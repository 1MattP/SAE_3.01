import { ProduitData } from "../../data/produits.js";
import { htmlToFragment } from "../../lib/utils.js";
import { CategoriesView } from "../../ui/categories/index.js";
import { GrilleProduitView } from "../../ui/grille-produit/index.js";
import { MessageView } from "../../ui/message/index.js";
import { PaginationView } from "../../ui/pagination/index.js";
import template from "./template.html?raw";


let M = {
  catalogue: null, 
  categories: [], 
  categorie: null, 
  message: null, 
};

let C = {};


C.charger = async function (page) {
  try {
    M.catalogue = await ProduitData.fetchPage(page, { categorie: M.categorie });
    M.categories = M.catalogue.categories;
    M.message = null;
  } catch (erreur) {
    M.catalogue = null;
    M.message = { type: "erreur", texte: `Impossible de charger le catalogue : ${erreur.message}` };
  }
};


C.handler_changerPage = async function (page) {
  await C.charger(page);
  V.rafraichir();
  window.scrollTo({ top: 0, behavior: "smooth" });
};

C.init = async function (params) {
  M.categorie = null;
  if (params.nom !== undefined) {
    M.categorie = params.nom;
  }

  await C.charger(1);
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

  if (M.catalogue === null) {

    for (let slot of pageFragment.querySelectorAll("slot")) {
      slot.remove();
    }
    return pageFragment;
  }

  pageFragment.querySelector('slot[name="categorie"]').replaceWith(
    CategoriesView.dom({ categories: M.categories })
  );

  pageFragment.querySelector('slot[name="grille"]').replaceWith(GrilleProduitView.dom(M.catalogue.produits));

  pageFragment.querySelector('slot[name="pagination"]').replaceWith(
    PaginationView.dom(M.catalogue, { surPage: C.handler_changerPage })
  );

  return pageFragment;
};

export function CataloguePage(params) {
  return C.init(params);
}
