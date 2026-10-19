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
        $sql = 'SELECT id, email, mot_de_passe
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
}
