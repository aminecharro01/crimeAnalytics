# 🎓 Guide de Soutenance - Projet Crime Analytics

Ce document liste les points clés à maîtriser pour réussir votre présentation devant le professeur.

---

## 1. Le "Pitch" (L'accroche)
**Si le prof demande : "De quoi parle votre projet ?"**
> "C'est une plateforme de **renseignement criminel**. Elle permet aux enquêteurs de croiser des données qui viennent de sources différentes (rapports de police, écoutes téléphoniques, indics) pour identifier des réseaux mafieux.
> Techniquement, c'est une démonstration de **persistance polyglotte** : on utilise 4 bases de données différentes, chacune pour ce qu'elle fait de mieux."

---

## 2. Les Concepts Techniques à Maîtriser
Le prof va vérifier si vous comprenez *pourquoi* vous avez fait ces choix.

### 🧠 Pourquoi une architecture Polyglotte ? (Cœur du sujet)
Ne dites pas juste "parce que c'est le projet". Dites :
*   **MySQL** : "Pour l'état civil et les abonnements téléphoniques. C'est des données structurées qui ne changent pas, on a besoin de rigueur (ACID)."
*   **MongoDB** : "Pour les dossiers suspects. Chaque suspect peut avoir des infos différentes (tatous, cicatrices, historique). Le format JSON flexible de Mongo est parfait pour ça."
*   **Neo4j** : "Pour le réseau criminel. Les bases SQL sont nulles pour dire 'qui connait qui qui connait qui'. Neo4j fait ça instantanément pour trouver le 'Parrain'."
*   **Redis** : "Pour le temps réel. On doit compter des appels téléphoniques en millisecondes pour lancer des alertes. Redis est en mémoire (RAM), c'est imbattable en vitesse."

### 🐳 Pourquoi Docker ?
> "Ça permet de lancer tout le projet (6 conteneurs) d'un coup avec une seule commande. Plus de problèmes de type 'ça marche chez moi mais pas chez toi'."

---

## 3. Démonstration (Le Script Gagnant)
Suivez cet ordre pour montrer que tout fonctionne :

1.  **Introduction** : Montrez le Dashboard global.
2.  **MongoDB (Dossiers)** : Cherchez "CHARRO". Montrez que vous récupérez sa biographie et ses crimes.
    *   *Point fort* : Montrez que la recherche est insensible à la casse ("charro" -> "CHARRO").
3.  **Neo4j (Graphe)** : Allez sur la carte Réseau.
    *   *Action* : Lancez "Charger le Réseau".
    *   *Explication* : "Ici, vous voyez visuellement qui dirige le réseau. Amine est au centre."
4.  **Algorithme (PageRank)** :
    *   *Action* : Cliquez sur "Lancer PageRank".
    *   *Explication* : "On utilise un algo mathématique pour confirmer qui est le chef, pas juste visuellement."
    *   *Bonus* : Mentionnez le **Cache Redis** ("La première fois c'est long, la 2ème fois c'est instantané").
5.  **Redis (Alerte)** :
    *   *Action* : Spammez le bouton "Simuler Appel" (6 fois).
    *   *Résultat* : L'alerte rouge apparaît. Expliquez que Redis a compté les appels en temps réel.
6.  **Maps (Leaflet)** : Montrez la carte pour prouver que vous savez intégrer des libs graphiques externes.

---

## 4. Questions Pièges (Anticipation)

**Q: Comment garantissez-vous qu'un suspect supprimé dans MySQL est aussi supprimé dans Neo4j ?**
> *R: "Actuellement, c'est géré par le code (Backend). Dans une V2, j'utiliserais un système d'événements comme **Kafka** ou **RabbitMQ** pour synchroniser toutes les bases automatiquement."* (C'est la réponse d'expert).

**Q: Pourquoi ne pas avoir tout mis dans MongoDB ?**
> *R: "Mongo aurait pu tout faire, mais il serait très lent pour calculer les chemins complexes (Graphe) ou gérer les verrous transactionnels stricts (SQL). On perdrait l'avantage de la spécialisation."*

**Q: Quelle a été la plus grande difficulté ?**
> *Référez-vous à votre [Learning Log](../documentation/LLog/Learning_Log.md).*
> *Exemple : "Synchroniser les données entre les bases. J'ai dû créer des scripts SQL et JSON qui utilisent exactement les mêmes IDs pour que tout corresponde."*

---

## 5. Mots-clés à placer
Essayez de dire ces mots pendant la présentation, ça fait sérieux :
*   **Scalabilité** (Le projet peut grandir).
*   **Polyglotte** (Plusieurs langages/DBs).
*   **Micro-services** (L'architecture Docker prépare à ça).
*   **ACID** (Pour MySQL) vs **BASE** (Pour NoSQL).
*   **Traversée de Graphe** (Pour Neo4j).

Bonne chance ! 🚀
