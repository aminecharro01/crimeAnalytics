# 🕵️ Crime Analytics Dashboard

A crime intelligence platform prototype utilizing a **polyglot persistence** architecture (MongoDB, Neo4j, MySQL, Redis).

## 🚀 Installation & Quick Start

1.  **Prerequisites**: Ensure Docker and Docker Compose are installed.
2.  **Start the project**:
    *   Open a terminal (PowerShell) in this directory.
    *   Run the automatic setup script:
        ```powershell
        .\setup.ps1
        ```
    *   *Alternatively, if `setup.ps1` fails: `docker-compose up --build -d`*

3.  **Access the application**:
    *   Frontend: [http://localhost:3000](http://localhost:3000)
    *   Backend API: [http://localhost:5001](http://localhost:5001)

## 📁 Documentation

Full documentation is available in the `/documentation` folder (local only).

## 🛠️ Tech Stack

*   **Frontend**: React.js, Leaflet (Maps), React-Force-Graph (Networks).
*   **Backend**: Node.js (Express).
*   **Databases**:
    *   **MongoDB**: Documents (Suspect Files).
    *   **Neo4j**: Graph (Criminal Relations, PageRank).
    *   **MySQL**: Structured (Identity, Phone Logs).
    *   **Redis**: Cache & Real-time (Wiretaps, PageRank Caching).

---
*Project realized as part of the NoSQL module - EMSI 2026*
