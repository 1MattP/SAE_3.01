<?php

declare(strict_types=1);

namespace App\Controller;

use App\Core\Acces;
use App\Core\Response;
use App\Model\CategorieModel;
use App\Model\CodePromoModel;
use App\Model\CommandeModel;
use App\Model\ProduitModel;

final class StatsController
{
    private ProduitModel $produits;

    private CommandeModel $commandes;

    private CodePromoModel $codes;

    private CategorieModel $categories;

    public function __construct(ProduitModel $produits, CommandeModel $commandes, CodePromoModel $codes, CategorieModel $categories)
    {
        $this->produits  = $produits;
        $this->commandes = $commandes;
        $this->codes     = $codes;
        $this->categories = $categories;
    }

    public function index(): void
    {
        Acces::administrateur();

        Response::json([
            'produits'  => $this->produits->compter(0),
            'commandes' => $this->commandes->compter(),
            'categories' => $this->categories->compter(),
            'codesPromo' => $this->codes->compter(),
        ]);
    }

    public function dashboard(): void
    {
        Acces::administrateur();

        $produits = $this->produits->listerTout();
        $stocks   = [];
        $alertes  = [];

        for ($i = 0; $i < count($produits); $i++) {
            $stock    = (int) $produits[$i]['stock'];
            $stocks[] = ['produit' => $produits[$i]['titre'], 'stock' => $stock];

            if ($stock <= $this->produits->seuilStock()) {
                $alertes[] = ['produit' => $produits[$i]['titre'], 'stock' => $stock];
            }
        }

        $jours   = $this->commandes->revenusSemaine();
        $revenus = [];

        for ($i = 0; $i < count($jours); $i++) {
            $revenus[] = [
                'jour'      => $jours[$i]['jour'],
                'revenu'    => round((float) $jours[$i]['revenu'], 2),
                'commandes' => (int) $jours[$i]['commandes'],
            ];
        }

        $comptes   = $this->commandes->compterParStatut();
        $statuts   = [];
        $nomsStatut = ['en cours', 'disponible', 'retirée', 'annulée'];

        for ($i = 0; $i < count($nomsStatut); $i++) {
            $nombre = 0;

            for ($j = 0; $j < count($comptes); $j++) {
                if ($comptes[$j]['statut'] === $nomsStatut[$i]) {
                    $nombre = (int) $comptes[$j]['nombre'];
                }
            }

            $statuts[] = ['statut' => $nomsStatut[$i], 'nombre' => $nombre];
        }

        $ventes  = $this->commandes->plusVendus(5);
        $vendus  = [];

        for ($i = 0; $i < count($ventes); $i++) {
            $vendus[] = ['produit' => $ventes[$i]['titre'], 'vendus' => (int) $ventes[$i]['vendus']];
        }

        Response::json([
            'stocks'        => $stocks,
            'alertes'       => $alertes,
            'seuil'         => $this->produits->seuilStock(),
            'revenus'       => $revenus,
            'commandes'     => ['total' => $this->commandes->compter(), 'parStatut' => $statuts],
            'plusVendus'    => $vendus,
        ]);
    }
}
