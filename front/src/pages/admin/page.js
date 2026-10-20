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

let C = {};

C.charger = async function () {
  M.stats = null;

  let data = await AdminData.me();
  M.adminEmail = data.email;

  if (M.adminEmail !== null) {
    M.stats = await StatsData.fetch();
  }
};

C.handler_connecterAdmin = async function (email, password) {
  M.email = email;

  try {
    await AdminData.login(email, password);
    await C.charger();
    M.message = null;
  } catch (erreur) {
    M.message = { type: "erreur", texte: erreur.message };
  }

  V.rafraichir();
};

C.handler_deconnecter = async function () {
  try {
    await AdminData.logout();
    await C.charger();
    M.message = { type: "succes", texte: "Vous êtes déconnecté." };
  } catch (erreur) {
    M.message = { type: "erreur", texte: erreur.message };
  }

  V.rafraichir();
};

C.init = async function () {
  M.message = null;

  try {
    await C.charger();
  } catch (erreur) {
    M.adminEmail = null;
    M.message = { type: "erreur", texte: erreur.message };
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

V.createPageFragment = function () {
  let pageFragment = htmlToFragment(template);

  pageFragment.querySelector('slot[name="message"]').replaceWith(MessageView.dom(M.message));

  if (M.adminEmail === null) {
    pageFragment.querySelector('slot[name="nav"]').remove();
    pageFragment.querySelector('[data-welcome]').remove();
    pageFragment.querySelector('slot[name="formulaire"]').replaceWith(
      FormulaireAuthView.dom(
        {
          title: "Administration",
          subtitle: "Connectez-vous à l'espace d'administration.",
          email: M.email,
          autocomplete: "current-password",
          button: "Se connecter",
          linkText: "Espace réservé aux administrateurs.",
          linkLabel: "Retour au site",
          link: "/",
        },
        { submit: C.handler_connecterAdmin }
      )
    );
    return pageFragment;
  }

  pageFragment.querySelector('slot[name="formulaire"]').remove();
  pageFragment.querySelector('slot[name="nav"]').replaceWith(
    AdminNavView.dom(M.stats, { logout: C.handler_deconnecter })
  );

  return pageFragment;
};

export function AdminPage() {
  return C.init();
}
