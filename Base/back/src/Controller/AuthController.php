<?php

declare(strict_types=1);

namespace App\Controller;

use App\Core\Request;
use App\Core\Response;
use App\Model\UtilisateurModel;


final class AuthController
{
    private UtilisateurModel $utilisateurs;

    public function __construct(UtilisateurModel $utilisateurs)
    {
        $this->utilisateurs = $utilisateurs;
    }

    public function register(Request $requete): void
    {
        $corps    = $requete->corps();
        $email    = trim((string) ($corps['email'] ?? ''));
        $password = (string) ($corps['password'] ?? '');

        if (strlen($email) > 190 || filter_var($email, FILTER_VALIDATE_EMAIL) === false) {
            Response::erreur('Adresse email invalide.', 400);
        }

        if (strlen($password) < 8 || strlen($password) > 72) {
            Response::erreur('Le mot de passe doit contenir entre 8 et 72 caractères.', 400);
        }

        if ($this->utilisateurs->trouverParEmail($email) !== null) {
            Response::erreur('Un compte existe déjà avec cette adresse email.', 409);
        }

        $id = $this->utilisateurs->creer($email, password_hash($password, PASSWORD_BCRYPT));

        session_regenerate_id(true);

        $_SESSION['utilisateur'] = $id;
        $_SESSION['email']       = $email;

        Response::json(['connecte' => true, 'email' => $email], 201);
    }

    public function login(Request $requete): void
    {
        $corps    = $requete->corps();
        $email    = trim((string) ($corps['email'] ?? ''));
        $password = (string) ($corps['password'] ?? '');

        $compte = $this->utilisateurs->trouverParEmail($email);

        if ($compte === null || !password_verify($password, $compte['mot_de_passe'])) {
            Response::erreur('Identifiants incorrects. Vérifiez votre email et votre mot de passe.', 401);
        }

        session_regenerate_id(true);

        $_SESSION['utilisateur'] = (int) $compte['id'];
        $_SESSION['email']       = $compte['email'];

        Response::json(['connecte' => true, 'email' => $compte['email']]);
    }

    public function logout(): void
    {
        $_SESSION = [];

        setcookie(session_name(), '', [
            'expires' => time() - 3600,
            'path'    => session_get_cookie_params()['path'],
        ]);

        session_destroy();

        Response::json(['connecte' => false, 'email' => null]);
    }

    public function me(): void
    {
        Response::json([
            'connecte' => ($_SESSION['utilisateur'] ?? null) !== null,
            'email'    => $_SESSION['email'] ?? null,
        ]);
    }
}
