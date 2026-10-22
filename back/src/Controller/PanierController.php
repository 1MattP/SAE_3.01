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

            $produit   = $this->produits->trouverParNomUrl($urlName);
            $stock     = 0;
            $prix      = 0.0;
            $prixBarre = null;

            if ($produit !== null) {
                $stock     = $this->stockVariante($produit, $demande);
                $prix      = (float) ($produit['prixPromo'] ?? $produit['prix']);
                $prixBarre = $produit['prixPromo'] === null ? null : (float) $produit['prix'];
            }

            $lignes[] = [
                'urlName'  => $urlName,
                'stock'    => $stock,
                'prix'      => $prix,
                'prixBarre' => $prixBarre,
                'quantity' => min($quantite, $stock),
            ];
        }

        Response::json(['lines' => $lignes]);
    }

    private function stockVariante(array $produit, array $demande): int
    {
        $choix = $demande['options'] ?? [];

        if (!is_array($choix)) {
            return 0;
        }

        $ids = [];

        for ($i = 0; $i < count($choix); $i++) {
            $ids[] = (int) $choix[$i];
        }

        $options = $this->produits->choisirOptions((int) $produit['id'], $ids);

        if ($options === null) {
            return 0;
        }

        $variante = $this->produits->trouverVariante((int) $produit['id'], $options['cle'], (string) ($demande['couleur'] ?? ''));

        if ($variante === null) {
            return 0;
        }

        return (int) $variante['stock'];
    }
}
