import { AuthData } from "../../data/auth.js";
import { CommandesData } from "../../data/commandes.js";
import { PanierData } from "../../data/panier.js";
import { htmlToFragment } from "../../lib/utils.js";
import { CompteNavView } from "../../ui/compte-nav/index.js";
import { FiltresCommandesView } from "../../ui/filtres-commandes/index.js";
import { ListeCommandesView } from "../../ui/liste-commandes/index.js";
import { MessageView } from "../../ui/message/index.js";
import { PaginationView } from "../../ui/pagination/index.js";
import template from "./template.html?raw";


let M = {
  connecte: false,
  liste: null,
  filtres: null,
  message: null,
};

let C = {};

C.charger = async function (page) {
  M.liste = await CommandesData.fetchPage(page, M.filtres);
  M.filtres = M.liste.filtres;
  M.connecte = true;
};

C.handler_filtrer = async function (statut, du, au) {
  M.filtres = { statut: statut, du: du, au: au };

  try {
    await C.charger(1);
    M.message = null;
  } catch (erreur) {
    M.message = { type: "erreur", texte: erreur.message };
  }

  V.rafraichir();
};

C.handler_changerPage = async function (page) {
  try {
    await C.charger(page);
    M.message = null;
  } catch (erreur) {
    M.message = { type: "erreur", texte: erreur.message };
  }

  V.rafraichir();
};

C.handler_commanderANouveau = async function (ev) {
  try {
    let data = await CommandesData.reorder(ev.target.dataset.numero);
    let notes = data.notes.concat(PanierData.ajouter(data.lignes));

    M.message = { type: "succes", texte: data.message };
    if (notes.length > 0) {
      M.message = { type: "erreur", texte: data.message + " " + notes.join(" ") };
    }
  } catch (erreur) {
    M.message = { type: "erreur", texte: erreur.message };
  }

  V.rafraichir();
};

C.handler_deconnecter = async function () {
  try {
    await AuthData.logout();
  } catch (erreur) {
    M.message = { type: "erreur", texte: erreur.message };
    V.rafraichir();
    return;
  }

  V.redirect("connexion");
};

C.init = async function () {
  M.message = null;
  M.connecte = false;
  M.filtres = null;

  try {
    await C.charger(1);
  } catch (erreur) {
    if (erreur.statut === 401) {
      V.redirect("connexion");
    } else {
      M.message = { type: "erreur", texte: erreur.message };
    }
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

  if (!M.connecte) {
    pageFragment.querySelector('slot[name="nav"]').remove();
    pageFragment.querySelector('slot[name="filtres"]').remove();
    pageFragment.querySelector('slot[name="liste"]').remove();
    pageFragment.querySelector('slot[name="pagination"]').remove();
    return pageFragment;
  }

  pageFragment.querySelector('slot[name="nav"]').replaceWith(
    CompteNavView.dom({ logout: C.handler_deconnecter })
  );
  pageFragment.querySelector('slot[name="filtres"]').replaceWith(
    FiltresCommandesView.dom(M.filtres, { submit: C.handler_filtrer })
  );
  pageFragment.querySelector('slot[name="liste"]').replaceWith(
    ListeCommandesView.dom({ titre: "", commandes: M.liste.commandes }, { reorder: C.handler_commanderANouveau })
  );
  pageFragment.querySelector('slot[name="pagination"]').replaceWith(
    PaginationView.dom(M.liste, { surPage: C.handler_changerPage })
  );

  return pageFragment;
};

export function CompteCommandesPage() {
  return C.init();
}
