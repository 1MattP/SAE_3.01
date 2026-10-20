<?php

declare(strict_types=1);

namespace App\Controller;

use App\Core\Request;
use App\Core\Response;
use App\Model\CategorieModel;

final class AdminCategorieController
{
    private CategorieModel $categories;

    public function __construct(CategorieModel $categories)
    {
        $this->categories = $categories;
    }

    public function index(): void
    {
        $this->verifierAdministrateur();

        Response::json(['categories' => $this->categories->lister()]);
    }

    public function show(Request $requete): void
    {
        $this->verifierAdministrateur();

        $id        = (int) ($requete->parametre('id', '0') ?? '0');
        $categorie = $this->categories->trouverParId($id);

        if ($categorie === null) {
            Response::erreur('Catégorie introuvable.', 404);
        }

        Response::json(['categorie' => $categorie]);
    }

    public function create(Request $requete): void
    {
        $this->verifierAdministrateur();

        $categorie = $this->lireCategorie($requete->corps(), 0);
        $id        = $this->categories->ajouter($categorie['libelle'], $categorie['description']);

        Response::json(['categorie' => ['id' => $id]], 201);
    }

    public function update(Request $requete): void
    {
        $this->verifierAdministrateur();

        $corps = $requete->corps();
        $id    = (int) ($corps['id'] ?? 0);

        if ($this->categories->trouverParId($id) === null) {
            Response::erreur('Catégorie introuvable.', 404);
        }

        $categorie = $this->lireCategorie($corps, $id);
        $this->categories->modifier($id, $categorie['libelle'], $categorie['description']);

        Response::json(['categorie' => ['id' => $id]]);
    }

    public function remove(Request $requete): void
    {
        $this->verifierAdministrateur();

        $id        = (int) ($requete->corps()['id'] ?? 0);
        $categorie = $this->categories->trouverParId($id);

        if ($categorie === null) {
            Response::erreur('Catégorie introuvable.', 404);
        }

        if ($categorie['nombre'] > 0) {
            Response::erreur('Cette catégorie contient encore des produits : déplace-les dans une autre catégorie avant de la supprimer.', 409);
        }

        $this->categories->supprimer($id);

        Response::json(['supprime' => true]);
    }

    private function verifierAdministrateur(): void
    {
        if (($_SESSION['administrateur'] ?? null) === null) {
            Response::erreur('Accès réservé aux administrateurs.', 401);
        }
    }

    private function lireCategorie(array $corps, int $id): array
    {
        $libelle     = trim((string) ($corps['libelle'] ?? ''));
        $description = trim((string) ($corps['description'] ?? ''));

        if ($libelle === '' || mb_strlen($libelle) > 40) {
            Response::erreur('Le nom est obligatoire (40 caractères maximum).', 400);
        }

        if (mb_strtolower($libelle) === 'tout') {
            Response::erreur('Le nom « Tout » est réservé au catalogue.', 400);
        }

        if ($description === '' || mb_strlen($description) > 255) {
            Response::erreur('La description est obligatoire (255 caractères maximum).', 400);
        }

        if ($this->categories->libelleExiste($libelle, $id)) {
            Response::erreur('Une catégorie porte déjà ce nom.', 409);
        }

        return ['libelle' => $libelle, 'description' => $description];
    }
}
