<?php

declare(strict_types=1);

namespace App\Controller;

use App\Core\Acces;
use App\Core\Request;
use App\Core\Response;
use App\Model\CommandeModel;

final class AdminCommandeController
{
    /** Liste blanche des tris : la clé vient du client, la valeur est écrite par nous. */
    private const TRIS = [
        'date_desc'    => 'commande.date_creation DESC, commande.id DESC',
        'date_asc'     => 'commande.date_creation ASC, commande.id ASC',
        'statut'       => 'commande.statut ASC, commande.id DESC',
        'montant_desc' => 'commande.total DESC, commande.id DESC',
        'montant_asc'  => 'commande.total ASC, commande.id DESC',
    ];

    /** Statuts d'origine autorisés pour chaque nouveau statut. */
    private const TRANSITIONS = [
        'disponible' => ['en cours'],
        'retirée'    => ['disponible'],
        'annulée'    => ['en cours', 'disponible'],
    ];

    private CommandeModel $commandes;

    private string $chemin;

    public function __construct(CommandeModel $commandes, string $chemin)
    {
        $this->commandes = $commandes;
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

    public function index(Request $requete): void
    {
        Acces::administrateur();

        if ($requete->parametre('tri') !== null) {
            setcookie('admin_commandes_tri', $requete->parametre('tri'), $this->optionsCookie());
        }

        $tri = $requete->parametre('tri') ?? $_COOKIE['admin_commandes_tri'] ?? 'date_desc';
        $tri = array_key_exists($tri, self::TRIS) ? $tri : 'date_desc';

        $parPage    = 15;
        $total      = $this->commandes->compter();
        $pagesTotal = max(1, (int) ceil($total / $parPage));
        $page       = (int) ($requete->parametre('page', '1') ?? '1');
        $page       = max(1, min($page, $pagesTotal));

        Response::json([
            'commandes'  => $this->commandes->listerTout(self::TRIS[$tri], $parPage, ($page - 1) * $parPage),
            'journal'    => $this->commandes->journalRecent(10),
            'tri'        => $tri,
            'page'       => $page,
            'pagesTotal' => $pagesTotal,
            'total'      => $total,
        ]);
    }

    public function show(Request $requete): void
    {
        Acces::administrateur();

        $numero = $requete->parametre('numero', '') ?? '';

        if ($numero === '' || strlen($numero) > 20) {
            Response::erreur('Numéro de commande invalide.', 400);
        }

        $commande = $this->commandes->trouverPourAdmin($numero);

        if ($commande === null) {
            Response::erreur('Commande introuvable.', 404);
        }

        for ($i = 0; $i < count($commande['lignes']); $i++) {
            $commande['lignes'][$i]['total'] = round((float) $commande['lignes'][$i]['prix'] * $commande['lignes'][$i]['quantite'], 2);
        }

        $commande['remise'] = (float) $commande['remise'];

        Response::json(['commande' => $commande]);
    }

    public function statut(Request $requete): void
    {
        Acces::administrateur();

        $corps   = $requete->corps();
        $statut  = (string) ($corps['statut'] ?? '');
        $demande = $corps['numeros'] ?? null;

        if (!array_key_exists($statut, self::TRANSITIONS)) {
            Response::erreur('Statut invalide.', 400);
        }

        if (!is_array($demande) || count($demande) < 1 || count($demande) > 50) {
            Response::erreur('Sélectionnez de 1 à 50 commandes.', 400);
        }

        $modifiees = 0;
        $ignorees  = [];

        for ($i = 0; $i < count($demande); $i++) {
            $numero = (string) $demande[$i];

            if ($numero === '' || strlen($numero) > 20) {
                Response::erreur('Numéro de commande invalide.', 400);
            }

            if ($this->commandes->changerStatut($numero, self::TRANSITIONS[$statut], $statut, (string) $_SESSION['admin_email'])) {
                $modifiees++;
            } else {
                $ignorees[] = $numero;
            }
        }

        Response::json(['modifiees' => $modifiees, 'ignorees' => $ignorees]);
    }
}
