import { AuthData } from "../../data/auth.js";
import { htmlToFragment } from "../../lib/utils.js";
import { CompteConnecteView } from "../../ui/compte-connecte/index.js";
import { FormulaireAuthView } from "../../ui/formulaire-auth/index.js";
import { MessageView } from "../../ui/message/index.js";
import template from "./template.html?raw";


let M = {
  email: "",
  connectedEmail: null,
  message: null,
};

let C = {};

C.charger = async function () {
  M.message = null;

  try {
    let data = await AuthData.me();
    M.connectedEmail = data.email;
  } catch (erreur) {
    M.connectedEmail = null;
    M.message = { type: "erreur", texte: `Impossible de vérifier votre session : ${erreur.message}` };
  }
};

C.handler_connecter = async function (email, password) {
  M.email = email;

  try {
    await AuthData.login(email, password);

    let data = await AuthData.me();
    M.connectedEmail = data.email;
    M.message = { type: "succes", texte: "Connexion réussie." };
  } catch (erreur) {
    M.message = { type: "erreur", texte: erreur.message };
  }

  V.rafraichir();
};

C.handler_deconnecter = async function () {
  try {
    await AuthData.logout();

    let data = await AuthData.me();
    M.connectedEmail = data.email;
    M.message = { type: "succes", texte: "Vous êtes déconnecté." };
  } catch (erreur) {
    M.message = { type: "erreur", texte: erreur.message };
  }

  V.rafraichir();
};

C.init = async function () {
  await C.charger();
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

V.createPageFragment = function () {
  let pageFragment = htmlToFragment(template);

  if (M.connectedEmail === null) {
    pageFragment.querySelector('slot[name="formulaire"]').replaceWith(
      FormulaireAuthView.dom(
        {
          title: "Connexion",
          subtitle: "Bienvenue. Connectez-vous à votre compte Nike.",
          email: M.email,
          autocomplete: "current-password",
          button: "Se connecter",
          linkText: "Pas encore de compte ?",
          linkLabel: "Créer un compte",
          link: "/inscription",
        },
        { submit: C.handler_connecter }
      )
    );
  } else {
    pageFragment.querySelector('slot[name="formulaire"]').replaceWith(
      CompteConnecteView.dom({ email: M.connectedEmail }, { logout: C.handler_deconnecter })
    );
  }

  pageFragment.querySelector('slot[name="message"]').replaceWith(MessageView.dom(M.message));

  return pageFragment;
};

export function ConnexionPage() {
  return C.init();
}
