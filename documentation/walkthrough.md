# Crime Analytics Dashboard - Guide de Test

Ce guide vous explique comment vérifier chaque fonctionnalité de l'application.
Rendez-vous sur [http://localhost:3000](http://localhost:3000).

## 1. Dossier Suspect (MongoDB)
*   **Objectif** : Récupérer des infos civiles structurées et non structurées.
*   **Action** :
    1.  Dans la carte "Dossier Suspect", tapez `CHARRO`.
    2.  Cliquez sur **Rechercher**.
*   **Résultat attendu** : Un JSON s'affiche avec son signalement ("Tatouage dragon...").

## 2. Écoutes Actives (Redis)
*   **Objectif** : Tester la détection de fraude en temps réel.
*   **Action** :
    1.  Dans la carte "Écoutes Actives", laissez le numéro par défaut.
    2.  Cliquez 6 ou 7 fois rapidement sur **Simuler Appel**.
*   **Résultat attendu** : Une alerte rouge clignotante apparaît : "⚠️ ACTIVITÉ SUSPECTE DÉTECTÉE".

## 3. Top Influents (Neo4j PageRank)
*   **Objectif** : Identifier le chef du réseau mathématiquement.
*   **Action** :
    1.  Dans la carte "Top Influents", cliquez sur **Lancer PageRank**.
*   **Résultat attendu** :
    1.  **Amine** apparaît en #1 (Score le plus élevé).
    2.  **Hassan** suit en #2 (Son lieutenant).

## 4. Réseau Criminel (Neo4j Graph)
*   **Objectif** : Visualiser les liens entre deux personnes.
*   **Action** :
    1.  Dans la grande carte "Réseau Criminel", entrez :
        *   Début : `Amine`
        *   Fin : `Hassan` (ou `Sofia`)
    2.  Cliquez sur **Analyser Liens**.
*   **Résultat attendu** : Le graphe s'anime et affiche les nœuds reliés par une flèche "DIRIGE".

## 5. Intelligence Textuelle (MongoDB Text Search)
*   **Objectif** : Trouver un suspect par mot-clé dans sa biographie.
*   **Action** :
    1.  Dans la barre de recherche tout en bas, tapez `drogue` ou `hacker`.
    2.  Cliquez sur **Chercher**.
*   **Résultat attendu** :
    *   Pour "hacker" -> **Karim DAOUDI** apparaît.
    *   Cliquez sur **"Lire la suite"** pour voir sa biographie complète ("...Hacker connu sous le pseudo K-Ghost").
    *   Pour "drogue" -> **Amine CHARRO** et **Sofia BENALI** apparaissent.

## 6. Cartographie (Leaflet)
*   **Objectif** : Situer les opérations du cartel sur une carte.
*   **Action** :
    1.  Observez la carte "Localisation Suspects".
    2.  Cliquez sur les marqueurs bleus.
*   **Résultat attendu** :
    *   Le marqueur sur **Tanger** affiche "Sofia BENALI - Logistique Port".
    *   Le marqueur sur **Casablanca** affiche "Amine CHARRO - Chef présumé".

## 7. Vérification de la Cohérence (SQL/Mongo/Neo4j)
*   **Objectif** : Vérifier que les données sont synchronisées entre les bases.
*   **Action** :
    1.  Cherchez le suspect **"Said"** dans le dossier suspect.
    2.  Vérifiez qu'il apparaît bien (Il était manquant auparavant).
    3.  Les données MySQL (relations, téléphones) correspondent désormais aux personnages du graphe Neo4j.
