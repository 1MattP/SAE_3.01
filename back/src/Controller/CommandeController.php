<?php

declare(strict_types=1);

namespace App\Controller;

use App\Core\Request;
use App\Core\Response;
use App\Model\CodePromoModel;
use App\Model\CommandeModel;
use App\Model\ProduitModel;


final class CommandeController
{
    private CommandeModel $commandes;

    private ProduitModel $produits;

    private CodePromoModel $codes;

    /** Chemin du projet sur le serveur, celui des cookies (voir config.php). */
    private string $chemin;

    public function __construct(CommandeModel $commandes, ProduitModel $produits, CodePromoModel $codes, string $chemin)
    {
        $this->commandes = $commandes;
        $this->produits  = $produits;
        $this->codes     = $codes;
        $this->chemin    = $chemin;
    }

    private function optionsCookie(): array
    {
        return [
            'expires'  => time() + 30 * 24 * 3600,
            'path'     => $this->chemin,
            'httponly' => true,
            'secure'   => true,
            'samesite' => 'Lax',
        ];
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

        $saisi      = strtoupper(trim((string) ($requete->corps()['code'] ?? '')));
        $codePromo  = null;
        $remise     = 0.0;

        if ($saisi !== '') {
            $code = $this->codes->trouverParCode($saisi);

            if ($code === null) {
                Response::erreur("Ce code promo n'existe pas.", 409);
            }

            $codePromo = $code['id'];
            $remise    = round($somme * $code['pourcentage'] / 100, 2);
        }

        $statut = 'en cours';
        $total  = round($somme - $remise, 2);
        $numero = $this->commandes->creer((int) $_SESSION['utilisateur'], $statut, $total, $codePromo, $remise, $lignes);

        if ($numero === null) {
            Response::erreur('Stock insuffisant pour un produit de votre commande.', 409);
        }

        Response::json([
            'commande' => [
                'numero' => $numero,
                'statut' => $statut,
                'total'  => $total,
                'remise' => $remise,
                'code'   => $saisi,
                'lignes' => $lignes,
            ],
        ], 201);
    }

    public function index(Request $requete): void
    {
        $utilisateur = $this->verifierConnexion();

       
        $statut = $requete->parametre('statut') ?? $_COOKIE['commandes_statut'] ?? '';
        $du     = $requete->parametre('du') ?? $_COOKIE['commandes_du'] ?? '';
        $au     = $requete->parametre('au') ?? $_COOKIE['commandes_au'] ?? '';

      
        if (!in_array($statut, ['', 'en cours', 'disponible', 'retirée', 'annulée'], true)) {
            $statut = '';
        }

        if ($du !== '' && !$this->dateValide($du)) {
            $du = '';
        }

        if ($au !== '' && !$this->dateValide($au)) {
            $au = '';
        }

        if ($du !== '' && $au !== '' && $du > $au) {
            $au = '';
        }

        if ($requete->parametre('statut') !== null) {
            setcookie('commandes_statut', $statut, $this->optionsCookie());
            setcookie('commandes_du',     $du,     $this->optionsCookie());
            setcookie('commandes_au',     $au,     $this->optionsCookie());
        }

        $parPage    = 10;
        $total      = $this->commandes->compterFiltre($utilisateur, $statut, $du, $au);
        $pagesTotal = max(1, (int) ceil($total / $parPage));
        $page       = (int) ($requete->parametre('page', '1') ?? '1');
        $page       = max(1, min($page, $pagesTotal));

        Response::json([
            'filtres'    => ['statut' => $statut, 'du' => $du, 'au' => $au],
            'commandes'  => $this->commandes->listerFiltre($utilisateur, $statut, $du, $au, $parPage, ($page - 1) * $parPage),
            'page'       => $page,
            'pagesTotal' => $pagesTotal,
            'total'      => $total,
        ]);
    }

    public function show(Request $requete): void
    {
        $utilisateur = $this->verifierConnexion();

        $numero = $requete->parametre('numero', '') ?? '';

        if ($numero === '' || strlen($numero) > 20) {
            Response::erreur('Numéro de commande invalide.', 400);
        }

        $commande = $this->commandes->trouverParNumero($numero, $utilisateur);

        if ($commande === null) {
            Response::erreur('Commande introuvable.', 404);
        }

        for ($i = 0; $i < count($commande['lignes']); $i++) {
            $commande['lignes'][$i]['total'] = round((float) $commande['lignes'][$i]['prix'] * $commande['lignes'][$i]['quantite'], 2);
        }

        unset($commande['id']);

        $commande['remise'] = (float) $commande['remise'];

        Response::json(['commande' => $commande]);
    }

    public function reorder(Request $requete): void
    {
        $utilisateur = $this->verifierConnexion();

        $numero = (string) ($requete->corps()['numero'] ?? '');

        if ($numero === '' || strlen($numero) > 20) {
            Response::erreur('Numéro de commande invalide.', 400);
        }

        $anciennes = $this->commandes->lignesParNumero($numero, $utilisateur);

        if ($anciennes === null) {
            Response::erreur('Commande introuvable.', 404);
        }

        $lignes = [];
        $notes  = [];

        for ($i = 0; $i < count($anciennes); $i++) {
            $ancienne = $anciennes[$i];
            $nom      = $ancienne['titre'];

            if ($ancienne['options'] !== '') {
                $nom .= ' (' . $ancienne['options'] . ')';
            }

            $variante = null;

            if ($ancienne['variante_id'] !== null) {
                $variante = $this->produits->trouverVarianteParId((int) $ancienne['variante_id']);
            }

            if ($variante === null) {
                $notes[] = $nom . ' : ce produit ou cette variante n\'est plus proposé.';
                continue;
            }

            $stock    = (int) $variante['stock'];
            $quantite = (int) $ancienne['quantite'];

            if ($stock === 0) {
                $notes[] = $nom . ' : épuisé.';
                continue;
            }

            if ($stock < $quantite) {
                $notes[]  = $nom . ' : quantité ramenée à ' . $stock . ' (stock disponible).';
                $quantite = $stock;
            }

            if (abs((float) $variante['prix'] - (float) $ancienne['prix']) > 0.001) {
                $notes[] = $nom . ' : le prix est passé de ' . number_format((float) $ancienne['prix'], 2, ',', ' ') . ' € à ' . number_format((float) $variante['prix'], 2, ',', ' ') . ' €.';
            }

            $images = $this->produits->images((int) $variante['produit']);

            $lignes[] = [
                'urlName'      => $variante['urlName'],
                'titre'        => $variante['titre'],
                'prix'         => $variante['prix'],
                'image'        => $images[0] ?? '',
                'options'      => $variante['cle'] === '' ? [] : explode(',', $variante['cle']),
                'optionsTexte' => $this->libelleVariante((int) $variante['produit'], (int) $variante['id']),
                'couleur'      => $variante['couleur'],
                'quantity'     => $quantite,
                'stock'        => $stock,
            ];
        }

        $message = count($lignes) . ' article(s) de la commande ' . $numero . ' ajouté(s) à votre panier.';

        if (count($lignes) === 0) {
            $message = 'Aucun article de la commande ' . $numero . " n'a pu être ajouté à votre panier.";
        }

        Response::json([
            'lignes'  => $lignes,
            'message' => $message,
            'notes'   => $notes,
        ]);
    }

    private function libelleVariante(int $produit, int $variante): string
    {
        $variantes = $this->produits->variantesAvecLibelle($produit);

        for ($i = 0; $i < count($variantes); $i++) {
            if ($variantes[$i]['id'] === $variante) {
                return $variantes[$i]['libelle'];
            }
        }

        return '';
    }

    private function verifierConnexion(): int
    {
        if (($_SESSION['utilisateur'] ?? null) === null) {
            Response::erreur('Vous devez être connecté.', 401);
        }

        return (int) $_SESSION['utilisateur'];
    }

    private function dateValide(string $date): bool
    {
        if (strlen($date) !== 10) {
            return false;
        }

        $annee = (int) substr($date, 0, 4);
        $mois  = (int) substr($date, 5, 2);
        $jour  = (int) substr($date, 8, 2);

        return checkdate($mois, $jour, $annee) && sprintf('%04d-%02d-%02d', $annee, $mois, $jour) === $date;
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
