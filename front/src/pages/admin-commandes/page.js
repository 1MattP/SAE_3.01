import { AdminData } from "../../data/admin.js";
import { AdminCommandeData } from "../../data/admin-commandes.js";
import { StatsData } from "../../data/stats.js";
import { htmlToFragment } from "../../lib/utils.js";
import { AdminNavView } from "../../ui/admin-nav/index.js";
import { BarreCommandesView } from "../../ui/barre-commandes/index.js";
import { ConfirmationAnnulationView } from "../../ui/confirmation-annulation/index.js";
import { JournalCommandesView } from "../../ui/journal-commandes/index.js";
import { MessageView } from "../../ui/message/index.js";
import { PaginationView } from "../../ui/pagination/index.js";
import { TableauCommandesView } from "../../ui/tableau-commandes/index.js";
import template from "./template.html?raw";


let M = {
  adminEmail: null,
  stats: null,
  liste: null,
  tri: null,
  selection: [],
  confirmation: false,
  message: null,
};

let C = {};

C.charger = async function (page) {
  M.stats = null;

  let data = await AdminData.me();
  M.adminEmail = data.email;

  if (M.adminEmail !== null) {
    M.stats = await StatsData.fetch();
    M.liste = await AdminCommandeData.fetchPage(page, M.tri);
    M.tri = M.liste.tri;
  }
};

C.rechargerListe = async function (page) {
  M.liste = await AdminCommandeData.fetchPage(page, M.tri);
  M.tri = M.liste.tri;
  M.selection = [];
  M.confirmation = false;
};

C.handler_changerTri = async function (tri) {
  M.tri = tri;

  try {
    await C.rechargerListe(1);
    M.message = null;
  } catch (erreur) {
    M.message = { type: "erreur", texte: erreur.message };
  }

  V.rafraichir();
};

C.handler_changerPage = async function (page) {
  try {
    await C.rechargerListe(page);
    M.message = null;
  } catch (erreur) {
    M.message = { type: "erreur", texte: erreur.message };
  }

  V.rafraichir();
};

C.handler_basculerSelection = function (ev) {
  let numero = ev.target.dataset.numero;

  if (ev.target.checked) {
    M.selection.push(numero);
  } else {
    M.selection = M.selection.filter(function (item) {
      return item !== numero;
    });
  }

  M.confirmation = false;
  V.rafraichir();
};

C.handler_basculerTout = function (ev) {
  M.selection = [];

  if (ev.target.checked) {
    M.selection = M.liste.commandes.map(function (commande) {
      return commande.numero;
    });
  }

  M.confirmation = false;
  V.rafraichir();
};

C.appliquerStatut = async function (statut) {
  try {
    let result = await AdminCommandeData.updateStatut(M.selection, statut);
    await C.rechargerListe(M.liste.page);
    M.stats = await StatsData.fetch();

    M.message = { type: "succes", texte: `${result.modifiees} commande(s) mise(s) à jour.` };
    if (result.ignorees.length > 0) {
      M.message = {
        type: "erreur",
        texte: `${result.modifiees} commande(s) mise(s) à jour. Non modifiées (statut incompatible) : ${result.ignorees.join(", ")}.`,
      };
    }
  } catch (erreur) {
    M.message = { type: "erreur", texte: erreur.message };
  }

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

C.init = async function () {
  M.message = null;
  M.selection = [];
  M.confirmation = false;
  M.tri = null;

  try {
    await C.charger(1);
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
  let pageFragment = htmlToFragment(template);

  pageFragment.querySelector('slot[name="message"]').replaceWith(MessageView.dom(M.message));

  if (M.stats === null || M.liste === null) {
    pageFragment.querySelector('slot[name="nav"]').remove();
    pageFragment.querySelector('slot[name="barre"]').remove();
    pageFragment.querySelector('slot[name="confirmation"]').remove();
    pageFragment.querySelector('slot[name="liste"]').remove();
    pageFragment.querySelector('slot[name="pagination"]').remove();
    pageFragment.querySelector('slot[name="journal"]').remove();
    return pageFragment;
  }

  pageFragment.querySelector('slot[name="nav"]').replaceWith(
    AdminNavView.dom(M.stats, { logout: C.handler_deconnecter })
  );
  pageFragment.querySelector('slot[name="barre"]').replaceWith(
    BarreCommandesView.dom(
      { tri: M.tri, nombre: M.selection.length },
      {
        tri: C.handler_changerTri,
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
        { titre: `Annuler ${M.selection.length} commande(s) ?` },
        { confirm: C.handler_confirmerAnnulation, cancel: C.handler_refuserAnnulation }
      )
    );
  } else {
    confirmation.remove();
  }

  pageFragment.querySelector('slot[name="liste"]').replaceWith(
    TableauCommandesView.dom(
      { commandes: M.liste.commandes, selection: M.selection },
      { toggle: C.handler_basculerSelection, toggleAll: C.handler_basculerTout }
    )
  );
  pageFragment.querySelector('slot[name="pagination"]').replaceWith(
    PaginationView.dom(M.liste, { surPage: C.handler_changerPage })
  );
  pageFragment.querySelector('slot[name="journal"]').replaceWith(JournalCommandesView.dom(M.liste.journal));

  return pageFragment;
};

export function AdminCommandesPage() {
  return C.init();
}
