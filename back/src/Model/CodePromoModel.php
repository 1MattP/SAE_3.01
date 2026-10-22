<?php

declare(strict_types=1);

namespace App\Model;

use PDO;

final class CodePromoModel
{
    private PDO $pdo;

    public function __construct(PDO $pdo)
    {
        $this->pdo = $pdo;
    }

    public function compter(): int
    {
        return (int) $this->pdo->query('SELECT COUNT(*) FROM code_promo')->fetchColumn();
    }

    public function lister(): array
    {
        $sql = "SELECT code_promo.id,
                       code_promo.code,
                       code_promo.pourcentage,
                       COUNT(commande.id) AS utilisations,
                       COALESCE(SUM(commande.remise), 0) AS remises
                  FROM code_promo
             LEFT JOIN commande ON commande.code_promo_id = code_promo.id
                               AND commande.statut <> 'annulée'
              GROUP BY code_promo.id, code_promo.code, code_promo.pourcentage
              ORDER BY code_promo.code";

        $lignes = $this->pdo->query($sql)->fetchAll();
        $codes  = [];

        for ($i = 0; $i < count($lignes); $i++) {
            $codes[] = [
                'id'           => (int) $lignes[$i]['id'],
                'code'         => $lignes[$i]['code'],
                'pourcentage'  => (int) $lignes[$i]['pourcentage'],
                'utilisations' => (int) $lignes[$i]['utilisations'],
                'remises'      => round((float) $lignes[$i]['remises'], 2),
            ];
        }

        return $codes;
    }

    public function trouverParId(int $id): ?array
    {
        $codes = $this->lister();

        for ($i = 0; $i < count($codes); $i++) {
            if ($codes[$i]['id'] === $id) {
                return $codes[$i];
            }
        }

        return null;
    }

    public function trouverParCode(string $code): ?array
    {
        $sql = 'SELECT id, code, pourcentage FROM code_promo WHERE code = :code';

        $requetePreparee = $this->pdo->prepare($sql);
        $requetePreparee->bindValue(':code', $code, PDO::PARAM_STR);
        $requetePreparee->execute();

        $ligne = $requetePreparee->fetch();

        if ($ligne === false) {
            return null;
        }

        return [
            'id'          => (int) $ligne['id'],
            'code'        => $ligne['code'],
            'pourcentage' => (int) $ligne['pourcentage'],
        ];
    }

    public function codePris(string $code, int $sauf): bool
    {
        $sql = 'SELECT COUNT(*) FROM code_promo WHERE code = :code AND id <> :sauf';

        $requetePreparee = $this->pdo->prepare($sql);
        $requetePreparee->bindValue(':code', $code, PDO::PARAM_STR);
        $requetePreparee->bindValue(':sauf', $sauf, PDO::PARAM_INT);
        $requetePreparee->execute();

        return (int) $requetePreparee->fetchColumn() > 0;
    }

    public function ajouter(string $code, int $pourcentage): int
    {
        $sql = 'INSERT INTO code_promo (code, pourcentage) VALUES (:code, :pourcentage)';

        $requetePreparee = $this->pdo->prepare($sql);
        $requetePreparee->bindValue(':code',        $code,        PDO::PARAM_STR);
        $requetePreparee->bindValue(':pourcentage', $pourcentage, PDO::PARAM_INT);
        $requetePreparee->execute();

        return (int) $this->pdo->lastInsertId();
    }

    public function modifier(int $id, string $code, int $pourcentage): void
    {
        $sql = 'UPDATE code_promo SET code = :code, pourcentage = :pourcentage WHERE id = :id';

        $requetePreparee = $this->pdo->prepare($sql);
        $requetePreparee->bindValue(':code',        $code,        PDO::PARAM_STR);
        $requetePreparee->bindValue(':pourcentage', $pourcentage, PDO::PARAM_INT);
        $requetePreparee->bindValue(':id',          $id,          PDO::PARAM_INT);
        $requetePreparee->execute();
    }

    public function supprimer(int $id): void
    {
        $sql = 'DELETE FROM code_promo WHERE id = :id';

        $requetePreparee = $this->pdo->prepare($sql);
        $requetePreparee->bindValue(':id', $id, PDO::PARAM_INT);
        $requetePreparee->execute();
    }
}
