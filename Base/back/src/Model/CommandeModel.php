<?php

declare(strict_types=1);

namespace App\Model;

use PDO;


final class CommandeModel
{
    private PDO $pdo;

    public function __construct(PDO $pdo)
    {
        $this->pdo = $pdo;
    }

    public function creer(int $utilisateur, string $statut, float $total, array $lignes): string
    {
        $this->pdo->beginTransaction();

        $sql = 'INSERT INTO commande (utilisateur_id, statut, total)
                VALUES (:utilisateur, :statut, :total)';

        $requetePreparee = $this->pdo->prepare($sql);
        $requetePreparee->bindValue(':utilisateur', $utilisateur, PDO::PARAM_INT);
        $requetePreparee->bindValue(':statut',      $statut,      PDO::PARAM_STR);
        $requetePreparee->bindValue(':total',       $total,       PDO::PARAM_STR);
        $requetePreparee->execute();

        $id     = (int) $this->pdo->lastInsertId();
        $numero = sprintf('CMD-%06d', $id);

        $sql = 'UPDATE commande SET numero = :numero WHERE id = :id';

        $requetePreparee = $this->pdo->prepare($sql);
        $requetePreparee->bindValue(':numero', $numero, PDO::PARAM_STR);
        $requetePreparee->bindValue(':id',     $id,     PDO::PARAM_INT);
        $requetePreparee->execute();

        $sql = 'INSERT INTO ligne_commande (commande_id, produit_id, titre, prix_unitaire, quantite)
                VALUES (:commande, :produit, :titre, :prix, :quantite)';

        $requetePreparee = $this->pdo->prepare($sql);

        for ($i = 0; $i < count($lignes); $i++) {
            $requetePreparee->bindValue(':commande', $id,                   PDO::PARAM_INT);
            $requetePreparee->bindValue(':produit',  $lignes[$i]['produit'], PDO::PARAM_INT);
            $requetePreparee->bindValue(':titre',    $lignes[$i]['titre'],  PDO::PARAM_STR);
            $requetePreparee->bindValue(':prix',     $lignes[$i]['prix'],   PDO::PARAM_STR);
            $requetePreparee->bindValue(':quantite', $lignes[$i]['quantite'], PDO::PARAM_INT);
            $requetePreparee->execute();
        }

        $this->pdo->commit();

        return $numero;
    }
}
