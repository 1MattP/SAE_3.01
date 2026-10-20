import { AdminData } from "../../data/admin.js";
import { AdminProduitData } from "../../data/admin-produits.js";
import { StatsData } from "../../data/stats.js";
import { htmlToFragment } from "../../lib/utils.js";
import { AdminNavView } from "../../ui/admin-nav/index.js";
import { MessageView } from "../../ui/message/index.js";
import { TableauProduitsView } from "../../ui/tableau-produits/index.js";
import template from "./template.html?raw";


let M = {
  adminEmail: null,
  stats: null,
  produits: [],
  confirmingId: null,
  message: null,
};

M.load = async function () {
  let data = await AdminData.me();
  M.adminEmail = data.email;

  if (M.adminEmail !== null) {
    M.stats = await StatsData.fetch();
    let list = await AdminProduitData.fetchAll();
    M.produits = list.produits;
  }
};

M.remove = async function (id) {
  await AdminProduitData.remove(id);
  M.confirmingId = null;
  await M.load();
};

M.getPage = function () {
  return {
    message: M.message,
    stats: M.stats,
    produits: M.produits.map(function (produit) {
      return {
        id: produit.id,
        titre: produit.titre,
        categorie: produit.categorie,
        prix: produit.prix,
        stock: produit.stock,
        image: produit.image,
        confirming: `${produit.id}` === M.confirmingId,
      };
    }),
  };
};


let C = {};

C.handler_clickOnRemove = function (ev) {
  M.confirmingId = ev.target.dataset.id;
  V.rafraichir(M.getPage());
};

C.handler_clickOnCancelRemove = function () {
  M.confirmingId = null;
  V.rafraichir(M.getPage());
};

C.handler_clickOnConfirmRemove = async function (ev) {
  try {
    await M.remove(ev.target.dataset.id);
    M.message = { type: "succes", texte: "Produit supprimé." };
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

C.init = async function () {
  M.message = null;
  M.confirmingId = null;

  try {
    await M.load();
  } catch (erreur) {
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
    pageFragment.querySelector('slot[name="liste"]').remove();
    return pageFragment;
  }

  pageFragment.querySelector('slot[name="nav"]').replaceWith(
    AdminNavView.dom(data.stats, { logout: C.handler_clickOnLogout })
  );
  pageFragment.querySelector('slot[name="liste"]').replaceWith(
    TableauProduitsView.dom(data.produits, {
      remove: C.handler_clickOnRemove,
      confirmRemove: C.handler_clickOnConfirmRemove,
      cancelRemove: C.handler_clickOnCancelRemove,
    })
  );

  return pageFragment;
};

export function AdminProduitsPage() {
  return C.init();
}
