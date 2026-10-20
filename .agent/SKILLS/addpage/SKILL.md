---
name: addpage
description: "Crée une nouvelle page front-end dans front/src/pages/ avec son template HTML, son architecture MVC, son intégration au routeur et ses états d'affichage, conformément aux conventions du site click & collect SAE301."
argument-hint: "Préciser la route souhaitée, le contenu de la page et les actions attendues"
user-invocable: true
---

# Ajouter une page front-end

## Objectif

Créer une page navigable dans `front/src/pages/`, intégrée au routeur existant et respectant l'architecture MVC, les conventions de rendu, la sécurité et l'accessibilité du projet.

Ce skill concerne la création d'une nouvelle page. Pour une modification limitée à une page existante, un composant UI ou un module `data/`, utiliser le skill adapté.

## Étapes obligatoires

### 1. Examiner l'existant

Avant toute modification :

1. Lire `AGENTS.md`, `ARCHITECTURE.md` et les règles de l'agent applicables, s'ils existent.
2. Examiner les pages existantes dans `front/src/pages/` et identifier celle dont l'architecture se rapproche le plus du besoin.
3. Examiner `front/src/main.js`, le routeur, le layout et le mécanisme de navigation interne.
4. Examiner les modules concernés de `front/src/data/`, les utilitaires de `front/src/lib/` et les composants réutilisables de `front/src/ui/`.
5. Vérifier le fonctionnement réel des fonctions de rendu, des templates et du cycle de vie des pages.
6. Identifier les données disponibles, les paramètres de route nécessaires et les éventuelles dépendances au contrat API.

Ne pas inventer de fichiers, de fonctions, de routes ou de champs API. S'appuyer sur le code réellement présent dans le dépôt.

### 2. Présenter le plan et attendre la validation

Avant d'écrire ou de modifier du code, présenter un plan indiquant :

- le nom de la page et la route prévue ;
- les fichiers à créer ou à modifier ;
- les responsabilités de M, V et C ;
- les modules `data/`, composants UI et utilitaires à réutiliser ;
- les paramètres de route et les interactions utilisateur ;
- les états d'affichage et la gestion des erreurs ;
- les vérifications qui seront effectuées.

**Attendre explicitement la validation de l'utilisateur avant de commencer l'implémentation.**

Pendant cette étape, ne modifier aucun fichier. Si une information indispensable manque, poser une question ciblée avant de finaliser le plan.

### 3. Créer la structure de la page

Utiliser l'organisation déjà adoptée par le projet. Si elle correspond à la convention observée, créer :

```text
front/src/pages/<nom-page>/
├── page.js
└── template.html
```

- Nommer le dossier en minuscules, avec des tirets entre les mots.
- Exporter la fonction de page selon la convention utilisée par les pages existantes et attendue par le routeur.
- Ne pas déplacer ni réorganiser des fichiers existants sans nécessité validée.
- Ajouter un fichier ou un composant supplémentaire uniquement si l'architecture actuelle le justifie.

### 4. Respecter les responsabilités MVC

#### Modèle — M

- Déclarer un objet `M` privé au module de page.
- Limiter M à l'état des données de la page : objets, tableaux, valeurs et états nécessaires à l'affichage.
- Ne pas accéder à `document`, `window`, aux éléments DOM ou aux événements.
- Ne pas effectuer d'appels réseau et ne pas importer les modules `data/`.
- Ne pas y placer de logique de présentation ni de fonctions métier si le modèle du projet est défini comme un simple état.
- Ne pas retourner de HTML depuis M.

Les appels aux données, filtres et transformations doivent être placés conformément à l'architecture existante, généralement coordonnés par C. Ne pas attribuer automatiquement ces responsabilités à M.

#### Contrôleur — C

- Déclarer un objet `C` privé au module.
- Utiliser `C.init(params)` comme point d'entrée si cette convention correspond au cycle de vie existant.
- Recevoir les paramètres de route et initialiser les données nécessaires.
- Appeler les modules `front/src/data/` pour récupérer ou transmettre des données.
- Mettre à jour M puis demander à V de rafraîchir l'affichage.
- Définir des handlers explicites selon les conventions du projet, par exemple `C.handler_changerTri` ou `C.handler_valider`.
- Lire les informations des événements dans les handlers concernés.
- Transmettre aux composants UI les callbacks nécessaires.
- Gérer les erreurs, les états de chargement et les résultats vides lorsque cela est pertinent.
- Ne pas contenir de logique de manipulation du DOM ni de génération de HTML.

Ne pas ajouter directement de `fetch` si le projet impose l'utilisation des modules `data/` et de `front/src/lib/api-request.js`.

#### Vue — V

- Déclarer un objet `V` privé au module.
- Lire M pour afficher l'état courant, sans le modifier.
- Utiliser les templates HTML, les composants UI et les utilitaires de rendu existants.
- Respecter le cycle de vie de la page, notamment `V.init`, `V.rafraichir` et les autres méthodes réellement utilisées dans le projet.
- Transmettre les interactions utilisateur à C par les callbacks ou les mécanismes de délégation prévus.
- Ne pas importer les modules `data/`, appeler l'API ou exécuter de logique métier.
- Éviter les mises à jour ponctuelles du DOM lorsqu'un rafraîchissement cohérent à partir de l'état est prévu par l'architecture.

### 5. Créer le template et gérer l'affichage

- Utiliser `template.html` pour structurer le contenu de la page.
- Réutiliser les mécanismes existants, tels que `htmlToFragment`, `genericRenderer` ou les composants UI, uniquement selon leurs interfaces réelles.
- Vérifier que les valeurs dynamiques sont correctement échappées par le mécanisme de rendu utilisé.
- Ne jamais concaténer directement une donnée utilisateur dans du HTML non échappé.
- Ne pas utiliser de rendu HTML brut pour injecter des données non fiables.
- Valider les URL dynamiques avant de les utiliser comme destinations de liens ou sources d'images.
- Prévoir les états pertinents selon la fonctionnalité :
  - chargement ;
  - affichage normal ;
  - absence de résultats ;
  - erreur ;
  - authentification requise, si nécessaire ;
  - indisponibilité du stock, si nécessaire.
- Respecter l'accessibilité : structure sémantique, libellés explicites, navigation clavier, focus visible et textes alternatifs pour les images.
- Ajouter les dimensions des images et le chargement différé lorsque cela convient.

Ne pas ajouter systématiquement des états qui n'ont pas de sens pour la page créée.

### 6. Intégrer la route et la navigation

1. Ajouter l'import de la page et la route dans `front/src/main.js`, en suivant la structure réellement utilisée.
2. Préserver le layout, le mécanisme `data-link`, la gestion de `import.meta.env.BASE_URL` et la route 404.
3. Utiliser les paramètres transmis par le routeur sans reconstruire arbitrairement l'URL de base.
4. Respecter le mécanisme existant de navigation interne afin d'éviter les rechargements inutiles.
5. Vérifier le comportement de la route directe, des liens internes et des paramètres de route, lorsque ces cas sont applicables.

Ne pas modifier le routeur au-delà de ce qui est nécessaire pour enregistrer la nouvelle page.

### 7. Respecter les contraintes du dépôt

- Utiliser les modules ES et les conventions JavaScript déjà adoptées dans le projet.
- Si le dépôt impose les fonctions classiques déclarées avec `function`, ne pas utiliser de fonctions fléchées.
- Ne pas utiliser `foreach` ni `fn` de PHP dans le code front-end.
- Respecter les conventions de nommage effectivement définies par le dépôt.
- Ne pas ajouter de bibliothèque, de framework, de couche ou d'objet global pour contourner l'architecture MVC.
- Ne jamais considérer les données du front comme fiables pour autoriser un prix, un rôle, une permission, une quantité, un stock ou un état de commande.
- Ne pas modifier le back-end, le contrat API ou le schéma SQL, sauf demande explicite de l'utilisateur concernant ces éléments.
- Ne jamais effectuer automatiquement de commit ou de push.

### 8. Vérifier l'implémentation

Après les modifications :

1. Relire les fichiers créés et modifiés, leurs imports et leurs exports.
2. Vérifier l'intégration de la route, le cycle de vie de la page et les responsabilités MVC.
3. Vérifier les états d'affichage, les interactions et le traitement des erreurs.
4. Exécuter le contrôle MVC du dépôt, si le script existe :

   ```bash
   node .agents/skills/verifier-mvc/scripts/check-mvc.js .
   ```

5. Si le script est absent ou si son chemin diffère, rechercher le script réellement disponible. Ne pas prétendre qu'il a été exécuté si ce n'est pas le cas.
6. Lancer `npm run build` depuis `front/` si l'environnement le permet.
7. Effectuer les autres tests pertinents disponibles dans le projet.

Corriger les erreurs introduites par les changements avant de terminer. Distinguer clairement les contrôles réussis, échoués, non exécutés ou impossibles à effectuer.

### 9. Fournir un compte rendu

Présenter un résumé final indiquant :

- la route ajoutée et son fonctionnement ;
- les fichiers créés et modifiés ;
- les responsabilités mises en place dans M, V et C ;
- les composants UI, utilitaires et modules `data/` utilisés ;
- les états d'affichage et les interactions implémentés ;
- les résultats réels du contrôle MVC, du build et des tests exécutés ;
- les écarts par rapport au plan validé et leur justification ;
- les éventuels points restant à vérifier.

Ne pas annoncer qu'une fonctionnalité fonctionne ou qu'un contrôle est réussi sans élément permettant de le confirmer.