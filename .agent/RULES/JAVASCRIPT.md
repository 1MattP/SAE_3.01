---
trigger: glob
globs:
  - "front/**/*.js"
  - "front/**/*.html"
---

# Règles JavaScript et HTML du front-end SAE301

## 1. Respect de l'architecture existante

- Avant toute modification, consulter les fichiers concernés et les règles pertinentes de `.agent/`.
- Respecter strictement l'organisation existante : `pages/`, `ui/`, `data/` et `lib/`.
- Réutiliser les fonctions, composants et conventions déjà présents avant d'en créer de nouveaux.
- Utiliser les modules ES (`import` / `export`) et conserver les chemins d'import relatifs déjà employés dans le projet.
- Ne pas déplacer, renommer ou refactoriser des fichiers sans nécessité liée à la tâche.
- Ne pas introduire de nouvelle dépendance sans autorisation.

## 2. Séparation des responsabilités

- **Pages (`pages/`)** : appliquer le modèle MVC local défini dans le projet, avec `M`, `C` et `V` déclarés localement.
- **Modèle (`M`)** : contenir uniquement l'état de la page. Aucune fonction, requête réseau ou manipulation du DOM.
- **Contrôleur (`C`)** : gérer les traitements, les actions utilisateur et les appels aux modules `data/`. Il met à jour `M` et demande à `V` de rafraîchir l'affichage.
- **Vue (`V`)** : construire et rafraîchir l'affichage à partir de `M`, sans modifier cet état ni appeler directement l'API.
- **Composants (`ui/`)** : gérer leur rendu et transmettre les actions utilisateur par l'intermédiaire de callbacks fournis par la page.
- **Données (`data/`)** : centraliser les appels HTTP et utiliser les fonctions existantes de `lib/api-request.js`.
- **Bibliothèque (`lib/`)** : réserver les fonctions partagées aux besoins réellement communs. Ne pas y ajouter de logique spécifique à une page.

Ne jamais contourner cette séparation pour simplifier ponctuellement une implémentation.

## 3. Templates et rendu HTML

- Privilégier `genericRenderer`, `htmlToFragment` et le système de templates existant.
- Importer les templates HTML avec `?raw`, conformément aux conventions du projet.
- Utiliser les emplacements `<slot>` prévus pour intégrer les composants dans les pages.
- Respecter le format des templates existants : pas de boucles ni de conditions directement dans les fichiers HTML.
- Pour afficher une liste, réutiliser ou créer un template par élément, puis assembler les éléments en JavaScript.
- Ne pas construire directement du HTML dans les contrôleurs.
- Éviter les modifications ponctuelles du DOM lorsque le mécanisme de rafraîchissement de la vue est prévu pour reconstruire la page.

## 4. Sécurité du front-end

- Toute valeur dynamique injectée dans un template doit être échappée conformément au fonctionnement de `genericRenderer`.
- Ne jamais insérer de donnée non fiable avec `innerHTML` ou une interpolation HTML brute.
- Ne pas considérer une donnée reçue du front-end comme fiable côté serveur.
- Ne jamais conserver côté front des informations faisant autorité concernant les permissions, les rôles ou les droits d'accès.
- L'API reste responsable de l'authentification, de l'autorisation et de la validation des données.
- Le front-end peut masquer ou désactiver des éléments pour l'ergonomie, mais cela ne constitue jamais un contrôle de sécurité.

## 5. Composants et événements

- Concevoir des composants réutilisables lorsqu'un besoin commun le justifie.
- Un composant ne doit contenir aucune décision métier ni appeler directement `data/` ou l'API.
- Transmettre les actions utilisateur par un objet `actions` fourni par la page.
- Les callbacks doivent appeler les méthodes prévues du contrôleur, notamment `C.handler_...`.
- Ne pas