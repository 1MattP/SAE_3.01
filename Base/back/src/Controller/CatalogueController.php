<?php

declare(strict_types=1);

namespace App\Controller;

use App\Core\Request;
use App\Core\Response;
use App\Model\ProduitModel;

/**
 * Liste paginée et triée du catalogue.
 */
final class CatalogueController
{
    /**
     * Liste blanche des tris autorisés.
     *
     * La clé vient du client, la valeur est écrite par nous. Le client ne choisit
     * donc jamais un nom de colonne : il choisit une entrée dans un tableau que
     * nous contrôlons entièrement.
     *
     * Un paramètre lié ne conviendrait pas : il protège une VALEUR, jamais un
     * IDENTIFIANT. « ORDER BY :colonne » lié à 'titre' produit « ORDER BY
     * 'titre' », une chaîne constante : le tri ne trie plus rien, sans erreur.
     */
    private const TRIS = [
        'titre' => 'produit.titre ASC',
        'annee' => 'produit.annee DESC',
        'note'  => 'produit.note_moyenne DESC',
    ];

    private const PAR_PAGE_AUTORISES = [12, 24, 48];

    /** Le modèle qui interroge la base, fourni à la construction. */
    private ProduitModel $produits;

    public function __construct(ProduitModel $produits)
    {
        $this->produits  = $produits;
    }

    public function index(Request $requete): void
    {
        $tri     = $requete->parametre('tri') ?? 'titre';
        $parPage = (int) ($requete->parametre('parPage') ?? 12);

        // Validation : on n'accepte que ce qui figure dans nos listes.
        $tri     = array_key_exists($tri, self::TRIS) ? $tri : 'titre';
        $parPage = in_array($parPage, self::PAR_PAGE_AUTORISES, true) ? $parPage : 12;
        $ordre   = self::TRIS[$tri];

        $total       = $this->produits->compter();
        $pagesTotal  = max(1, (int) ceil($total / $parPage));
        $page        = (int) ($requete->parametre('page', '1') ?? '1');
        $page        = max(1, min($page, $pagesTotal));

        $produits = $this->produits->lister($ordre, $parPage, ($page - 1) * $parPage);

        Response::json([
            'produits' => $produits,
            'tri'        => $tri,
            'parPage'    => $parPage,
            'page'       => $page,
            'pagesTotal' => $pagesTotal,
            'total'      => $total,
        ]);
    }
}
