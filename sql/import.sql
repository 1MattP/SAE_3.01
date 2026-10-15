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
-- L'import est rejouable : produit est supprimée en premier, car sa clé
-- étrangère dépend de categorie.
--
DROP TABLE IF EXISTS `produit`;
DROP TABLE IF EXISTS `categorie`;

--
-- Structure de la table `categorie`
--

CREATE TABLE `categorie` (
  `id` tinyint(3) UNSIGNED NOT NULL AUTO_INCREMENT,
  `libelle` varchar(40) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_categorie_libelle` (`libelle`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO `categorie` (`id`, `libelle`) VALUES
(1, 'Chaussures'),
(2, 'Vêtements'),
(3, 'Accessoires');

-- --------------------------------------------------------

--
-- Structure de la table `produit`
--

CREATE TABLE `produit` (
  `id` smallint(5) UNSIGNED NOT NULL,
  `titre` varchar(160) NOT NULL,
  `description` varchar(120) NOT NULL,
  `prix` decimal(7,2) NOT NULL,
  `couleurs` varchar(120) NOT NULL,
  `image` varchar(255) DEFAULT NULL,
  `categorie_id` tinyint(3) UNSIGNED NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Déchargement des données de la table `produit`
--

INSERT INTO `produit` (`id`, `titre`, `description`, `prix`, `couleurs`, `image`, `categorie_id`) VALUES
(1, 'Air Force 1 \'07', 'Chaussure de sport', '59.99', '#f4f4f5,#09090b,#dc2626', '/images/air-force-1-07.png', 1),
(2, 'Air Max 90', 'Chaussure de sport', '149.99', '#f4f4f5,#09090b,#2563eb', '/images/air-max-90.avif', 1),
(3, 'Dunk Low', 'Chaussure de ville', '119.99', '#f4f4f5,#16a34a', '/images/Dunk-Low.avif', 1),
(4, 'Pegasus 42', 'Chaussure de ville', '139.99', '#f4f4f5,#16a34a', '/images/Nike-Pegasus-42.avif', 1),
(5, 'Jordan Luka 77', 'Chaussure de ville', '99.99', '#f4f4f5,#09090b', '/images/jordan-luka-77.avif', 1),
(7, 'Cortez', 'Chaussure de ville', '89.99', '#71717a,#09090b', '/images/Cortez.avif', 1),
(8, 'Air Jordan 1 Mid', 'Chaussure de ville', '74.99', '#f4f4f5,#09090b,#dc2626', '/images/air-jordan-1-mid.avif', 1),
(10, 'Nike P-6000', 'Chaussure de course', '89.99', '#71717a,#f4f4f5', '/images/Nike-P-6000.avif', 1),
(14, 'Nike Sportswear Tech Fleece', 'Pantalon de survêtement', '69.99', '#09090b,#71717a', '/images/Nike-Sportswear-Tech-Fleece.avif', 2),
(16, 'ACG Aireez', 'Veste légère', '114.99', '#f4f4f5,#16a34a', '/images/ACG-Aireez.avif', 2),
(18, 'Jordan Brooklyn', 'Pantalon cargo', '109.99', '#2563eb,#09090b', '/images/Jordan Brooklyn.avif', 2),
(19, 'Nike Fly', 'Casquette', '29.99', '#09090b,#f4f4f5,#dc2626', '/images/Nike-Fly.avif', 3),
(21, 'Nike Peak', 'Bonnet', '22.99', '#09090b,#f4f4f5', '/images/Nike-Peak.avif', 3),
(22, 'Nike Everyday Cushioned', 'Chaussettes', '24.99', '#f4f4f5,#09090b', '/images/Nike-Everyday-Cushioned.avif', 3),
(23, 'GNike Refuel', 'Gourde', '19.99', '#2563eb,#09090b', '/images/Nike-Refuel.avif', 3),
(24, 'Nike Commute', 'Sac Banane', '49.99', '#09090b,#71717a', '/images/Nike-commute.avif', 3);

--
-- Index pour les tables déchargées
--

--
-- Index pour la table `produit`
--
ALTER TABLE `produit`
  ADD PRIMARY KEY (`id`),
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
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
