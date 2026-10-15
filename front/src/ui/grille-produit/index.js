import { htmlToFragment } from "../../lib/utils.js";
import { CarteProduitView } from "../carte-produits/index.js";
import template from "./template.html?raw";
import templateVide from "./vide.html?raw";


let GrilleProduitView = {
  dom: function (produits) {
    if (produits.length === 0) {
      return htmlToFragment(templateVide);
    }

    let fragment = htmlToFragment(template);
    let cartes = produits.map((produit) => CarteProduitView.dom(produit));
    fragment.querySelector('slot[name="cartes"]').replaceWith(...cartes);
    return fragment;
  },
};

export { GrilleProduitView };
