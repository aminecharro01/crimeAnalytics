import React, { useState, useRef } from 'react';
import axios from 'axios';
import ForceGraph2D from 'react-force-graph-2d';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import './App.css';

// Fix pour les icones Leaflet par défaut qui ne s'affichent pas en React/Webpack
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
    iconUrl: require('leaflet/dist/images/marker-icon.png'),
    shadowUrl: require('leaflet/dist/images/marker-shadow.png'),
});

// --- DONNÉES GÉOGRAPHIQUES MOCKÉES ---
const LOCATIONS = {
    "Casablanca": [33.5731, -7.5898],
    "Tanger": [35.7595, -5.8340],
    "Marrakech": [31.6295, -7.9811],
    "Fès": [34.0331, -5.0003],
    "Rabat": [34.0209, -6.8416],
    "Sidi Bernoussi": [33.6060, -7.5050],
    "Hay Mohammadi": [33.5950, -7.5600]
};

function SuspectMap() {
    console.log("Rendering SuspectMap");
    // Liste statique mise à jour avec les 8 suspects
    const [suspects] = useState([
        { nom: 'Amine CHARRO', ville: 'Casablanca (Centre)', desc: 'Chef présumé', coords: LOCATIONS['Casablanca'] },
        { nom: 'Hassan EL-FASSI', ville: 'Casablanca (Port)', desc: 'Lieutenant', coords: [33.5900, -7.6100] },
        { nom: 'Sofia BENALI', ville: 'Tanger', desc: 'Logistique Port', coords: LOCATIONS['Tanger'] },
        { nom: 'Miguel RODRIGUEZ', ville: 'Marrakech', desc: 'Trafic Armes', coords: LOCATIONS['Marrakech'] },
        { nom: 'Yassine JEBBOUR', ville: 'Fès', desc: 'Comptable', coords: LOCATIONS['Fès'] },
        { nom: 'Karim DAOUDI', ville: 'Casablanca (Anfa)', desc: 'Hacker', coords: [33.5850, -7.6400] },
        { nom: 'Said OUALI', ville: 'Sidi Bernoussi', desc: 'Petite Main', coords: LOCATIONS['Sidi Bernoussi'] },
        { nom: 'Rachid TALEB', ville: 'Hay Mohammadi', desc: 'Chauffeur', coords: LOCATIONS['Hay Mohammadi'] }
    ]);

    return (
        <MapContainer center={[31.7917, -7.0926]} zoom={6} scrollWheelZoom={false} style={{ height: '400px', width: '100%', borderRadius: '8px', zIndex: 0 }}>
            <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            {suspects.map((s, i) => (
                <Marker key={i} position={s.coords}>
                    <Popup>
                        <strong>{s.nom}</strong><br />
                        {s.desc}<br />
                        <span style={{ color: 'var(--text-secondary)', fontSize: '0.8em' }}>{s.ville}</span>
                    </Popup>
                </Marker>
            ))}
        </MapContainer>
    );
}

function App() {
    const [nomRecherche, setNomRecherche] = useState('');
    const [dossierSuspect, setDossierSuspect] = useState(null);

    // Fonction pour chercher le dossier (MongoDB)
    const chercherDossier = async () => {
        try {
            const response = await axios.get(`http://localhost:5001/api/suspect/${nomRecherche}`);
            setDossierSuspect(response.data);
        } catch (error) {
            console.error("Erreur:", error);
            setDossierSuspect(null);
            alert("Suspect non trouvé ou erreur API");
        }
    };

    const [numeroAlerte, setNumeroAlerte] = useState('+212699887766');
    const [resultatAlerte, setResultatAlerte] = useState(null);

    // Fonction pour simuler un appel sur écoute (Redis)
    const simulerAppel = async () => {
        try {
            const response = await axios.post(`http://localhost:5001/api/alerte/appel`, { numero: numeroAlerte });
            setResultatAlerte(response.data);
        } catch (error) {
            console.error("Erreur:", error);
            alert("Erreur API pour l'alerte");
        }
    };

    // --- LOGIQUE GRAPHE NEO4J ---
    const [prenomDebut, setPrenomDebut] = useState('Amine');
    const [prenomFin, setPrenomFin] = useState('Hassan');
    const [graphData, setGraphData] = useState({ nodes: [], links: [] });
    const [graphError, setGraphError] = useState(null);

    // Helper pour extraire l'ID correctement (compatibilité Neo4j Integer structure)
    const getNeo4jId = (identity) => {
        if (typeof identity === 'string' || typeof identity === 'number') return identity.toString();
        if (identity && identity.low !== undefined) return identity.low.toString();
        return JSON.stringify(identity); // Fallback unique
    };

    const chercherChemin = async () => {
        try {
            setGraphError(null);
            // Reset data temporarily to force refresh effect
            setGraphData({ nodes: [], links: [] });

            const response = await axios.get(`http://localhost:5001/api/reseau/chemin?debut=${prenomDebut}&fin=${prenomFin}`);

            if (response.data.chemin_trouve && response.data.data) {
                const pathData = response.data.data;

                // Transformation des données Neo4j pour react-force-graph
                const nodes = new Map();
                const links = [];

                pathData.segments.forEach(segment => {
                    // Utilisation du helper pour les IDs
                    const startId = getNeo4jId(segment.start.identity);
                    const endId = getNeo4jId(segment.end.identity);

                    // Traitement Nœud Départ
                    if (!nodes.has(startId)) {
                        nodes.set(startId, {
                            id: startId,
                            label: segment.start.properties.prenom || 'Inconnu',
                            group: 'Personne'
                        });
                    }
                    // Traitement Nœud Arrivée
                    if (!nodes.has(endId)) {
                        nodes.set(endId, {
                            id: endId,
                            label: segment.end.properties.prenom || 'Inconnu',
                            group: 'Personne'
                        });
                    }
                    // Traitement Lien
                    links.push({
                        source: startId,
                        target: endId,
                        label: segment.relationship.type
                    });
                });

                setGraphData({ nodes: Array.from(nodes.values()), links });
            } else {
                setGraphError("Aucun chemin trouvé entre ces deux personnes.");
            }
        } catch (error) {
            console.error("Erreur Neo4j:", error);
            setGraphError("Erreur lors de la récupération du graphe.");
        }
    };

    // Fonctions Graph
    const chargerReseauComplet = async () => {
        try {
            setGraphError(null);
            setGraphData({ nodes: [], links: [] });

            const response = await axios.get('http://localhost:5001/api/reseau/global');

            if (response.data.nodes && response.data.nodes.length > 0) {
                setGraphData(response.data);
            } else {
                setGraphError("Le réseau est vide.");
            }
        } catch (error) {
            console.error("Erreur Neo4j:", error);
            setGraphError("Erreur lors du chargement du graphe complet.");
        }
    };

    return (
        <div className="dashboard-container">
            <header className="header">
                <h1 className="title">🕵️ Crime Analytics Dashboard</h1>
                <div style={{ color: 'var(--text-secondary)' }}>v1.1.0</div>
            </header>

            <div className="grid-layout">

                {/* --- ROW 1: KEY METRICS & INPUTS --- */}

                {/* 1. Dossier Suspect */}
                <div className="card">
                    <div className="card-header">
                        <span className="icon">📂</span>
                        <h2 className="card-title">Dossier Suspect</h2>
                    </div>
                    <p style={{ color: 'var(--text-secondary)', marginBottom: '16px', fontSize: '0.9rem' }}>
                        Recherche documentaire dans MongoDB.
                    </p>
                    <div className="input-group">
                        <input
                            type="text"
                            placeholder="Nom du suspect (ex: CHARRO)"
                            value={nomRecherche}
                            onChange={(e) => setNomRecherche(e.target.value.toUpperCase())}
                        />
                        <button onClick={chercherDossier}>Rechercher</button>
                    </div>
                    {dossierSuspect && (
                        <div className="result-box">
                            <h3 style={{ marginTop: 0, color: 'var(--accent-cyan)', borderBottom: '1px solid var(--glass-border)', paddingBottom: '10px' }}>
                                📑 Fiche Suspect: {dossierSuspect.prenom} {dossierSuspect.nom}
                            </h3>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '15px' }}>
                                <div>
                                    <span style={{ color: 'var(--text-secondary)', fontSize: '0.8rem' }}>ADRESSE</span>
                                    <div style={{ fontWeight: 'bold' }}>{dossierSuspect.adresse}</div>
                                </div>
                                <div>
                                    <span style={{ color: 'var(--text-secondary)', fontSize: '0.8rem' }}>SIGNALEMENT</span>
                                    <div style={{ fontWeight: 'bold', color: 'var(--alert-red)' }}>{dossierSuspect.signalement}</div>
                                </div>
                            </div>
                            <div style={{ marginBottom: '15px' }}>
                                <span style={{ color: 'var(--text-secondary)', fontSize: '0.8rem' }}>BIOGRAPHIE</span>
                                <p style={{ margin: '5px 0', fontStyle: 'italic', background: 'rgba(0,0,0,0.2)', padding: '8px', borderRadius: '4px' }}>
                                    "{dossierSuspect.biographie}"
                                </p>
                            </div>
                            <div>
                                <span style={{ color: 'var(--text-secondary)', fontSize: '0.8rem' }}>CRIMES CONNUS</span>
                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginTop: '5px' }}>
                                    {dossierSuspect.crimes.map((crime, i) => (
                                        <span key={i} style={{
                                            background: 'rgba(239, 68, 68, 0.2)', color: '#fca5a5',
                                            padding: '4px 8px', borderRadius: '4px', fontSize: '0.85rem', fontWeight: 'bold'
                                        }}>
                                            {crime}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* 2. Écoutes Actives */}
                <div className="card alert-card">
                    <div className="card-header">
                        <span className="icon">🚨</span>
                        <h2 className="card-title">Écoutes Actives</h2>
                    </div>
                    <p style={{ color: 'var(--text-secondary)', marginBottom: '16px', fontSize: '0.9rem' }}>
                        Détection d'activité anormale via Redis.
                    </p>
                    <div className="input-group">
                        <input
                            type="text"
                            placeholder="Numéro (+212...)"
                            value={numeroAlerte}
                            onChange={(e) => setNumeroAlerte(e.target.value)}
                        />
                        <button onClick={simulerAppel} style={{ background: 'var(--alert-red)' }}>Simuler Appel</button>
                    </div>
                    {resultatAlerte && (
                        <div className={`alert-result`}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                                <span>Numéro: <strong>{resultatAlerte.numero}</strong></span>
                                <span>Appels: <strong>{resultatAlerte.appels_recepts}</strong></span>
                            </div>
                            {resultatAlerte.ALERTE_ROUGE ? (
                                <div className="alert-badge">
                                    ⚠️ ACTIVITÉ SUSPECTE DÉTECTÉE
                                </div>
                            ) : (
                                <div className="status-normal">
                                    🟢 Surveillance active - Rien à signaler
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* 3. Top Influents */}
                <div className="card">
                    <div className="card-header">
                        <span className="icon">👑</span>
                        <h2 className="card-title">Top Influents</h2>
                    </div>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '16px' }}>Calcul d'influence (PageRank).</p>
                    <TopSuspects />
                </div>

                {/* --- ROW 2: MAP (Full Width) --- */}
                <div className="card" style={{ gridColumn: '1 / -1' }}>
                    <div className="card-header">
                        <span className="icon">🗺️</span>
                        <h2 className="card-title">Localisation Suspects</h2>
                    </div>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Dernières positions connues.</p>
                    <SuspectMap />
                </div>

                {/* --- ROW 3: NETWORK GRAPH (Full Width) --- */}
                <div className="card" style={{ gridColumn: '1 / -1' }}>
                    <div className="card-header">
                        <span className="icon">🕸️</span>
                        <h2 className="card-title">Reseau Criminel Global</h2>
                    </div>
                    <p style={{ color: 'var(--text-secondary)', marginBottom: '16px', fontSize: '0.9rem' }}>
                        Visualisation complète du réseau criminel (Noeuds et Relations).
                    </p>
                    <div className="input-group" style={{ maxWidth: '300px' }}>
                        <button onClick={chargerReseauComplet}>Charger le Réseau Entier</button>
                    </div>
                    {graphError && (
                        <div style={{ color: 'var(--alert-red)', marginBottom: '16px', fontWeight: 'bold' }}>
                            {graphError}
                        </div>
                    )}
                    <div style={{
                        height: '400px',
                        border: '1px solid var(--glass-border)',
                        borderRadius: '8px',
                        overflow: 'hidden',
                        background: 'rgba(0,0,0,0.3)',
                        position: 'relative'
                    }}>
                        {graphData.nodes.length > 0 ? (
                            <ForceGraph2D
                                graphData={graphData}
                                nodeLabel="label"
                                nodeColor={() => '#06b6d4'}
                                nodeRelSize={8}
                                backgroundColor="rgba(0,0,0,0)"
                                width={1000}
                                height={400}
                                linkColor={() => '#94a3b8'}
                                linkDirectionalArrowLength={6}
                                linkDirectionalArrowRelPos={1}
                                linkCurvature={0.25}
                                nodeCanvasObject={(node, ctx, globalScale) => {
                                    const label = node.label;
                                    const fontSize = 14 / globalScale;
                                    ctx.font = `${fontSize}px Sans-Serif`;
                                    ctx.beginPath();
                                    ctx.arc(node.x, node.y, 6, 0, 2 * Math.PI, false);
                                    ctx.fillStyle = '#06b6d4';
                                    ctx.fill();
                                    ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
                                    ctx.textAlign = 'center';
                                    ctx.textBaseline = 'top';
                                    ctx.fillText(label, node.x, node.y + 8);
                                }}
                                linkCanvasObjectMode={() => 'after'}
                                linkCanvasObject={(link, ctx, globalScale) => {
                                    const label = link.label;
                                    if (!label) return;
                                    const fontSize = 10 / globalScale;
                                    ctx.font = `${fontSize}px Sans-Serif`;
                                    ctx.fillStyle = '#94a3b8';
                                    ctx.textAlign = 'center';
                                    ctx.textBaseline = 'middle';
                                    const start = link.source;
                                    const end = link.target;
                                    if (typeof start !== 'object' || typeof end !== 'object') return;
                                    const textPos = Object.assign({},
                                        start.x > end.x ? end : start,
                                        { x: start.x + (end.x - start.x) / 2, y: start.y + (end.y - start.y) / 2 }
                                    );
                                    ctx.fillText(label, textPos.x, textPos.y);
                                }}
                            />
                        ) : (
                            <div style={{
                                position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
                                color: 'var(--text-secondary)', textAlign: 'center'
                            }}>
                                Aucune donnée à afficher. Lancez une recherche.
                            </div>
                        )}
                    </div>
                </div>

                {/* --- ROW 4: TEXT INTELLIGENCE (Full Width) --- */}
                <div className="card" style={{ gridColumn: '1 / -1' }}>
                    <div className="card-header">
                        <span className="icon">🔎</span>
                        <h2 className="card-title">Intelligence Textuelle</h2>
                    </div>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Recherche par mots-clés (ex: "drogue").</p>
                    <MongoTextSearch />
                </div>

            </div>
        </div>
    );
}

// --- SOUS-COMPOSANTS POUR LA CLARTÉ ---

function TopSuspects() {
    const [suspects, setSuspects] = useState([]);

    const calculerPageRank = async () => {
        try {
            const res = await axios.get('http://localhost:5001/api/reseau/pagerank');
            // Gère le cas fallback ou normal
            setSuspects(res.data.data || res.data);
        } catch (e) { console.error(e); }
    };

    return (
        <div>
            <button onClick={calculerPageRank} style={{ marginBottom: '10px', width: '100%' }}>Lancer PageRank</button>
            <ul style={{ listStyle: 'none', padding: 0 }}>
                {suspects.map((s, i) => (
                    <li key={i} style={{
                        padding: '10px', borderBottom: '1px solid var(--glass-border)',
                        display: 'flex', justifyContent: 'space-between'
                    }}>
                        <span>#{i + 1} <strong>{s.prenom} {s.nom}</strong></span>
                        <span style={{ color: 'var(--accent-cyan)' }}>Score: {typeof s.score === 'number' ? s.score.toFixed(2) : s.score}</span>
                    </li>
                ))}
            </ul>
        </div>
    );
}

function MongoTextSearch() {
    const [query, setQuery] = useState('');
    const [results, setResults] = useState([]);

    const search = async () => {
        try {
            const res = await axios.get(`http://localhost:5001/api/suspects/search?q=${query}`);
            setResults(res.data);
        } catch (e) { console.error(e); }
    };

    return (
        <div>
            <div className="input-group">
                <input type="text" placeholder="Mot-clé (ex: armes)" value={query} onChange={e => setQuery(e.target.value)} />
                <button onClick={search}>Chercher</button>
            </div>
            <div style={{ maxHeight: '200px', overflowY: 'auto' }}>
                {results.map((r, i) => (
                    <SearchResultItem key={i} result={r} />
                ))}
            </div>
        </div>
    );
}

function SearchResultItem({ result }) {
    const [expanded, setExpanded] = useState(false);
    const isLong = result.biographie.length > 60;

    return (
        <div style={{ background: 'rgba(0,0,0,0.2)', padding: '8px', marginBottom: '4px', borderRadius: '4px' }}>
            <div style={{ fontWeight: 'bold' }}>{result.prenom} {result.nom}</div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '4px' }}>
                {expanded ? result.biographie : `${result.biographie.substring(0, 60)}${isLong ? '...' : ''}`}
            </div>
            {isLong && (
                <button
                    onClick={() => setExpanded(!expanded)}
                    style={{
                        background: 'none', border: 'none', color: 'var(--accent-cyan)',
                        padding: 0, fontSize: '0.75rem', cursor: 'pointer', textDecoration: 'underline'
                    }}
                >
                    {expanded ? "Lire moins" : "Lire la suite"}
                </button>
            )}
        </div>
    );
}

export default App;
