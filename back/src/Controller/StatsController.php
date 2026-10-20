<?php

declare(strict_types=1);

namespace App\Controller;

use App\Core\Response;
use App\Model\CommandeModel;
use App\Model\ProduitModel;

final class StatsController
{
    private ProduitModel $produits;

    private CommandeModel $commandes;

    public function __construct(ProduitModel $produits, CommandeModel $commandes)
    {
        $this->produits  = $produits;
        $this->commandes = $commandes;
    }

    public function index(): void
    {
        if (($_SESSION['administrateur'] ?? null) === null) {
            Response::erreur('Accès réservé aux administrateurs.', 401);
        }

        Response::json([
            'produits'  => $this->produits->compter(0),
            'commandes' => $this->commandes->compter(),
            'categories' => count($this->produits->categories()),
        ]);
    }
}
