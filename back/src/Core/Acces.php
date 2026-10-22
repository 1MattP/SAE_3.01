<?php

declare(strict_types=1);

namespace App\Core;

/**
 * Contrôle d'accès commun aux contrôleurs : la session est déjà ouverte par
 * index.php, et le serveur décide seul des autorisations (le front n'est
 * jamais une protection).
 */
final class Acces
{
    /** Renvoie l'identifiant du client connecté, ou répond 401. */
    public static function client(string $message = 'Vous devez être connecté.'): int
    {
        if (($_SESSION['utilisateur'] ?? null) === null) {
            Response::erreur($message, 401);
        }

        return (int) $_SESSION['utilisateur'];
    }

    /** Répond 401 si aucun administrateur n'est connecté. */
    public static function administrateur(): void
    {
        if (($_SESSION['administrateur'] ?? null) === null) {
            Response::erreur('Accès réservé aux administrateurs.', 401);
        }
    }
}
