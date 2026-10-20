<?php

declare(strict_types=1);

use App\Controller\AdminController;
use App\Controller\AdminProduitController;
use App\Controller\AuthController;
use App\Controller\CatalogueController;
use App\Controller\CommandeController;
use App\Controller\PanierController;
use App\Controller\ProduitController;
use App\Controller\StatsController;

/**
 * Table des routes de l'API.
 *
 * Clé    : méthode HTTP et chemin, séparés par un ou plusieurs espaces.
 * Valeur : [classe du contrôleur, méthode à appeler].
 *
 * Toute instance de contrôleur utilisée ici doit également être enregistrée
 * dans back/index.php.
 */

return [
    'GET  /api/produits'       => [CatalogueController::class, 'index'],
    'GET  /api/produit'        => [ProduitController::class,   'show'],
    'POST /api/register'       => [AuthController::class,      'register'],
    'POST /api/login'          => [AuthController::class,      'login'],
    'POST /api/logout'         => [AuthController::class,      'logout'],
    'GET  /api/me'             => [AuthController::class,      'me'],
    'POST /api/commandes'      => [CommandeController::class,  'create'],
    'POST /api/commandes/annuler' => [CommandeController::class, 'cancel'],
    'POST /api/panier/verifier' => [PanierController::class, 'verify'],
    'POST /api/admin/login'    => [AdminController::class,     'login'],
    'POST /api/admin/logout'   => [AdminController::class,     'logout'],
    'GET  /api/admin/me'       => [AdminController::class,     'me'],
    'GET  /api/admin/stats'    => [StatsController::class,     'index'],
    'GET  /api/admin/produits' => [AdminProduitController::class, 'index'],
    'GET  /api/admin/produit'  => [AdminProduitController::class, 'show'],
    'POST /api/admin/produits' => [AdminProduitController::class, 'create'],
    'POST /api/admin/produits/modifier'  => [AdminProduitController::class, 'update'],
    'POST /api/admin/produits/supprimer' => [AdminProduitController::class, 'remove'],
];
