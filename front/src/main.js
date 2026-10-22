import { Router } from "./lib/router.js";
import { RootLayout } from "./layouts/root/layout.js";
import { AdminLayout } from "./layouts/admin/layout.js";
import { CataloguePage } from "./pages/catalogue/page.js";
import { ProduitPage } from "./pages/produit/page.js";
import { PanierPage } from "./pages/panier/page.js";
import { ConnexionPage } from "./pages/connexion/page.js";
import { InscriptionPage } from "./pages/inscription/page.js";
import { ValidationPage } from "./pages/validation/page.js";
import { AdminPage } from "./pages/admin/page.js";
import { AdminProduitsPage } from "./pages/admin-produits/page.js";
import { AdminProduitNouveauPage, AdminProduitModifierPage } from "./pages/admin-produit/page.js";
import { ComptePage } from "./pages/compte/page.js";
import { CompteCommandesPage } from "./pages/compte-commandes/page.js";
import { CompteCommandePage } from "./pages/compte-commande/page.js";
import { CompteProfilPage } from "./pages/compte-profil/page.js";
import { AdminCommandesPage } from "./pages/admin-commandes/page.js";
import { AdminCommandePage } from "./pages/admin-commande/page.js";
import { AdminCategoriesPage } from "./pages/admin-categories/page.js";
import { AdminCategorieNouvellePage, AdminCategorieModifierPage } from "./pages/admin-categorie/page.js";
import { The404Page } from "./pages/404/page.js";

// base : chemin du projet sur le serveur (BASE dans vite.config.js).
const router = new Router("app", { base: import.meta.env.BASE_URL });

router.addLayout("/", RootLayout);
router.addLayout("/admin", AdminLayout);

router.addRoute("/categorie/:nom", CataloguePage);

router.addRoute("/produit/:urlName", ProduitPage);

router.addRoute("/panier", PanierPage);

router.addRoute("/connexion", ConnexionPage);

router.addRoute("/inscription", InscriptionPage);

router.addRoute("/validation", ValidationPage);

router.addRoute("/compte", ComptePage);

router.addRoute("/compte/profil", CompteProfilPage);

router.addRoute("/compte/commandes", CompteCommandesPage);

router.addRoute("/compte/commandes/:numero", CompteCommandePage);

router.addRoute("/", CataloguePage);

router.addRoute("/admin", AdminPage);

router.addRoute("/admin/produits", AdminProduitsPage);

router.addRoute("/admin/produits/nouveau", AdminProduitNouveauPage);

router.addRoute("/admin/produits/:id", AdminProduitModifierPage);

router.addRoute("/admin/commandes", AdminCommandesPage);

router.addRoute("/admin/commandes/:numero", AdminCommandePage);

router.addRoute("/admin/categories", AdminCategoriesPage);

router.addRoute("/admin/categories/nouveau", AdminCategorieNouvellePage);

router.addRoute("/admin/categories/:id", AdminCategorieModifierPage);

// En dernier : toute adresse qui ne correspond à aucune route.
router.addRoute("*", The404Page);

// Démarrer le routeur
router.start();
