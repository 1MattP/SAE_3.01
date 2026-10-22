<?php

declare(strict_types=1);

/**
 * Point d'entrée unique de l'API.
 *
 * Toutes les requêtes commençant par /api/ aboutissent ici, redirigées par le
 * fichier .htaccess situé à la racine du projet.
 *
 * Ce fichier ne contient aucune logique métier : il assemble les pièces et
 * confie la requête au routeur.
 */

use App\Core\Database;
use App\Core\Request;
use App\Core\Response;
use App\Core\Router;
use App\Controller\AdminCategorieController;
use App\Controller\AdminCodePromoController;
use App\Controller\AdminCommandeController;
use App\Controller\AdminController;
use App\Controller\AdminProduitController;
use App\Controller\AuthController;
use App\Controller\CatalogueController;
use App\Controller\CodePromoController;
use App\Controller\CommandeController;
use App\Controller\CompteController;
use App\Controller\PanierController;
use App\Controller\ProduitController;
use App\Controller\StatsController;
use App\Model\CategorieModel;
use App\Model\CodePromoModel;
use App\Model\CommandeModel;
use App\Model\ProduitModel;
use App\Model\UtilisateurModel;

// --- Chargement automatique des classes ------------------------------------
// App\Core\Router  ->  back/src/Core/Router.php
//
// Plutôt que d'écrire un require par classe, on confie à PHP la fonction
// ci-dessous. PHP la gardera de côté et l'appellera LUI-MÊME, chaque fois qu'il
// rencontrera un nom de classe qu'il ne connaît pas encore — en lui passant ce
// nom en paramètre. À charge pour elle de trouver le fichier correspondant et
// de l'inclure. Rien ici n'est exécuté maintenant : on prépare seulement ce qui
// servira plus tard.
spl_autoload_register(static function (string $classe): void {
    $prefixe = 'App\\';

    if (!str_starts_with($classe, $prefixe)) {
        return;
    }

    $relatif = substr($classe, strlen($prefixe));
    $fichier = __DIR__ . '/src/' . str_replace('\\', '/', $relatif) . '.php';

    if (is_file($fichier)) {
        require $fichier;
    }
});

$config = require __DIR__ . '/config/config.php';

// --- Affichage des erreurs --------------------------------------------------
// En développement, une erreur PHP brute casserait le JSON attendu par le front.
// On les capture pour toujours répondre un document exploitable.
error_reporting(E_ALL);
ini_set('display_errors', '0');

try {
    $pdo = Database::connexion($config['bdd']);

    // --- Assemblage ---------------------------------------------------------
    // Les dépendances sont créées explicitement : le modèle reçoit la connexion,
    // le contrôleur reçoit le modèle. Aucune magie, tout est lisible ici.
    $seuilStock = $config['stock']['seuil_bientot_epuise'];
    $remisePromo = $config['promotion']['pourcentage'];

    $controleurs = [
        CatalogueController::class => new CatalogueController(new ProduitModel($pdo, $seuilStock, $remisePromo), new CategorieModel($pdo)),
        ProduitController::class   => new ProduitController(new ProduitModel($pdo, $seuilStock, $remisePromo)),
        AuthController::class      => new AuthController(new UtilisateurModel($pdo)),
        CommandeController::class  => new CommandeController(new CommandeModel($pdo), new ProduitModel($pdo, $seuilStock, $remisePromo), new CodePromoModel($pdo), $config['chemin']),
        CodePromoController::class => new CodePromoController(new CodePromoModel($pdo)),
        PanierController::class    => new PanierController(new ProduitModel($pdo, $seuilStock, $remisePromo)),
        AdminController::class     => new AdminController(new UtilisateurModel($pdo)),
        AdminProduitController::class => new AdminProduitController(new ProduitModel($pdo, $seuilStock, $remisePromo), new CategorieModel($pdo)),
        AdminCategorieController::class => new AdminCategorieController(new CategorieModel($pdo)),
        CompteController::class    => new CompteController(new UtilisateurModel($pdo), new CommandeModel($pdo)),
        AdminCommandeController::class => new AdminCommandeController(new CommandeModel($pdo), $config['chemin']),
        AdminCodePromoController::class => new AdminCodePromoController(new CodePromoModel($pdo)),
        StatsController::class     => new StatsController(new ProduitModel($pdo, $seuilStock, $remisePromo), new CommandeModel($pdo), new CodePromoModel($pdo), new CategorieModel($pdo)),
    ];

    $routes = require __DIR__ . '/src/routes.php';

    // --- Session : réglage unique, avant tout contrôleur --------------------
    // PHP n'envoie le cookie PHPSESSID qu'au moment où il crée la session : ses
    // paramètres doivent donc être fixés ici, avant session_start(), et nulle
    // part ailleurs.
    ini_set('session.use_strict_mode', '1');

    session_set_cookie_params([
        'path'     => $config['chemin'],
        'httponly' => true,
        'secure'   => true,
        'samesite' => 'Lax',
    ]);

    session_start();

    (new Router($routes, $controleurs))->traiter(Request::depuisGlobals());
} catch (Throwable $e) {
    Response::json(
        [
            'erreur' => $config['debug']
                ? $e->getMessage()
                : 'Une erreur interne est survenue.',
            'fichier' => $config['debug'] ? $e->getFile() . ':' . $e->getLine() : null,
        ],
        500,
    );
}
