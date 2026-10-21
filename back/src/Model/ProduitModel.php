<?php

declare(strict_types=1);

namespace App\Model;

use PDO;

/**
 * Accès aux données du catalogue.
 *
 * Cette couche ne contient aucune règle métier et ne décide de rien :
 * elle exécute les requêtes qu'on lui demande et renvoie des tableaux.
 */
final class ProduitModel
{
    /** Connexion à la base, fournie à la construction. */
    private PDO $pdo;

    private int $seuilStock;

    private const TOTAL = 'LEFT JOIN (SELECT produit_id, SUM(stock) AS stock FROM variante GROUP BY produit_id) AS total
                                  ON total.produit_id = produit.id';

    public function __construct(PDO $pdo, int $seuilStock)
    {
        $this->pdo        = $pdo;
        $this->seuilStock = $seuilStock;
    }

    public function compter(int $categorie): int
    {
        $sql = 'SELECT COUNT(*)
                FROM produit
                WHERE :toutes = 0 OR produit.categorie_id = :categorie';

        $requetePreparee = $this->pdo->prepare($sql);
        $requetePreparee->bindValue(':toutes',    $categorie, PDO::PARAM_INT);
        $requetePreparee->bindValue(':categorie', $categorie, PDO::PARAM_INT);
        $requetePreparee->execute();

        return (int) $requetePreparee->fetchColumn();
    }

    public function lister(int $categorie, int $limite, int $decalage): array
    {
        $sql = "SELECT produit.id,
                    produit.titre,
                    produit.nom_url AS urlName,
                    produit.description,
                    produit.prix,
                    produit.couleurs,
                    produit.image,
                    CASE WHEN COALESCE(total.stock, 0) = 0 THEN 'epuise'
                         WHEN total.stock <= :seuil THEN 'bientot_epuise'
                         ELSE 'en_stock' END AS etatStock,
                    categorie.libelle AS categorie
                FROM produit
            INNER JOIN categorie ON categorie.id = produit.categorie_id
            " . self::TOTAL . "
                WHERE :toutes = 0 OR produit.categorie_id = :categorie
            ORDER BY produit.titre, produit.id
                LIMIT :limite OFFSET :decalage";

        $requetePreparee = $this->pdo->prepare($sql);
        $requetePreparee->bindValue(':seuil',     $this->seuilStock, PDO::PARAM_INT);
        $requetePreparee->bindValue(':toutes',    $categorie, PDO::PARAM_INT);
        $requetePreparee->bindValue(':categorie', $categorie, PDO::PARAM_INT);
        $requetePreparee->bindValue(':limite',    $limite,    PDO::PARAM_INT);
        $requetePreparee->bindValue(':decalage',  $decalage,  PDO::PARAM_INT);
        $requetePreparee->execute();

        return $requetePreparee->fetchAll();
    }

    public function trouverParNomUrl(string $urlName): ?array
    {
        $sql = "SELECT produit.id,
                       produit.titre,
                       produit.nom_url AS urlName,
                       produit.description,
                       produit.description_longue,
                       produit.prix,
                       produit.couleurs,
                       COALESCE(total.stock, 0) AS stock,
                       CASE WHEN COALESCE(total.stock, 0) = 0 THEN 'epuise'
                            WHEN total.stock <= :seuil THEN 'bientot_epuise'
                            ELSE 'en_stock' END AS etatStock,
                       categorie.libelle AS categorie
                  FROM produit
            INNER JOIN categorie ON categorie.id = produit.categorie_id
            " . self::TOTAL . "
                 WHERE produit.nom_url = :urlName";

        $requetePreparee = $this->pdo->prepare($sql);
        $requetePreparee->bindValue(':seuil',   $this->seuilStock, PDO::PARAM_INT);
        $requetePreparee->bindValue(':urlName', $urlName, PDO::PARAM_STR);
        $requetePreparee->execute();

        $ligne = $requetePreparee->fetch();

        return $ligne === false ? null : $ligne;
    }


    public function images(int $produit): array
    {
        $sql = 'SELECT url
                  FROM image_produit
                 WHERE produit_id = :produit
              ORDER BY position';

        $requetePreparee = $this->pdo->prepare($sql);
        $requetePreparee->bindValue(':produit', $produit, PDO::PARAM_INT);
        $requetePreparee->execute();

        return $requetePreparee->fetchAll(PDO::FETCH_COLUMN);
    }


    public function listerTout(): array
    {
        $sql = 'SELECT produit.id,
                       produit.titre,
                       produit.nom_url AS urlName,
                       produit.prix,
                       COALESCE(total.stock, 0) AS stock,
                       produit.image,
                       categorie.libelle AS categorie
                  FROM produit
            INNER JOIN categorie ON categorie.id = produit.categorie_id
            ' . self::TOTAL . '
              ORDER BY produit.titre, produit.id';

        return $this->pdo->query($sql)->fetchAll();
    }

    public function trouverParId(int $id): ?array
    {
        $sql = 'SELECT id,
                       titre,
                       nom_url AS urlName,
                       description,
                       description_longue AS descriptionLongue,
                       prix,
                       couleurs,
                       image,
                       categorie_id AS categorieId
                  FROM produit
                 WHERE id = :id';

        $requetePreparee = $this->pdo->prepare($sql);
        $requetePreparee->bindValue(':id', $id, PDO::PARAM_INT);
        $requetePreparee->execute();

        $ligne = $requetePreparee->fetch();

        if ($ligne === false) {
            return null;
        }

        $images          = $this->images($id);
        $ligne['images'] = [];

        for ($i = 1; $i < count($images); $i++) {
            $ligne['images'][] = $images[$i];
        }

        $ligne['options']   = $this->texteOptions($this->options($id));
        $ligne['variantes'] = $this->variantesAvecLibelle($id);

        return $ligne;
    }

    public function nomUrlPris(string $urlName, int $sauf): bool
    {
        $sql = 'SELECT COUNT(*) FROM produit WHERE nom_url = :urlName AND id <> :sauf';

        $requetePreparee = $this->pdo->prepare($sql);
        $requetePreparee->bindValue(':urlName', $urlName, PDO::PARAM_STR);
        $requetePreparee->bindValue(':sauf',    $sauf,    PDO::PARAM_INT);
        $requetePreparee->execute();

        return (int) $requetePreparee->fetchColumn() > 0;
    }

    public function ajouter(array $produit): int
    {
        $this->pdo->beginTransaction();

        $sql = 'INSERT INTO produit (titre, nom_url, description, description_longue, prix, couleurs, image, categorie_id)
                VALUES (:titre, :urlName, :description, :descriptionLongue, :prix, :couleurs, :image, :categorie)';

        $requetePreparee = $this->pdo->prepare($sql);
        $this->lierProduit($requetePreparee, $produit);
        $requetePreparee->execute();

        $id = (int) $this->pdo->lastInsertId();

        $this->enregistrerImages($id, $produit['image'], $produit['images']);
        $this->enregistrerOptions($id, $produit['options']);
        $this->synchroniserVariantes($id, $produit['couleurs'], []);

        $this->pdo->commit();

        return $id;
    }

    public function modifier(int $id, array $produit): void
    {
        $this->pdo->beginTransaction();

        $anciennes = $this->variantesAvecLibelle($id);

        $sql = 'UPDATE produit
                   SET titre = :titre,
                       nom_url = :urlName,
                       description = :description,
                       description_longue = :descriptionLongue,
                       prix = :prix,
                       couleurs = :couleurs,
                       image = :image,
                       categorie_id = :categorie
                 WHERE id = :id';

        $requetePreparee = $this->pdo->prepare($sql);
        $this->lierProduit($requetePreparee, $produit);
        $requetePreparee->bindValue(':id', $id, PDO::PARAM_INT);
        $requetePreparee->execute();

        $this->enregistrerImages($id, $produit['image'], $produit['images']);

        if ($this->texteOptions($this->options($id)) !== $this->texteOptions($produit['options'])) {
            $this->enregistrerOptions($id, $produit['options']);
        }

        $this->synchroniserVariantes($id, $produit['couleurs'], $anciennes);

        $this->pdo->commit();
    }

    public function supprimer(int $id): void
    {
        $sql = 'DELETE FROM produit WHERE id = :id';

        $requetePreparee = $this->pdo->prepare($sql);
        $requetePreparee->bindValue(':id', $id, PDO::PARAM_INT);
        $requetePreparee->execute();
    }

    private function lierProduit(\PDOStatement $requetePreparee, array $produit): void
    {
        $requetePreparee->bindValue(':titre',             $produit['titre'],             PDO::PARAM_STR);
        $requetePreparee->bindValue(':urlName',           $produit['urlName'],           PDO::PARAM_STR);
        $requetePreparee->bindValue(':description',       $produit['description'],       PDO::PARAM_STR);
        $requetePreparee->bindValue(':descriptionLongue', $produit['descriptionLongue'], PDO::PARAM_STR);
        $requetePreparee->bindValue(':prix',              $produit['prix'],              PDO::PARAM_STR);
        $requetePreparee->bindValue(':couleurs',          $produit['couleurs'],          PDO::PARAM_STR);
        $requetePreparee->bindValue(':image',             $produit['image'],             PDO::PARAM_STR);
        $requetePreparee->bindValue(':categorie',         $produit['categorieId'],       PDO::PARAM_INT);
    }

    private function enregistrerImages(int $id, string $image, array $images): void
    {
        $sql = 'INSERT INTO image_produit (produit_id, url, position)
                VALUES (:produit, :url, :position)
                ON DUPLICATE KEY UPDATE url = VALUES(url)';

        $requetePreparee = $this->pdo->prepare($sql);

        for ($position = 1; $position <= 4; $position++) {
            $url = $image;

            if ($position > 1 && $images[$position - 2] !== '') {
                $url = $images[$position - 2];
            }

            $requetePreparee->bindValue(':produit',  $id,       PDO::PARAM_INT);
            $requetePreparee->bindValue(':url',      $url,      PDO::PARAM_STR);
            $requetePreparee->bindValue(':position', $position, PDO::PARAM_INT);
            $requetePreparee->execute();
        }
    }

    public function listerCouleurs(string $couleurs): array
    {
        $codes = explode(',', $couleurs);
        $liste = [];

        for ($i = 0; $i < count($codes); $i++) {
            if (trim($codes[$i]) !== '') {
                $liste[] = trim($codes[$i]);
            }
        }

        return $liste;
    }

    public function options(int $produit): array
    {
        $sql = 'SELECT option_groupe.id AS groupe_id,
                       option_groupe.nom,
                       option_valeur.id AS valeur_id,
                       option_valeur.libelle
                  FROM option_groupe
            INNER JOIN option_valeur ON option_valeur.groupe_id = option_groupe.id
                 WHERE option_groupe.produit_id = :produit
              ORDER BY option_groupe.id, option_valeur.id';

        $requetePreparee = $this->pdo->prepare($sql);
        $requetePreparee->bindValue(':produit', $produit, PDO::PARAM_INT);
        $requetePreparee->execute();

        $lignes = $requetePreparee->fetchAll();
        $groupes = [];

        for ($i = 0; $i < count($lignes); $i++) {
            $dernier = count($groupes) - 1;

            if ($dernier < 0 || $groupes[$dernier]['id'] !== (int) $lignes[$i]['groupe_id']) {
                $groupes[] = ['id' => (int) $lignes[$i]['groupe_id'], 'nom' => $lignes[$i]['nom'], 'valeurs' => []];
                $dernier++;
            }

            $groupes[$dernier]['valeurs'][] = [
                'id'         => (int) $lignes[$i]['valeur_id'],
                'libelle'    => $lignes[$i]['libelle'],
            ];
        }

        return $groupes;
    }

    public function choisirOptions(int $produit, array $choix): ?array
    {
        $groupes = $this->options($produit);

        if (count($choix) !== count($groupes)) {
            return null;
        }

        $textes = [];
        $cle    = [];

        for ($i = 0; $i < count($groupes); $i++) {
            $trouve = null;

            for ($j = 0; $j < count($groupes[$i]['valeurs']); $j++) {
                if (in_array($groupes[$i]['valeurs'][$j]['id'], $choix, true)) {
                    $trouve = $groupes[$i]['valeurs'][$j];
                }
            }

            if ($trouve === null) {
                return null;
            }

            $textes[] = $groupes[$i]['nom'] . ' : ' . $trouve['libelle'];
            $cle[]    = $trouve['id'];
        }

        return ['texte' => implode(', ', $textes), 'cle' => implode(',', $cle)];
    }

    public function texteOptions(array $groupes): string
    {
        $lignes = [];

        for ($i = 0; $i < count($groupes); $i++) {
            $valeurs = [];

            for ($j = 0; $j < count($groupes[$i]['valeurs']); $j++) {
                $valeurs[] = $groupes[$i]['valeurs'][$j]['libelle'];
            }

            $lignes[] = $groupes[$i]['nom'] . ' : ' . implode(', ', $valeurs);
        }

        return implode("\n", $lignes);
    }

    private function enregistrerOptions(int $id, array $groupes): void
    {
        $sql = 'DELETE FROM option_groupe WHERE produit_id = :produit';

        $requetePreparee = $this->pdo->prepare($sql);
        $requetePreparee->bindValue(':produit', $id, PDO::PARAM_INT);
        $requetePreparee->execute();

        $sqlGroupe = 'INSERT INTO option_groupe (produit_id, nom)
                      VALUES (:produit, :nom)';
        $sqlValeur = 'INSERT INTO option_valeur (groupe_id, libelle)
                      VALUES (:groupe, :libelle)';

        $insertionGroupe = $this->pdo->prepare($sqlGroupe);
        $insertionValeur = $this->pdo->prepare($sqlValeur);

        for ($i = 0; $i < count($groupes); $i++) {
            $insertionGroupe->bindValue(':produit',  $id,                  PDO::PARAM_INT);
            $insertionGroupe->bindValue(':nom',      $groupes[$i]['nom'],  PDO::PARAM_STR);
            $insertionGroupe->execute();

            $groupe = (int) $this->pdo->lastInsertId();

            for ($j = 0; $j < count($groupes[$i]['valeurs']); $j++) {
                $insertionValeur->bindValue(':groupe',     $groupe,                                      PDO::PARAM_INT);
                $insertionValeur->bindValue(':libelle',    $groupes[$i]['valeurs'][$j]['libelle'],       PDO::PARAM_STR);
                $insertionValeur->execute();
            }
        }
    }

    public function variantes(int $produit): array
    {
        $sql = "SELECT id,
                       cle,
                       couleur,
                       stock,
                       CASE WHEN stock = 0 THEN 'epuise'
                            WHEN stock <= :seuil THEN 'bientot_epuise'
                            ELSE 'en_stock' END AS etatStock
                  FROM variante
                 WHERE produit_id = :produit
              ORDER BY id";

        $requetePreparee = $this->pdo->prepare($sql);
        $requetePreparee->bindValue(':seuil',   $this->seuilStock, PDO::PARAM_INT);
        $requetePreparee->bindValue(':produit', $produit,          PDO::PARAM_INT);
        $requetePreparee->execute();

        return $requetePreparee->fetchAll();
    }

    public function trouverVariante(int $produit, string $cle, string $couleur): ?array
    {
        $sql = 'SELECT id, stock
                  FROM variante
                 WHERE produit_id = :produit AND cle = :cle AND couleur = :couleur';

        $requetePreparee = $this->pdo->prepare($sql);
        $requetePreparee->bindValue(':produit', $produit, PDO::PARAM_INT);
        $requetePreparee->bindValue(':cle',     $cle,     PDO::PARAM_STR);
        $requetePreparee->bindValue(':couleur', $couleur, PDO::PARAM_STR);
        $requetePreparee->execute();

        $ligne = $requetePreparee->fetch();

        return $ligne === false ? null : $ligne;
    }

    public function trouverVarianteParId(int $id): ?array
    {
        $sql = 'SELECT variante.id,
                       variante.cle,
                       variante.couleur,
                       variante.stock,
                       produit.id AS produit,
                       produit.nom_url AS urlName,
                       produit.titre,
                       produit.prix
                  FROM variante
            INNER JOIN produit ON produit.id = variante.produit_id
                 WHERE variante.id = :id';

        $requetePreparee = $this->pdo->prepare($sql);
        $requetePreparee->bindValue(':id', $id, PDO::PARAM_INT);
        $requetePreparee->execute();

        $ligne = $requetePreparee->fetch();

        return $ligne === false ? null : $ligne;
    }

    public function modifierStocks(int $produit, array $stocks): void
    {
        $sql = 'UPDATE variante SET stock = :stock WHERE id = :id AND produit_id = :produit';

        $requetePreparee = $this->pdo->prepare($sql);

        for ($i = 0; $i < count($stocks); $i++) {
            $requetePreparee->bindValue(':stock',   $stocks[$i]['stock'], PDO::PARAM_INT);
            $requetePreparee->bindValue(':id',      $stocks[$i]['id'],    PDO::PARAM_INT);
            $requetePreparee->bindValue(':produit', $produit,             PDO::PARAM_INT);
            $requetePreparee->execute();
        }
    }

    public function variantesAvecLibelle(int $produit): array
    {
        $groupes   = $this->options($produit);
        $variantes = $this->variantes($produit);

        for ($i = 0; $i < count($variantes); $i++) {
            $variantes[$i]['libelle'] = $this->libelleCombinaison($groupes, $variantes[$i]['cle']);
        }

        return $variantes;
    }

    private function libelleCombinaison(array $groupes, string $cle): string
    {
        if ($cle === '') {
            return '';
        }

        $ids     = explode(',', $cle);
        $libelle = [];

        for ($i = 0; $i < count($groupes); $i++) {
            for ($j = 0; $j < count($groupes[$i]['valeurs']); $j++) {
                if (in_array((string) $groupes[$i]['valeurs'][$j]['id'], $ids, true)) {
                    $libelle[] = $groupes[$i]['nom'] . ' : ' . $groupes[$i]['valeurs'][$j]['libelle'];
                }
            }
        }

        return implode(', ', $libelle);
    }

    private function synchroniserVariantes(int $produit, string $couleurs, array $anciennes): void
    {
        $groupes = $this->options($produit);
        $cles    = [''];

        for ($i = 0; $i < count($groupes); $i++) {
            $suite = [];

            for ($k = 0; $k < count($cles); $k++) {
                for ($j = 0; $j < count($groupes[$i]['valeurs']); $j++) {
                    $suite[] = ($cles[$k] === '' ? '' : $cles[$k] . ',') . $groupes[$i]['valeurs'][$j]['id'];
                }
            }

            $cles = $suite;
        }

        $codes   = $this->listerCouleurs($couleurs);
        $gardees = [];

        $miseAJour = $this->pdo->prepare('UPDATE variante SET cle = :cle WHERE id = :id');
        $insertion = $this->pdo->prepare('INSERT INTO variante (produit_id, cle, couleur, stock) VALUES (:produit, :cle, :couleur, 0)');

        for ($k = 0; $k < count($cles); $k++) {
            $libelle = $this->libelleCombinaison($groupes, $cles[$k]);

            for ($c = 0; $c < count($codes); $c++) {
                $ancienne = null;

                for ($a = 0; $a < count($anciennes); $a++) {
                    if ($anciennes[$a]['libelle'] === $libelle && $anciennes[$a]['couleur'] === $codes[$c]) {
                        $ancienne = $anciennes[$a];
                    }
                }

                if ($ancienne !== null) {
                    $miseAJour->bindValue(':cle', $cles[$k],       PDO::PARAM_STR);
                    $miseAJour->bindValue(':id',  $ancienne['id'], PDO::PARAM_INT);
                    $miseAJour->execute();

                    $gardees[] = $ancienne['id'];
                } else {
                    $insertion->bindValue(':produit', $produit,    PDO::PARAM_INT);
                    $insertion->bindValue(':cle',     $cles[$k],   PDO::PARAM_STR);
                    $insertion->bindValue(':couleur', $codes[$c],  PDO::PARAM_STR);
                    $insertion->execute();
                }
            }
        }

        $suppression = $this->pdo->prepare('DELETE FROM variante WHERE id = :id');

        for ($a = 0; $a < count($anciennes); $a++) {
            if (!in_array($anciennes[$a]['id'], $gardees, true)) {
                $suppression->bindValue(':id', $anciennes[$a]['id'], PDO::PARAM_INT);
                $suppression->execute();
            }
        }
    }

    public function categories(): array
    {
        $sql = 'SELECT categorie.id,
                       categorie.libelle,
                       COUNT(produit.id) AS nombre
                  FROM categorie
              LEFT JOIN produit ON produit.categorie_id = categorie.id
              GROUP BY categorie.id, categorie.libelle
              ORDER BY categorie.id';

              $lignes = $this->pdo->query($sql)->fetchAll();

              $categories = [];

                foreach ($lignes as $ligne) {
                    $categories[] = [
                        'id'      => (int) $ligne['id'],
                        'libelle' => $ligne['libelle'],
                        'nombre'  => (int) $ligne['nombre'],
                    ];
                }

        return $categories;

    }



}
