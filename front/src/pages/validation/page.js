import { AuthData } from "../../data/auth.js";
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
  connectedEmail: null,
  images: [],
  order: null,
  message: null,
};

M.sync = async function () {
  let result = await StockData.adjust(M.lines);

  M.lines = result.lines;
  PanierData.save(M.lines);

  return result.messages;
};

M.load = async function () {
  let data = await AuthData.me();
  M.connectedEmail = data.email;
  M.lines = PanierData.load();

  let messages = await M.sync();
  if (messages.length > 0) {
    M.message = { type: "erreur", texte: messages.join(" ") };
  }
};

M.confirm = async function () {
  let items = M.lines.map(function (line) {
    return { urlName: line.urlName, quantity: line.quantity };
  });

  let data = null;

  try {
    data = await CommandesData.create(items);
  } catch (erreur) {
    if (erreur.statut === 409) {
      let messages = await M.sync();
      messages.unshift(erreur.message);
      throw new Error(messages.join(" "));
    }
    throw erreur;
  }

  M.order = data.commande;
  M.images = M.lines.map(function (line) {
    return line.image;
  });
  M.lines = [];
  PanierData.save([]);
};

M.getPage = function () {
  if (M.order !== null) {
    return {
      message: null,
      lines: M.order.lignes.map(function (line, index) {
        return { titre: line.titre, image: M.images[index], prix: line.prix, quantity: line.quantite, total: line.total };
      }),
      subtotal: M.order.total,
      shipping: 0,
      total: M.order.total,
      numero: M.order.numero,
      button: "",
    };
  }

  let sum = 0;
  let lines = M.lines.map(function (line) {
    let lineTotal = line.prix * line.quantity;
    sum += lineTotal;
    return { titre: line.titre, image: line.image, prix: line.prix, quantity: line.quantity, total: lineTotal };
  });

  let message = M.message;
  if (message === null && lines.length === 0) {
    message = { type: "erreur", texte: "Votre panier est vide." };
  }

  let button = "";
  if (M.connectedEmail !== null && lines.length > 0) {
    button = "Confirmer ma commande";
  }

  return {
    message: message,
    lines: lines,
    subtotal: sum,
    shipping: 0,
    total: sum,
    numero: "",
    button: button,
  };
};


let C = {};

C.handler_clickOnConfirm = async function () {
  try {
    await M.confirm();
    M.message = null;
  } catch (erreur) {
    M.message = { type: "erreur", texte: erreur.message };
  }

  V.rafraichir(M.getPage());
};

C.init = async function () {
  M.order = null;
  M.message = null;

  try {
    await M.load();
  } catch (erreur) {
    M.message = { type: "erreur", texte: `Impossible de vérifier votre session ou votre panier : ${erreur.message}` };
    return V.init(M.getPage());
  }

  if (M.connectedEmail === null) {
    V.redirect("connexion");
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

V.redirect = function (path) {
  window.location.assign(import.meta.env.BASE_URL + path);
};

V.createPageFragment = function (data) {
  let pageFragment = htmlToFragment(template);

  pageFragment.querySelector('slot[name="message"]').replaceWith(MessageView.dom(data.message));

  if (data.lines.length === 0) {
    pageFragment.querySelector('slot[name="lignes"]').remove();
    pageFragment.querySelector('slot[name="carte"]').remove();
    return pageFragment;
  }

  pageFragment.querySelector('slot[name="lignes"]').replaceWith(LignesCommandeView.dom(data));
  pageFragment.querySelector('slot[name="carte"]').replaceWith(
    CarteCommandeView.dom(data, { confirm: C.handler_clickOnConfirm })
  );

  return pageFragment;
};

export function ValidationPage() {
  return C.init();
}
