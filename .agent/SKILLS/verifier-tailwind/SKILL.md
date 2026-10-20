---
name: verifier-tailwind
description: "Vérifie le code tailwind de sorte a ce qu'il corresponde au besoins de l'utilisateur ci-dessous"
---

## Quand utiliser ce skill

Lancer ce skill après toute modification ou création de html utilisant le tailwind

# Vérifier le tailwind

1. utiliser uniquement tailwind JAMAIS de css, sass ou autre technologie css.
3. Utilise des variables CSS privées aux composants . Les modifiers doivent uniquement réattribuer ces variables.
2. Pour les couleur et valeur toujours utiliser celle dans `global.css`
3. pour les couleur , token primitives - sémentique ne jamais utiliser de [ ] ( ).
4. Pour toute valeur par exemple w-15 ne JAMAIS mettre de [] () comme par exemple w-[13.3rem].
5. Pas de valeurs arbitraire.

