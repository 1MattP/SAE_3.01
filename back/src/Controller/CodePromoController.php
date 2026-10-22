<?php

declare(strict_types=1);

namespace App\Controller;

use App\Core\Request;
use App\Core\Response;
use App\Model\CodePromoModel;

final class CodePromoController
{
    private CodePromoModel $codes;

    public function __construct(CodePromoModel $codes)
    {
        $this->codes = $codes;
    }

    public function verify(Request $requete): void
    {
        if (($_SESSION['utilisateur'] ?? null) === null) {
            Response::erreur('Vous devez être connecté pour utiliser un code promo.', 401);
        }

        $saisi = strtoupper(trim((string) ($requete->corps()['code'] ?? '')));
        $code  = $this->codes->trouverParCode($saisi);

        if ($saisi === '' || strlen($saisi) > 20 || $code === null) {
            Response::erreur("Ce code promo n'existe pas.", 404);
        }

        Response::json(['code' => $code['code'], 'pourcentage' => $code['pourcentage']]);
    }
}
