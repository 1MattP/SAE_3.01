import { AdminData } from "../../data/admin.js";
import { AdminCategorieData } from "../../data/admin-categories.js";
import { StatsData } from "../../data/stats.js";
import { htmlToFragment } from "../../lib/utils.js";
import { AdminNavView } from "../../ui/admin-nav/index.js";
import { FormulaireCategorieView } from "../../ui/formulaire-categorie/index.js";
import { MessageView } from "../../ui/message/index.js";
import template from "./template.html?raw";


let M = {
  id: 0,
  adminEmail: null,
  stats: null,
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

    M.values = { libelle: "", description: "" };

    if (id !== 0) {
      let result = await AdminCategorieData.fetchOne(id);
      M.values = result.categorie;
    }
  }
};

C.handler_enregistrerCategorie = async function (values) {
  let creation = M.id === 0;
  M.values = values;

  try {
    if (creation) {
      let result = await AdminCategorieData.create(values);
      M.id = result.categorie.id;
    } else {
      values.id = M.id;
      await AdminCategorieData.update(values);
    }

    M.stats = await StatsData.fetch();
    M.message = { type: "succes", texte: creation ? "Catégorie ajoutée." : "Catégorie modifiée." };
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
    return pageFragment;
  }

  let title = "Ajouter une catégorie";
  let button = "Ajouter la catégorie";

  if (M.id !== 0) {
    title = "Modifier la catégorie";
    button = "Enregistrer les modifications";
  }

  pageFragment.querySelector('slot[name="nav"]').replaceWith(
    AdminNavView.dom(M.stats, { logout: C.handler_deconnecter })
  );
  pageFragment.querySelector('slot[name="formulaire"]').replaceWith(
    FormulaireCategorieView.dom(
      { title: title, button: button, values: M.values },
      { submit: C.handler_enregistrerCategorie }
    )
  );

  return pageFragment;
};

export function AdminCategorieNouvellePage() {
  return C.init(0);
}

export function AdminCategorieModifierPage(params) {
  return C.init(params.id);
}
