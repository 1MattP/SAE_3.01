import { ProduitData } from "../../data/produits.js";
import { htmlToFragment } from "../../lib/utils.js";
import { GrilleProduitView } from "../../ui/grille-produit/index.js";
import { MessageView } from "../../ui/message/index.js";
import { PaginationView } from "../../ui/pagination/index.js";
import template from "./template.html?raw";

/**
 * Page « Catalogue ».
 */

let M = {
  catalogue: null, // dernière réponse de l'API : produits et pagination
  message: null, // { type, texte }, ou null
};

let C = {};

/**
 * Demande une page du catalogue et range la réponse dans le modèle.
 */
C.charger = async function (page) {
  try {
    M.catalogue = await ProduitData.fetchPage(page);
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

C.init = async function () {
  await C.charger(1);
  return V.init();
};

let V = {};

V.racine = null; // élément racine de la page affichée

V.init = function () {
  let fragment = V.createPageFragment();
  V.racine = fragment.firstElementChild;
  return fragment;
};

/**
 * Reconstruit toute la page à partir du modèle, et remplace l'ancienne.
 * C'est le principe des frameworks : l'affichage se déduit de l'état, on ne le
 * retouche pas morceau par morceau.
 */
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
    // Rien à afficher : on retire les emplacements restants.
    for (let slot of pageFragment.querySelectorAll("slot")) {
      slot.remove();
    }
    return pageFragment;
  }

  pageFragment.querySelector('slot[name="grille"]').replaceWith(GrilleProduitView.dom(M.catalogue.produits));

  pageFragment.querySelector('slot[name="pagination"]').replaceWith(
    PaginationView.dom(M.catalogue, { surPage: C.handler_changerPage })
  );

  return pageFragment;
};

export function CataloguePage() {
  return C.init();
}
