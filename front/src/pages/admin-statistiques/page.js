import { AdminData } from "../../data/admin.js";
import { StatistiquesData } from "../../data/statistiques.js";
import { StatsData } from "../../data/stats.js";
import { formaterDate, formaterPrix } from "../../lib/format.js";
import { htmlToFragment } from "../../lib/utils.js";
import { AdminNavView } from "../../ui/admin-nav/index.js";
import { AlertesStockView } from "../../ui/alertes-stock/index.js";
import { CartesStatistiquesView } from "../../ui/cartes-statistiques/index.js";
import { EnteteStatistiquesView } from "../../ui/entete-statistiques/index.js";
import { GraphiqueBarresView } from "../../ui/graphique-barres/index.js";
import { MessageView } from "../../ui/message/index.js";
import template from "./template.html?raw";


let M = {
  adminEmail: null,
  stats: null,
  donnees: null,
  cartes: [],
  stocks: [],
  revenus: [],
  vendus: [],
  message: null,
};

let C = {};

C.barres = function (valeurs) {
  let maximum = Math.max(...valeurs.map(function (item) {
    return item.nombre;
  }), 1);

  return valeurs.map(function (item) {
    return { libelle: item.libelle, valeur: item.texte, pourcentage: Math.round((item.nombre / maximum) * 100) };
  });
};

C.preparer = function () {
  let donnees = M.donnees;
  let revenuTotal = 0;

  for (let jour of donnees.revenus) {
    revenuTotal += jour.revenu;
  }

  M.cartes = [{ valeur: donnees.commandes.total, libelle: "commandes" }];
  for (let ligne of donnees.commandes.parStatut) {
    M.cartes.push({ valeur: ligne.nombre, libelle: ligne.statut });
  }
  M.cartes.push({ valeur: formaterPrix(revenuTotal), libelle: "revenus sur 7 jours" });

  M.stocks = C.barres(donnees.stocks.map(function (ligne) {
    return { libelle: ligne.produit, nombre: ligne.stock, texte: `${ligne.stock}` };
  }));

  M.revenus = C.barres(donnees.revenus.map(function (jour) {
    return { libelle: formaterDate(jour.jour), nombre: jour.revenu, texte: formaterPrix(jour.revenu) };
  }));

  M.vendus = C.barres(donnees.plusVendus.map(function (ligne) {
    return { libelle: ligne.produit, nombre: ligne.vendus, texte: `${ligne.vendus}` };
  }));
};

C.charger = async function () {
  M.stats = null;

  let data = await AdminData.me();
  M.adminEmail = data.email;

  if (M.adminEmail !== null) {
    M.stats = await StatsData.fetch();
    M.donnees = await StatistiquesData.fetch();
    C.preparer();
  }
};

C.handler_exporter = function () {
  let donnees = M.donnees;
  let lignes = [`Statistiques du ${new Date().toLocaleString("fr-FR")}`, ""];

  lignes.push("Stock par produit", "Produit;Stock");
  for (let ligne of donnees.stocks) {
    lignes.push(`${ligne.produit};${ligne.stock}`);
  }

  lignes.push("", `Stocks faibles (seuil : ${donnees.seuil})`, "Produit;Stock");
  for (let alerte of donnees.alertes) {
    lignes.push(`${alerte.produit};${alerte.stock}`);
  }

  lignes.push("", "Revenus des 7 derniers jours", "Jour;Revenu;Commandes");
  for (let jour of donnees.revenus) {
    lignes.push(`${jour.jour};${jour.revenu};${jour.commandes}`);
  }

  lignes.push("", "Commandes par statut", "Statut;Nombre");
  for (let ligne of donnees.commandes.parStatut) {
    lignes.push(`${ligne.statut};${ligne.nombre}`);
  }

  lignes.push("", "Produits les plus vendus", "Produit;Quantité vendue");
  for (let ligne of donnees.plusVendus) {
    lignes.push(`${ligne.produit};${ligne.vendus}`);
  }

  V.telecharger("statistiques.csv", lignes.join("\n"));
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
  M.donnees = null;

  try {
    await C.charger();
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

V.telecharger = function (nom, contenu) {
  let lien = document.createElement("a");

  lien.href = "data:text/csv;charset=utf-8,%EF%BB%BF" + contenu;
  lien.download = nom;
  lien.click();
};

V.createPageFragment = function () {
  let pageFragment = htmlToFragment(template);

  pageFragment.querySelector('slot[name="message"]').replaceWith(MessageView.dom(M.message));

  if (M.stats === null || M.donnees === null) {
    pageFragment.querySelector('slot[name="nav"]').remove();
    pageFragment.querySelector('slot[name="entete"]').remove();
    pageFragment.querySelector('slot[name="cartes"]').remove();
    pageFragment.querySelector('slot[name="alertes"]').remove();
    pageFragment.querySelector('slot[name="stocks"]').remove();
    pageFragment.querySelector('slot[name="revenus"]').remove();
    pageFragment.querySelector('slot[name="vendus"]').remove();
    return pageFragment;
  }

  pageFragment.querySelector('slot[name="nav"]').replaceWith(
    AdminNavView.dom(M.stats, { logout: C.handler_deconnecter })
  );
  pageFragment.querySelector('slot[name="entete"]').replaceWith(
    EnteteStatistiquesView.dom({ export: C.handler_exporter })
  );
  pageFragment.querySelector('slot[name="cartes"]').replaceWith(CartesStatistiquesView.dom(M.cartes));
  pageFragment.querySelector('slot[name="alertes"]').replaceWith(
    AlertesStockView.dom({
      titre: `Stocks faibles (${M.donnees.seuil} ou moins)`,
      alertes: M.donnees.alertes,
    })
  );
  pageFragment.querySelector('slot[name="stocks"]').replaceWith(
    GraphiqueBarresView.dom({ titre: "Stock par produit", lignes: M.stocks })
  );
  pageFragment.querySelector('slot[name="revenus"]').replaceWith(
    GraphiqueBarresView.dom({ titre: "Revenus des 7 derniers jours", lignes: M.revenus })
  );
  pageFragment.querySelector('slot[name="vendus"]').replaceWith(
    GraphiqueBarresView.dom({ titre: "Produits les plus vendus", lignes: M.vendus })
  );

  return pageFragment;
};

export function AdminStatistiquesPage() {
  return C.init();
}
