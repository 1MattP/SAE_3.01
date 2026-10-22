<?php

declare(strict_types=1);

namespace App\Controller;

use App\Core\Acces;
use App\Core\Request;
use App\Core\Response;
use App\Model\CodePromoModel;

final class AdminCodePromoController
{
    private CodePromoModel $codes;

    public function __construct(CodePromoModel $codes)
    {
        $this->codes = $codes;
    }

    public function index(): void
    {
        Acces::administrateur();

        Response::json(['codes' => $this->codes->lister()]);
    }

    public function show(Request $requete): void
    {
        Acces::administrateur();

        $id   = (int) ($requete->parametre('id', '0') ?? '0');
        $code = $this->codes->trouverParId($id);

        if ($code === null) {
            Response::erreur('Code promo introuvable.', 404);
        }

        Response::json(['code' => $code]);
    }

    public function create(Request $requete): void
    {
        Acces::administrateur();

        $code = $this->lireCode($requete->corps(), 0);
        $id   = $this->codes->ajouter($code['code'], $code['pourcentage']);

        Response::json(['code' => ['id' => $id]], 201);
    }

    public function update(Request $requete): void
    {
        Acces::administrateur();

        $corps = $requete->corps();
        $id    = (int) ($corps['id'] ?? 0);

        if ($this->codes->trouverParId($id) === null) {
            Response::erreur('Code promo introuvable.', 404);
        }

        $code = $this->lireCode($corps, $id);
        $this->codes->modifier($id, $code['code'], $code['pourcentage']);

        Response::json(['code' => ['id' => $id]]);
    }

    public function remove(Request $requete): void
    {
        Acces::administrateur();

        $id = (int) ($requete->corps()['id'] ?? 0);

        if ($this->codes->trouverParId($id) === null) {
            Response::erreur('Code promo introuvable.', 404);
        }

        $this->codes->supprimer($id);

        Response::json(['supprime' => true]);
    }

    private function lireCode(array $corps, int $id): array
    {
        $code        = strtoupper(trim((string) ($corps['code'] ?? '')));
        $pourcentage = (int) ($corps['pourcentage'] ?? 0);
        $autorises   = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789-';

        if (strlen($code) < 3 || strlen($code) > 20) {
            Response::erreur('Le code doit contenir de 3 à 20 caractères.', 400);
        }

        for ($i = 0; $i < strlen($code); $i++) {
            if (strpos($autorises, $code[$i]) === false) {
                Response::erreur('Le code ne peut contenir que des lettres, des chiffres et des tirets.', 400);
            }
        }

        if ($pourcentage < 1 || $pourcentage > 100) {
            Response::erreur('Le pourcentage doit être compris entre 1 et 100.', 400);
        }

        if ($this->codes->codePris($code, $id)) {
            Response::erreur('Ce code existe déjà.', 409);
        }

        return ['code' => $code, 'pourcentage' => $pourcentage];
    }
}
