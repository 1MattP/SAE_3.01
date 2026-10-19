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
