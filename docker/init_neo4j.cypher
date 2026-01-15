// --- NETTOYAGE ---
MATCH (n) DETACH DELETE n;

// --- NOEUDS (Suspects) ---
CREATE (amine:Personne {nom: 'CHARRO', prenom: 'Amine', statut: 'Parrain'})
CREATE (hassan:Personne {nom: 'EL-FASSI', prenom: 'Hassan', statut: 'Lieutenant'})
CREATE (karim:Personne {nom: 'DAOUDI', prenom: 'Karim', statut: 'Hacker'})
CREATE (sofia:Personne {nom: 'BENALI', prenom: 'Sofia', statut: 'Logistique'})
CREATE (miguel:Personne {nom: 'RODRIGUEZ', prenom: 'Miguel', statut: 'Fournisseur Armes'})
CREATE (yassine:Personne {nom: 'JEBBOUR', prenom: 'Yassine', statut: 'Comptable'})
CREATE (said:Personne {nom: 'OUALI', prenom: 'Said', statut: 'Petite Main'})
CREATE (rachid:Personne {nom: 'TALEB', prenom: 'Rachid', statut: 'Petite Main'})

// --- NOEUDS (Téléphones) ---
CREATE (telAmine:Telephone {numero: '+212611223344'})
CREATE (telHassan:Telephone {numero: '+212699887766'})
CREATE (telSofia:Telephone {numero: '+212600000001'})

// --- RELATIONS HIÉRARCHIQUES ---
// Amine contrôle tout le monde directement ou indirectement
CREATE (amine)-[:DIRIGE {importance: 10}]->(hassan)
CREATE (amine)-[:DIRIGE {importance: 10}]->(yassine)
CREATE (hassan)-[:DIRIGE {importance: 8}]->(karim)
CREATE (hassan)-[:DIRIGE {importance: 8}]->(sofia)
CREATE (miguel)-[:PARTENAIRE {importance: 5}]->(amine) // Relation d'égal à égal commerciale

// Les petites mains obéissent à Hassan
CREATE (hassan)-[:DONNE_ORDRE]->(said)
CREATE (hassan)-[:DONNE_ORDRE]->(rachid)

// --- RELATIONS FONCTIONNELLES ---
CREATE (yassine)-[:FINANCE]->(miguel) // Le comptable paie le fournisseur
CREATE (sofia)-[:LIVRE]->(hassan) // La logistique livre au lieutenant
CREATE (karim)-[:PROTEGE]->(amine) // Le hacker protège le chef

// --- RELATIONS TÉLÉPHONIQUES ---
CREATE (amine)-[:POSSEDE]->(telAmine)
CREATE (hassan)-[:POSSEDE]->(telHassan)
CREATE (sofia)-[:POSSEDE]->(telSofia)

CREATE (telHassan)-[:A_APPELE {date: '2023-11-01', duree: 20}]->(telAmine)
CREATE (telSofia)-[:A_APPELE {date: '2023-11-02', duree: 300}]->(telHassan)
