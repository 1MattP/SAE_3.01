<?php

declare(strict_types=1);

namespace App\Controller;

use App\Core\Request;
use App\Core\Response;
use App\Model\ProduitModel;


final class ProduitController
{
    private ProduitModel $produits;

    public function __construct(ProduitModel $produits)
    {
        $this->produits = $produits;
    }


    public function show(Request $requete): void
    {
        $urlName = $requete->parametre('urlName', '') ?? '';

        if ($urlName === '' || strlen($urlName) > 160) {
            Response::erreur('Nom de produit invalide.', 400);
        }

        $produit = $this->produits->trouverParNomUrl($urlName);

        if ($produit === null) {
            Response::erreur('Produit introuvable.', 404);
        }

        $id = (int) $produit['id'];

        Response::json([
            'produit' => [
                'id'                => $id,
                'titre'             => $produit['titre'],
                'urlName'           => $produit['urlName'],
                'description'       => $produit['description'],
                'descriptionLongue' => $produit['description_longue'],
                'prix'              => $produit['prix'],
                'categorie'         => $produit['categorie'],
                'images'            => $this->produits->images($id),
            ],
        ]);
    }
}
