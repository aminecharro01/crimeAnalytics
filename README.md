# 🕵️ Crime Analytics Dashboard

Un prototype de plateforme de renseignement criminel utilisant une architecture de **persistance polyglotte** (MongoDB, Neo4j, MySQL, Redis).

## 🚀 Installation & Démarrage Rapide

1.  **Pré-requis** : Avoir Docker et Docker Compose installés.
2.  **Lancer le projet** :
    *   Ouvrez un terminal (PowerShell) dans ce dossier.
    *   Exécutez le script d'installation automatique :
        ```powershell
        .\setup.ps1
        ```
    *   *Alternativement, si `setup.ps1` ne passe pas : `docker-compose up --build -d`*

3.  **Accéder à l'application** :
    *   Frontend : [http://localhost:3000](http://localhost:3000)
    *   Backend API : [http://localhost:5001](http://localhost:5001)

## 📁 Documentation

La documentation complète se trouve dans le dossier `/documentation` :
*   `project_overview.md` : Explication technique, architecture et optimisations.
*   `walkthrough.md` : Guide étape par étape pour tester toutes les fonctionnalités.

## 🛠️ Stack Technique

*   **Frontend** : React.js, Leaflet (Cartes), React-Force-Graph (Réseaux).
*   **Backend** : Node.js (Express).
*   **Bases de Données** :
    *   **MongoDB** : Documents (Dossiers suspects).
    *   **Neo4j** : Graphe (Relations criminelles, PageRank).
    *   **MySQL** : Structuré (Identité, Téléphones).
    *   **Redis** : Cache & Temps réel (Écoutes, Caching PageRank).

---
*Projet réalisé dans le cadre du module NoSQL - EMSI 2026*
