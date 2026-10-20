---
name: addcomponent
description: "Crée ou étend un composant de présentation réutilisable dans front/src/ui/, avec template.html et index.js, en respectant l'architecture MVC SAE301, les conventions de rendu, la sécurité HTML, l'accessibilité et les interfaces existantes."
argument-hint: "Préciser le composant attendu, ses données d'entrée, ses états d'affichage et ses callbacks"
user-invocable: true
---

# Skill — Ajouter un composant UI SAE301

## 1. Objectif et périmètre

Utiliser ce skill lorsqu'une tâche nécessite de créer ou d'étendre un composant de présentation réutilisable dans `front/src/ui/`.

Le composant reçoit ses données et ses callbacks depuis la page qui l'utilise. Il ne gère ni l'état de la page, ni les appels réseau, ni les décisions métier.

Ce skill doit respecter en priorité :
- Les instructions générales du projet dans `AGENTS.md`.
- Les règles d'architecture définies dans `ARCHITECTURE.md` et le catalogue SAE301.
- Les règles et skills pertinents disponibles dans `.agent/`.
- Les conventions réellement présentes dans les composants et les pages existants.

En cas de contradiction entre ces sources, ne pas inventer une nouvelle convention. Identifier le conflit et demander une clarification si nécessaire.

## 2. Étude préalable obligatoire

Avant de créer ou de modifier un composant :

1. Lire les instructions applicables du projet et les skills pertinents.
2. Examiner au moins deux composants existants comparables dans `front/src/ui/`.
3. Lire leurs `index.js`, leurs `template.html` et les pages qui les utilisent.
4. Examiner les implémentations réelles de `genericRenderer`, `htmlToFragment` et des helpers pertinents dans `front/src/lib/`.
5. Consulter `front/src/global.css` pour réutiliser les classes, tokens et conventions visuelles existants.
6. Vérifier si un composant existant peut être réutilisé ou étendu sans introduire de complexité inutile.

Ne jamais supposer qu'une fonction, une signature ou un comportement existe sans l'avoir vérifié dans le code.

## 3. Définition du contrat du composant

Avant l'implémentation, identifier :

- **Responsabilité :** ce que le composant affiche et ce qu'il ne doit pas décider.
- **Données d'entrée :** propriétés attendues, types, valeurs facultatives et valeurs par défaut.
- **Actions :** callbacks nécessaires, leurs paramètres et les événements qui les déclenchent.
- **États visuels :** chargement, absence de données, erreur, désactivation ou sélection, si pertinents.
- **Composition :** slots éventuels et composants enfants.
- **Interface publique :** méthode `html(data)`, méthode `dom(data, actions)`, ou les deux si nécessaire.

Présenter un plan d'implémentation concis avant de coder. Si une information essentielle manque et ne peut pas être déduite du projet, demander une clarification.

## 4. Structure des fichiers

Créer les fichiers nécessaires dans le dossier du composant :

    front/src/ui/<nom-composant>/
    ├── index.js
    └── template.html

Ajouter un template HTML supplémentaire uniquement si un besoin réel le justifie.

- Respecter les conventions de nommage existantes.
- Ne déplacer ni renommer les fichiers existants sans nécessité.
- Ne pas créer de fichier, abstraction ou composant supplémentaire sans justification.
- Ne pas ajouter de dépendance npm sans autorisation.

## 5. Responsabilités et architecture

### 5.1. `index.js` — logique de présentation

Le fichier `index.js` expose un objet de vue nommé selon les conventions du projet, par exemple `CarteProduitView` ou `MessageView`.

Il peut :
- Transformer les données reçues en représentation destinée à l'affichage.
- Utiliser `genericRenderer` pour remplacer les placeholders des templates.
- Utiliser `htmlToFragment` pour construire un `DocumentFragment`.
- Configurer les états visuels et intégrer les composants enfants.
- Relier les interactions aux callbacks fournis dans `actions`, conformément aux conventions existantes.

Il ne doit jamais :
- Accéder au modèle `M` d'une page.
- Importer une page ou un contrôleur spécifique.
- Appeler `fetch`, `data/`, `api-request.js` ou une API externe.
- Prendre une décision métier ou décider quelles données charger.
- Gérer un stockage global ou créer un second état métier.
- Déclencher une navigation métier indépendamment du contrôleur.

### 5.2. `template.html` — structure et présentation

- Placer le balisage HTML et les classes Tailwind dans le template autant que possible.
- Respecter la sémantique HTML et les conventions visuelles existantes.
- Ne pas introduire de boucles ou de conditions dans le template.
- Utiliser les placeholders et le mécanisme de rendu déjà employés par le projet.
- Utiliser les slots prévus par l'architecture lorsqu'un composant enfant doit être inséré.
- Ne pas intégrer de logique métier dans le HTML.

## 6. Sécurité du rendu

La sécurité doit être vérifiée dans le contexte réel des helpers du projet.

- Toute donnée externe insérée dans le HTML doit être échappée selon le mécanisme existant.
- Ne jamais concaténer directement une valeur non fiable dans une chaîne HTML.
- Ne pas supposer que `genericRenderer` échappe automatiquement les valeurs sans vérifier son implémentation.
- Ne pas contourner le renderer en utilisant `innerHTML` avec du contenu non fiable.
- Pour les attributs, respecter le contexte d'échappement HTML approprié.
- Pour les URL dynamiques (`href`, `src`), vérifier que les protocoles et destinations sont acceptables ; l'échappement HTML seul ne suffit pas.
- Ne pas utiliser de données externes pour créer des gestionnaires d'événements inline.
- Ne pas utiliser `eval`, `Function` ou des mécanismes équivalents pour interpréter des données.

Si une valeur détermine une variante visuelle, utiliser une table de correspondance explicite entre les valeurs autorisées et les classes complètes.

## 7. Gestion des événements et callbacks

- Les callbacks sont fournis par la page via l'objet `actions`.
- Le composant ne contient aucune logique métier dans ses gestionnaires d'événements.
- Un événement doit uniquement transmettre l'action et les paramètres nécessaires au callback.
- Respecter les noms et signatures déjà utilisés dans le projet.
- Si le composant utilise des attributs `data-*`, valider les valeurs lues avant de les transmettre.
- Si les événements sont délégués, utiliser un ancêtre stable et suivre les conventions existantes.
- Éviter d'enregistrer plusieurs fois le même écouteur lors des rafraîchissements.
- Ne pas introduire de mécanisme de délégation ou de gestion du cycle de vie différent sans nécessité démontrée.

Les callbacks doivent être reliés aux handlers du contrôleur, par exemple `C.handler_...`, par l'intermédiaire de `actions`. Le composant ne doit pas importer directement `C`.

## 8. Conventions JavaScript

- Utiliser les modules ES (`import` / `export`).
- Respecter la convention du projet concernant les fonctions déclarées avec `function` ou les fonctions fléchées, après vérification des composants existants.
- Préserver les signatures publiques déjà utilisées.
- Documenter les méthodes publiques lorsque cela apporte une information utile sur leurs paramètres et leurs valeurs de retour.
- Réutiliser les helpers de `front/src/lib/`, notamment ceux de rendu et de formatage.
- Ne pas réimplémenter un utilitaire partagé sans raison.
- Ne pas utiliser de dépendance, variable globale ou mécanisme non prévu par le projet.

Le contrat du composant doit rester simple, explicite et cohérent avec ses utilisateurs.

## 9. Accessibilité

Selon la fonction du composant :

- Employer des éléments HTML sémantiques.
- Associer chaque champ de formulaire à un label accessible.
- Garantir l'utilisation au clavier des contrôles interactifs.
- Prévoir un indicateur de focus visible.
- Donner un nom accessible aux boutons et aux liens.
- Associer les messages d'erreur aux champs concernés lorsque nécessaire.
- Utiliser les attributs ARIA uniquement lorsqu'ils apportent une information utile et conformément au comportement attendu.
- Pour les images informatives, fournir un texte alternatif pertinent ; pour les images décoratives, utiliser un texte alternatif vide.
- Définir les dimensions des images lorsque cela est pertinent et utiliser `loading="lazy"` pour les images non prioritaires lorsque cela convient.

Ne pas ajouter d'attributs ARIA redondants ou incorrects sur des éléments qui possèdent déjà la sémantique native adaptée.

## 10. Intégration dans une page

1. Importer le composant dans la page concernée.
2. Préparer les données dans le modèle ou le contrôleur selon leur nature et les conventions SAE301.
3. Définir les callbacks dans le contrôleur.
4. Transmettre les données et les callbacks au composant via son interface publique.
5. Insérer le fragment dans la vue de la page conformément au système de slots existant.
6. Vérifier que les changements d'état provoquent le rafraîchissement prévu par le cycle de vie de la page.

Ne pas modifier l'architecture de la page uniquement pour faciliter l'implémentation du composant.

## 11. Vérifications et compte rendu

Après l'implémentation :

1. Vérifier les imports, exports, signatures et chemins des templates.
2. Vérifier la compatibilité avec la page qui utilise le composant.
3. Vérifier les données dynamiques, l'échappement HTML et les URL.
4. Vérifier les callbacks, les événements et l'absence de logique métier dans le composant.
5. Vérifier les états d'affichage et les aspects d'accessibilité pertinents.
6. Exécuter `npm run build` depuis `front/` lorsque l'environnement le permet.
7. Corriger les erreurs introduites par la modification.

Le compte rendu final doit préciser :
- Les fichiers créés ou modifiés.
- Le rôle du composant et son interface publique.
- Les données et callbacks attendus.
- Les vérifications effectuées et leurs résultats.
- Les éventuelles limites ou vérifications non exécutées.

Ne jamais committer ni pousser les changements.