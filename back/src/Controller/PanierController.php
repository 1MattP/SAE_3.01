<?php

declare(strict_types=1);

namespace App\Controller;

use App\Core\Request;
use App\Core\Response;
use App\Model\ProduitModel;

final class PanierController
{
    private ProduitModel $produits;

    public function __construct(ProduitModel $produits)
    {
        $this->produits = $produits;
    }

    public function verify(Request $requete): void
    {
        $demandes = $requete->corps()['lines'] ?? null;

        if (!is_array($demandes) || count($demandes) > 50) {
            Response::erreur('Votre panier est invalide.', 400);
        }

        $lignes = [];

        for ($i = 0; $i < count($demandes); $i++) {
            $demande = $demandes[$i];

            if (!is_array($demande)) {
                Response::erreur('Votre panier est invalide.', 400);
            }

            $urlName  = (string) ($demande['urlName'] ?? '');
            $quantite = (int) ($demande['quantity'] ?? 0);

            if ($quantite < 1 || $quantite > 99) {
                Response::erreur('Quantité invalide.', 400);
            }

            $produit = $this->produits->trouverParNomUrl($urlName);
            $stock   = 0;

            if ($produit !== null) {
                $stock = (int) $produit['stock'];
            }

            $lignes[] = [
                'urlName'  => $urlName,
                'stock'    => $stock,
                'quantity' => min($quantite, $stock),
            ];
        }

        Response::json(['lines' => $lignes]);
    }
}
