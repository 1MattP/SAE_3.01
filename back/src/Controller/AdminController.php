<?php

declare(strict_types=1);

namespace App\Controller;

use App\Core\Request;
use App\Core\Response;
use App\Model\UtilisateurModel;

final class AdminController
{
    private UtilisateurModel $utilisateurs;

    public function __construct(UtilisateurModel $utilisateurs)
    {
        $this->utilisateurs = $utilisateurs;
    }

    public function login(Request $requete): void
    {
        $corps    = $requete->corps();
        $email    = trim((string) ($corps['email'] ?? ''));
        $password = (string) ($corps['password'] ?? '');

        $compte = $this->utilisateurs->trouverParEmail($email);

        if ($compte === null || $compte['role'] !== 'admin' || !password_verify($password, $compte['mot_de_passe'])) {
            Response::erreur('Identifiants incorrects. Vérifiez votre email et votre mot de passe.', 401);
        }

        session_regenerate_id(true);

        $_SESSION['administrateur'] = (int) $compte['id'];
        $_SESSION['admin_email']    = $compte['email'];

        Response::json(['connecte' => true, 'email' => $compte['email']]);
    }

    public function logout(): void
    {
        $_SESSION['administrateur'] = null;
        $_SESSION['admin_email']    = null;

        session_regenerate_id(true);

        Response::json(['connecte' => false, 'email' => null]);
    }

    public function me(): void
    {
        Response::json([
            'connecte' => ($_SESSION['administrateur'] ?? null) !== null,
            'email'    => $_SESSION['admin_email'] ?? null,
        ]);
    }
}
