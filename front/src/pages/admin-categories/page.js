import { AdminData } from "../../data/admin.js";
import { AdminCategorieData } from "../../data/admin-categories.js";
import { StatsData } from "../../data/stats.js";
import { htmlToFragment } from "../../lib/utils.js";
import { AdminNavView } from "../../ui/admin-nav/index.js";
import { MessageView } from "../../ui/message/index.js";
import { TableauCategoriesView } from "../../ui/tableau-categories/index.js";
import template from "./template.html?raw";


let M = {
  adminEmail: null,
  stats: null,
  categories: [],
  confirmingId: null,
  message: null,
};

let C = {};

C.charger = async function () {
  M.stats = null;

  let data = await AdminData.me();
  M.adminEmail = data.email;

  if (M.adminEmail !== null) {
    M.stats = await StatsData.fetch();

    let list = await AdminCategorieData.fetchAll();
    M.categories = list.categories;
  }
};

C.handler_demanderSuppression = function (ev) {
  M.confirmingId = ev.target.dataset.id;
  V.rafraichir();
};

C.handler_annulerSuppression = function () {
  M.confirmingId = null;
  V.rafraichir();
};

C.handler_supprimerCategorie = async function (ev) {
  try {
    await AdminCategorieData.remove(ev.target.dataset.id);
    M.confirmingId = null;
    await C.charger();
    M.message = { type: "succes", texte: "Catégorie supprimée." };
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

C.init = async function () {
  M.message = null;
  M.confirmingId = null;

  try {
    await C.charger();
  } catch (erreur) {
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
    pageFragment.querySelector('slot[name="liste"]').remove();
    return pageFragment;
  }

  let lignes = M.categories.map(function (categorie) {
    return {
      id: categorie.id,
      libelle: categorie.libelle,
      description: categorie.description,
      nombre: categorie.nombre,
      confirming: `${categorie.id}` === M.confirmingId,
    };
  });

  pageFragment.querySelector('slot[name="nav"]').replaceWith(
    AdminNavView.dom(M.stats, { logout: C.handler_deconnecter })
  );
  pageFragment.querySelector('slot[name="liste"]').replaceWith(
    TableauCategoriesView.dom(lignes, {
      remove: C.handler_demanderSuppression,
      confirmRemove: C.handler_supprimerCategorie,
      cancelRemove: C.handler_annulerSuppression,
    })
  );

  return pageFragment;
};

export function AdminCategoriesPage() {
  return C.init();
}
