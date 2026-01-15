-- =============================================
-- PARTIE 1 : CRÉATION DU SCHÉMA (DDL)
-- =============================================

-- Création de la base de données (si nécessaire)
-- CREATE DATABASE IF NOT EXISTS criminel_network_sql;
-- USE criminel_network_sql;

-- Désactiver temporairement les vérifications de clés étrangères pour faciliter la création
SET FOREIGN_KEY_CHECKS=0;

-- ---------------------------------------------
-- TABLE 1 : Personne (Les individus)
-- ---------------------------------------------
DROP TABLE IF EXISTS Personne;
CREATE TABLE Personne (
    id_personne INT AUTO_INCREMENT PRIMARY KEY,
    nom VARCHAR(100) NOT NULL,
    prenom VARCHAR(100),
    surnom VARCHAR(100),
    statut ENUM('Suspect', 'Civil', 'Informateur', 'Cible') NOT NULL,
    date_creation TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ---------------------------------------------
-- TABLE 2 : Organisation (Mafias, Entreprises écrans)
-- ---------------------------------------------
DROP TABLE IF EXISTS Organisation;
CREATE TABLE Organisation (
    id_org INT AUTO_INCREMENT PRIMARY KEY,
    nom_org VARCHAR(150) NOT NULL UNIQUE,
    type_org VARCHAR(100) -- Ex: 'Syndicat du crime', 'Entreprise légitime'
);

-- ---------------------------------------------
-- TABLE 3 : Emploi (Table de jointure Personne <-> Organisation)
-- Relation N:M : Une personne peut avoir plusieurs "jobs" dans plusieurs orgs
-- ---------------------------------------------
DROP TABLE IF EXISTS Emploi;
CREATE TABLE Emploi (
    fk_personne INT NOT NULL,
    fk_organisation INT NOT NULL,
    role VARCHAR(100), -- Ex: 'Parrain', 'Comptable', 'Soldat'
    PRIMARY KEY (fk_personne, fk_organisation),
    CONSTRAINT FK_Emploi_Personne FOREIGN KEY (fk_personne) REFERENCES Personne(id_personne),
    CONSTRAINT FK_Emploi_Org FOREIGN KEY (fk_organisation) REFERENCES Organisation(id_org)
);

-- ---------------------------------------------
-- TABLE 4 : Relation_Personne (Table de jointure réflexive Personne <-> Personne)
-- C'est la table la plus complexe en SQL pour gérer le "Qui connaît Qui"
-- ---------------------------------------------
DROP TABLE IF EXISTS Relation_Personne;
CREATE TABLE Relation_Personne (
    fk_personne_A INT NOT NULL,
    fk_personne_B INT NOT NULL,
    nature_relation VARCHAR(100), -- Ex: 'Associé', 'Famille', 'Rival'
    date_debut DATE,
    PRIMARY KEY (fk_personne_A, fk_personne_B),
    CONSTRAINT FK_Rel_PersA FOREIGN KEY (fk_personne_A) REFERENCES Personne(id_personne),
    CONSTRAINT FK_Rel_PersB FOREIGN KEY (fk_personne_B) REFERENCES Personne(id_personne),
    -- Contrainte pour éviter que A soit lié à A
    CONSTRAINT CHK_DiffPersonnes CHECK (fk_personne_A <> fk_personne_B)
);

-- ---------------------------------------------
-- TABLE 5 : Telephone
-- ---------------------------------------------
DROP TABLE IF EXISTS Telephone;
CREATE TABLE Telephone (
    id_telephone INT AUTO_INCREMENT PRIMARY KEY,
    numero VARCHAR(20) NOT NULL UNIQUE,
    operateur VARCHAR(50),
    imei VARCHAR(20)
);

-- ---------------------------------------------
-- TABLE 6 : Utilisateur_Tel (Table de jointure Personne <-> Telephone)
-- ---------------------------------------------
DROP TABLE IF EXISTS Utilisateur_Tel;
CREATE TABLE Utilisateur_Tel (
    fk_personne INT NOT NULL,
    fk_telephone INT NOT NULL,
    est_proprietaire BOOLEAN DEFAULT TRUE,
    PRIMARY KEY (fk_personne, fk_telephone),
    CONSTRAINT FK_UtilTel_Pers FOREIGN KEY (fk_personne) REFERENCES Personne(id_personne),
    CONSTRAINT FK_UtilTel_Tel FOREIGN KEY (fk_telephone) REFERENCES Telephone(id_telephone)
);

-- ---------------------------------------------
-- TABLE 7 : Appel (Table de jointure Telephone <-> Telephone)
-- C'est le "journal des appels" (Logs)
-- ---------------------------------------------
DROP TABLE IF EXISTS Appel;
CREATE TABLE Appel (
    id_appel BIGINT AUTO_INCREMENT PRIMARY KEY,
    fk_tel_appelant INT NOT NULL,
    fk_tel_appele INT NOT NULL,
    date_heure_appel DATETIME NOT NULL,
    duree_secondes INT,
    CONSTRAINT FK_Appel_Appelant FOREIGN KEY (fk_tel_appelant) REFERENCES Telephone(id_telephone),
    CONSTRAINT FK_Appel_Appele FOREIGN KEY (fk_tel_appele) REFERENCES Telephone(id_telephone)
);

-- Réactiver les vérifications de clés étrangères
SET FOREIGN_KEY_CHECKS=1;


-- =============================================
-- PARTIE 2 : INSERTION DES DONNÉES (DML) - SYNCHRONISÉ AVEC MONGO/NEO4J
-- =============================================

-- 1. Insertion des Personnes
INSERT INTO Personne (id_personne, nom, prenom, surnom, statut) VALUES
(1, 'CHARRO', 'Amine', 'Le Parrain', 'Suspect'),
(2, 'EL-FASSI', 'Hassan', 'Le Bras Droit', 'Suspect'),
(3, 'BENALI', 'Sofia', 'La Reine du Port', 'Suspect'),
(4, 'DAOUDI', 'Karim', 'K-Ghost', 'Suspect'),
(5, 'RODRIGUEZ', 'Miguel', 'El Gringo', 'Suspect'),
(6, 'JEBBOUR', 'Yassine', 'Le Comptable', 'Suspect'),
(7, 'OUALI', 'Said', 'La Main', 'Suspect'),
(8, 'TALEB', 'Rachid', 'Le Pilote', 'Suspect');

-- 2. Insertion des Organisations
INSERT INTO Organisation (id_org, nom_org, type_org) VALUES
(1, 'Cartel de Casablanca', 'Syndicat du crime'),
(2, 'Tanger Logistics S.A.R.L', 'Entreprise écran (Import-Export)'),
(3, 'Jebbour Immobilier', 'Agence Immobilière (Blanchiment)');

-- 3. Insertion des Emplois
INSERT INTO Emploi (fk_personne, fk_organisation, role) VALUES
(1, 1, 'Chef Suprême'),
(2, 1, 'Lieutenant Chef'),
(3, 2, 'Directrice des Opérations'),
(6, 3, 'Gérant'),
(6, 1, 'Expert Financier'),
(4, 1, 'Cybersécurité');

-- 4. Insertion des Relations
INSERT INTO Relation_Personne (fk_personne_A, fk_personne_B, nature_relation, date_debut) VALUES
(1, 2, 'Confiance absolue', '2015-06-01'),
(1, 6, 'Partenaire financier', '2018-09-15'),
(2, 7, 'Hiérarchique', '2022-01-01'),
(2, 8, 'Hiérarchique', '2022-02-01'),
(3, 1, 'Partenaire Logistique', '2019-03-10');

-- 5. Insertion des Téléphones (Coordonné avec Neo4j)
INSERT INTO Telephone (id_telephone, numero, operateur) VALUES
(1, '+212611223344', 'Maroc Telecom'), -- Amine
(2, '+212699887766', 'Inwi'),          -- Hassan
(3, '+212600000001', 'Orange');        -- Sofia

-- 6. Lier les personnes aux téléphones
INSERT INTO Utilisateur_Tel (fk_personne, fk_telephone, est_proprietaire) VALUES
(1, 1, TRUE),
(2, 2, TRUE),
(3, 3, TRUE);

-- 7. Journal des appels (Logs)
INSERT INTO Appel (fk_tel_appelant, fk_tel_appele, date_heure_appel, duree_secondes) VALUES
(1, 2, '2023-11-01 10:00:00', 120), -- Amine appelle Hassan
(3, 2, '2023-11-01 14:30:00', 300), -- Sofia appelle Hassan (Livraison)
(2, 1, '2023-11-01 18:00:00', 45);  -- Hassan rend compte à Amine

COMMIT;
