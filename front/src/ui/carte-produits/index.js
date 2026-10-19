import { genericRenderer, htmlToFragment } from "../../lib/utils.js";
import { formaterPrix, formaterImage } from "../../lib/format.js";
import template from "./template.html?raw";
import templatePastille from "./pastille.html?raw";


let CarteProduitView = {
  html: function (produit) {

    return genericRenderer(template, {
      titre: produit.titre,
      lien: "/produit/" + produit.urlName,
      description: produit.description,
      prix: formaterPrix(produit.prix),
      image: formaterImage(produit.image),
    });
  },

  dom: function (produit) {
    let fragment = htmlToFragment(CarteProduitView.html(produit));

    let pastilles = produit.couleurs.split(",").map(function (couleur) {
      return htmlToFragment(genericRenderer(templatePastille, { couleur: couleur.trim() }));
    });
    fragment.querySelector('slot[name="couleurs"]').replaceWith(...pastilles);

    return fragment;
  },
};

export { CarteProduitView };


