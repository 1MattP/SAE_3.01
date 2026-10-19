import { PanierData } from "../../data/panier.js";
import { htmlToFragment } from "../../lib/utils.js";
import { PanierView } from "../../ui/panier/index.js";
import { RecapitulatifView } from "../../ui/recapitulatif/index.js";
import template from "./template.html?raw";


let M = {
  lines: [],
};

M.load = function () {
  M.lines = PanierData.load();
};

M.changeQuantity = function (urlName, step) {
  let line = M.lines.find(function (item) {
    return item.urlName === urlName;
  });

  if (line.quantity + step > 0) {
    line.quantity += step;
    PanierData.save(M.lines);
  }
};

M.remove = function (urlName) {
  M.lines = M.lines.filter(function (item) {
    return item.urlName !== urlName;
  });
  PanierData.save(M.lines);
};

M.getPage = function () {
  let sum = 0;

  let lines = M.lines.map(function (line) {
    let lineTotal = line.prix * line.quantity;
    sum += lineTotal;
    return {
      urlName: line.urlName,
      titre: line.titre,
      prix: line.prix,
      image: line.image,
      quantity: line.quantity,
      total: lineTotal,
    };
  });

  return { lines: lines, subtotal: sum, shipping: 0, total: sum };
};


let C = {};

C.handler_clickOnPlus = function (ev) {
  M.changeQuantity(ev.target.dataset.urlName, 1);
  V.rafraichir(M.getPage());
};

C.handler_clickOnMinus = function (ev) {
  M.changeQuantity(ev.target.dataset.urlName, -1);
  V.rafraichir(M.getPage());
};

C.handler_clickOnDelete = function (ev) {
  M.remove(ev.target.dataset.urlName);
  V.rafraichir(M.getPage());
};

C.handler_clickOnValidate = function (ev) {
  V.redirect("validation");
};

C.init = function () {
  M.load();
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

  pageFragment.querySelector('slot[name="panier"]').replaceWith(
    PanierView.dom(data.lines, {
      plus: C.handler_clickOnPlus,
      minus: C.handler_clickOnMinus,
      delete: C.handler_clickOnDelete,
    })
  );

  pageFragment.querySelector('slot[name="recapitulatif"]').replaceWith(
    RecapitulatifView.dom(data, { validate: C.handler_clickOnValidate })
  );

  return pageFragment;
};

export function PanierPage() {
  return C.init();
}
