import { genericRenderer, htmlToFragment } from "../../lib/utils.js";
import { formaterPrix, formaterImage } from "../../lib/format.js";
import template from "./template.html?raw";
import { BadgeStockView } from "../badge-stock/index.js";
import templatePastille from "./pastille.html?raw";


let CarteProduitView = {
  html: function (produit) {

    return genericRenderer(template, {
      titre: produit.titre,
      lien: "/produit/" + produit.urlName,
      description: produit.description,
      prix: formaterPrix(produit.prixPromo ?? produit.prix),
      prixBarre: produit.prixPromo === null ? "" : formaterPrix(produit.prix),
      image: formaterImage(produit.image),
    });
  },

  dom: function (produit) {
    let fragment = htmlToFragment(CarteProduitView.html(produit));

    let pastilles = produit.couleurs.split(",").map(function (couleur) {
      return htmlToFragment(genericRenderer(templatePastille, { couleur: couleur.trim() }));
    });
    fragment.querySelector('slot[name="couleurs"]').replaceWith(...pastilles);
    fragment.querySelector('slot[name="stock"]').replaceWith(BadgeStockView.dom({ etat: produit.etatStock }));

    return fragment;
  },
};

export { CarteProduitView };


