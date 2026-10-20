---
trigger: always_on
---

# Architecture front-end SAE301 — MVC et responsabilités

## 1. Principe général

Le front-end utilise les ES modules de Vite et applique une architecture MVC locale à chaque page dynamique.

- Chaque page possède son propre état et ses propres objets `M`, `C` et `V`.
- Ces objets sont déclarés localement dans le fichier de la page avec `let`, jamais comme variables globales.
- Ne pas créer un MVC global partagé entre plusieurs pages.
- Avant toute modification, consulter `front/src/pages/catalogue/page.js`, `front/src/pages/admin/page.js` et les autres implémentations pertinentes pour respecter les conventions réellement utilisées.
- En cas de contradiction entre cette règle et l'architecture détaillée du projet, ne pas improviser : identifier le conflit et demander une clarification.

## 2. M — Modèle : état de la page

Le modèle `M` contient exclusivement l'état nécessaire à la page.

Il peut notamment contenir :
- Les données reçues de l'API.
- Les valeurs saisies à conserver.
- Les messages d'information et d'erreur.
- Les états nécessaires à l'affichage : pagination, tri, chargement ou résultats.

### Interdictions

- Aucune méthode ni fonction dans `M`.
- Aucun appel réseau, `fetch` ou appel direct à l'API.
- Aucun accès au DOM.
- Aucune génération de HTML.
- Aucune référence à `V`.
- Aucun second stockage des données déjà gérées par un autre module sans justification.

Le modèle est mis à jour par le contrôleur `C`. La vue peut lire son état, mais ne doit jamais le modifier.

## 3. C — Contrôleur : coordination et actions

Le contrôleur `C` coordonne les traitements de la page et les interactions utilisateur.

Ses responsabilités :
- Charger les données initiales dans `C.init()`.
- Appeler les modules appropriés de `front/src/data/`.
- Enregistrer dans `M` les résultats et les erreurs.
- Valider les actions utilisateur au niveau de l'interface lorsque nécessaire.
- Ex