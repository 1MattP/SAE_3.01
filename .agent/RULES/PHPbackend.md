---
trigger: glob
globs:
  - "base/back/**/*.php"
---

# Règles PHP — API back-end SAE301

## 1. Respect de l'architecture existante

- Avant toute modification, consulter les fichiers concernés et les règles pertinentes de `.agent/`.
- Respecter strictement l'organisation existante :
  - `Core/` : infrastructure et composants techniques.
  - `Controller/` : validation des entrées, décisions et coordination.
  - `Model/` : accès aux données et requêtes SQL.
  - `routes.php` : déclaration des routes HTTP.
- Consulter `base/back/index.php`, `base/back/src/routes.php` et les classes existantes avant d'ajouter une route, un contrôleur ou un modèle.
- Réutiliser les mécanismes existants plutôt que de créer des systèmes parallèles.
- Ne pas déplacer, renommer ou refactoriser des fichiers sans nécessité liée à la tâche.
- Ne pas ajouter de dépendance Composer sans autorisation.

## 2. Conventions PHP

- Commencer chaque fichier PHP par `declare(strict_types=1);`, conformément aux conventions du projet.
- Préserver l'autoload et l'initialisation définis dans `base/back/index.php`.
- Utiliser les espaces de noms `App\...` conformément à l'organisation existante.
- Déclarer les classes `final`, sauf exception justifiée par l'architecture.
- Typer les propriétés, les paramètres et les valeurs de retour.
- Ajouter une PHPDoc aux méthodes publiques pour documenter leur rôle, leurs paramètres et leur résultat lorsque cela apporte une information utile.
- Respecter les conventions de nommage et de formatage déjà présentes.
- Préférer des méthodes courtes, avec une responsabilité clairement identifiée.

## 3. Core/ — infrastructure

- Réserver `Core/` aux mécanismes techniques partagés, notamment `Request`, `Response`, `Router` et `Database`.
- Ne pas y placer de règles métier propres au catalogue, à l'authentification ou à l'administration.
- Ne pas coupler les composants d'infrastructure aux contrôleurs ou aux modèles concrets sans nécessité.
- Réutiliser les abstractions existantes pour traiter les requêtes, construire les réponses et accéder à la base de données.

## 4. Controller/ — validation et décisions

Chaque contrôleur doit :

1. Recevoir et exploiter les données de `Request` selon les conventions existantes.
2. Valider les paramètres avec des règles explicites et des listes blanches lorsque cela est pertinent.
3. Vérifier les droits requis pour chaque opération protégée.
4. Appeler le modèle pour accéder aux données.
5. Construire une réponse avec `Response::json()` ou `Response::erreur()`.

### Interdictions

- Aucune requête SQL dans un contrôleur.
- Aucun accès direct à PDO pour exécuter une requête.
- Ne jamais faire confiance aux paramètres reçus du client.
- Ne jamais considérer un contrôle d'accès réalisé uniquement dans le front-end comme suffisant.
- Ne pas dupliquer les mêmes règles de validation ou d'autorisation dans plusieurs endroits sans justification.

Les contrôles de rôles et de permissions doivent être réalisés côté serveur avant toute opération protégée.

## 5. Model/ — accès aux données

- Réserver les modèles à l'accès à la base de données et à la restitution des résultats.
- Utiliser PDO et les requêtes préparées pour toutes les valeurs transmises aux requêtes SQL.
- Utiliser `bindValue()` ou les paramètres de `execute()` conformément aux pratiques existantes.
- Retourner les données sous forme de tableaux, selon les conventions du projet.
- Ne pas accéder directement à `$_GET`, `$_POST`, `$_COOKIE`, `$_SESSION` ou à l'objet `Request`.
- Ne pas produire de réponse HTTP depuis un modèle.
- Ne pas y placer de règles métier ou de décisions d'autorisation.

### Identifiants SQL dynamiques

Les noms de colonnes, directions de tri et autres identifiants SQL ne peuvent pas être sécurisés par de simples paramètres préparés.

- Les sélectionner à partir d'une liste blanche définie côté serveur.
- Valider les valeurs reçues avant de les utiliser.
- Ne jamais concaténer directement un identifiant fourni par le client dans une requête SQL.

## 6. Routes et assemblage

### `routes.php`

- Déclarer les routes conformément au format existant :

  `'METHODE /api/chemin' => [Controleur::class, 'methode']`

- Ne pas y placer de logique métier ou de requêtes SQL.
- Vérifier que chaque route cible une méthode existante et que la méthode HTTP correspond à l'opération.

### `index.php`

Lorsqu'un nouveau contrôleur est nécessaire :

1. Créer et initialiser ses dépendances conformément aux conventions existantes.
2. Enregistrer son instance dans `base/back/index.php`.
3. Déclarer sa route dans `base/back/src/routes.php`.
4. Vérifier les espaces de noms, l'autoload et les signatures des méthodes.

Ne pas modifier le mécanisme général d'assemblage pour une simple fonctionnalité.

## 7. Réponses HTTP et JSON

- L'API renvoie exclusivement du JSON, conformément au contrat du projet.
- Utiliser `Response::json()` pour les réponses réussies et `Response::erreur()` pour les erreurs, selon leurs signatures existantes.
- Employer des codes HTTP adaptés, notamment `400`, `401`, `403`, `404` et `500` lorsque la situation le justifie.
- Conserver un format de réponse cohérent avec les endpoints existants.
- Ne jamais exposer au client une trace d'exception, un chemin interne, des identifiants de connexion ou des détails SQL.
- Respecter le comportement de `Response::json()` : si cette méthode termine le script avec `exit`, ne placer aucun traitement après son appel.
- Poser les cookies nécessaires avant d'appeler une méthode qui termine le script.

## 8. Sessions et authentification

- Configurer les paramètres de session une seule fois, avant le premier `session_start()`, au point d'initialisation approprié.
- Respecter le chemin du projet défini par la configuration existante.
- Configurer le cookie de session avec :
  - `httponly => true`
  - `secure => true` lorsque la connexion HTTPS est utilisée et garantie.
  - `samesite => 'Lax'`, sauf exigence justifiée différente.
  - Un `path` correspondant au périmètre réel de l'application.
- Ne pas modifier la configuration de session dans chaque contrôleur.
- Après une authentification réussie, appeler `session_regenerate_id(true)` avant de considérer la nouvelle session comme établie.
- Ne jamais transmettre l'identifiant de session dans une réponse JSON ou une URL.
- Vérifier côté serveur l'authentification et le rôle requis pour chaque route protégée.
- Détruire correctement la session lors de la déconnexion, conformément au mécanisme existant.

Ne pas désactiver les protections de session pour contourner un problème d'environnement. Si HTTPS, le chemin de session ou le fonctionnement actuel rendent une configuration incertaine, examiner le déploiement avant de la modifier.

## 9. Gestion des erreurs et sécurité

- Valider les données à leur frontière d'entrée avant de les transmettre au modèle.
- Traiter explicitement les erreurs attendues et les échecs d'accès aux données.
- Ne pas intercepter une exception pour la masquer ou retourner un succès fictif.
- Ne pas journaliser les mots de passe, les identifiants de session ou les données sensibles.
- Utiliser des requêtes préparées et appliquer les contrôles d'autorisation côté serveur.
- Ne pas modifier le schéma SQL ni les données d'initialisation sans nécessité et autorisation.

## 10. Vérifications après modification

Avant de conclure une tâche :

1. Vérifier la séparation des responsabilités entre `Core/`, `Controller/` et `Model/`.
2. Vérifier les types, espaces de noms, imports et signatures.
3. Vérifier les requêtes SQL, les listes blanches et les contrôles d'accès.
4. Vérifier la cohérence des réponses JSON et des codes HTTP.
5. Exécuter `php -l` sur chaque fichier PHP modifié lorsque l'environnement le permet.
6. Effectuer les tests pertinents disponibles.
7. Indiquer les fichiers modifiés, les vérifications réalisées, leurs résultats et les éventuelles limites.

Ne jamais committer ni pousser les changements.