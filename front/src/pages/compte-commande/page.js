import { AuthData } from "../../data/auth.js";
import { CommandesData } from "../../data/commandes.js";
import { htmlToFragment } from "../../lib/utils.js";
import { CompteNavView } from "../../ui/compte-nav/index.js";
import { DetailCommandeView } from "../../ui/detail-commande/index.js";
import { MessageView } from "../../ui/message/index.js";
import template from "./template.html?raw";


let M = {
  connecte: false,
  commande: null,
  message: null,
};

let C = {};

C.charger = async function (numero) {
  let data = await CommandesData.fetchOne(numero);
  M.commande = data.commande;
  M.connecte = true;
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

C.init = async function (numero) {
  M.message = null;
  M.connecte = false;
  M.commande = null;

  try {
    await C.charger(numero);
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

  if (M.commande === null) {
    pageFragment.querySelector('slot[name="nav"]').remove();
    pageFragment.querySelector('slot[name="detail"]').remove();
    return pageFragment;
  }

  pageFragment.querySelector('slot[name="nav"]').replaceWith(
    CompteNavView.dom({ logout: C.handler_deconnecter })
  );
  pageFragment.querySelector('slot[name="detail"]').replaceWith(DetailCommandeView.dom(M.commande));

  return pageFragment;
};

export function CompteCommandePage(params) {
  return C.init(params.numero);
}
