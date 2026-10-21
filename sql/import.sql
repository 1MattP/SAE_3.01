-- phpMyAdmin SQL Dump
-- version 5.2.0
-- https://www.phpmyadmin.net/
--
-- Hôte : localhost
-- Généré le : jeu. 15 oct. 2026 à 13:43
-- Version du serveur : 11.8.6-MariaDB-0+deb13u1 from Debian
-- Version de PHP : 8.4.26

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Base de données : `pages39`
--

-- --------------------------------------------------------

--
-- L'import est rejouable : image_produit est supprimée en premier, puis
-- produit, car leurs clés étrangères dépendent de produit puis de categorie.
--
DROP TABLE IF EXISTS `mouvement_stock`;
DROP TABLE IF EXISTS `ligne_commande`;
DROP TABLE IF EXISTS `commande`;
DROP TABLE IF EXISTS `utilisateur`;
DROP TABLE IF EXISTS `variante`;
DROP TABLE IF EXISTS `option_valeur`;
DROP TABLE IF EXISTS `option_groupe`;
DROP TABLE IF EXISTS `image_produit`;
DROP TABLE IF EXISTS `produit`;
DROP TABLE IF EXISTS `categorie`;

--
-- Structure de la table `categorie`
--

CREATE TABLE `categorie` (
  `id` tinyint(3) UNSIGNED NOT NULL AUTO_INCREMENT,
  `libelle` varchar(40) NOT NULL,
  `description` varchar(255) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_categorie_libelle` (`libelle`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO `categorie` (`id`, `libelle`, `description`) VALUES
(1, 'Chaussures', 'Baskets de ville, de running et de basketball.'),
(2, 'Vêtements', 'Vestes, pantalons et tenues pour l\'entraînement comme pour la ville.'),
(3, 'Accessoires', 'Casquettes, bonnets, chaussettes, gourdes et sacs.');

-- --------------------------------------------------------

--
-- Structure de la table `produit`
--

CREATE TABLE `produit` (
  `id` smallint(5) UNSIGNED NOT NULL,
  `titre` varchar(160) NOT NULL,
  `nom_url` varchar(160) NOT NULL,
  `description` varchar(120) NOT NULL,
  `description_longue` text NOT NULL,
  `prix` decimal(7,2) NOT NULL,
  `couleurs` varchar(120) NOT NULL,
  `image` varchar(255) DEFAULT NULL,
  `stock` smallint(5) UNSIGNED NOT NULL DEFAULT 0,
  `categorie_id` tinyint(3) UNSIGNED NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Déchargement des données de la table `produit`
--

INSERT INTO `produit` (`id`, `titre`, `nom_url`, `description`, `description_longue`, `prix`, `couleurs`, `image`, `stock`, `categorie_id`) VALUES
(1, 'Air Force 1 \'07', 'air-force-1-07', 'Chaussure de sport', 'Initialement conçue pour le basketball, cette chaussure en cuir se caractérise par une semelle épaisse intégrant l\'unité de confort Air. Elle est réputée pour sa durabilité et son design classique.', '59.99', '#f4f4f5,#09090b,#dc2626', '/images/air-force-1-07.png', 24, 1),
(2, 'Air Max 90', 'air-max-90', 'Chaussure de sport', 'Reconnaissable à son unité Air visible et à sa semelle waffle, l\'Air Max 90 allie amorti et maintien. Son empeigne en cuir et textile offre un confort durable au quotidien.', '149.99', '#f4f4f5,#09090b,#2563eb', '/images/air-max-90.avif', 4, 1),
(3, 'Dunk Low', 'dunk-low', 'Chaussure de ville', 'Née sur les terrains de basketball, la Dunk Low est devenue un classique de la rue. Son empeigne en cuir et sa semelle en caoutchouc assurent une bonne adhérence et un style intemporel.', '119.99', '#f4f4f5,#16a34a', '/images/Dunk-Low.avif', 0, 1),
(4, 'Pegasus 42', 'pegasus-42', 'Chaussure de ville', 'Légère et respirante, la Pegasus 42 est pensée pour les longues sorties. Sa maille aérée et sa semelle réactive offrent un amorti régulier à chaque foulée.', '139.99', '#f4f4f5,#16a34a', '/images/Nike-Pegasus-42.avif', 15, 1),
(5, 'Jordan Luka 77', 'jordan-luka-77', 'Chaussure de ville', 'Inspirée du jeu de Luka Dončić, cette chaussure combine un maintien solide et un amorti réactif. Son empeigne synthétique résiste aux changements de direction rapides.', '99.99', '#f4f4f5,#09090b', '/images/jordan-luka-77.avif', 5, 1),
(7, 'Cortez', 'cortez', 'Chaussure de ville', 'Chaussure de running à l\'origine, la Cortez a conservé sa silhouette fine et sa semelle en mousse. Son cuir souple lui donne un style rétro facile à porter.', '89.99', '#71717a,#09090b', '/images/Cortez.avif', 40, 1),
(8, 'Air Jordan 1 Mid', 'air-jordan-1-mid', 'Chaussure de ville', 'Fidèle à l\'esprit de la première Air Jordan, ce modèle mi-montant en cuir offre un maintien confortable de la cheville et une unité Air dans le talon.', '74.99', '#f4f4f5,#09090b,#dc2626', '/images/air-jordan-1-mid.avif', 1, 1),
(10, 'Nike P-6000', 'nike-p-6000', 'Chaussure de course', 'Inspirée des chaussures de running du début des années 2000, la P-6000 associe maille respirante et surpiqûres synthétiques pour un amorti confortable toute la journée.', '89.99', '#71717a,#f4f4f5', '/images/Nike-P-6000.avif', 12, 1),
(14, 'Nike Sportswear Tech Fleece', 'nike-sportswear-tech-fleece', 'Pantalon de survêtement', 'Ce pantalon en molleton Tech Fleece offre une chaleur légère sans volume excessif. Sa coupe ajustée et sa matière douce conviennent à l\'entraînement comme à la ville.', '69.99', '#09090b,#71717a', '/images/Nike-Sportswear-Tech-Fleece.avif', 0, 2),
(16, 'ACG Aireez', 'acg-aireez', 'Veste légère', 'Pensée pour l\'extérieur, cette veste légère en nylon protège du vent et se range facilement dans un sac. Sa coupe souple laisse libre de ses mouvements.', '114.99', '#f4f4f5,#16a34a', '/images/ACG-Aireez.avif', 30, 2),
(18, 'Jordan Brooklyn', 'jordan-brooklyn', 'Pantalon cargo', 'Ce pantalon cargo en coton résistant dispose de poches latérales pratiques. Sa coupe décontractée offre un confort durable au quotidien.', '109.99', '#2563eb,#09090b', '/images/Jordan Brooklyn.avif', 3, 2),
(19, 'Nike Fly', 'nike-fly', 'Casquette', 'Cette casquette en coton dispose d\'une visière incurvée et d\'une fermeture réglable. Elle protège du soleil tout en restant légère et confortable.', '29.99', '#09090b,#f4f4f5,#dc2626', '/images/Nike-Fly.avif', 50, 3),
(21, 'Nike Peak', 'nike-peak', 'Bonnet', 'Ce bonnet en maille acrylique se porte aussi bien à l\'entraînement qu\'en ville. Sa matière douce et extensible tient chaud sans serrer.', '22.99', '#09090b,#f4f4f5', '/images/Nike-Peak.avif', 6, 3),
(22, 'Nike Everyday Cushioned', 'nike-everyday-cushioned', 'Chaussettes', 'Ces chaussettes rembourrées sont conçues pour un amorti confortable à chaque pas. Leur tissu évacue l\'humidité et reste agréable toute la journée.', '24.99', '#f4f4f5,#09090b', '/images/Nike-Everyday-Cushioned.avif', 100, 3),
(23, 'GNike Refuel', 'nike-refuel', 'Gourde', 'Cette gourde réutilisable est conçue pour t\'accompagner à l\'entraînement comme au quotidien. Son bouchon sécurisé évite les fuites dans le sac.', '19.99', '#2563eb,#09090b', '/images/Nike-Refuel.avif', 2, 3),
(24, 'Nike Commute', 'nike-commute', 'Sac Banane', 'Ce sac banane en polyester se porte à la taille ou en bandoulière. Ses compartiments zippés permettent de ranger l\'essentiel en toute sécurité.', '49.99', '#09090b,#71717a', '/images/Nike-commute.avif', 18, 3);

--
-- Index pour les tables déchargées
--

--
-- Index pour la table `produit`
--
ALTER TABLE `produit`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `uq_produit_nom_url` (`nom_url`),
  ADD KEY `idx_produit_titre` (`titre`),
  ADD KEY `idx_produit_prix` (`prix`),
  ADD KEY `idx_produit_categorie` (`categorie_id`);

--
-- AUTO_INCREMENT pour les tables déchargées
--

--
-- AUTO_INCREMENT pour la table `produit`
--
ALTER TABLE `produit`
  MODIFY `id` smallint(5) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=25;

--
-- Contraintes pour les tables déchargées
--

--
-- Contraintes pour la table `produit`
--
ALTER TABLE `produit`
  ADD CONSTRAINT `fk_produit_categorie` FOREIGN KEY (`categorie_id`) REFERENCES `categorie` (`id`) ON UPDATE CASCADE;
-- --------------------------------------------------------

--
-- Structure de la table `image_produit`
--

CREATE TABLE `image_produit` (
  `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT,
  `produit_id` smallint(5) UNSIGNED NOT NULL,
  `url` varchar(255) NOT NULL,
  `position` tinyint(3) UNSIGNED NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_image_produit_position` (`produit_id`, `position`),
  CONSTRAINT `fk_image_produit_produit` FOREIGN KEY (`produit_id`) REFERENCES `produit` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Quatre emplacements par produit, remplis avec l'image du catalogue en
-- attendant les vues supplémentaires.
--
INSERT INTO `image_produit` (`produit_id`, `url`, `position`)
SELECT produit.id, produit.image, positions.position
  FROM produit
CROSS JOIN (
          SELECT 1 AS position
UNION ALL SELECT 2
UNION ALL SELECT 3
UNION ALL SELECT 4
) AS positions
WHERE produit.image IS NOT NULL;

-- --------------------------------------------------------

--
-- Structure des tables `option_groupe` et `option_valeur`
--
-- Un groupe est une option d'un produit (Pointure, Taille…) et
-- contient plusieurs valeurs.
--

CREATE TABLE `option_groupe` (
  `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT,
  `produit_id` smallint(5) UNSIGNED NOT NULL,
  `nom` varchar(40) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_option_groupe_produit` (`produit_id`),
  CONSTRAINT `fk_option_groupe_produit` FOREIGN KEY (`produit_id`) REFERENCES `produit` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `option_valeur` (
  `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT,
  `groupe_id` int(10) UNSIGNED NOT NULL,
  `libelle` varchar(40) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_option_valeur_groupe` (`groupe_id`),
  CONSTRAINT `fk_option_valeur_groupe` FOREIGN KEY (`groupe_id`) REFERENCES `option_groupe` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO `option_groupe` (`produit_id`, `nom`)
SELECT `id`, 'Pointure' FROM `produit` WHERE `categorie_id` = 1;

INSERT INTO `option_groupe` (`produit_id`, `nom`)
SELECT `id`, 'Taille' FROM `produit` WHERE `categorie_id` = 2;

INSERT INTO `option_valeur` (`groupe_id`, `libelle`)
SELECT `option_groupe`.`id`, `valeurs`.`libelle`
  FROM `option_groupe`
CROSS JOIN (
          SELECT '40' AS `libelle`
UNION ALL SELECT '41'
UNION ALL SELECT '42'
UNION ALL SELECT '43'
UNION ALL SELECT '44'
) AS `valeurs`
WHERE `option_groupe`.`nom` = 'Pointure';

INSERT INTO `option_valeur` (`groupe_id`, `libelle`)
SELECT `option_groupe`.`id`, `valeurs`.`libelle`
  FROM `option_groupe`
CROSS JOIN (
          SELECT 'S' AS `libelle`
UNION ALL SELECT 'M'
UNION ALL SELECT 'L'
UNION ALL SELECT 'XL'
) AS `valeurs`
WHERE `option_groupe`.`nom` = 'Taille';

-- --------------------------------------------------------

--
-- Structure de la table `variante`
--
-- Une variante est une combinaison d'options et de couleur d'un produit, avec
-- son propre stock. cle contient les identifiants des valeurs d'options
-- choisies, triés et séparés par des virgules (vide si le produit n'a pas
-- d'option).
--

CREATE TABLE `variante` (
  `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT,
  `produit_id` smallint(5) UNSIGNED NOT NULL,
  `cle` varchar(60) NOT NULL DEFAULT '',
  `couleur` varchar(120) NOT NULL DEFAULT '',
  `stock` smallint(5) UNSIGNED NOT NULL DEFAULT 0,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_variante_combinaison` (`produit_id`, `cle`, `couleur`),
  CONSTRAINT `fk_variante_produit` FOREIGN KEY (`produit_id`) REFERENCES `produit` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Une variante par valeur d'option et par couleur (jusqu'à 3 couleurs), puis
-- une variante par couleur pour les produits sans option.
--
INSERT INTO `variante` (`produit_id`, `cle`, `couleur`, `stock`)
SELECT `option_groupe`.`produit_id`,
       CAST(`option_valeur`.`id` AS CHAR),
       TRIM(SUBSTRING_INDEX(SUBSTRING_INDEX(`produit`.`couleurs`, ',', `rang`.`n`), ',', -1)),
       0
  FROM `option_valeur`
INNER JOIN `option_groupe` ON `option_groupe`.`id` = `option_valeur`.`groupe_id`
INNER JOIN `produit` ON `produit`.`id` = `option_groupe`.`produit_id`
INNER JOIN (
          SELECT 1 AS `n`
UNION ALL SELECT 2
UNION ALL SELECT 3
UNION ALL SELECT 4
UNION ALL SELECT 5
UNION ALL SELECT 6
) AS `rang` ON `rang`.`n` <= 1 + LENGTH(`produit`.`couleurs`) - LENGTH(REPLACE(`produit`.`couleurs`, ',', ''));

INSERT INTO `variante` (`produit_id`, `cle`, `couleur`, `stock`)
SELECT `produit`.`id`,
       '',
       TRIM(SUBSTRING_INDEX(SUBSTRING_INDEX(`produit`.`couleurs`, ',', `rang`.`n`), ',', -1)),
       0
  FROM `produit`
INNER JOIN (
          SELECT 1 AS `n`
UNION ALL SELECT 2
UNION ALL SELECT 3
UNION ALL SELECT 4
UNION ALL SELECT 5
UNION ALL SELECT 6
) AS `rang` ON `rang`.`n` <= 1 + LENGTH(`produit`.`couleurs`) - LENGTH(REPLACE(`produit`.`couleurs`, ',', ''))
WHERE `produit`.`id` NOT IN (SELECT `produit_id` FROM `option_groupe`);

--
-- Migration du stock : l'ancien stock du produit est réparti à parts égales
-- entre ses variantes (le reste va à la première), puis la colonne disparaît.
--
UPDATE `variante`
INNER JOIN `produit` ON `produit`.`id` = `variante`.`produit_id`
INNER JOIN (
  SELECT `produit_id`, COUNT(*) AS `nombre`, MIN(`id`) AS `premiere`
    FROM `variante`
GROUP BY `produit_id`
) AS `total` ON `total`.`produit_id` = `variante`.`produit_id`
SET `variante`.`stock` = `produit`.`stock` DIV `total`.`nombre`
    + IF(`variante`.`id` = `total`.`premiere`, `produit`.`stock` MOD `total`.`nombre`, 0);

ALTER TABLE `produit` DROP COLUMN `stock`;

-- --------------------------------------------------------

--
-- Structure de la table `utilisateur`
--
-- mot_de_passe contient le hash bcrypt (60 caractères), jamais le mot de
-- passe lui-même.
--

CREATE TABLE `utilisateur` (
  `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT,
  `email` varchar(190) NOT NULL,
  `nom` varchar(80) NOT NULL DEFAULT '',
  `mot_de_passe` varchar(255) NOT NULL,
  `role` varchar(10) NOT NULL DEFAULT 'user',
  `date_creation` datetime NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_utilisateur_email` (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Structure de la table `commande`
--
-- numero vaut NULL le temps de l'insertion : il est calculé à partir de
-- l'identifiant (CMD-000123), dans la même transaction.
--

CREATE TABLE `commande` (
  `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT,
  `numero` varchar(20) DEFAULT NULL,
  `utilisateur_id` int(10) UNSIGNED NOT NULL,
  `statut` varchar(20) NOT NULL DEFAULT 'en cours',
  `total` decimal(9,2) NOT NULL,
  `date_creation` datetime NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_commande_numero` (`numero`),
  KEY `idx_commande_utilisateur` (`utilisateur_id`),
  CONSTRAINT `fk_commande_utilisateur` FOREIGN KEY (`utilisateur_id`) REFERENCES `utilisateur` (`id`) ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Structure de la table `ligne_commande`
--
-- titre et prix_unitaire sont figés au moment de la commande. Si le produit
-- est supprimé, produit_id passe à NULL et la ligne est conservée.
--

CREATE TABLE `ligne_commande` (
  `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT,
  `commande_id` int(10) UNSIGNED NOT NULL,
  `produit_id` smallint(5) UNSIGNED DEFAULT NULL,
  `variante_id` int(10) UNSIGNED DEFAULT NULL,
  `titre` varchar(160) NOT NULL,
  `prix_unitaire` decimal(7,2) NOT NULL,
  `quantite` smallint(5) UNSIGNED NOT NULL,
  `options` varchar(255) NOT NULL DEFAULT '',
  `couleur` varchar(120) NOT NULL DEFAULT '',
  PRIMARY KEY (`id`),
  KEY `idx_ligne_commande_commande` (`commande_id`),
  KEY `idx_ligne_commande_produit` (`produit_id`),
  KEY `idx_ligne_commande_variante` (`variante_id`),
  CONSTRAINT `fk_ligne_commande_commande` FOREIGN KEY (`commande_id`) REFERENCES `commande` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_ligne_commande_produit` FOREIGN KEY (`produit_id`) REFERENCES `produit` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `fk_ligne_commande_variante` FOREIGN KEY (`variante_id`) REFERENCES `variante` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Structure de la table `mouvement_stock`
--
-- Journal des variations de stock : quantite est négative pour une vente et
-- positive pour une annulation. Les lignes ne sont jamais supprimées.
--

CREATE TABLE `mouvement_stock` (
  `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT,
  `produit_id` smallint(5) UNSIGNED DEFAULT NULL,
  `variante_id` int(10) UNSIGNED DEFAULT NULL,
  `commande_id` int(10) UNSIGNED NOT NULL,
  `type` varchar(20) NOT NULL,
  `quantite` smallint(6) NOT NULL,
  `date_creation` datetime NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `idx_mouvement_stock_produit` (`produit_id`),
  KEY `idx_mouvement_stock_variante` (`variante_id`),
  KEY `idx_mouvement_stock_commande` (`commande_id`),
  CONSTRAINT `fk_mouvement_stock_produit` FOREIGN KEY (`produit_id`) REFERENCES `produit` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `fk_mouvement_stock_variante` FOREIGN KEY (`variante_id`) REFERENCES `variante` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `fk_mouvement_stock_commande` FOREIGN KEY (`commande_id`) REFERENCES `commande` (`id`) ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Compte administrateur de test : admin@nike.fr (mot de passe de test indiqué
-- hors du dépôt). Pour promouvoir un compte existant :
-- UPDATE `utilisateur` SET `role` = 'admin' WHERE `email` = '...';
--

INSERT INTO `utilisateur` (`email`, `mot_de_passe`, `role`) VALUES
('admin@nike.fr', '$2y$12$vdHwz7xSwS5jZArd0ZyaLOeby/0Ba/GC4lNWzyrj/2dWL1AnBc5ju', 'admin');
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
