<?php

declare(strict_types=1);

namespace App\Controller;

use App\Core\Request;
use App\Core\Response;
use App\Model\ProduitModel;

/**
 * Liste paginée du catalogue, éventuellement limitée à une catégorie.
 */
final class CatalogueController
{
    
    private ProduitModel $produits;

    public function __construct(ProduitModel $produits)
    {
        $this->produits = $produits;
    }

    public function index(Request $requete): void
    {
        $categories = [['id' => 0, 'libelle' => 'Tout', 'nombre' => 0]];
        $somme      = 0;

        foreach ($this->produits->categories() as $ligne) {
            $categories[] = $ligne;
            $somme += $ligne['nombre'];
        }

        $categories[0]['nombre'] = $somme;

       
        $demande   = $requete->parametre('categorie');
        $categorie = 0;

        foreach ($categories as $ligne) {
            if ($ligne['libelle'] === $demande) {
                $categorie = $ligne['id'];
            }
        }

        $parPage = 12;

        $total      = $this->produits->compter($categorie);
        $pagesTotal = max(1, (int) ceil($total / $parPage));
        $page       = (int) ($requete->parametre('page', '1') ?? '1');
        $page       = max(1, min($page, $pagesTotal));

        $produits = $this->produits->lister($categorie, $parPage, ($page - 1) * $parPage);

        Response::json([
            'produits'   => $produits,
            'categories' => $categories,
            'categorie'  => $categorie,
            'page'       => $page,
            'pagesTotal' => $pagesTotal,
            'total'      => $total,
        ]);
    }
}
