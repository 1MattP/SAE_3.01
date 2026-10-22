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

    private const FILTRE = "commande.utilisateur_id = :utilisateur
                 AND (:statut = '' OR commande.statut = :statutFiltre)
                 AND (:du = '' OR DATE(commande.date_creation) >= :duFiltre)
                 AND (:au = '' OR DATE(commande.date_creation) <= :auFiltre)";

    private function lierFiltre(\PDOStatement $requetePreparee, int $utilisateur, string $statut, string $du, string $au): void
    {
        $requetePreparee->bindValue(':utilisateur', $utilisateur, PDO::PARAM_INT);
        $requetePreparee->bindValue(':statut',      $statut,      PDO::PARAM_STR);
        $requetePreparee->bindValue(':statutFiltre', $statut,     PDO::PARAM_STR);
        $requetePreparee->bindValue(':du',          $du,          PDO::PARAM_STR);
        $requetePreparee->bindValue(':duFiltre',    $du,          PDO::PARAM_STR);
        $requetePreparee->bindValue(':au',          $au,          PDO::PARAM_STR);
        $requetePreparee->bindValue(':auFiltre',    $au,          PDO::PARAM_STR);
    }

    public function compterFiltre(int $utilisateur, string $statut, string $du, string $au): int
    {
        $sql = 'SELECT COUNT(*) FROM commande WHERE ' . self::FILTRE;

        $requetePreparee = $this->pdo->prepare($sql);
        $this->lierFiltre($requetePreparee, $utilisateur, $statut, $du, $au);
        $requetePreparee->execute();

        return (int) $requetePreparee->fetchColumn();
    }

    public function listerFiltre(int $utilisateur, string $statut, string $du, string $au, int $limite, int $decalage): array
    {
        $sql = 'SELECT commande.numero,
                       commande.statut,
                       commande.total,
                       commande.date_creation AS date,
                       COALESCE(SUM(ligne_commande.quantite), 0) AS articles
                  FROM commande
             LEFT JOIN ligne_commande ON ligne_commande.commande_id = commande.id
                 WHERE ' . self::FILTRE . '
              GROUP BY commande.id
              ORDER BY commande.id DESC
                 LIMIT :limite OFFSET :decalage';

        $requetePreparee = $this->pdo->prepare($sql);
        $this->lierFiltre($requetePreparee, $utilisateur, $statut, $du, $au);
        $requetePreparee->bindValue(':limite',   $limite,   PDO::PARAM_INT);
        $requetePreparee->bindValue(':decalage', $decalage, PDO::PARAM_INT);
        $requetePreparee->execute();

        return $requetePreparee->fetchAll();
    }

    public function lignesParNumero(string $numero, int $utilisateur): ?array
    {
        $sql = 'SELECT ligne_commande.titre,
                       ligne_commande.options,
                       ligne_commande.variante_id,
                       ligne_commande.prix_unitaire AS prix,
                       ligne_commande.quantite
                  FROM ligne_commande
            INNER JOIN commande ON commande.id = ligne_commande.commande_id
                 WHERE commande.numero = :numero AND commande.utilisateur_id = :utilisateur
              ORDER BY ligne_commande.id';

        $requetePreparee = $this->pdo->prepare($sql);
        $requetePreparee->bindValue(':numero',      $numero,      PDO::PARAM_STR);
        $requetePreparee->bindValue(':utilisateur', $utilisateur, PDO::PARAM_INT);
        $requetePreparee->execute();

        $lignes = $requetePreparee->fetchAll();

        return count($lignes) === 0 ? null : $lignes;
    }

    public function trouverParNumero(string $numero, int $utilisateur): ?array
    {
        $sql = 'SELECT id, numero, statut, total, date_creation AS date
                  FROM commande
                 WHERE numero = :numero AND utilisateur_id = :utilisateur';

        $requetePreparee = $this->pdo->prepare($sql);
        $requetePreparee->bindValue(':numero',      $numero,      PDO::PARAM_STR);
        $requetePreparee->bindValue(':utilisateur', $utilisateur, PDO::PARAM_INT);
        $requetePreparee->execute();

        $commande = $requetePreparee->fetch();

        if ($commande === false) {
            return null;
        }

        $sql = 'SELECT titre, options, couleur, prix_unitaire AS prix, quantite
                  FROM ligne_commande
                 WHERE commande_id = :commande
              ORDER BY id';

        $requetePreparee = $this->pdo->prepare($sql);
        $requetePreparee->bindValue(':commande', $commande['id'], PDO::PARAM_INT);
        $requetePreparee->execute();

        $commande['lignes'] = $requetePreparee->fetchAll();

        return $commande;
    }

    public function revenusSemaine(): array
    {
        $sql = "SELECT jours.jour,
                       COALESCE(SUM(commande.total), 0) AS revenu,
                       COUNT(commande.id) AS commandes
                  FROM (SELECT CURDATE() - INTERVAL 6 DAY AS jour
              UNION ALL SELECT CURDATE() - INTERVAL 5 DAY
              UNION ALL SELECT CURDATE() - INTERVAL 4 DAY
              UNION ALL SELECT CURDATE() - INTERVAL 3 DAY
              UNION ALL SELECT CURDATE() - INTERVAL 2 DAY
              UNION ALL SELECT CURDATE() - INTERVAL 1 DAY
              UNION ALL SELECT CURDATE()) AS jours
             LEFT JOIN commande ON DATE(commande.date_creation) = jours.jour
                              AND commande.statut <> 'annulée'
              GROUP BY jours.jour
              ORDER BY jours.jour";

        return $this->pdo->query($sql)->fetchAll();
    }

    public function compterParStatut(): array
    {
        $sql = 'SELECT statut, COUNT(*) AS nombre FROM commande GROUP BY statut';

        return $this->pdo->query($sql)->fetchAll();
    }

    public function plusVendus(int $limite): array
    {
        $sql = "SELECT ligne_commande.titre,
                       SUM(ligne_commande.quantite) AS vendus
                  FROM ligne_commande
            INNER JOIN commande ON commande.id = ligne_commande.commande_id
                 WHERE commande.statut <> 'annulée'
              GROUP BY ligne_commande.titre
              ORDER BY vendus DESC, ligne_commande.titre ASC
                 LIMIT :limite";

        $requetePreparee = $this->pdo->prepare($sql);
        $requetePreparee->bindValue(':limite', $limite, PDO::PARAM_INT);
        $requetePreparee->execute();

        return $requetePreparee->fetchAll();
    }

    public function listerTout(string $ordre, int $limite, int $decalage): array
    {
        $sql = 'SELECT commande.numero,
                       commande.statut,
                       commande.total,
                       commande.date_creation AS date,
                       utilisateur.email AS client,
                       COALESCE(SUM(ligne_commande.quantite), 0) AS articles
                  FROM commande
            INNER JOIN utilisateur ON utilisateur.id = commande.utilisateur_id
             LEFT JOIN ligne_commande ON ligne_commande.commande_id = commande.id
              GROUP BY commande.id
              ORDER BY ' . $ordre . '
                 LIMIT :limite OFFSET :decalage';

        $requetePreparee = $this->pdo->prepare($sql);
        $requetePreparee->bindValue(':limite',   $limite,   PDO::PARAM_INT);
        $requetePreparee->bindValue(':decalage', $decalage, PDO::PARAM_INT);
        $requetePreparee->execute();

        return $requetePreparee->fetchAll();
    }

    public function trouverPourAdmin(string $numero): ?array
    {
        $sql = 'SELECT commande.id,
                       commande.numero,
                       commande.statut,
                       commande.total,
                       commande.date_creation AS date,
                       utilisateur.email AS client
                  FROM commande
            INNER JOIN utilisateur ON utilisateur.id = commande.utilisateur_id
                 WHERE commande.numero = :numero';

        $requetePreparee = $this->pdo->prepare($sql);
        $requetePreparee->bindValue(':numero', $numero, PDO::PARAM_STR);
        $requetePreparee->execute();

        $commande = $requetePreparee->fetch();

        if ($commande === false) {
            return null;
        }

        $sql = 'SELECT titre, options, couleur, prix_unitaire AS prix, quantite
                  FROM ligne_commande
                 WHERE commande_id = :commande
              ORDER BY id';

        $requetePreparee = $this->pdo->prepare($sql);
        $requetePreparee->bindValue(':commande', $commande['id'], PDO::PARAM_INT);
        $requetePreparee->execute();

        $commande['lignes']  = $requetePreparee->fetchAll();
        $commande['journal'] = $this->journal($commande['id'], 50);

        unset($commande['id']);

        return $commande;
    }

    public function journalRecent(int $limite): array
    {
        return $this->journal(0, $limite);
    }

    private function journal(int $commande, int $limite): array
    {
        $sql = 'SELECT commande.numero,
                       journal_commande.administrateur,
                       journal_commande.ancien_statut AS ancien,
                       journal_commande.nouveau_statut AS nouveau,
                       journal_commande.date_creation AS date
                  FROM journal_commande
            INNER JOIN commande ON commande.id = journal_commande.commande_id
                 WHERE :tout = 0 OR journal_commande.commande_id = :commande
              ORDER BY journal_commande.id DESC
                 LIMIT :limite';

        $requetePreparee = $this->pdo->prepare($sql);
        $requetePreparee->bindValue(':tout',     $commande, PDO::PARAM_INT);
        $requetePreparee->bindValue(':commande', $commande, PDO::PARAM_INT);
        $requetePreparee->bindValue(':limite',   $limite,   PDO::PARAM_INT);
        $requetePreparee->execute();

        return $requetePreparee->fetchAll();
    }

    public function changerStatut(string $numero, array $anciens, string $nouveau, string $administrateur): bool
    {
        $this->pdo->beginTransaction();

        $sql = 'SELECT id, statut FROM commande WHERE numero = :numero FOR UPDATE';

        $requetePreparee = $this->pdo->prepare($sql);
        $requetePreparee->bindValue(':numero', $numero, PDO::PARAM_STR);
        $requetePreparee->execute();

        $commande = $requetePreparee->fetch();

        if ($commande === false || !in_array($commande['statut'], $anciens, true)) {
            $this->pdo->rollBack();
            return false;
        }

        $sql = 'UPDATE commande SET statut = :nouveau WHERE id = :id';

        $requetePreparee = $this->pdo->prepare($sql);
        $requetePreparee->bindValue(':nouveau', $nouveau,                      PDO::PARAM_STR);
        $requetePreparee->bindValue(':id',      (int) $commande['id'],         PDO::PARAM_INT);
        $requetePreparee->execute();

        if ($nouveau === 'annulée') {
            $this->rendreAuStock($numero);
        }

        $sql = 'INSERT INTO journal_commande (commande_id, administrateur, ancien_statut, nouveau_statut)
                VALUES (:commande, :administrateur, :ancien, :nouveau)';

        $requetePreparee = $this->pdo->prepare($sql);
        $requetePreparee->bindValue(':commande',       (int) $commande['id'], PDO::PARAM_INT);
        $requetePreparee->bindValue(':administrateur', $administrateur,       PDO::PARAM_STR);
        $requetePreparee->bindValue(':ancien',         $commande['statut'],   PDO::PARAM_STR);
        $requetePreparee->bindValue(':nouveau',        $nouveau,              PDO::PARAM_STR);
        $requetePreparee->execute();

        $this->pdo->commit();

        return true;
    }

    public function recentes(int $utilisateur, int $limite): array
    {
        $sql = 'SELECT commande.numero,
                       commande.statut,
                       commande.total,
                       commande.date_creation AS date,
                       COALESCE(SUM(ligne_commande.quantite), 0) AS articles
                  FROM commande
             LEFT JOIN ligne_commande ON ligne_commande.commande_id = commande.id
                 WHERE commande.utilisateur_id = :utilisateur
              GROUP BY commande.id
              ORDER BY commande.id DESC
                 LIMIT :limite';

        $requetePreparee = $this->pdo->prepare($sql);
        $requetePreparee->bindValue(':utilisateur', $utilisateur, PDO::PARAM_INT);
        $requetePreparee->bindValue(':limite',      $limite,      PDO::PARAM_INT);
        $requetePreparee->execute();

        return $requetePreparee->fetchAll();
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

        $sql = 'INSERT INTO ligne_commande (commande_id, produit_id, variante_id, titre, options, couleur, prix_unitaire, quantite)
                VALUES (:commande, :produit, :variante, :titre, :options, :couleur, :prix, :quantite)';

        $insertion = $this->pdo->prepare($sql);

        $sql = 'UPDATE variante
                   SET stock = stock - :quantite
                 WHERE id = :variante AND stock >= :minimum';

        $decrement = $this->pdo->prepare($sql);

        for ($i = 0; $i < count($lignes); $i++) {
            $decrement->bindValue(':quantite', $lignes[$i]['quantite'], PDO::PARAM_INT);
            $decrement->bindValue(':minimum',  $lignes[$i]['quantite'], PDO::PARAM_INT);
            $decrement->bindValue(':variante', $lignes[$i]['variante'], PDO::PARAM_INT);
            $decrement->execute();

            if ($decrement->rowCount() === 0) {
                $this->pdo->rollBack();
                return null;
            }

            $insertion->bindValue(':commande', $id,                      PDO::PARAM_INT);
            $insertion->bindValue(':produit',  $lignes[$i]['produit'],   PDO::PARAM_INT);
            $insertion->bindValue(':variante', $lignes[$i]['variante'],  PDO::PARAM_INT);
            $insertion->bindValue(':titre',    $lignes[$i]['titre'],     PDO::PARAM_STR);
            $insertion->bindValue(':options',  $lignes[$i]['options'],   PDO::PARAM_STR);
            $insertion->bindValue(':couleur',  $lignes[$i]['couleur'],   PDO::PARAM_STR);
            $insertion->bindValue(':prix',     $lignes[$i]['prix'],      PDO::PARAM_STR);
            $insertion->bindValue(':quantite', $lignes[$i]['quantite'],  PDO::PARAM_INT);
            $insertion->execute();

            $this->journaliser($lignes[$i]['produit'], $lignes[$i]['variante'], $id, 'vente', -$lignes[$i]['quantite']);
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

        $this->rendreAuStock($numero);

        $this->pdo->commit();

        return true;
    }

    private function rendreAuStock(string $numero): void
    {
        $sql = 'SELECT ligne_commande.commande_id, ligne_commande.produit_id, ligne_commande.variante_id, ligne_commande.quantite
                  FROM ligne_commande
            INNER JOIN commande ON commande.id = ligne_commande.commande_id
                 WHERE commande.numero = :numero';

        $requetePreparee = $this->pdo->prepare($sql);
        $requetePreparee->bindValue(':numero', $numero, PDO::PARAM_STR);
        $requetePreparee->execute();

        $lignes = $requetePreparee->fetchAll();

        $sql = 'UPDATE variante SET stock = stock + :quantite WHERE id = :variante';

        $recredit = $this->pdo->prepare($sql);

        for ($i = 0; $i < count($lignes); $i++) {
            if ($lignes[$i]['variante_id'] === null) {
                continue;
            }

            $recredit->bindValue(':quantite', (int) $lignes[$i]['quantite'],   PDO::PARAM_INT);
            $recredit->bindValue(':variante', (int) $lignes[$i]['variante_id'], PDO::PARAM_INT);
            $recredit->execute();

            $this->journaliser(
                (int) $lignes[$i]['produit_id'],
                (int) $lignes[$i]['variante_id'],
                (int) $lignes[$i]['commande_id'],
                'annulation',
                (int) $lignes[$i]['quantite'],
            );
        }
    }

    private function journaliser(int $produit, int $variante, int $commande, string $type, int $quantite): void
    {
        $sql = 'INSERT INTO mouvement_stock (produit_id, variante_id, commande_id, type, quantite)
                VALUES (:produit, :variante, :commande, :type, :quantite)';

        $requetePreparee = $this->pdo->prepare($sql);
        $requetePreparee->bindValue(':produit',  $produit,  PDO::PARAM_INT);
        $requetePreparee->bindValue(':variante', $variante, PDO::PARAM_INT);
        $requetePreparee->bindValue(':commande', $commande, PDO::PARAM_INT);
        $requetePreparee->bindValue(':type',     $type,     PDO::PARAM_STR);
        $requetePreparee->bindValue(':quantite', $quantite, PDO::PARAM_INT);
        $requetePreparee->execute();
    }
}
