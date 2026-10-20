import { AdminData } from "../../data/admin.js";
import { StatsData } from "../../data/stats.js";
import { htmlToFragment } from "../../lib/utils.js";
import { AdminNavView } from "../../ui/admin-nav/index.js";
import { FormulaireAuthView } from "../../ui/formulaire-auth/index.js";
import { MessageView } from "../../ui/message/index.js";
import template from "./template.html?raw";


let M = {
  email: "",
  adminEmail: null,
  stats: null,
  message: null,
};

M.load = async function () {
  let data = await AdminData.me();
  M.adminEmail = data.email;
  M.stats = null;

  if (M.adminEmail !== null) {
    M.stats = await StatsData.fetch();
  }
};

M.getPage = function () {
  return {
    message: M.message,
    connected: M.adminEmail !== null,
    stats: M.stats,
    form: {
      title: "Administration",
      subtitle: "Connectez-vous à l'espace d'administration.",
      email: M.email,
      autocomplete: "current-password",
      button: "Se connecter",
      linkText: "Espace réservé aux administrateurs.",
      linkLabel: "Retour au site",
      link: "/",
    },
  };
};


let C = {};

C.handler_submit = async function (email, password) {
  M.email = email;

  try {
    await AdminData.login(email, password);
    await M.load();
    M.message = null;
  } catch (erreur) {
    M.message = { type: "erreur", texte: erreur.message };
  }

  V.rafraichir(M.getPage());
};

C.handler_clickOnLogout = async function () {
  try {
    await AdminData.logout();
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
    M.adminEmail = null;
    M.message = { type: "erreur", texte: erreur.message };
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

  pageFragment.querySelector('slot[name="message"]').replaceWith(MessageView.dom(data.message));

  if (!data.connected) {
    pageFragment.querySelector('slot[name="nav"]').remove();
    pageFragment.querySelector('[data-welcome]').remove();
    pageFragment.querySelector('slot[name="formulaire"]').replaceWith(
      FormulaireAuthView.dom(data.form, { submit: C.handler_submit })
    );
    return pageFragment;
  }

  pageFragment.querySelector('slot[name="formulaire"]').remove();
  pageFragment.querySelector('slot[name="nav"]').replaceWith(
    AdminNavView.dom(data.stats, { logout: C.handler_clickOnLogout })
  );

  return pageFragment;
};

export function AdminPage() {
  return C.init();
}
