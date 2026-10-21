import { PanierData } from "../../data/panier.js";
import { StockData } from "../../data/stocks.js";
import { htmlToFragment } from "../../lib/utils.js";
import { MessageView } from "../../ui/message/index.js";
import { PanierView } from "../../ui/panier/index.js";
import { RecapitulatifView } from "../../ui/recapitulatif/index.js";
import template from "./template.html?raw";


let M = {
  lines: [],
  subtotal: 0,
  shipping: 0,
  total: 0,
  message: null,
};

let C = {};

C.charger = function () {
  M.lines = PanierData.load();
};

C.enregistrer = function () {
  PanierData.save(M.lines.map(function (line) {
    return {
      urlName: line.urlName,
      titre: line.titre,
      prix: line.prix,
      options: line.options,
      couleur: line.couleur,
      optionsTexte: line.optionsTexte,
      image: line.image,
      quantity: line.quantity,
      stock: line.stock,
    };
  }));
};

C.calculer = function () {
  let sum = 0;

  for (let line of M.lines) {
    line.total = line.prix * line.quantity;
    line.canIncrease = line.quantity < line.stock;
    sum += line.total;
  }

  M.subtotal = sum;
  M.total = sum;
};

C.synchroniser = async function () {
  M.message = null;

  try {
    let result = await StockData.adjust(M.lines);

    M.lines = result.lines;
    C.enregistrer();

    if (result.messages.length > 0) {
      M.message = { type: "erreur", texte: result.messages.join(" ") };
    }
  } catch (erreur) {
    M.message = { type: "erreur", texte: erreur.message };
  }

  C.calculer();
};

C.handler_augmenterQuantite = async function (ev) {
  let line = M.lines.find(function (item) {
    return item.cle === ev.target.dataset.cle;
  });

  line.quantity += 1;
  C.enregistrer();

  await C.synchroniser();
  V.rafraichir();
};

C.handler_diminuerQuantite = function (ev) {
  let line = M.lines.find(function (item) {
    return item.cle === ev.target.dataset.cle;
  });

  if (line.quantity > 1) {
    line.quantity -= 1;
  }

  M.message = null;
  C.enregistrer();
  C.calculer();
  V.rafraichir();
};

C.handler_supprimerLigne = function (ev) {
  M.lines = M.lines.filter(function (item) {
    return item.cle !== ev.target.dataset.cle;
  });

  M.message = null;
  C.enregistrer();
  C.calculer();
  V.rafraichir();
};

C.handler_validerPanier = function () {
  V.redirect("validation");
};

C.init = async function () {
  C.charger();
  await C.synchroniser();
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

  pageFragment.querySelector('slot[name="panier"]').replaceWith(
    PanierView.dom(M.lines, {
      plus: C.handler_augmenterQuantite,
      minus: C.handler_diminuerQuantite,
      delete: C.handler_supprimerLigne,
    })
  );

  pageFragment.querySelector('slot[name="recapitulatif"]').replaceWith(
    RecapitulatifView.dom(
      { subtotal: M.subtotal, shipping: M.shipping, total: M.total },
      { validate: C.handler_validerPanier }
    )
  );

  return pageFragment;
};

export function PanierPage() {
  return C.init();
}
