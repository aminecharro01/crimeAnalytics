# Crime Analytics Dashboard - Vue d'Ensemble

## 1. Explication du Projet

Ce projet est une plateforme de **renseignement criminel (Crime Analytics)** conçue pour démontrer la puissance de la **persistance polyglotte** (l'utilisation de plusieurs bases de données spécialisées pour un même projet).

L'objectif est d'aider les enquêteurs à croiser des données provenant de sources variées pour identifier des suspects et démanteler des réseaux.

### Architecture Technique

L'application repose sur une architecture conteneurisée via **Docker**, orchestrant les services suivants :

*   **Frontend (`client`)** : Interface React.js moderne (Dashboard).
*   **Backend (`server`)** : API Node.js/Express qui centralise les requêtes.
*   **Bases de Données (Le cœur du système)** :
    1.  **MySQL (Relationnel)** : Stocke les données structurées "classiques" (Identité civile, Comptes bancaires, Propriétés). *Pourquoi ? Intégrité des données et requêtes SQL standard.*
    2.  **MongoDB (Document)** : Stocke les "Dossiers Suspects" (Rapports de police, antécédents, données non structurées). *Pourquoi ? Flexibilité du schéma JSON pour des dossiers variés.*
    3.  **Neo4j (Graphe)** : Stocke les relations (Personne A connaît Personne B, Appels téléphoniques, Hiérarchie criminelle). *Pourquoi ? Performances inégalées pour traverser des réseaux complexes (ex: "Qui est le chef ?").*
    4.  **Redis (Clé-Valeur / Cache)** : Gère les données temps réel et éphémères (Alertes d'écoutes téléphoniques, compteurs d'appels). *Pourquoi ? Rapidité extrême en mémoire.*

## 2. Suggestions d'Amélioration

Voici des pistes pour transformer ce prototype en application de production robuste :

### 🛡️ Sécurité & Infrastructure
*   **Authentification (Auth0 / JWT)** : Actuellement, l'accès est ouvert. Il faut sécuriser l'API et le Frontend pour que seuls les agents autorisés accèdent aux données.
*   **HTTPS & Reverse Proxy (Nginx)** : Sécuriser les échanges de données.
*   **Typescript** : Migrer le code JavaScript vers TypeScript pour éviter les bugs de typage et améliorer la maintenabilité.

### 🧠 Intelligence & Analyse
*   **Algorithmes de Graphe Avancés** :
    *   *PageRank* : Pour identifier les "influenceurs" ou parrains cachés dans le réseau.
    *   *Community Detection* : Pour repérer automatiquement des gangs distincts.
*   **Recherche Full-Text (Elasticsearch)** : Pour rechercher instantanément dans le texte des rapports de police (actuellement dans Mongo).
*   **Analyse Géospatiale** : Ajouter une carte (Leaflet/Mapbox) pour localiser les crimes et les domiciles des suspects.

### ⚡ Performance & Données
*   **Pipeline d'Ingestion (Kafka)** : Si les données arrivent en temps réel de capteurs ou de rapports, utiliser un bus de message.
*   **Tests Unitaires & E2E** : Ajouter Jest (Backend) et Cypress (Frontend) pour garantir qu'aucune mise à jour ne casse la recherche ou le graphe.

## 3. Optimisations Techniques (Immédiates)

Basé sur l'analyse du code actuel, voici 3 actions concrètes pour optimiser la performance :

### A. Caching Redis pour les Algorithmes (Backend)
*   **Problème** : L'algorithme PageRank (`/api/reseau/pagerank`) projette le graphe en mémoire à chaque appel. C'est très coûteux (CPU/RAM).
*   **Solution** : Stocker le résultat JSON dans Redis avec un TTL (ex: 10 minutes).
    ```javascript
    // Pseudo-code
    const cache = await redisClient.get('pagerank_results');
    if (cache) return res.json(JSON.parse(cache));
    // ... calcul ...
    await redisClient.set('pagerank_results', JSON.stringify(result), { EX: 600 });
    ```

### B. Pagination des résultats de recherche (Mongo)
*   **Problème** : `db.collection('suspects').find()` retourne potentiellement des milliers de documents.
*   **Solution** : Ajouter `limit=20` et `skip=0` (Page 1, 2, 3...) pour ne pas surcharger le navigateur du client.

### C. Débouncing de la Recherche (Frontend)
*   **Problème** : Si on implémente une recherche "au fur et à mesure", chaque frappe de clavier enverrait une requête.
*   **Solution** : Utiliser un `debounce` de 300ms. L'API n'est appelée que si l'utilisateur arrête de taper.
