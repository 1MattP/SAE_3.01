<?php

declare(strict_types=1);

namespace App\Controller;

use App\Core\Acces;
use App\Core\Request;
use App\Core\Response;
use App\Model\CommandeModel;
use App\Model\UtilisateurModel;

final class CompteController
{
    private UtilisateurModel $utilisateurs;

    private CommandeModel $commandes;

    public function __construct(UtilisateurModel $utilisateurs, CommandeModel $commandes)
    {
        $this->utilisateurs = $utilisateurs;
        $this->commandes    = $commandes;
    }

    public function show(): void
    {
        $id     = Acces::client();
        $compte = $this->utilisateurs->trouverParId($id);

        Response::json([
            'compte' => [
                'nom'          => $compte['nom'],
                'email'        => $compte['email'],
                'dateCreation' => $compte['date_creation'],
            ],
            'commandes' => $this->commandes->recentes($id, 5),
        ]);
    }

    public function updateProfil(Request $requete): void
    {
        $id    = Acces::client();
        $corps = $requete->corps();
        $nom   = trim((string) ($corps['nom'] ?? ''));
        $email = trim((string) ($corps['email'] ?? ''));

        if ($nom === '' || strlen($nom) > 80) {
            Response::erreur('Le nom est obligatoire (80 caractères maximum).', 400);
        }

        if (strlen($email) > 190 || filter_var($email, FILTER_VALIDATE_EMAIL) === false) {
            Response::erreur('Adresse email invalide.', 400);
        }

        if ($this->utilisateurs->emailPris($email, $id)) {
            Response::erreur('Un compte existe déjà avec cette adresse email.', 409);
        }

        $this->utilisateurs->modifierProfil($id, $nom, $email);

        $_SESSION['email'] = $email;

        Response::json(['compte' => ['nom' => $nom, 'email' => $email]]);
    }

    public function updateMotDePasse(Request $requete): void
    {
        $id      = Acces::client();
        $corps   = $requete->corps();
        $actuel  = (string) ($corps['actuel'] ?? '');
        $nouveau = (string) ($corps['nouveau'] ?? '');
        $compte  = $this->utilisateurs->trouverParId($id);

        if (!password_verify($actuel, $compte['mot_de_passe'])) {
            Response::erreur('Le mot de passe actuel est incorrect.', 403);
        }

        if (strlen($nouveau) < 8 || strlen($nouveau) > 72) {
            Response::erreur('Le nouveau mot de passe doit contenir entre 8 et 72 caractères.', 400);
        }

        $this->utilisateurs->modifierMotDePasse($id, password_hash($nouveau, PASSWORD_BCRYPT));

        session_regenerate_id(true);

        Response::json(['modifie' => true]);
    }
}
