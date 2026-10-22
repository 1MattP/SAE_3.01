<?php

declare(strict_types=1);

namespace App\Controller;

use App\Core\Request;
use App\Core\Response;
use App\Model\ProduitModel;

final class AdminProduitController
{
    private ProduitModel $produits;

    public function __construct(ProduitModel $produits)
    {
        $this->produits = $produits;
    }

    public function index(): void
    {
        $this->verifierAdministrateur();

        Response::json(['produits' => $this->produits->listerTout()]);
    }

    public function show(Request $requete): void
    {
        $this->verifierAdministrateur();

        $id      = (int) ($requete->parametre('id', '0') ?? '0');
        $produit = null;

        if ($id > 0) {
            $produit = $this->produits->trouverParId($id);

            if ($produit === null) {
                Response::erreur('Produit introuvable.', 404);
            }
        }

        Response::json(['produit' => $produit, 'categories' => $this->produits->categories()]);
    }

    public function create(Request $requete): void
    {
        $this->verifierAdministrateur();

        $produit = $this->lireProduit($requete->corps(), 0);
        $id      = $this->produits->ajouter($produit);

        Response::json(['produit' => ['id' => $id]], 201);
    }

    public function update(Request $requete): void
    {
        $this->verifierAdministrateur();

        $corps = $requete->corps();
        $id    = (int) ($corps['id'] ?? 0);

        if ($this->produits->trouverParId($id) === null) {
            Response::erreur('Produit introuvable.', 404);
        }

        $this->produits->modifier($id, $this->lireProduit($corps, $id));

        Response::json(['produit' => ['id' => $id]]);
    }

    public function remove(Request $requete): void
    {
        $this->verifierAdministrateur();

        $id = (int) ($requete->corps()['id'] ?? 0);

        if ($this->produits->trouverParId($id) === null) {
            Response::erreur('Produit introuvable.', 404);
        }

        $this->produits->supprimer($id);

        Response::json(['supprime' => true]);
    }

    public function stocks(Request $requete): void
    {
        $this->verifierAdministrateur();

        $corps   = $requete->corps();
        $id      = (int) ($corps['id'] ?? 0);
        $demande = $corps['stocks'] ?? null;

        if ($this->produits->trouverParId($id) === null) {
            Response::erreur('Produit introuvable.', 404);
        }

        if (!is_array($demande)) {
            Response::erreur('Stocks invalides.', 400);
        }

        $stocks = [];

        for ($i = 0; $i < count($demande); $i++) {
            $stock = (int) ($demande[$i]['stock'] ?? -1);

            if ($stock < 0 || $stock > 65535) {
                Response::erreur('Chaque stock doit être compris entre 0 et 65 535.', 400);
            }

            $stocks[] = ['id' => (int) ($demande[$i]['id'] ?? 0), 'stock' => $stock];
        }

        $this->produits->modifierStocks($id, $stocks);

        Response::json(['produit' => ['id' => $id]]);
    }

    private function verifierAdministrateur(): void
    {
        if (($_SESSION['administrateur'] ?? null) === null) {
            Response::erreur('Accès réservé aux administrateurs.', 401);
        }
    }

    private function lireProduit(array $corps, int $id): array
    {
        $titre             = trim((string) ($corps['titre'] ?? ''));
        $urlName           = trim((string) ($corps['urlName'] ?? ''));
        $description       = trim((string) ($corps['description'] ?? ''));
        $descriptionLongue = trim((string) ($corps['descriptionLongue'] ?? ''));
        $couleurs          = trim((string) ($corps['couleurs'] ?? ''));
        $image             = trim((string) ($corps['image'] ?? ''));
        $extras            = $corps['images'] ?? [];
        $texteOptions      = trim((string) ($corps['options'] ?? ''));
        $prix              = (float) str_replace(',', '.', (string) ($corps['prix'] ?? '0'));
        $categorieId       = (int) ($corps['categorieId'] ?? 0);

        if ($titre === '' || strlen($titre) > 160) {
            Response::erreur('Le titre est obligatoire (160 caractères maximum).', 400);
        }

        if ($urlName === '' || strlen($urlName) > 160 || !$this->nomUrlValide($urlName)) {
            Response::erreur("Le nom dans l'URL est obligatoire : lettres minuscules, chiffres et tirets seulement.", 400);
        }

        if ($description === '' || strlen($description) > 120) {
            Response::erreur('La description courte est obligatoire (120 caractères maximum).', 400);
        }

        if ($descriptionLongue === '') {
            Response::erreur('La description détaillée est obligatoire.', 400);
        }

        if ($prix <= 0 || $prix >= 100000) {
            Response::erreur('Le prix doit être supérieur à 0 et inférieur à 100 000.', 400);
        }

        if ($couleurs === '' || strlen($couleurs) > 120) {
            Response::erreur('Les couleurs sont obligatoires (120 caractères maximum).', 400);
        }

        if ($image === '' || strlen($image) > 255) {
            Response::erreur("L'image est obligatoire (255 caractères maximum).", 400);
        }

        $images = [];

        for ($i = 0; $i < 3; $i++) {
            $url = '';

            if (is_array($extras) && isset($extras[$i])) {
                $url = trim((string) $extras[$i]);
            }

            if (strlen($url) > 255) {
                Response::erreur('Chaque image fait 255 caractères maximum.', 400);
            }

            $images[] = $url;
        }

        $options = $this->lireOptions($texteOptions);

        $combinaisons = count($this->produits->listerCouleurs($couleurs));

        for ($i = 0; $i < count($options); $i++) {
            $combinaisons *= count($options[$i]['valeurs']);
        }

        if ($combinaisons > 100) {
            Response::erreur('Ce produit aurait ' . $combinaisons . ' variantes (options × couleurs) : 100 maximum.', 400);
        }

        $categories = $this->produits->categories();
        $existe     = false;

        for ($i = 0; $i < count($categories); $i++) {
            if ($categories[$i]['id'] === $categorieId) {
                $existe = true;
            }
        }

        if (!$existe) {
            Response::erreur('Catégorie invalide.', 400);
        }

        if ($this->produits->nomUrlPris($urlName, $id)) {
            Response::erreur("Ce nom dans l'URL est déjà utilisé par un autre produit.", 409);
        }

        return [
            'titre'             => $titre,
            'urlName'           => $urlName,
            'description'       => $description,
            'descriptionLongue' => $descriptionLongue,
            'prix'              => round($prix, 2),
            'couleurs'          => $couleurs,
            'image'             => $image,
            'images'            => $images,
            'options'           => $options,
            'categorieId'       => $categorieId,
        ];
    }

    private function nomUrlValide(string $urlName): bool
    {
        $autorises = 'abcdefghijklmnopqrstuvwxyz0123456789-';

        for ($i = 0; $i < strlen($urlName); $i++) {
            if (strpos($autorises, $urlName[$i]) === false) {
                return false;
            }
        }

        return true;
    }

    private function lireOptions(string $texte): array
    {
        if ($texte === '') {
            return [];
        }

        $lignes  = explode("\n", $texte);
        $groupes = [];

        if (count($lignes) > 5) {
            Response::erreur('Un produit a 5 options maximum.', 400);
        }

        for ($i = 0; $i < count($lignes); $i++) {
            $morceaux = explode(':', $lignes[$i], 2);
            $nom      = trim($morceaux[0]);

            if (count($morceaux) !== 2 || $nom === '' || strlen($nom) > 40) {
                Response::erreur('Chaque option s\'écrit « Nom : valeur, valeur » (nom de 40 caractères maximum).', 400);
            }

            for ($k = 0; $k < count($groupes); $k++) {
                if ($groupes[$k]['nom'] === $nom) {
                    Response::erreur('L\'option « ' . $nom . ' » est écrite deux fois.', 400);
                }
            }

            $valeurs = $this->lireValeurs(explode(',', $morceaux[1]), $nom);

            $groupes[] = ['nom' => $nom, 'valeurs' => $valeurs];
        }

        return $groupes;
    }

    private function lireValeurs(array $morceaux, string $nom): array
    {
        if (count($morceaux) > 10) {
            Response::erreur('L\'option « ' . $nom . ' » a 10 valeurs maximum.', 400);
        }

        $valeurs = [];

        for ($j = 0; $j < count($morceaux); $j++) {
            $libelle = trim($morceaux[$j]);

            if ($libelle === '' || strlen($libelle) > 40) {
                Response::erreur('Chaque valeur de « ' . $nom . ' » doit avoir un nom de 40 caractères maximum.', 400);
            }

            for ($k = 0; $k < count($valeurs); $k++) {
                if ($valeurs[$k]['libelle'] === $libelle) {
                    Response::erreur('La valeur « ' . $libelle . ' » est écrite deux fois dans « ' . $nom . ' ».', 400);
                }
            }

            $valeurs[] = ['libelle' => $libelle];
        }

        return $valeurs;
    }
}
