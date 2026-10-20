# SAE301-Starter --- Catalogue

# 0. Avant toute chose

Tout le travail devra être effectuer dans SAE301

- Pour chaque travaux navigue dans .agent afin d'utiliser les meilleur règle et skill.

- Avant toute modification, inspecter la structure du projet et lire les fichiers existants concernés.
- Respecter strictement la séparation des responsabilités du front-end et du back-end.

- Ne pas ajouter de dépendance, modifier des fichiers sans rapport avec la tâche, ni effectuer de refactorisation non demandée sans autorisation.

- En cas de contradiction entre les instructions, ou si une décision d'architecture est nécessaire et non documentée, suspendre la modification concernée et demander une clarification.

- Après chaque modification, exécuter les vérifications applicables et signaler celles qui n'ont pas pu être exécutées.

- Ne jamais committer ni pousser les changements.

Application composée de deux parties :

-   **Back-end** : API PHP en trois couches (routage, contrôleur,
    modèle) au-dessus de MySQL. L'API renvoie exclusivement du JSON.
-   **Front-end** : JavaScript avec Vite et Tailwind, organisé en
    layouts, pages et composants, avec un routeur côté client.

Fonctionnalités prévues/présentes :

-   Catalogue trié et paginé, avec préférences conservées dans
    des cookies.
-   Connexion par session.
-   Page d'administration réservée au rôle `admin`.
-   Thème clair/sombre conservé dans `localStorage`.

------------------------------------------------------------------------

## 1. Architecture obligatoire

Le projet applique la séparation des responsabilités à deux endroits.
Toute modification ou tout ajout doit respecter strictement ces
découpages.

**En cas de doute sur l'emplacement d'une fonction, arrêter le travail
et demander avant de mélanger les rôles.**

### 1.1. Front-end : MVC dans chaque page

Fichier type : `front/src/pages/<page>/page.js`

``` text
M ← C → V
    |
  data/ → API PHP → Router → Controller → Model → MySQL
                         API : JSON uniquement
```

Chaque page dynamique contient trois objets locaux `M`, `C` et `V`,
déclarés avec `let` et non globaux. Elle exporte une fonction
`XxxPage()` qui renvoie `C.init()`.

#### M --- Modèle : état de la page

Le modèle contient uniquement l'état de la page, par exemple :

-   `M.catalogue`
-   `M.message`
-   `M.login`
-   `M.stats`

Il conserve les données reçues de l'API, les messages à afficher et les
saisies à garder.

**Interdictions :**

-   Aucune fonction.
-   Aucun appel réseau.
-   Aucun accès au DOM.
-   Aucune référence à `V`.

#### C --- Contrôleur : traitements et réactions

-   `C.init()` charge les données initiales, puis renvoie `V.init()`.
    C'est le point d'entrée de la page.
-   `C.charger...()` appelle un module de `data/` et range la réponse ou
    l'erreur dans `M`.
-   `C.handler_<action>(...)` réagit à une action utilisateur : appelle
    `data/`, met à jour `M`, puis appelle `V.rafraichir()`.
-   Les handlers sont transmis aux composants via `actions`, par exemple
    `surTri`, `surPage` ou `surConnexion`.

**Interdictions :**

-   Ne construit pas de HTML.
-   Ne touche pas au DOM.
-   N'appelle pas `fetch` directement : les requêtes passent par
    `data/`.
-   Exception existante : `window.scrollTo` dans `handler_changerPage`.
    Tout nouveau code de ce type doit être placé dans `V`.

#### V --- Vue : affichage construit à partir de M

-   `V.createPageFragment()` lit `M`, charge le template avec
    `htmlToFragment(template)`, puis remplace chaque `<slot name="…">`
    par le DOM d'un composant de `ui/`.
-   `V.rafraichir()` reconstruit toute la page et remplace l'ancienne
    racine avec `V.racine.replaceWith(...)`. L'affichage est déduit de
    l'état : ne pas modifier le DOM morceau par morceau.
-   `V.init()` construit le fragment initial et mémorise `V.racine`.

La vue peut lire `M`, mais ne doit jamais le modifier.

**Interdictions :**

-   N'appelle pas `data/` ni l'API.
-   Ne modifie pas `M`.
-   Ne définit pas de gestionnaire d'événement qui ne soit pas une
    méthode de `C`. Les composants reçoivent les méthodes
    `C.handler_...` via `actions`.

### 1.2. Composants du front-end

Emplacement : `front/src/ui/<composant>/`

Chaque composant possède un dossier comprenant :

-   `template.html` : HTML et classes Tailwind.
-   `index.js` : logique de rendu du composant.

Le composant exporte un objet `XxxView` avec `html(data)` (chaîne HTML)
et/ou `dom(data, actions)` (fragment DOM).

Règles :

-   Un composant ne prend aucune décision métier.
-   Il reçoit ses données et signale les actions de l'utilisateur via
    les fonctions d'`actions`.
-   Il n'importe ni `data/`, ni une page.
-   Les clés `{{cle}}` d'un template sont remplacées par des valeurs
    échappées avec `genericRenderer`.
-   Pour insérer un autre composant, un `<slot name="…">` est remplacé
    en JavaScript par `slot.replaceWith(Composant.dom(…))`.
-   Un template ne contient ni boucle ni condition. Pour une liste,
    utiliser un template par élément (voir
    `ui/statistiques/ligne-genre.html`).
-   Un état comme une option sélectionnée ou un bouton désactivé est
    réglé en JavaScript après `htmlToFragment`.
-   Les valeurs telles que les notes et les durées sont mises en forme
    dans `lib/format.js` avant d'être transmises au template.

### 1.3. Autres couches du front-end

#### `data/`

-   Un module par ressource.
-   Chaque module expose un objet `XxxData` avec des fonctions
    asynchrones.
-   Les appels HTTP utilisent `getRequest` et `postRequest` de
    `lib/api-request.js`.
-   Aucune logique d'affichage.

#### `lib/`

Contient les éléments partagés : routeur, rendu des templates
(`utils.js`), requêtes, formatage et thème.

Aucune logique propre à une page ne doit y être ajoutée.

#### `layouts/`

Contient la structure commune, notamment l'en-tête et un `<slot>` sans
nom, rempli par le routeur.

#### `main.js`

-   Déclare les layouts et les routes.
-   La route `addRoute("*", The404Page)` doit toujours rester en
    dernier.

#### Liens internes

Utiliser la forme suivante, sans inclure le chemin du projet :

``` html
<a href="/chemin" data-link>
```

Le routeur ajoute lui-même le chemin du projet.

------------------------------------------------------------------------

## 2. Back-end : architecture en trois couches

Emplacement : `back/src/`

### 2.1. `Core/` --- infrastructure

Contient les composants d'infrastructure :

-   `Request`
-   `Response`
-   `Router`
-   `Database`

Cette couche ne contient aucune règle métier.

### 2.2. `Controller/` --- décisions et validation

Un contrôleur :

1.  Reçoit une `Request`.
2.  Lit et valide les entrées avec une liste blanche.
3.  Pose les cookies si nécessaire.
4.  Appelle le modèle.
5.  Répond avec `Response::json()` ou `Response::erreur()`.

**Interdiction : aucune requête SQL dans un contrôleur.**

### 2.3. `Model/` --- accès aux données

Le modèle :

-   Exécute les requêtes SQL avec PDO.
-   Retourne des tableaux.

**Interdictions :**

-   Aucune règle métier.
-   Aucune référence à `Request` ou `Response`.
-   Aucun accès à `$_GET`, `$_COOKIE` ou `$_SESSION`.

### 2.4. Routes et assemblage

#### `routes.php`

Déclare les routes sous la forme :

``` php
'METHODE /api/chemin' => [Controleur::class, 'methode'],
```

#### `index.php`

Assemble les dépendances :

-   Le modèle reçoit le PDO.
-   Le contrôleur reçoit le modèle.
-   Chaque nouveau contrôleur doit être enregistré à deux endroits :
    1.  `back/index.php` pour son instance.
    2.  `back/src/routes.php` pour sa route.

------------------------------------------------------------------------

## 3. Conventions de développement

Chaque nouveau besoin doit être réparti comme suit :

  -----------------------------------------------------------------------
  Besoin                              Emplacement
  ----------------------------------- -----------------------------------
  Donnée ou appel API                 `data/`

  État de la page                     `M`

  Traitement ou réaction à un         `C`
  événement                           

  Affichage                           `V` et `ui/`

  Événement DOM                       Composant `ui/`, qui appelle une
                                      action reliée à `C.handler_...`

  Déclaration d'une route serveur     `routes.php`

  Décision et validation serveur      `Controller`

  SQL                                 `Model`
  -----------------------------------------------------------------------

### Nommage

Respecter les conventions existantes :

-   `C.handler_<verbe><Objet>`, par exemple `handler_changerTri`.
-   `C.charger...()`.
-   `V.rafraichir()`.
-   `V.createPageFragment()`.
-   `XxxView.dom()`.
-   `XxxData.fetch...()`.

Conserver les identifiants existants, notamment `tri`, `parPage`,
`film.titre` et `note_moyenne`.

### Commentaires

Les commentaires sont en français et expliquent **pourquoi** le code
existe, plutôt que de simplement décrire ce qu'il fait.

### JavaScript

-   Utiliser les modules ES (`import` / `export`).
-   Importer les fichiers de template avec `?raw`.

### PHP

-   Commencer chaque fichier PHP par `declare(strict_types=1);`.
-   Utiliser des classes `final`.
-   Utiliser l'espace de noms `App\…`.
-   Déclarer les propriétés avec des types.

------------------------------------------------------------------------

## 4. Sécurité : règles impératives

### SQL

-   Toutes les valeurs SQL sont liées avec `bindValue` ou des paramètres
    préparés.
-   Un nom de colonne ou un `ORDER BY` ne vient jamais directement du
    client.
-   Le tri est choisi dans une liste blanche du contrôleur, comme
    `CatalogueController::TRIS`.

### HTML

-   Toute donnée injectée dans un template passe par `{{cle}}`, avec
    échappement.
-   Ne jamais utiliser `innerHTML` avec une donnée brute.

### Droits et sessions

-   Le serveur décide des autorisations et renvoie les réponses `401` ou
    `403` si nécessaire.
-   Le front-end affiche la réponse du serveur : il ne constitue pas une
    protection d'accès.

### Réponse JSON

`Response::json()` termine le script (`exit`). Les cookies doivent donc
être posés avant l'appel ; aucun code ne doit être exécuté ensuite.

### Tailwind

Tailwind ne génère que les classes écrites en entier.

Correct :

``` js
"text-red-700"
```

Incorrect :

``` js
"text-" + couleur
```

### Dépendances

-   Ne pas ajouter de dépendance npm ou Composer sans demander.
-   Ne jamais modifier `package-lock.json` à la main.
-   `front/dist/` et `front/node_modules/` ne sont pas versionnés.

------------------------------------------------------------------------

## 5. Fichiers et architecture du projet

``` text
.htaccess
sql/
└── import.sql

back/
├── index.php
├── config/
│   └── config.php
└── src/
    ├── Core/
    ├── Controller/
    ├── Model/
    └── routes.php

front/
├── index.html
├── vite.config.js
├── global.css
└── src/
    ├── main.js
    ├── layouts/
    ├── pages/
    ├── ui/
    ├── data/
    └── lib/
```

Le fichier `sql/import.sql` définit les tables `film` et `genre` et
contient 60 films répartis dans 8 genres.

### Chemin du projet

Le chemin du projet ne doit apparaître qu'à deux endroits :

1.  Dans `back/config/config.php`.
2.  Dans `BASE` dans `front/vite.config.js`.

Ces deux valeurs doivent rester identiques. Ne pas recopier le chemin
ailleurs.

------------------------------------------------------------------------

## 6. Installation, développement et vérifications

Toujours demander la permission avant de faire une commande

### Installation

``` bash
cd front
npm install
```

### Développement

``` bash
cd front
npm run dev
```

Adresse de développement :

``` text
https://mmi.unilim.fr/~pages39/SAE301/
```

Le proxy Vite relaie `/api` vers `mmi.unilim.fr`. Le back-end doit donc
y être déployé.

Utiliser **Chrome ou Firefox** pour les tests.

### Vérification du front-end

``` bash
cd front
npm run build
```

La commande doit se terminer sans erreur.

### Vérification de la syntaxe PHP

Pour chaque fichier PHP modifié, lancer `php -l`. Exemple :

``` bash
php -l back/src/Controller/CatalogueController.php
```


------------------------------------------------------------------------

## 7. Comptes de test

  Identifiant   Mot de passe   Rôle
  ------------- -------------- ---------
  `alice`       `azerty`       `user`
  `admin`       `motdepasse`   `admin`

**Attention :** les comptes codés en dur servent uniquement aux tests et
ne doivent jamais être utilisés en production.

------------------------------------------------------------------------

## 8. Règles de fin de tâche

Avant de conclure une modification :

-   [ ] Vérifier que le découpage des couches est respecté.
-   [ ] Exécuter `npm run build` dans `front/`.
-   [ ] Exécuter `php -l` pour chaque fichier PHP modifié.
-   [ ] Indiquer dans le compte rendu les vérifications effectuées et
    leurs résultats.
-   [ ] Pour chaque fonction ajoutée, préciser sa couche : `M`, `C`,
    `V`, `ui`, `data`, `lib`, `Controller` ou `Model`.

**Ne jamais committer ni pousser les changements.** La personne
responsable relit les modifications et effectue elle-même le commit.
