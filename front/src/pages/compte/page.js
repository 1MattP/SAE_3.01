import { AuthData } from "../../data/auth.js";
import { CompteData } from "../../data/compte.js";
import { genericRenderer, htmlToFragment } from "../../lib/utils.js";
import { CommandesRecentesView } from "../../ui/commandes-recentes/index.js";
import { CompteNavView } from "../../ui/compte-nav/index.js";
import { InfosCompteView } from "../../ui/infos-compte/index.js";
import { MessageView } from "../../ui/message/index.js";
import template from "./template.html?raw";


let M = {
  compte: null,
  commandes: [],
  message: null,
};

let C = {};

C.charger = async function () {
  M.compte = null;

  let data = await CompteData.fetch();
  M.compte = data.compte;
  M.commandes = data.commandes;
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

  try {
    await C.charger();
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
  let titre = "Mon espace";
  if (M.compte !== null) {
    titre = `Bonjour ${M.compte.nom === "" ? M.compte.email : M.compte.nom}`;
  }

  let pageFragment = htmlToFragment(genericRenderer(template, { titre: titre }));

  pageFragment.querySelector('slot[name="message"]').replaceWith(MessageView.dom(M.message));

  if (M.compte === null) {
    pageFragment.querySelector('slot[name="nav"]').remove();
    pageFragment.querySelector('slot[name="infos"]').remove();
    pageFragment.querySelector('slot[name="commandes"]').remove();
    return pageFragment;
  }

  let infos = { nom: M.compte.nom, email: M.compte.email, dateCreation: M.compte.dateCreation };
  if (infos.nom === "") {
    infos.nom = "Non renseigné";
  }

  pageFragment.querySelector('slot[name="nav"]').replaceWith(
    CompteNavView.dom({ logout: C.handler_deconnecter })
  );
  pageFragment.querySelector('slot[name="infos"]').replaceWith(InfosCompteView.dom(infos));
  pageFragment.querySelector('slot[name="commandes"]').replaceWith(CommandesRecentesView.dom(M.commandes));

  return pageFragment;
};

export function ComptePage() {
  return C.init();
}
