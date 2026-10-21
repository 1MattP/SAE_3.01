import { AuthData } from "../../data/auth.js";
import { CompteData } from "../../data/compte.js";
import { htmlToFragment } from "../../lib/utils.js";
import { CompteNavView } from "../../ui/compte-nav/index.js";
import { FormulaireMotDePasseView } from "../../ui/formulaire-mot-de-passe/index.js";
import { FormulaireProfilView } from "../../ui/formulaire-profil/index.js";
import { MessageView } from "../../ui/message/index.js";
import template from "./template.html?raw";


let M = {
  compte: null,
  message: null,
};

let C = {};

C.charger = async function () {
  M.compte = null;

  let data = await CompteData.fetch();
  M.compte = data.compte;
};

C.handler_enregistrerProfil = async function (nom, email) {
  M.compte.nom = nom;
  M.compte.email = email;

  try {
    await CompteData.saveProfil(nom, email);
    M.message = { type: "succes", texte: "Profil mis à jour." };
  } catch (erreur) {
    M.message = { type: "erreur", texte: erreur.message };
  }

  V.rafraichir();
};

C.handler_changerMotDePasse = async function (actuel, nouveau, confirmation) {
  if (nouveau !== confirmation) {
    M.message = { type: "erreur", texte: "La confirmation ne correspond pas au nouveau mot de passe." };
    V.rafraichir();
    return;
  }

  try {
    await CompteData.savePassword(actuel, nouveau);
    M.message = { type: "succes", texte: "Mot de passe modifié." };
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
  let pageFragment = htmlToFragment(template);

  pageFragment.querySelector('slot[name="message"]').replaceWith(MessageView.dom(M.message));

  if (M.compte === null) {
    pageFragment.querySelector('slot[name="nav"]').remove();
    pageFragment.querySelector('slot[name="profil"]').remove();
    pageFragment.querySelector('slot[name="motDePasse"]').remove();
    return pageFragment;
  }

  pageFragment.querySelector('slot[name="nav"]').replaceWith(
    CompteNavView.dom({ logout: C.handler_deconnecter })
  );
  pageFragment.querySelector('slot[name="profil"]').replaceWith(
    FormulaireProfilView.dom(
      { nom: M.compte.nom, email: M.compte.email },
      { submit: C.handler_enregistrerProfil }
    )
  );
  pageFragment.querySelector('slot[name="motDePasse"]').replaceWith(
    FormulaireMotDePasseView.dom({ submit: C.handler_changerMotDePasse })
  );

  return pageFragment;
};

export function CompteProfilPage() {
  return C.init();
}
