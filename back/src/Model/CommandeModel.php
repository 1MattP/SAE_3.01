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

    public function compter(): int
    {
        return (int) $this->pdo->query('SELECT COUNT(*) FROM commande')->fetchColumn();
    }

    public function creer(int $utilisateur, string $statut, float $total, array $lignes): ?string
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

        $insertion = $this->pdo->prepare($sql);

        $sql = 'UPDATE produit
                   SET stock = stock - :quantite
                 WHERE id = :produit AND stock >= :minimum';

        $decrement = $this->pdo->prepare($sql);

        for ($i = 0; $i < count($lignes); $i++) {
            $decrement->bindValue(':quantite', $lignes[$i]['quantite'], PDO::PARAM_INT);
            $decrement->bindValue(':minimum',  $lignes[$i]['quantite'], PDO::PARAM_INT);
            $decrement->bindValue(':produit',  $lignes[$i]['produit'],  PDO::PARAM_INT);
            $decrement->execute();

            if ($decrement->rowCount() === 0) {
                $this->pdo->rollBack();
                return null;
            }

            $insertion->bindValue(':commande', $id,                      PDO::PARAM_INT);
            $insertion->bindValue(':produit',  $lignes[$i]['produit'],   PDO::PARAM_INT);
            $insertion->bindValue(':titre',    $lignes[$i]['titre'],     PDO::PARAM_STR);
            $insertion->bindValue(':prix',     $lignes[$i]['prix'],      PDO::PARAM_STR);
            $insertion->bindValue(':quantite', $lignes[$i]['quantite'],  PDO::PARAM_INT);
            $insertion->execute();

            $this->journaliser($lignes[$i]['produit'], $id, 'vente', -$lignes[$i]['quantite']);
        }

        $this->pdo->commit();

        return $numero;
    }

    public function annuler(string $numero, int $utilisateur, string $ancien, string $nouveau): bool
    {
        $this->pdo->beginTransaction();

        $sql = 'UPDATE commande
                   SET statut = :nouveau
                 WHERE numero = :numero AND utilisateur_id = :utilisateur AND statut = :ancien';

        $requetePreparee = $this->pdo->prepare($sql);
        $requetePreparee->bindValue(':nouveau',     $nouveau,     PDO::PARAM_STR);
        $requetePreparee->bindValue(':numero',      $numero,      PDO::PARAM_STR);
        $requetePreparee->bindValue(':utilisateur', $utilisateur, PDO::PARAM_INT);
        $requetePreparee->bindValue(':ancien',      $ancien,      PDO::PARAM_STR);
        $requetePreparee->execute();

        if ($requetePreparee->rowCount() === 0) {
            $this->pdo->rollBack();
            return false;
        }

        $sql = 'SELECT ligne_commande.commande_id, ligne_commande.produit_id, ligne_commande.quantite
                  FROM ligne_commande
            INNER JOIN commande ON commande.id = ligne_commande.commande_id
                 WHERE commande.numero = :numero';

        $requetePreparee = $this->pdo->prepare($sql);
        $requetePreparee->bindValue(':numero', $numero, PDO::PARAM_STR);
        $requetePreparee->execute();

        $lignes = $requetePreparee->fetchAll();

        $sql = 'UPDATE produit SET stock = stock + :quantite WHERE id = :produit';

        $recredit = $this->pdo->prepare($sql);

        for ($i = 0; $i < count($lignes); $i++) {
            if ($lignes[$i]['produit_id'] === null) {
                continue;
            }

            $recredit->bindValue(':quantite', (int) $lignes[$i]['quantite'],   PDO::PARAM_INT);
            $recredit->bindValue(':produit',  (int) $lignes[$i]['produit_id'], PDO::PARAM_INT);
            $recredit->execute();

            $this->journaliser(
                (int) $lignes[$i]['produit_id'],
                (int) $lignes[$i]['commande_id'],
                'annulation',
                (int) $lignes[$i]['quantite'],
            );
        }

        $this->pdo->commit();

        return true;
    }

    private function journaliser(int $produit, int $commande, string $type, int $quantite): void
    {
        $sql = 'INSERT INTO mouvement_stock (produit_id, commande_id, type, quantite)
                VALUES (:produit, :commande, :type, :quantite)';

        $requetePreparee = $this->pdo->prepare($sql);
        $requetePreparee->bindValue(':produit',  $produit,  PDO::PARAM_INT);
        $requetePreparee->bindValue(':commande', $commande, PDO::PARAM_INT);
        $requetePreparee->bindValue(':type',     $type,     PDO::PARAM_STR);
        $requetePreparee->bindValue(':quantite', $quantite, PDO::PARAM_INT);
        $requetePreparee->execute();
    }
}
