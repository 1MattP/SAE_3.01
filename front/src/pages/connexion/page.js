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

M.load = async function () {
  let data = await AuthData.me();
  M.connectedEmail = data.email;
};

M.getPage = function () {
  return {
    message: M.message,
    connectedEmail: M.connectedEmail,
    form: {
      title: "Connexion",
      subtitle: "Bienvenue. Connectez-vous à votre compte Nike.",
      email: M.email,
      autocomplete: "current-password",
      button: "Se connecter",
      linkText: "Pas encore de compte ?",
      linkLabel: "Créer un compte",
      link: "/inscription",
    },
  };
};


let C = {};

C.handler_submit = async function (email, password) {
  M.email = email;

  try {
    await AuthData.login(email, password);
    await M.load();
    M.message = { type: "succes", texte: "Connexion réussie." };
  } catch (erreur) {
    M.message = { type: "erreur", texte: erreur.message };
  }

  V.rafraichir(M.getPage());
};

C.handler_clickOnLogout = async function () {
  try {
    await AuthData.logout();
    await M.load();
    M.message = { type: "succes", texte: "Vous êtes déconnecté." };
  } catch (erreur) {
    M.message = { type: "erreur", texte: erreur.message };
  }

  V.rafraichir(M.getPage());
};

C.init = async function () {
  M.message = null;

  try {
    await M.load();
  } catch (erreur) {
    M.connectedEmail = null;
    M.message = { type: "erreur", texte: `Impossible de vérifier votre session : ${erreur.message}` };
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

V.createPageFragment = function (data) {
  let pageFragment = htmlToFragment(template);

  if (data.connectedEmail === null) {
    pageFragment.querySelector('slot[name="formulaire"]').replaceWith(
      FormulaireAuthView.dom(data.form, { submit: C.handler_submit })
    );
  } else {
    pageFragment.querySelector('slot[name="formulaire"]').replaceWith(
      CompteConnecteView.dom({ email: data.connectedEmail }, { logout: C.handler_clickOnLogout })
    );
  }

  pageFragment.querySelector('slot[name="message"]').replaceWith(MessageView.dom(data.message));

  return pageFragment;
};

export function ConnexionPage() {
  return C.init();
}
