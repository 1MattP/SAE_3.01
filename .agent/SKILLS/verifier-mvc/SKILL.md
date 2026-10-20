---
name: verifier-mvc
description: "Vérifie la séparation MVC du front-end Vite, les responsabilités des modules data, des composants UI et des pages, les règles de sécurité et les résultats du contrôle automatisé et du build. À exécuter après toute modification du front-end SAE301."
user-invocable: true
---

# Vérifier l'architecture MVC du front-end

## Objectif

Contrôler que les modifications du front-end respectent l'architecture MVC du projet, les conventions de rendu, les règles de sécurité et les responsabilités des modules.

Ce skill réalise des vérifications statiques et manuelles. Ne pas considérer le passage du script automatisé ou du build comme une preuve suffisante du respect de toutes les règles MVC.

## Quand utiliser ce skill

Lancer ce skill après toute modification de :

- `front/src/pages/` ;
- `front/src/ui/` ;
- `front/src/data/` ;
- `front/src/lib/` ;
- `front/src/main.js`, lorsqu'une route ou le cycle de navigation est concerné.

L'utiliser avant de terminer une modification de page, de composant UI, de module `data/` ou de mécanisme de rendu.

## Étapes de vérification

### 1. Examiner les changements

- Identifier les fichiers créés, modifiés et supprimés dans le périmètre de la tâche.
- Lire intégralement les fichiers modifiés et examiner leurs imports directs.
- Consulter les fonctions utilitaires et les interfaces appelées lorsque leur comportement est nécessaire à l'analyse.
- Examiner les pages ou composants similaires pour vérifier la cohérence avec l'architecture existante.
- Ne pas étendre inutilement l'audit à des fichiers sans rapport avec les changements, sauf si une dépendance directe le justifie.

### 2. Vérifier les responsabilités MVC

#### Modèle — M

- M contient l'état des données de la page.
- M n'accède ni au DOM, ni aux événements, ni aux fonctions de rendu.
- M n'effectue pas d'appels réseau et ne dépend pas de V ou de C.
- Les données métier ne sont pas dupliquées inutilement entre M et C.

Ne pas signaler comme erreur une convention différente sans vérifier les règles réelles du projet.

#### Modules `data/`

- Les modules `data/` gèrent les échanges avec l'API selon les interfaces existantes.
- Ils n'accèdent pas au DOM et ne manipulent pas directement les composants UI.
- Ils utilisent les fonctions partagées de communication avec l'API, lorsque le projet l'impose.
- Ils ne contiennent pas de logique de présentation.
- Les paramètres transmis et les réponses exploitées sont cohérents avec le contrat API connu.

#### Vue — V et composants UI

- V assure le rendu à partir de l'état de la page et ne modifie pas directement M.
- Les composants UI restent dédiés à la présentation et n'effectuent pas d'appels API.
- Les composants UI ne connaissent ni M ni les détails internes des pages.
- Les interactions sont transmises par les callbacks ou le mécanisme de délégation prévu.
- Les templates et utilitaires de rendu existants sont utilisés conformément à leurs interfaces.
- Les événements et écouteurs ne sont pas multipliés involontairement lors des rafraîchissements.
- Les classes Tailwind dynamiques ne sont pas construites d'une manière empêchant leur détection par le build.

#### Contrôleur — C

- C coordonne les interactions entre M, V et les modules `data/`.
- Les handlers traitent les événements, mettent à jour l'état et demandent le rafraîchissement de V.
- Les appels API ne sont pas placés dans V ou les composants UI.
- Les erreurs et les états de chargement sont traités conformément au comportement attendu.
- Les fonctions et responsabilités restent cohérentes avec le cycle de vie des pages existantes.

### 3. Vérifier la sécurité et l'accessibilité

- Les données utilisateur sont échappées avant toute insertion dans un template HTML.
- Le mécanisme d'échappement utilisé est réellement adapté au contexte d'insertion ; ne pas supposer qu'un utilitaire échappe automatiquement toutes les valeurs.
- Les données non fiables ne sont pas injectées directement dans du HTML brut.
- Les URL dynamiques sont validées lorsqu'elles peuvent être contrôlées par un utilisateur ou une réponse externe.
- Les actions sensibles ne reposent pas uniquement sur des données ou des contrôles côté front-end.
- Les formulaires ont des libellés appropriés et les éléments interactifs restent utilisables au clavier.
- Les images pertinentes disposent d'un texte alternatif adapté.

Ne pas affirmer qu'une vulnérabilité existe sans identifier le fichier, le passage concerné et le risque associé.

### 4. Vérifier les erreurs et les états d'affichage

Selon le contexte de la fonctionnalité, vérifier :

- les états de chargement ;
- les réponses sans résultat ;
- les erreurs réseau et les réponses API invalides ;
- le comportement en cas de réponse HTTP `401` ou `403` ;
- la présentation des erreurs à l'utilisateur ;
- les états de stock, d'authentification ou de commande lorsqu'ils sont concernés.

Ne pas exiger des états inutiles pour une fonctionnalité qui ne les nécessite pas. Vérifier que les erreurs ne sont ni ignorées silencieusement ni présentées comme des succès.

### 5. Exécuter le script automatisé

Exécuter le script de contrôle MVC depuis la racine du dépôt, si ce chemin existe :

```bash
node .agents/skills/verifier-mvc/scripts/check-mvc.js .
```

- Lire le résultat complet de la commande.
- Identifier les erreurs, avertissements et limites signalés.
- Corriger les problèmes introduits par les changements, lorsque cela est dans le périmètre autorisé.
- Si le script est absent, rechercher son emplacement réel dans le dépôt.
- Si le script ne peut pas être exécuté, indiquer la raison et ne pas inventer de résultat.
- Ne pas modifier le script de vérification uniquement pour faire disparaître un échec sans comprendre sa cause.

### 6. Exécuter le build

Si l'environnement le permet, lancer le build du front-end depuis le dossier `front/` :

```bash
npm run build
```

- Vérifier le code de sortie et les erreurs affichées.
- Distinguer les erreurs préexistantes des erreurs introduites par les changements lorsque cela peut être établi.
- Ne pas déclarer le build réussi si la commande n'a pas été exécutée ou si elle a échoué.
- Ne pas installer de nouvelles dépendances pour contourner un problème sans autorisation.

### 7. Corriger et recontrôler

- Corriger les problèmes liés aux modifications et relevant du périmètre autorisé.
- Relancer les contrôles nécessaires après correction.
- Ne pas modifier le back-end ou le schéma SQL dans le cadre de cet audit front-end, sauf demande explicite.
- Ne jamais effectuer automatiquement de commit ou de push.

## Compte rendu obligatoire

Présenter un compte rendu synthétique contenant les éléments suivants :

### Fichiers contrôlés
Lister les fichiers effectivement examinés.

### Séparation des responsabilités
Indiquer les constats concernant :
- M et l'état des données ;
- les modules `data/` et les appels API ;
- V et les composants UI ;
- C et la coordination des interactions.

### Sécurité et comportement
Signaler les problèmes identifiés concernant l'échappement HTML, les URL, les erreurs API, les états d'affichage et l'accessibilité, lorsque ces points sont pertinents.

### Résultats des vérifications

Pour chaque contrôle, préciser son statut :

- **Réussi** : commande exécutée ou point contrôlé sans problème identifié.
- **Échec** : erreur ou non-conformité effectivement constatée.
- **Non exécuté** : contrôle non lancé.
- **Non vérifiable** : éléments insuffisants pour conclure.

Présenter séparément :
- le contrôle MVC automatisé ;
- le build ;
- les éventuels tests complémentaires.

### Actions restantes
Lister les problèmes non corrigés, les limites de l'audit et les vérifications restant à effectuer.

Ne jamais confondre l'absence d'erreurs détectées avec une garantie absolue de conformité.