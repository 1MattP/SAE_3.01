import { AdminData } from "../../data/admin.js";
import { AdminCommandeData } from "../../data/admin-commandes.js";
import { StatsData } from "../../data/stats.js";
import { genericRenderer, htmlToFragment } from "../../lib/utils.js";
import { ActionsCommandeView } from "../../ui/actions-commande/index.js";
import { AdminNavView } from "../../ui/admin-nav/index.js";
import { ConfirmationAnnulationView } from "../../ui/confirmation-annulation/index.js";
import { DetailCommandeView } from "../../ui/detail-commande/index.js";
import { JournalCommandesView } from "../../ui/journal-commandes/index.js";
import { MessageView } from "../../ui/message/index.js";
import template from "./template.html?raw";


let M = {
  adminEmail: null,
  stats: null,
  commande: null,
  confirmation: false,
  message: null,
};

let C = {};

C.charger = async function (numero) {
  M.stats = null;

  let data = await AdminData.me();
  M.adminEmail = data.email;

  if (M.adminEmail !== null) {
    M.stats = await StatsData.fetch();

    let result = await AdminCommandeData.fetchOne(numero);
    M.commande = result.commande;
  }
};

C.appliquerStatut = async function (statut) {
  try {
    let result = await AdminCommandeData.updateStatut([M.commande.numero], statut);

    if (result.modifiees === 1) {
      let data = await AdminCommandeData.fetchOne(M.commande.numero);
      M.commande = data.commande;
      M.message = { type: "succes", texte: "Statut mis à jour." };
    } else {
      M.message = { type: "erreur", texte: "Ce changement de statut n'est pas possible." };
    }
  } catch (erreur) {
    M.message = { type: "erreur", texte: erreur.message };
  }

  M.confirmation = false;
  V.rafraichir();
};

C.handler_marquerDisponible = async function () {
  await C.appliquerStatut("disponible");
};

C.handler_marquerRetiree = async function () {
  await C.appliquerStatut("retirée");
};

C.handler_demanderAnnulation = function () {
  M.confirmation = true;
  V.rafraichir();
};

C.handler_confirmerAnnulation = async function () {
  await C.appliquerStatut("annulée");
};

C.handler_refuserAnnulation = function () {
  M.confirmation = false;
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

C.init = async function (numero) {
  M.message = null;
  M.confirmation = false;
  M.commande = null;

  try {
    await C.charger(numero);
  } catch (erreur) {
    M.stats = null;
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
  let client = "";
  if (M.commande !== null) {
    client = M.commande.client;
  }

  let pageFragment = htmlToFragment(genericRenderer(template, { client: client }));

  pageFragment.querySelector('slot[name="message"]').replaceWith(MessageView.dom(M.message));

  if (M.stats === null || M.commande === null) {
    pageFragment.querySelector('slot[name="nav"]').remove();
    pageFragment.querySelector('slot[name="detail"]').remove();
    pageFragment.querySelector('slot[name="actions"]').remove();
    pageFragment.querySelector('slot[name="confirmation"]').remove();
    pageFragment.querySelector('slot[name="journal"]').remove();
    return pageFragment;
  }

  pageFragment.querySelector('slot[name="nav"]').replaceWith(
    AdminNavView.dom(M.stats, { logout: C.handler_deconnecter })
  );
  pageFragment.querySelector('slot[name="detail"]').replaceWith(DetailCommandeView.dom(M.commande));
  pageFragment.querySelector('slot[name="actions"]').replaceWith(
    ActionsCommandeView.dom(
      { statut: M.commande.statut },
      {
        disponible: C.handler_marquerDisponible,
        retiree: C.handler_marquerRetiree,
        annuler: C.handler_demanderAnnulation,
      }
    )
  );

  let confirmation = pageFragment.querySelector('slot[name="confirmation"]');
  if (M.confirmation) {
    confirmation.replaceWith(
      ConfirmationAnnulationView.dom(
        { titre: `Annuler la commande ${M.commande.numero} ?` },
        { confirm: C.handler_confirmerAnnulation, cancel: C.handler_refuserAnnulation }
      )
    );
  } else {
    confirmation.remove();
  }

  pageFragment.querySelector('slot[name="journal"]').replaceWith(JournalCommandesView.dom(M.commande.journal));

  return pageFragment;
};

export function AdminCommandePage(params) {
  return C.init(params.numero);
}
