<?php

declare(strict_types=1);

use App\Controller\AdminCategorieController;
use App\Controller\AdminCommandeController;
use App\Controller\AdminController;
use App\Controller\AdminProduitController;
use App\Controller\AuthController;
use App\Controller\CatalogueController;
use App\Controller\CommandeController;
use App\Controller\CompteController;
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
    'GET  /api/commandes'      => [CommandeController::class,  'index'],
    'GET  /api/commande'       => [CommandeController::class,  'show'],
    'POST /api/commandes'      => [CommandeController::class,  'create'],
    'POST /api/commandes/recommander' => [CommandeController::class, 'reorder'],
    'POST /api/commandes/annuler' => [CommandeController::class, 'cancel'],
    'GET  /api/compte'         => [CompteController::class,    'show'],
    'POST /api/compte/profil'  => [CompteController::class,    'updateProfil'],
    'POST /api/compte/mot-de-passe' => [CompteController::class, 'updateMotDePasse'],
    'POST /api/panier/verifier' => [PanierController::class, 'verify'],
    'POST /api/admin/login'    => [AdminController::class,     'login'],
    'POST /api/admin/logout'   => [AdminController::class,     'logout'],
    'GET  /api/admin/me'       => [AdminController::class,     'me'],
    'GET  /api/admin/stats'    => [StatsController::class,     'index'],
    'GET  /api/admin/statistiques' => [StatsController::class, 'dashboard'],
    'GET  /api/admin/produits' => [AdminProduitController::class, 'index'],
    'GET  /api/admin/produit'  => [AdminProduitController::class, 'show'],
    'POST /api/admin/produits' => [AdminProduitController::class, 'create'],
    'POST /api/admin/produits/modifier'  => [AdminProduitController::class, 'update'],
    'POST /api/admin/produits/supprimer' => [AdminProduitController::class, 'remove'],
    'POST /api/admin/produits/stocks'    => [AdminProduitController::class, 'stocks'],
    'GET  /api/admin/commandes'  => [AdminCommandeController::class, 'index'],
    'GET  /api/admin/commande'   => [AdminCommandeController::class, 'show'],
    'POST /api/admin/commandes/statut' => [AdminCommandeController::class, 'statut'],
    'GET  /api/admin/categories' => [AdminCategorieController::class, 'index'],
    'GET  /api/admin/categorie'  => [AdminCategorieController::class, 'show'],
    'POST /api/admin/categories' => [AdminCategorieController::class, 'create'],
    'POST /api/admin/categories/modifier'  => [AdminCategorieController::class, 'update'],
    'POST /api/admin/categories/supprimer' => [AdminCategorieController::class, 'remove'],
];
