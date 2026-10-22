import { AdminData } from "../../data/admin.js";
import { AdminCodePromoData } from "../../data/admin-codes-promo.js";
import { StatsData } from "../../data/stats.js";
import { formaterPrix } from "../../lib/format.js";
import { htmlToFragment } from "../../lib/utils.js";
import { AdminNavView } from "../../ui/admin-nav/index.js";
import { CartesStatistiquesView } from "../../ui/cartes-statistiques/index.js";
import { MessageView } from "../../ui/message/index.js";
import { TableauCodesPromoView } from "../../ui/tableau-codes-promo/index.js";
import template from "./template.html?raw";


let M = {
  adminEmail: null,
  stats: null,
  codes: [],
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

    let list = await AdminCodePromoData.fetchAll();
    M.codes = list.codes;
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

C.handler_supprimerCode = async function (ev) {
  try {
    await AdminCodePromoData.remove(ev.target.dataset.id);
    M.confirmingId = null;
    await C.charger();
    M.message = { type: "succes", texte: "Code promo supprimé." };
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
    pageFragment.querySelector('slot[name="cartes"]').remove();
    pageFragment.querySelector('slot[name="liste"]').remove();
    return pageFragment;
  }

  let lignes = M.codes.map(function (code) {
    return {
      id: code.id,
      code: code.code,
      pourcentage: code.pourcentage,
      utilisations: code.utilisations,
      remises: code.remises,
      confirming: `${code.id}` === M.confirmingId,
    };
  });

  let utilisations = 0;
  let remises = 0;
  for (let code of M.codes) {
    utilisations += code.utilisations;
    remises += code.remises;
  }

  pageFragment.querySelector('slot[name="nav"]').replaceWith(
    AdminNavView.dom(M.stats, { logout: C.handler_deconnecter })
  );
  pageFragment.querySelector('slot[name="cartes"]').replaceWith(
    CartesStatistiquesView.dom([
      { valeur: M.codes.length, libelle: "codes promo" },
      { valeur: utilisations, libelle: "utilisations" },
      { valeur: formaterPrix(remises), libelle: "réductions accordées" },
    ])
  );
  pageFragment.querySelector('slot[name="liste"]').replaceWith(
    TableauCodesPromoView.dom(lignes, {
      remove: C.handler_demanderSuppression,
      confirmRemove: C.handler_supprimerCode,
      cancelRemove: C.handler_annulerSuppression,
    })
  );

  return pageFragment;
};

export function AdminCodesPromoPage() {
  return C.init();
}
