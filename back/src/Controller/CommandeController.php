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
        $totaux = [];

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

            $id    = (int) $produit['id'];
            $choix = $demande['options'] ?? [];

            if (!is_array($choix)) {
                Response::erreur('Votre panier est invalide.', 400);
            }

            $ids = [];

            for ($k = 0; $k < count($choix); $k++) {
                $ids[] = (int) $choix[$k];
            }

            $options = $this->produits->choisirOptions($id, $ids);

            if ($options === null) {
                Response::erreur('Les options de ' . $produit['titre'] . ' ont changé : retirez-le du panier puis ajoutez-le à nouveau.', 409);
            }

            $couleurs = $this->produits->listerCouleurs($produit['couleurs']);
            $couleur  = (string) ($demande['couleur'] ?? '');

            if (count($couleurs) > 0 && !in_array($couleur, $couleurs, true)) {
                Response::erreur('La couleur de ' . $produit['titre'] . ' est invalide : retirez-le du panier puis ajoutez-le à nouveau.', 409);
            }

            if (count($couleurs) === 0) {
                $couleur = '';
            }

            $variante = $this->produits->trouverVariante($id, $options['cle'], $couleur);

            if ($variante === null) {
                Response::erreur('Cette variante de ' . $produit['titre'] . " n'existe plus : retirez-la du panier puis ajoutez-la à nouveau.", 409);
            }

            $varianteId = (int) $variante['id'];
            $stock      = (int) $variante['stock'];
            $nom        = $produit['titre'];

            if ($options['texte'] !== '') {
                $nom .= ' (' . $options['texte'] . ')';
            }

            $totaux[$varianteId] = ($totaux[$varianteId] ?? 0) + $quantite;

            if ($totaux[$varianteId] > $stock) {
                $message = $nom . ' est épuisé.';

                if ($stock > 0) {
                    $message = 'Il ne reste que ' . $stock . ' exemplaire(s) de ' . $nom . '.';
                }

                Response::erreur($message, 409);
            }

            $prix   = (float) $produit['prix'];
            $somme += $prix * $quantite;

            $lignes[] = [
                'produit'  => $id,
                'variante' => $varianteId,
                'titre'    => $produit['titre'],
                'options'  => $options['texte'],
                'couleur'  => $couleur,
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
