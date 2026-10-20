---
name: addmvc
description: "Ajoute une fonctionnalité front-end au site click & collect en respectant l'architecture MVC existante (M, V et C), les modules data et les composants UI. À utiliser pour toute évolution fonctionnelle du catalogue, des produits, des catégories, du panier, des commandes, du stock ou de l'administration."
argument-hint: "Décrire la fonctionnalité attendue, le comportement utilisateur et les pages concernées si elles sont connues"
user-invocable: true
---

# Ajouter une fonctionnalité front-end en MVC

## Objectif

Implémenter une fonctionnalité dans le front-end du site click & collect en respectant strictement l'architecture, les conventions et les composants déjà présents dans le projet.

Privilégier la réutilisation du code existant. Ne pas créer une nouvelle architecture ni introduire de dépendances sans nécessité.

## Étapes obligatoires

### 1. Examiner l'existant

Avant toute modification :

- Lire les consignes applicables, notamment `AGENTS.md`, et les règles de l'agent disponibles.
- Examiner les pages concernées et leurs objets locaux `M`, `V` et `C`.
- Identifier le routeur, les templates HTML, les composants UI et les modules `front/src/data/` concernés.
- Consulter les fonctions utilitaires et les mécanismes de rendu déjà utilisés.
- Repérer les fonctionnalités similaires afin de réutiliser les conventions existantes.
- Identifier les contraintes du contrat API et les éventuelles limites des données disponibles.

Ne pas supposer qu'un fichier, une fonction ou un mécanisme existe sans l'avoir vérifié dans le projet.

### 2. Présenter un plan et attendre la validation

Avant d'écrire ou de modifier du code, présenter un plan précis qui indique :

- les fichiers à créer ou à modifier ;
- les responsabilités attribuées à M, V et C ;
- les éventuels composants UI et modules `data` à réutiliser ou à créer ;
- les interactions utilisateur et les états d'affichage concernés ;
- les vérifications prévues.

**Attendre explicitement la validation de l'utilisateur avant de commencer l'implémentation.**

Ne pas modifier les fichiers pendant cette phase de planification.

### 3. Respecter les responsabilités MVC

#### Modèle — M

- Contient uniquement l'état des données de la page : objets, tableaux, valeurs et états nécessaires à l'affichage.
- Ne contient ni logique de présentation, ni accès au DOM, ni appel réseau.
- Ne dépend ni de V ni de C.
- Ne doit pas devenir un emplacement pour les appels API ou les transformations métier si l'architecture existante attribue ces responsabilités au contrôleur ou aux modules `data`.

Toute transformation ou tout filtrage doit être placé à l'endroit prévu par l'architecture du projet. Ne pas ajouter de fonctions au modèle si celui-ci est défini comme un simple état de données.

#### Vue — V

- Lit l'état de M et génère ou actualise l'affichage.
- Utilise les templates, les composants UI et les utilitaires de rendu existants.
- Respecte les mécanismes de rendu et de rafraîchissement de la page.
- Ne modifie pas directement l'état de M.
- Ne réalise aucun appel API et n'importe aucun module `data`.
- Transmet les événements utilisateur à C au moyen des callbacks ou des mécanismes de délégation prévus par le projet.

La vue ne doit pas contenir de logique métier.

#### Contrôleur — C

- Coordonne les interactions entre M, V et les modules `front/src/data/`.
- Contient les gestionnaires d'événements, selon les conventions existantes, par exemple `C.handler_...`.
- Appelle les modules `data` pour obtenir ou envoyer des données.
- Met à jour l'état de M, puis demande à V de rafraîchir l'affichage.
- Gère les erreurs, les états de chargement et les résultats vides lorsque cela est nécessaire.

Ne pas ajouter directement de `fetch` dans C si le projet impose de passer par les modules `data` et `front/src/lib/api-request.js`.

### 4. Implémenter la fonctionnalité

Après validation du plan :

- Effectuer uniquement les changements nécessaires à la fonctionnalité demandée.
- Réutiliser les composants UI, les templates, les utilitaires et les modules `data` existants.
- Respecter les conventions de nommage, d'importation et d'exportation du projet.
- Utiliser les mécanismes de rendu déjà en place.
- Sécuriser l'affichage des données dynamiques et respecter les règles d'accessibilité.
- Prévoir les états utiles : chargement, succès, erreur, absence de données et interaction désactivée, selon le besoin.
- Ne pas contourner le routeur, le système de rendu ou les responsabilités MVC existantes.

### 5. Exécuter le skill de vérification MVC

Après l'implémentation, exécuter le skill `verifier-mvc` s'il est disponible dans l'environnement de l'agent.

- Corriger les écarts détectés avant de terminer.
- Si le skill est introuvable ou ne peut pas être exécuté, le signaler explicitement et effectuer les vérifications manuelles possibles.
- Ne jamais prétendre qu'une vérification a réussi si elle n'a pas été effectuée.

### 6. Vérifier les changements

Effectuer les vérifications adaptées aux fichiers modifiés, notamment :

- vérifier les imports, les exports et les dépendances ;
- contrôler le respect des responsabilités de M, V et C ;
- vérifier les appels aux modules `data` et le traitement des erreurs ;
- lancer `npm run build` dans `front/` si l'environnement le permet ;
- effectuer les tests disponibles et vérifier les comportements concernés.

Ne pas ajouter de bibliothèque ou de framework pour faciliter les tests sans validation explicite de l'utilisateur.

### 7. Fournir un compte rendu

À la fin, résumer :

- les fichiers créés et modifiés ;
- les responsabilités et fonctions ajoutées dans M, V et C ;
- les modules `data` et composants UI utilisés ou créés ;
- les changements visibles pour l'utilisateur ;
- les vérifications réellement exécutées et leurs résultats ;
- les écarts par rapport au plan validé et leur justification ;
- les éventuels points restant à vérifier.

## Contraintes impératives

- **Aucune nouvelle bibliothèque ni aucun framework.** Utiliser le JavaScript natif et les outils déjà présents dans le projet.
- Ne pas introduire de données, d'exemples métier ou de références relatives aux films.
- Ne pas modifier le back-end, les routes API côté serveur ou le schéma SQL dans le cadre de cette tâche, sauf demande explicite de l'utilisateur concernant le contrat de l'API ou un besoin associé.
- Ne pas inventer de champs API, de routes, de données ou de fonctions absentes du projet.
- Ne pas effectuer automatiquement de commit ou de push.
- Ne pas commencer l'implémentation avant validation explicite du plan par l'utilisateur.