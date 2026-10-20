import { AdminData } from "../../data/admin.js";
import { AdminProduitData } from "../../data/admin-produits.js";
import { StatsData } from "../../data/stats.js";
import { htmlToFragment } from "../../lib/utils.js";
import { AdminNavView } from "../../ui/admin-nav/index.js";
import { FormulaireProduitView } from "../../ui/formulaire-produit/index.js";
import { MessageView } from "../../ui/message/index.js";
import template from "./template.html?raw";


let M = {
  id: 0,
  adminEmail: null,
  stats: null,
  categories: [],
  values: null,
  message: null,
};

M.load = async function (id) {
  M.id = id;

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
      stock: "0",
      couleurs: "",
      image: "",
      categorieId: M.categories[0].id,
    };

    if (result.produit !== null) {
      M.values = result.produit;
    }
  }
};

M.save = async function (values) {
  M.values = values;

  if (M.id === 0) {
    let result = await AdminProduitData.create(values);
    M.id = result.produit.id;
  } else {
    values.id = M.id;
    await AdminProduitData.update(values);
  }

  M.stats = await StatsData.fetch();
};

M.getPage = function () {
  let title = "Ajouter un produit";
  let button = "Ajouter le produit";

  if (M.id !== 0) {
    title = "Modifier le produit";
    button = "Enregistrer les modifications";
  }

  return {
    message: M.message,
    stats: M.stats,
    form: { title: title, button: button, values: M.values, categories: M.categories },
  };
};


let C = {};

C.handler_submit = async function (values) {
  let creation = M.id === 0;

  try {
    await M.save(values);
    M.message = { type: "succes", texte: creation ? "Produit ajouté." : "Produit modifié." };
  } catch (erreur) {
    M.message = { type: "erreur", texte: erreur.message };
  }

  V.rafraichir(M.getPage());
};

C.handler_clickOnLogout = async function () {
  try {
    await AdminData.logout();
  } catch (erreur) {
    M.message = { type: "erreur", texte: erreur.message };
    V.rafraichir(M.getPage());
    return;
  }

  V.redirect("admin");
};

C.init = async function (id) {
  M.message = null;

  try {
    await M.load(id);
  } catch (erreur) {
    M.adminEmail = null;
    M.stats = null;
    M.message = { type: "erreur", texte: erreur.message };
    return V.init(M.getPage());
  }

  if (M.adminEmail === null) {
    V.redirect("admin");
  }

  return V.init(M.getPage());
};


let V = {};

V.racine = null;

V.init = function (data) {
  let fragment = V.createPageFragment(data);
  V.racine = fragment.firstElementChild;
  return fragment;
};

V.rafraichir = function (data) {
  let fragment = V.createPageFragment(data);
  let nouvelleRacine = fragment.firstElementChild;
  V.racine.replaceWith(fragment);
  V.racine = nouvelleRacine;
};

V.redirect = function (path) {
  window.location.assign(import.meta.env.BASE_URL + path);
};

V.createPageFragment = function (data) {
  let pageFragment = htmlToFragment(template);

  pageFragment.querySelector('slot[name="message"]').replaceWith(MessageView.dom(data.message));

  if (data.stats === null) {
    pageFragment.querySelector('slot[name="nav"]').remove();
    pageFragment.querySelector('slot[name="formulaire"]').remove();
    return pageFragment;
  }

  pageFragment.querySelector('slot[name="nav"]').replaceWith(
    AdminNavView.dom(data.stats, { logout: C.handler_clickOnLogout })
  );
  pageFragment.querySelector('slot[name="formulaire"]').replaceWith(
    FormulaireProduitView.dom(data.form, { submit: C.handler_submit })
  );

  return pageFragment;
};

export function AdminProduitNouveauPage() {
  return C.init(0);
}

export function AdminProduitModifierPage(params) {
  return C.init(params.id);
}
