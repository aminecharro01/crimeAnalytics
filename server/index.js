// --- /server/index.js ---
const express = require('express');
const cors = require('cors');
// Import des drivers
const mysql = require('mysql2/promise');
const { MongoClient } = require('mongodb');
const neo4j = require('neo4j-driver');
const redis = require('redis');

const app = express();
app.use(cors()); // Autoriser le frontend React
app.use(express.json());

app.use((req, res, next) => {
    console.log(`[INCOMING REQUEST] ${req.method} ${req.url}`);
    next();
});

// --- CONFIGURATION DES CONNEXIONS DB ---

// 1. MySQL Config
const mysqlPool = mysql.createPool({
    host: process.env.DB_HOST || 'localhost', user: 'root', password: 'rootpassword', database: 'policedb_sql', port: 3306
});

// 2. MongoDB Config
const mongoHost = process.env.MONGO_HOST || 'localhost';
const mongoClient = new MongoClient(`mongodb://admin:adminpassword@${mongoHost}:27017`);
let mongoDb;

// 3. Neo4j Config
const neo4jHost = process.env.NEO4J_HOST || 'localhost';
const neo4jDriver = neo4j.driver(`bolt://${neo4jHost}:7687`, neo4j.auth.basic('neo4j', 'password'));

// 4. Redis Config
const redisHost = process.env.REDIS_HOST || 'localhost';
const redisClient = redis.createClient({ url: `redis://${redisHost}:6379` });

// --- INITIALISATION DES CONNEXIONS ---
async function connectDBs() {
    try {
        await mongoClient.connect();
        mongoDb = mongoClient.db('policedb_mongo');
        await redisClient.connect();
        console.log("Toutes les bases de données sont connectées !");
    } catch (err) {
        console.error("Erreur de connexion à la base de données:", err);
        // It's better to exit if DB connection fails, but for this exercise we'll just log it.
    }
}
connectDBs();


// --- ROUTES DE L'API (Endpoints) ---

// Route 1 (MongoDB) : Obtenir le dossier d'un suspect
// Pourquoi Mongo ? Lecture rapide d'un document complexe et structuré.
app.get('/api/suspect/:nom', async (req, res) => {
    const nomRecherche = req.params.nom;
    if (!mongoDb) {
        return res.status(500).json({ error: "La connexion à MongoDB n'est pas établie." });
    }
    try {
        console.log(`Searching for suspect: "${nomRecherche}" in DB: ${mongoDb ? mongoDb.databaseName : 'NOT CONNECTED'}`);
        const dossier = await mongoDb.collection('suspects').findOne({ nom: nomRecherche });
        console.log(`Result:`, dossier);
        if (dossier) {
            res.json(dossier);
        } else {
            res.status(404).json({ message: "Suspect non trouvé." });
        }
    } catch (err) {
        res.status(500).json({ error: "Erreur lors de la recherche du suspect.", details: err.message });
    }
});

// Route 2 (Neo4j) : Trouver le chemin le plus court entre deux personnes
// Pourquoi Neo4j ? Impossible à faire efficacement en SQL ou Mongo.
app.get('/api/reseau/chemin', async (req, res) => {
    const { debut, fin } = req.query; // ex: ?debut=Youssef&fin=Amine
    const session = neo4jDriver.session();
    try {
        const result = await session.run(
            `MATCH p = shortestPath((p1:Personne {prenom: $debut})-[*]-(p2:Personne {prenom: $fin})) RETURN p`,
            { debut, fin }
        );
        // (Le traitement du résultat Neo4j pour le renvoyer en JSON est un peu verbeux, simplifié ici)
        res.json({ chemin_trouve: result.records.length > 0, data: result.records[0]?.get('p') });
    } catch (err) {
        res.status(500).json({ error: "Erreur lors de la recherche du chemin.", details: err.message });
    } finally {
        await session.close();
    }
});

// Route 2 bis (Neo4j) : Récupérer TOUT le graphe
app.get('/api/reseau/global', async (req, res) => {
    const session = neo4jDriver.session();
    try {
        // On récupère tous les noeuds et relations (limite 100 pour sécu)
        const result = await session.run(
            `MATCH (n)-[r]->(m) RETURN n, r, m LIMIT 200`
        );

        const nodes = new Map();
        const links = [];

        result.records.forEach(record => {
            const source = record.get('n');
            const target = record.get('m');
            const rel = record.get('r');

            // Extraction sécurisée des IDs (Integer vs String)
            const getNeo4jId = (identity) => {
                if (typeof identity === 'string' || typeof identity === 'number') return identity.toString();
                if (identity && identity.low !== undefined) return identity.low.toString();
                return JSON.stringify(identity);
            };

            const sourceId = getNeo4jId(source.identity);
            const targetId = getNeo4jId(target.identity);

            if (!nodes.has(sourceId)) {
                nodes.set(sourceId, {
                    id: sourceId,
                    label: source.properties.prenom || 'Inconnu',
                    group: 'Personne'
                });
            }
            if (!nodes.has(targetId)) {
                nodes.set(targetId, {
                    id: targetId,
                    label: target.properties.prenom || 'Inconnu',
                    group: 'Personne'
                });
            }

            links.push({
                source: sourceId,
                target: targetId,
                label: rel.type
            });
        });

        res.json({ nodes: Array.from(nodes.values()), links });
    } catch (err) {
        console.error("Erreur Graph Global:", err);
        res.status(500).json({ error: "Erreur graph global", details: err.message });
    } finally {
        await session.close();
    }
});

// Route 3 (Redis) : Simuler un appel sur écoute (Wiretap)
// Pourquoi Redis ? Besoin d'écriture atomique ultra-rapide et d'expiration automatique.
app.post('/api/alerte/appel', async (req, res) => {
    const { numero } = req.body; // ex: {"numero": "+212699887766"}
    if (!numero) {
        return res.status(400).json({ error: "Le numéro est requis." });
    }
    const cleRedis = `alerte:${numero}`;
    try {
        // Incrémente le compteur
        const compteur = await redisClient.incr(cleRedis);
        // Si c'est le premier appel, on met une expiration de 60 secondes
        if (compteur === 1) {
            await redisClient.expire(cleRedis, 60);
        }
        // Si plus de 5 appels en 1 minute -> Alerte Rouge !
        const alerteRouge = compteur > 5;
        res.json({ numero, appels_recepts: compteur, ALERTE_ROUGE: alerteRouge });
    } catch (err) {
        res.status(500).json({ error: "Erreur avec Redis.", details: err.message });
    }
});

// --- ROUTES AVANCÉES (NOUVEAU) ---

// Route 4 (MongoDB) : Recherche Full-Text
// Utilise l'index textuel créé sur 'biographie' et 'crimes'
app.get('/api/suspects/search', async (req, res) => {
    const query = req.query.q; // ?q=drogue
    if (!mongoDb) return res.status(500).json({ error: "MongoDB non connecté" });

    try {
        console.log(`Text Search query: "${query}"`);
        // Recherche textuelle + Tri par pertinence (score)
        const results = await mongoDb.collection('suspects')
            .find({ $text: { $search: query } })
            .project({ score: { $meta: "textScore" } })
            .sort({ score: { $meta: "textScore" } })
            .toArray();
        res.json(results);
    } catch (err) {
        res.status(500).json({ error: "Erreur recherche textuelle", details: err.message });
    }
});

// Route 5 (Neo4j) : PageRank (Qui est le chef ?)
// Nécessite la librairie GDS (Graph Data Science) ou une projection in-memory
app.get('/api/reseau/pagerank', async (req, res) => {
    // 1. Check Redis Cache
    try {
        const cachedResult = await redisClient.get('pagerank_results');
        if (cachedResult) {
            console.log("Serving PageRank from Redis Cache ⚡");
            return res.json(JSON.parse(cachedResult));
        }
    } catch (e) {
        console.error("Redis Cache Error:", e);
    }

    const session = neo4jDriver.session();
    try {
        // ... (Logic remains similar: Projection + PageRank)
        const projectionName = 'reseauCriminel_v2';

        try {
            await session.run(`CALL gds.graph.drop($name, false)`, { name: projectionName });
        } catch (e) { /* ignore */ }

        await session.run(`
            CALL gds.graph.project(
                $name,
                'Personne',
                {
                    DIRIGE: {
                        orientation: 'REVERSE'
                    }
                }
            )
        `, { name: projectionName });

        const result = await session.run(`
            CALL gds.pageRank.stream($name)
            YIELD nodeId, score
            RETURN gds.util.asNode(nodeId).prenom AS prenom, gds.util.asNode(nodeId).nom AS nom, score
            ORDER BY score DESC
            LIMIT 5
        `, { name: projectionName });

        const topCriminels = result.records.map(r => ({
            prenom: r.get('prenom'),
            nom: r.get('nom'),
            score: r.get('score')
        }));

        // 2. Save result to Redis Cache (TTL = 10 minutes)
        await redisClient.set('pagerank_results', JSON.stringify(topCriminels), { EX: 600 });
        console.log("PageRank calculated and cached 💾");

        res.json(topCriminels);
    } catch (err) {
        console.error("Erreur PageRank:", err);
        // Fallback
        try {
            const fallback = await session.run(`
                MATCH (p:Personne)-[r:DIRIGE]->()
                RETURN p.prenom AS prenom, p.nom AS nom, count(r) as score
                ORDER BY score DESC LIMIT 5
            `);
            const fallbackData = fallback.records.map(r => ({
                prenom: r.get('prenom'),
                nom: r.get('nom'),
                score: r.get('score').toNumber()
            }));
            res.json({ method: "Fallback (Degree Centrality)", data: fallbackData });
        } catch (e2) {
            res.status(500).json({ error: "Erreur PageRank et Fallback", details: err.message });
        }
    } finally {
        await session.close();
    }
});


const PORT = 5000;
app.listen(PORT, () => console.log(`Serveur API tournant sur le port ${PORT}`));
