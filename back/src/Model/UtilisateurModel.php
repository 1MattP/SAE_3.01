<?php

declare(strict_types=1);

namespace App\Model;

use PDO;


final class UtilisateurModel
{
    private PDO $pdo;

    public function __construct(PDO $pdo)
    {
        $this->pdo = $pdo;
    }

    public function trouverParEmail(string $email): ?array
    {
        $sql = 'SELECT id, email, mot_de_passe, role
                  FROM utilisateur
                 WHERE email = :email';

        $requetePreparee = $this->pdo->prepare($sql);
        $requetePreparee->bindValue(':email', $email, PDO::PARAM_STR);
        $requetePreparee->execute();

        $ligne = $requetePreparee->fetch();

        return $ligne === false ? null : $ligne;
    }

    public function creer(string $email, string $motDePasseHache): int
    {
        $sql = 'INSERT INTO utilisateur (email, mot_de_passe)
                VALUES (:email, :motDePasse)';

        $requetePreparee = $this->pdo->prepare($sql);
        $requetePreparee->bindValue(':email',      $email,           PDO::PARAM_STR);
        $requetePreparee->bindValue(':motDePasse', $motDePasseHache, PDO::PARAM_STR);
        $requetePreparee->execute();

        return (int) $this->pdo->lastInsertId();
    }

    public function trouverParId(int $id): ?array
    {
        $sql = 'SELECT id, email, nom, mot_de_passe, date_creation
                  FROM utilisateur
                 WHERE id = :id';

        $requetePreparee = $this->pdo->prepare($sql);
        $requetePreparee->bindValue(':id', $id, PDO::PARAM_INT);
        $requetePreparee->execute();

        $ligne = $requetePreparee->fetch();

        return $ligne === false ? null : $ligne;
    }

    public function emailPris(string $email, int $sauf): bool
    {
        $sql = 'SELECT COUNT(*) FROM utilisateur WHERE email = :email AND id <> :sauf';

        $requetePreparee = $this->pdo->prepare($sql);
        $requetePreparee->bindValue(':email', $email, PDO::PARAM_STR);
        $requetePreparee->bindValue(':sauf',  $sauf,  PDO::PARAM_INT);
        $requetePreparee->execute();

        return (int) $requetePreparee->fetchColumn() > 0;
    }

    public function modifierProfil(int $id, string $nom, string $email): void
    {
        $sql = 'UPDATE utilisateur SET nom = :nom, email = :email WHERE id = :id';

        $requetePreparee = $this->pdo->prepare($sql);
        $requetePreparee->bindValue(':nom',   $nom,   PDO::PARAM_STR);
        $requetePreparee->bindValue(':email', $email, PDO::PARAM_STR);
        $requetePreparee->bindValue(':id',    $id,    PDO::PARAM_INT);
        $requetePreparee->execute();
    }

    public function modifierMotDePasse(int $id, string $motDePasseHache): void
    {
        $sql = 'UPDATE utilisateur SET mot_de_passe = :motDePasse WHERE id = :id';

        $requetePreparee = $this->pdo->prepare($sql);
        $requetePreparee->bindValue(':motDePasse', $motDePasseHache, PDO::PARAM_STR);
        $requetePreparee->bindValue(':id',         $id,              PDO::PARAM_INT);
        $requetePreparee->execute();
    }
}
