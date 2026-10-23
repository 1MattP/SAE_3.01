Pour réaliser cette ordre  j’ai commencer par déterminer les dépendances des User Story en vers les autres car si un user story dépend d’un autre alors elle doit être réaliser après celle qui en dépend.
J’ai trouvé 3 US qui dépendent d’aucune autre qui sont DEC-b, CMD-c, GOF-b

Pour réaliser l’ordre je me suis basée sur les dépendances, la valeur pour l’utilisateur




| USER-STORY - ORDRE | Dépendance technique | Valeur pour l’utilisateur |
|---|---|---|
| **DEC-b : Catalogue de produits** | Aucune | Haute - premiers visuels (la base du site) |
| **DEC-a : Navigation par catégories** | DEC-b | Moyenne - trouver plus vite ce qui l’intéresse |
| **DEC-c : Détail d'un produit** | DEC-b | Haute - décider d’acheter en connaissance de cause |
| **CMD-b : Panier d'achat** | DEC-b & DEC-c | Haute - préparer sa commande |
| **CMD-c : Authentification** | Aucune | Haute - indispensable pour commander |
| **CMD-a : Validation de commande** | CMD-b & CMD-c | Haute - le client peut passer sa commande |
| **STK-b : Affichage des stocks** | DEC-c | Moyenne - savoir si un produit est disponible |
| **STK-a : Mise à jour automatique des stocks** | CMD-a & STK-b | Haute - le stock doit rester juste |
| **STK-c : Contraintes de stock** | CMD-a & STK-b | Haute - éviter de faux retraits |
| **GOF-b : Back-office** | Aucune | Moyenne - donne accès à l’administration |
| **GOF-a : Gestion des produits** | GOF-b & STK-b | Haute - permettre à l’admin de maintenir la base à jour |
| **GOF-c : Gestion des catégories** | GOF-b & DEC-a | Moyenne - organiser le catalogue |
| **OPT-c : Choix des options** | DEC-c & CMD-b | Haute - permettre les choix de l’utilisateur selon le produit |
| **OPT-a : Options dans le panier et les commandes** | OPT-c & CMD-a | Haute - retrouver ces choix dans le panier et la commande |
| **OPT-b : Variantes et stock par variante** | OPT-c & STK-a & STK-c | Moyenne - ne pas commander une variante hors stock |
| **SUI-b : Espace personnel** | CMD-c | Moyenne - gérer son profil |
| **SUI-c : Historique des commandes** | CMD-c & SUI-b | Moyenne - suivre ses achats |
| **SUI-a : Réutilisation des commandes** | SUI-b & STK-c | Basse - gagner du temps sur des achats récurrents |
| **PIL-b : Gestion des commandes** | GOF-b & STK-a | Haute - l’admin traite les retraits |
| **PIL-a : Tableaux de bord statistiques** | GOF-b & CMD-a & STK-b | Basse - seuls les administrateurs y ont accès |
| **PRO-b : Gestion des codes promo** | GOF-b | Basse - seuls les administrateurs y ont accès (bonus) |
| **PRO-a : Codes promotionnels** | CMD-a & PRO-b | Basse - proposer des promotions sur les produits (bonus) |
| **PRO-c : Promotions automatiques** | STK-b & CMD-b | Basse - fonctionnalité gérée par les administrateurs |


# Pour être plus précis: 

## DEC-b : Catalogue de produits

C'est la base du site, Elle ne dépend de rien et c'est l'US qui en débloque le plus. Parmi les trois US sans dépendance

##  DEC-a : Navigation par catégories

L’utilisateur doit trouver rapidement et facilement  ce qui l'intéresse. elle permet d’aller du catalogue à une fiche produit en passant par les catégories. Elle dépend seulement de DEC-b 

## DEC-c : Détail d'un produit

C'est sur la fiche produit que le client décide d'acheter : description, galerie d'images, prix, bouton « Ajouter au panier ». Elle a besoin du catalogue et des catégories.  Avec elle, l'epic « Découvrir l'offre » est terminé et le bouton « Ajouter au panier » devient actif à l'US suivante.  Elle est dépendante de DEC-b

## CMD-b : Panier d'achat

Elle est impossible avant : on ajoute des produits depuis le catalogue et depuis la fiche produit. Elle est dépandante de DEC-b et DEC-c.

## CMD-c : Authentification

Un client doit être identifié pour valider sa commande.  Elle ne dépend de rien : elle aurait pu être faite en premier. J'ai choisi de la placer juste avant la première US qui en a besoin (CMD-a). D'abord, je préfère priorisé ce que le client voit . Ensuite, je la teste aussitôt en conditions réelles avec la redirection de CMD-a.

## CMD-a : Validation de commande

C'est la fin du parcours “ Commander en click & collect “ elle est a cette place car elle a besoin du panier et de la connexion, elle vient donc forcément après les deux. elle est dépendante de CMD-b & CMD-c 

## STK-b : Affichage des stocks

Le client voit si un produit est disponible (« En stock », « Bientôt épuisé », « Épuisé »). Elle aurait pu être faite juste après la fiche produit. Je l'ai placée après CMD-a, car afficher le stock n'est pas nécessaire pour passer une commande : je préfère d'abord terminer le parcours de commande. Elle ouvre tout le bloc « stock ». Elle est dépendante de DEC-c.

## STK-a : Mise à jour automatique des stocks

Le stock baisse quand une commande est validée et remonte quand elle est annulée. C'est l'US la plus difficile du projet (transactions, journal, deux commandes en même temps), donc je la fais tôt pour avoir le temps de la corriger. Je la place juste après le début du bloc stock, car elle modifie le code de CMD-a, que je viens d'écrire. Elle est dépendante de CMD-a et STK-b.

## STK-c : Contraintes de stock

Le client ne peut pas ajouter au panier ni commander plus que le stock disponible. Elle vient après STK-a, car elle s'appuie sur la vérification côté serveur déjà en place. Avec elle, l'epic « Garantir la disponibilité » est terminé. Elle est dépendante de CMD-a et STK-b.

## GOF-b : Back-office

L'administrateur a besoin d'un espace sécurisé (/admin) pour gérer le site. Elle ne dépend de rien et aurait pu être faite au début. Mais un back-office sans produits, sans stock et sans commandes à gérer n'a pas d'intérêt : je la place ici pour que toute l'administration arrive d'un bloc. Elle réutilise le code de connexion de CMD-c. Elle ne dépend d'aucune US.

## GOF-a : Gestion des produits

L'administrateur ajoute, modifie et supprime des produits sans toucher à la base de données. Elle vient après le stock, car l'admin fixe aussi les stocks et le seuil « Bientôt épuisé ». C'est une US lourde (formulaires complets, envoi d'images). Elle est dépendante de GOF-b et STK-b.

## GOF-c : Gestion des catégories

L'administrateur organise le catalogue. Elle est simple et suit directement la gestion des produits, avec le même type de pages. Avec elle, l'epic « Gérer l'offre » est terminé. Elle est dépendante de GOF-b et DEC-a.

## PIL-b : Gestion des commandes

L'administrateur fait passer les commandes de « en cours » à « disponible » puis « retirée », ou les annule. Elle vient après STK-a, car une annulation doit remettre les produits en stock : elle réutilise la fonction de STK-a au lieu de la recoder. Elle est dépendante de GOF-b et STK-a.

## OPT-c : Choix des options

Le client choisit la taille, la couleur… sur la fiche produit, et le prix se met à jour. Le sujet demande des options pour chaque produit. Je la fais avant « Suivre mes achats », car l'historique devra afficher les options : ça évite de reprendre ces US. Elle est dépendante de DEC-c et CMD-b.

## OPT-a : Options dans le panier et les commandes

Le client retrouve ses choix dans le panier, le récapitulatif et la commande. Elle termine le parcours « choisir → panier → commander » avec les options. Elle est dépendante de OPT-c et CMD-a.

## OPT-b : Variantes et stock par variante

Chaque combinaison (exemple : T-shirt bleu taille M) a son propre stock, et une combinaison épuisée ne peut pas être choisie. Elle vient en dernier dans son epic, car c'est la plus complexe et elle applique les règles de stock déjà faites. Avec elle, l'epic « Personnaliser son produit » est terminé. Elle est dépendante de OPT-c, STK-a et STK-c.

## SUI-b : Espace personnel

Le client connecté retrouve et modifie ses informations. Elle est simple et réutilise la connexion. C'est l'entrée vers l'historique des commandes. Elle est dépendante de CMD-c.

## SUI-c : Historique des commandes

Le client consulte ses commandes passées avec leur statut. Je la place après PIL-b et les options : elle affiche directement les vrais statuts (« disponible », « retirée »…) et les options choisies, sans devoir y revenir. Elle est dépendante de CMD-a et SUI-b.

## SUI-a : Réutilisation des commandes

Le client peut « Commander à nouveau » depuis son historique. Elle réutilise l'historique, le panier et la vérification du stock. Avec elle, l'epic « Suivre mes achats » est terminé. Elle est dépendante de SUI-c et STK-c.

## PIL-a : Tableaux de bord statistiques

L'administrateur voit les chiffres clés : stocks, revenus, produits les plus vendus. C'est l'US obligatoire qui a le moins de valeur, car elle ne bloque aucun parcours. Je la place en dernier pour qu'elle affiche de vraies données (commandes, statuts). Avec elle, l'epic « Traiter et piloter l'activité » est terminé. Elle est dépendante de GOF-b, CMD-a et STK-b.

## PRO-b : Gestion des codes promo (bonus)

L'administrateur crée les codes promo. L'epic « Promotions » est un bonus : je ne le commence que si tout le reste est fini. Je la fais en premier dans l'epic pour pouvoir créer des codes avant de les utiliser. Elle est dépendante de GOF-b.

## PRO-a : Codes promotionnels (bonus)

Le client saisit un code lors de la commande et la réduction s'applique au total. Elle est dépendante de CMD-a et PRO-b.

## PRO-c : Promotions automatiques (bonus)

Le produit qui a le plus de stock passe automatiquement à -20 %, avec un prix barré. C'est la plus simple de l'epic, je la garde pour la fin. Elle est dépendante de STK-b et CMD-b.

# Ce qui donne en graphe:

![Texte alternatif](Doc/SAE_3.01.png)

## Voici ce que révèle lighthouse: 


# desktop: 

![Texte alternatif](Doc/lighthousedesktop.png)

# mobile: 

![Texte alternatif](Doc/lighthousemobile.png)