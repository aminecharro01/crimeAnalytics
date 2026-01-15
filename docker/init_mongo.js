db = db.getSiblingDB("policedb_mongo");
db.suspects.drop();

db.suspects.insertMany([
    {
        "nom": "CHARRO",
        "prenom": "Amine",
        "adresse": "123 Rue de la République",
        "crimes": ["Cambriolage", "Trafic de stupéfiants", "Blanchiment"],
        "biographie": "Chef présumé du clan Charro. Connu pour utiliser des sociétés écrans pour blanchir l'argent de la drogue. Très méfiant.",
        "signalement": "Tatouage dragon sur le bras gauche"
    },
    {
        "nom": "EL-FASSI",
        "prenom": "Hassan",
        "adresse": "45 Boulevard Mohammed V",
        "crimes": ["Recel", "Complicité"],
        "biographie": "Bras droit d'Amine. Gère la logistique et les transports. Ancien chauffeur routier.",
        "signalement": "Cicatrice joue droite"
    },
    {
        "nom": "DAOUDI",
        "prenom": "Karim",
        "adresse": "Casablanca, Anfa",
        "crimes": ["Cybercriminalité", "Faux et usage de faux"],
        "biographie": "Expert en informatique. Créateur des systèmes de communication cryptés du réseau. Hacker connu sous le pseudo 'K-Ghost'.",
        "signalement": "Porte toujours des lunettes noires"
    },
    {
        "nom": "BENALI",
        "prenom": "Sofia",
        "adresse": "Tanger, Zone Franche",
        "crimes": ["Contrebande", "Corruption"],
        "biographie": "Gère l'import-export au port de Tanger. Facilite le passage des marchandises illicites via des conteneurs.",
        "signalement": "Cheveux roux, très élégante"
    },
    {
        "nom": "RODRIGUEZ",
        "prenom": "Miguel",
        "adresse": "Marrakech, Palmeraie",
        "crimes": ["Trafic d'armes", "Association de malfaiteurs"],
        "biographie": "Lien avec les cartels sud-américains. Fournit les armes lourdes au réseau. Dangereux et armé.",
        "signalement": "Parle avec un fort accent espagnol"
    },
    {
        "nom": "JEBBOUR",
        "prenom": "Yassine",
        "adresse": "Fès, Medina",
        "crimes": ["Blanchiment", "Fraude fiscale"],
        "biographie": "Comptable du réseau. Transforme l'argent sale en investissements immobiliers. Apparemment un notable respectable.",
        "signalement": "Toujours en costume cravate"
    },
    {
        "nom": "OUALI",
        "prenom": "Said",
        "adresse": "Casablanca, Sidi Bernoussi",
        "crimes": ["Vol à l'arraché", "Vente de stupéfiants"],
        "biographie": "Petite main du réseau. Exécute les basses oeuvres sur le terrain. Obéit directement à Hassan.",
        "signalement": "Casquette à l'envers, cicatrice sourcil"
    },
    {
        "nom": "TALEB",
        "prenom": "Rachid",
        "adresse": "Casablanca, Hay Mohammadi",
        "crimes": ["Transport illicite", "Guetteur"],
        "biographie": "Chauffeur pour les livraisons rapides. Connaît bien les raccourcis de la ville. Peu fiable.",
        "signalement": "Boite légèrement"
    }
]);

// Création d'un Index Textuel pour la recherche Full-Text
db.suspects.createIndex({ "biographie": "text", "crimes": "text" });
