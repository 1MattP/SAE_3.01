<?php

declare(strict_types=1);

namespace App\Controller;

use App\Core\Request;
use App\Core\Response;
use App\Model\CommandeModel;
use App\Model\ProduitModel;


final class CommandeController
{
    private CommandeModel $commandes;

    private ProduitModel $produits;

    public function __construct(CommandeModel $commandes, ProduitModel $produits)
    {
        $this->commandes = $commandes;
        $this->produits  = $produits;
    }


    public function create(Request $requete): void
    {
        if (($_SESSION['utilisateur'] ?? null) === null) {
            Response::erreur('Vous devez être connecté pour passer commande.', 401);
        }

        $demandes = $requete->corps()['lines'] ?? null;

        $lignes = [];
        $somme  = 0;

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

            if ($produit === null) {
                Response::erreur("Un produit de votre panier n'existe plus.", 400);
            }

            $prix   = (float) $produit['prix'];
            $somme += $prix * $quantite;

            $lignes[] = [
                'produit'  => (int) $produit['id'],
                'titre'    => $produit['titre'],
                'prix'     => $prix,
                'quantite' => $quantite,
                'total'    => round($prix * $quantite, 2),
            ];
        }

        $statut = 'en cours';
        $total  = round($somme, 2);
        $numero = $this->commandes->creer((int) $_SESSION['utilisateur'], $statut, $total, $lignes);

        if ($numero === null) {
            Response::erreur('Stock insuffisant pour un produit de votre commande.', 409);
        }

        Response::json([
            'commande' => [
                'numero' => $numero,
                'statut' => $statut,
                'total'  => $total,
                'lignes' => $lignes,
            ],
        ], 201);
    }

    public function cancel(Request $requete): void
    {
        if (($_SESSION['utilisateur'] ?? null) === null) {
            Response::erreur('Vous devez être connecté pour annuler une commande.', 401);
        }

        $numero = (string) ($requete->corps()['numero'] ?? '');

        if ($numero === '' || strlen($numero) > 20) {
            Response::erreur('Numéro de commande invalide.', 400);
        }

        $statut = 'annulée';

        if (!$this->commandes->annuler($numero, (int) $_SESSION['utilisateur'], 'en cours', $statut)) {
            Response::erreur('Commande introuvable ou déjà traitée.', 404);
        }

        Response::json(['commande' => ['numero' => $numero, 'statut' => $statut]]);
    }
}
