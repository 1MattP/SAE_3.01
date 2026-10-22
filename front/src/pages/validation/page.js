import { AuthData } from "../../data/auth.js";
import { CodePromoData } from "../../data/codes-promo.js";
import { CommandesData } from "../../data/commandes.js";
import { PanierData } from "../../data/panier.js";
import { StockData } from "../../data/stocks.js";
import { htmlToFragment } from "../../lib/utils.js";
import { CarteCommandeView } from "../../ui/carte-commande/index.js";
import { LignesCommandeView } from "../../ui/lignes-commande/index.js";
import { MessageView } from "../../ui/message/index.js";
import template from "./template.html?raw";


let M = {
  lines: [],
  images: [],
  connectedEmail: null,
  order: null,
  message: null,
  lignes: [],
  sousTotal: 0,
  reduction: 0,
  codePromo: null,
  codeSaisi: "",
  erreurCode: null,
  total: 0,
  numero: "",
  bouton: "",
};

let C = {};

C.synchroniser = async function () {
  let result = await StockData.adjust(M.lines);

  M.lines = result.lines;
  PanierData.save(M.lines);

  return result.messages;
};


C.charger = async function () {
  M.order = null;
  M.message = null;
  M.connectedEmail = null;

  try {
    let data = await AuthData.me();
    M.connectedEmail = data.email;
    M.lines = PanierData.load();

    let messages = await C.synchroniser();
    if (messages.length > 0) {
      M.message = { type: "erreur", texte: messages.join(" ") };
    }
  } catch (erreur) {
    M.message = { type: "erreur", texte: `Impossible de vérifier votre session ou votre panier : ${erreur.message}` };
    C.preparer();
    return false;
  }

  C.preparer();
  return true;
};

C.preparer = function () {
  if (M.order !== null) {
    M.lignes = M.order.lignes.map(function (line, index) {
      return { titre: line.titre, options: line.options, couleur: line.couleur, image: M.images[index], prix: line.prix, quantity: line.quantite, total: line.total };
    });
    M.reduction = M.order.remise;
    M.sousTotal = M.order.total + M.order.remise;
    M.total = M.order.total;
    M.numero = M.order.numero;
    M.bouton = "";
    return;
  }

  let sum = 0;
  M.lignes = M.lines.map(function (line) {
    let lineTotal = line.prix * line.quantity;
    sum += lineTotal;
    return { titre: line.titre, options: line.optionsTexte, couleur: line.couleur, image: line.image, prix: line.prix, prixBarre: line.prixBarre, quantity: line.quantity, total: lineTotal };
  });
  M.sousTotal = sum;
  M.reduction = 0;
  if (M.codePromo !== null) {
    M.reduction = Math.round(sum * M.codePromo.pourcentage) / 100;
  }
  M.total = Math.round((sum - M.reduction) * 100) / 100;
  M.numero = "";

  M.bouton = "";
  if (M.connectedEmail !== null && M.lignes.length > 0) {
    M.bouton = "Confirmer ma commande";
  }

  if (M.message === null && M.lignes.length === 0) {
    M.message = { type: "erreur", texte: "Votre panier est vide." };
  }
};


C.expliquerRefus = async function (texte) {
  try {
    let messages = await C.synchroniser();
    messages.unshift(texte);
    return messages.join(" ");
  } catch (erreur) {
    return texte;
  }
};

C.handler_appliquerCode = async function (code) {
  M.codeSaisi = code;
  M.erreurCode = null;

  try {
    M.codePromo = await CodePromoData.verify(code);
    M.codeSaisi = M.codePromo.code;
  } catch (erreur) {
    M.codePromo = null;
    M.erreurCode = erreur.message;
  }

  C.preparer();
  V.rafraichir();
};

C.handler_retirerCode = function () {
  M.codePromo = null;
  M.codeSaisi = "";
  M.erreurCode = null;

  C.preparer();
  V.rafraichir();
};

C.handler_confirmerCommande = async function () {
  let items = M.lines.map(function (line) {
    return { urlName: line.urlName, quantity: line.quantity, options: line.options, couleur: line.couleur };
  });

  try {
    let code = "";
    if (M.codePromo !== null) {
      code = M.codePromo.code;
    }

    let data = await CommandesData.create(items, code);

    M.order = data.commande;
    M.images = M.lines.map(function (line) {
      return line.image;
    });
    M.lines = [];
    PanierData.save([]);
    M.message = null;
  } catch (erreur) {
    M.message = { type: "erreur", texte: erreur.message };

    if (erreur.statut === 409) {
      M.message.texte = await C.expliquerRefus(erreur.message);
    }
  }

  C.preparer();
  V.rafraichir();
};

C.init = async function () {
  M.codePromo = null;
  M.codeSaisi = "";
  M.erreurCode = null;

  let verifie = await C.charger();

  if (verifie && M.connectedEmail === null) {
    V.redirect("connexion");
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

  if (M.lignes.length === 0) {
    pageFragment.querySelector('slot[name="lignes"]').remove();
    pageFragment.querySelector('slot[name="carte"]').remove();
    return pageFragment;
  }

  let codePromo = null;
  if (M.bouton !== "") {
    codePromo = { code: null, saisie: M.codeSaisi, erreur: M.erreurCode, remise: M.reduction };
    if (M.codePromo !== null) {
      codePromo.code = M.codePromo.code;
    }
  }

  let data = {
    lines: M.lignes,
    subtotal: M.sousTotal,
    reduction: M.reduction,
    code: M.codePromo === null ? "" : M.codePromo.code,
    shipping: 0,
    total: M.total,
    codePromo: codePromo,
    numero: M.numero,
    button: M.bouton,
  };

  pageFragment.querySelector('slot[name="lignes"]').replaceWith(LignesCommandeView.dom(data, { apply: C.handler_appliquerCode, remove: C.handler_retirerCode }));
  pageFragment.querySelector('slot[name="carte"]').replaceWith(
    CarteCommandeView.dom(data, { confirm: C.handler_confirmerCommande })
  );

  return pageFragment;
};

export function ValidationPage() {
  return C.init();
}
