<?php

declare(strict_types=1);

namespace App\Model;

use PDO;

/**
 * Accès aux données du catalogue.
 *
 * Cette couche ne contient aucune règle métier et ne décide de rien :
 * elle exécute les requêtes qu'on lui demande et renvoie des tableaux.
 */
final class ProduitModel
{
    /** Connexion à la base, fournie à la construction. */
    private PDO $pdo;

    private int $seuilStock;

    public function __construct(PDO $pdo, int $seuilStock)
    {
        $this->pdo        = $pdo;
        $this->seuilStock = $seuilStock;
    }

    public function compter(int $categorie): int
    {
        $sql = 'SELECT COUNT(*)
                FROM produit
                WHERE :toutes = 0 OR produit.categorie_id = :categorie';

        $requetePreparee = $this->pdo->prepare($sql);
        $requetePreparee->bindValue(':toutes',    $categorie, PDO::PARAM_INT);
        $requetePreparee->bindValue(':categorie', $categorie, PDO::PARAM_INT);
        $requetePreparee->execute();

        return (int) $requetePreparee->fetchColumn();
    }

    public function lister(int $categorie, int $limite, int $decalage): array
    {
        $sql = "SELECT produit.id,
                    produit.titre,
                    produit.nom_url AS urlName,
                    produit.description,
                    produit.prix,
                    produit.couleurs,
                    produit.image,
                    CASE WHEN produit.stock = 0 THEN 'epuise'
                         WHEN produit.stock <= :seuil THEN 'bientot_epuise'
                         ELSE 'en_stock' END AS etatStock,
                    categorie.libelle AS categorie
                FROM produit
            INNER JOIN categorie ON categorie.id = produit.categorie_id
                WHERE :toutes = 0 OR produit.categorie_id = :categorie
            ORDER BY produit.titre, produit.id
                LIMIT :limite OFFSET :decalage";

        $requetePreparee = $this->pdo->prepare($sql);
        $requetePreparee->bindValue(':seuil',     $this->seuilStock, PDO::PARAM_INT);
        $requetePreparee->bindValue(':toutes',    $categorie, PDO::PARAM_INT);
        $requetePreparee->bindValue(':categorie', $categorie, PDO::PARAM_INT);
        $requetePreparee->bindValue(':limite',    $limite,    PDO::PARAM_INT);
        $requetePreparee->bindValue(':decalage',  $decalage,  PDO::PARAM_INT);
        $requetePreparee->execute();

        return $requetePreparee->fetchAll();
    }

    public function trouverParNomUrl(string $urlName): ?array
    {
        $sql = "SELECT produit.id,
                       produit.titre,
                       produit.nom_url AS urlName,
                       produit.description,
                       produit.description_longue,
                       produit.prix,
                       produit.stock,
                       CASE WHEN produit.stock = 0 THEN 'epuise'
                            WHEN produit.stock <= :seuil THEN 'bientot_epuise'
                            ELSE 'en_stock' END AS etatStock,
                       categorie.libelle AS categorie
                  FROM produit
            INNER JOIN categorie ON categorie.id = produit.categorie_id
                 WHERE produit.nom_url = :urlName";

        $requetePreparee = $this->pdo->prepare($sql);
        $requetePreparee->bindValue(':seuil',   $this->seuilStock, PDO::PARAM_INT);
        $requetePreparee->bindValue(':urlName', $urlName, PDO::PARAM_STR);
        $requetePreparee->execute();

        $ligne = $requetePreparee->fetch();

        return $ligne === false ? null : $ligne;
    }


    public function images(int $produit): array
    {
        $sql = 'SELECT url
                  FROM image_produit
                 WHERE produit_id = :produit
              ORDER BY position';

        $requetePreparee = $this->pdo->prepare($sql);
        $requetePreparee->bindValue(':produit', $produit, PDO::PARAM_INT);
        $requetePreparee->execute();

        return $requetePreparee->fetchAll(PDO::FETCH_COLUMN);
    }


    public function listerTout(): array
    {
        $sql = 'SELECT produit.id,
                       produit.titre,
                       produit.nom_url AS urlName,
                       produit.prix,
                       produit.stock,
                       produit.image,
                       categorie.libelle AS categorie
                  FROM produit
            INNER JOIN categorie ON categorie.id = produit.categorie_id
              ORDER BY produit.titre, produit.id';

        return $this->pdo->query($sql)->fetchAll();
    }

    public function trouverParId(int $id): ?array
    {
        $sql = 'SELECT id,
                       titre,
                       nom_url AS urlName,
                       description,
                       description_longue AS descriptionLongue,
                       prix,
                       couleurs,
                       image,
                       stock,
                       categorie_id AS categorieId
                  FROM produit
                 WHERE id = :id';

        $requetePreparee = $this->pdo->prepare($sql);
        $requetePreparee->bindValue(':id', $id, PDO::PARAM_INT);
        $requetePreparee->execute();

        $ligne = $requetePreparee->fetch();

        return $ligne === false ? null : $ligne;
    }

    public function nomUrlPris(string $urlName, int $sauf): bool
    {
        $sql = 'SELECT COUNT(*) FROM produit WHERE nom_url = :urlName AND id <> :sauf';

        $requetePreparee = $this->pdo->prepare($sql);
        $requetePreparee->bindValue(':urlName', $urlName, PDO::PARAM_STR);
        $requetePreparee->bindValue(':sauf',    $sauf,    PDO::PARAM_INT);
        $requetePreparee->execute();

        return (int) $requetePreparee->fetchColumn() > 0;
    }

    public function ajouter(array $produit): int
    {
        $this->pdo->beginTransaction();

        $sql = 'INSERT INTO produit (titre, nom_url, description, description_longue, prix, couleurs, image, stock, categorie_id)
                VALUES (:titre, :urlName, :description, :descriptionLongue, :prix, :couleurs, :image, :stock, :categorie)';

        $requetePreparee = $this->pdo->prepare($sql);
        $this->lierProduit($requetePreparee, $produit);
        $requetePreparee->execute();

        $id = (int) $this->pdo->lastInsertId();

        $this->enregistrerImage($id, $produit['image']);

        $this->pdo->commit();

        return $id;
    }

    public function modifier(int $id, array $produit): void
    {
        $this->pdo->beginTransaction();

        $sql = 'UPDATE produit
                   SET titre = :titre,
                       nom_url = :urlName,
                       description = :description,
                       description_longue = :descriptionLongue,
                       prix = :prix,
                       couleurs = :couleurs,
                       image = :image,
                       stock = :stock,
                       categorie_id = :categorie
                 WHERE id = :id';

        $requetePreparee = $this->pdo->prepare($sql);
        $this->lierProduit($requetePreparee, $produit);
        $requetePreparee->bindValue(':id', $id, PDO::PARAM_INT);
        $requetePreparee->execute();

        $this->enregistrerImage($id, $produit['image']);

        $this->pdo->commit();
    }

    public function supprimer(int $id): void
    {
        $sql = 'DELETE FROM produit WHERE id = :id';

        $requetePreparee = $this->pdo->prepare($sql);
        $requetePreparee->bindValue(':id', $id, PDO::PARAM_INT);
        $requetePreparee->execute();
    }

    private function lierProduit(\PDOStatement $requetePreparee, array $produit): void
    {
        $requetePreparee->bindValue(':titre',             $produit['titre'],             PDO::PARAM_STR);
        $requetePreparee->bindValue(':urlName',           $produit['urlName'],           PDO::PARAM_STR);
        $requetePreparee->bindValue(':description',       $produit['description'],       PDO::PARAM_STR);
        $requetePreparee->bindValue(':descriptionLongue', $produit['descriptionLongue'], PDO::PARAM_STR);
        $requetePreparee->bindValue(':prix',              $produit['prix'],              PDO::PARAM_STR);
        $requetePreparee->bindValue(':couleurs',          $produit['couleurs'],          PDO::PARAM_STR);
        $requetePreparee->bindValue(':image',             $produit['image'],             PDO::PARAM_STR);
        $requetePreparee->bindValue(':stock',             $produit['stock'],             PDO::PARAM_INT);
        $requetePreparee->bindValue(':categorie',         $produit['categorieId'],       PDO::PARAM_INT);
    }

    private function enregistrerImage(int $id, string $image): void
    {
        $sql = 'INSERT INTO image_produit (produit_id, url, position)
                VALUES (:produit, :url, 1)
                ON DUPLICATE KEY UPDATE url = VALUES(url)';

        $requetePreparee = $this->pdo->prepare($sql);
        $requetePreparee->bindValue(':produit', $id,    PDO::PARAM_INT);
        $requetePreparee->bindValue(':url',     $image, PDO::PARAM_STR);
        $requetePreparee->execute();
    }

    public function categories(): array
    {
        $sql = 'SELECT categorie.id,
                       categorie.libelle,
                       COUNT(produit.id) AS nombre
                  FROM categorie
              LEFT JOIN produit ON produit.categorie_id = categorie.id
              GROUP BY categorie.id, categorie.libelle
              ORDER BY categorie.id';

              $lignes = $this->pdo->query($sql)->fetchAll();

              $categories = [];

                foreach ($lignes as $ligne) {
                    $categories[] = [
                        'id'      => (int) $ligne['id'],
                        'libelle' => $ligne['libelle'],
                        'nombre'  => (int) $ligne['nombre'],
                    ];
                }

        return $categories;

    }



}
