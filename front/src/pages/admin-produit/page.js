import { AdminData } from "../../data/admin.js";
import { AdminProduitData } from "../../data/admin-produits.js";
import { StatsData } from "../../data/stats.js";
import { htmlToFragment } from "../../lib/utils.js";
import { AdminNavView } from "../../ui/admin-nav/index.js";
import { FormulaireProduitView } from "../../ui/formulaire-produit/index.js";
import { TableauVariantesView } from "../../ui/tableau-variantes/index.js";
import { MessageView } from "../../ui/message/index.js";
import template from "./template.html?raw";


let M = {
  id: 0,
  adminEmail: null,
  stats: null,
  categories: [],
  variantes: [],
  values: null,
  message: null,
};

let C = {};

C.charger = async function (id) {
  M.id = id;
  M.stats = null;

  let data = await AdminData.me();
  M.adminEmail = data.email;

  if (M.adminEmail !== null) {
    M.stats = await StatsData.fetch();

    let result = await AdminProduitData.fetchOne(id);
    M.categories = result.categories;
    M.values = {
      titre: "",
      urlName: "",
      description: "",
      descriptionLongue: "",
      prix: "",
      couleurs: "",
      image: "",
      images: ["", "", ""],
      options: "",
      categorieId: M.categories[0].id,
    };

    M.variantes = [];

    if (result.produit !== null) {
      M.values = result.produit;
      M.variantes = result.produit.variantes;
    }
  }
};

C.handler_enregistrerProduit = async function (values) {
  let creation = M.id === 0;
  M.values = values;

  try {
    if (creation) {
      let result = await AdminProduitData.create(values);
      M.id = result.produit.id;
    } else {
      values.id = M.id;
      await AdminProduitData.update(values);
    }

    M.stats = await StatsData.fetch();

    let result = await AdminProduitData.fetchOne(M.id);
    M.variantes = result.produit.variantes;
    M.message = { type: "succes", texte: creation ? "Produit ajouté." : "Produit modifié." };
  } catch (erreur) {
    M.message = { type: "erreur", texte: erreur.message };
  }

  V.rafraichir();
};

C.handler_enregistrerStocks = async function (stocks) {
  try {
    await AdminProduitData.saveStocks(M.id, stocks);

    let result = await AdminProduitData.fetchOne(M.id);
    M.variantes = result.produit.variantes;
    M.message = { type: "succes", texte: "Stocks enregistrés." };
  } catch (erreur) {
    M.message = { type: "erreur", texte: erreur.message };
  }

  V.rafraichir();
};

C.handler_deconnecter = async function () {
  try {
    await AdminData.logout();
  } catch (erreur) {
    M.message = { type: "erreur", texte: erreur.message };
    V.rafraichir();
    return;
  }

  V.redirect("admin");
};

C.init = async function (id) {
  M.message = null;

  try {
    await C.charger(id);
  } catch (erreur) {
    M.stats = null;
    M.message = { type: "erreur", texte: erreur.message };
    return V.init();
  }

  if (M.adminEmail === null) {
    V.redirect("admin");
  }

  return V.init();
};


let V = {};

V.racine = null;

V.init = function () {
  let fragment = V.createPageFragment();
  V.racine = fragment.firstElementChild;
  return fragment;
};

V.rafraichir = function () {
  let fragment = V.createPageFragment();
  let nouvelleRacine = fragment.firstElementChild;
  V.racine.replaceWith(fragment);
  V.racine = nouvelleRacine;
};

V.redirect = function (path) {
  window.location.assign(import.meta.env.BASE_URL + path);
};

V.createPageFragment = function () {
  let pageFragment = htmlToFragment(template);

  pageFragment.querySelector('slot[name="message"]').replaceWith(MessageView.dom(M.message));

  if (M.stats === null) {
    pageFragment.querySelector('slot[name="nav"]').remove();
    pageFragment.querySelector('slot[name="formulaire"]').remove();
    pageFragment.querySelector('slot[name="variantes"]').remove();
    return pageFragment;
  }

  let title = "Ajouter un produit";
  let button = "Ajouter le produit";

  if (M.id !== 0) {
    title = "Modifier le produit";
    button = "Enregistrer les modifications";
  }

  pageFragment.querySelector('slot[name="nav"]').replaceWith(
    AdminNavView.dom(M.stats, { logout: C.handler_deconnecter })
  );
  pageFragment.querySelector('slot[name="formulaire"]').replaceWith(
    FormulaireProduitView.dom(
      { title: title, button: button, values: M.values, categories: M.categories },
      { submit: C.handler_enregistrerProduit }
    )
  );

  let slotVariantes = pageFragment.querySelector('slot[name="variantes"]');
  if (M.variantes.length === 0) {
    slotVariantes.remove();
  } else {
    slotVariantes.replaceWith(
      TableauVariantesView.dom(M.variantes, { submit: C.handler_enregistrerStocks })
    );
  }

  return pageFragment;
};

export function AdminProduitNouveauPage() {
  return C.init(0);
}

export function AdminProduitModifierPage(params) {
  return C.init(params.id);
}
