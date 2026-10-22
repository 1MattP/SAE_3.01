<?php

declare(strict_types=1);

namespace App\Model;

use PDO;

final class CategorieModel
{
    private PDO $pdo;

    public function __construct(PDO $pdo)
    {
        $this->pdo = $pdo;
    }

    public function compter(): int
    {
        return (int) $this->pdo->query('SELECT COUNT(*) FROM categorie')->fetchColumn();
    }

    public function lister(): array
    {
        $sql = 'SELECT categorie.id,
                       categorie.libelle,
                       categorie.description,
                       COUNT(produit.id) AS nombre
                  FROM categorie
             LEFT JOIN produit ON produit.categorie_id = categorie.id
              GROUP BY categorie.id, categorie.libelle, categorie.description
              ORDER BY categorie.id';

        $lignes     = $this->pdo->query($sql)->fetchAll();
        $categories = [];

        for ($i = 0; $i < count($lignes); $i++) {
            $categories[] = [
                'id'          => (int) $lignes[$i]['id'],
                'libelle'     => $lignes[$i]['libelle'],
                'description' => $lignes[$i]['description'],
                'nombre'      => (int) $lignes[$i]['nombre'],
            ];
        }

        return $categories;
    }

    public function trouverParId(int $id): ?array
    {
        $categories = $this->lister();

        for ($i = 0; $i < count($categories); $i++) {
            if ($categories[$i]['id'] === $id) {
                return $categories[$i];
            }
        }

        return null;
    }

    public function libelleExiste(string $libelle, int $sauf): bool
    {
        $sql = 'SELECT COUNT(*) FROM categorie WHERE libelle = :libelle AND id <> :sauf';

        $requetePreparee = $this->pdo->prepare($sql);
        $requetePreparee->bindValue(':libelle', $libelle, PDO::PARAM_STR);
        $requetePreparee->bindValue(':sauf',    $sauf,    PDO::PARAM_INT);
        $requetePreparee->execute();

        return (int) $requetePreparee->fetchColumn() > 0;
    }

    public function ajouter(string $libelle, string $description): int
    {
        $sql = 'INSERT INTO categorie (libelle, description) VALUES (:libelle, :description)';

        $requetePreparee = $this->pdo->prepare($sql);
        $requetePreparee->bindValue(':libelle',     $libelle,     PDO::PARAM_STR);
        $requetePreparee->bindValue(':description', $description, PDO::PARAM_STR);
        $requetePreparee->execute();

        return (int) $this->pdo->lastInsertId();
    }

    public function modifier(int $id, string $libelle, string $description): void
    {
        $sql = 'UPDATE categorie
                   SET libelle = :libelle,
                       description = :description
                 WHERE id = :id';

        $requetePreparee = $this->pdo->prepare($sql);
        $requetePreparee->bindValue(':libelle',     $libelle,     PDO::PARAM_STR);
        $requetePreparee->bindValue(':description', $description, PDO::PARAM_STR);
        $requetePreparee->bindValue(':id',          $id,          PDO::PARAM_INT);
        $requetePreparee->execute();
    }

    public function supprimer(int $id): void
    {
        $sql = 'DELETE FROM categorie WHERE id = :id';

        $requetePreparee = $this->pdo->prepare($sql);
        $requetePreparee->bindValue(':id', $id, PDO::PARAM_INT);
        $requetePreparee->execute();
    }
}
