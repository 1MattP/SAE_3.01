import { genericRenderer, htmlToFragment } from "../../lib/utils.js";
import { formaterPrix } from "../../lib/format.js";
import template from "./template.html?raw";
import templatePastille from "./pastille.html?raw";


let CarteProduitView = {
  html: function (produit) {
    // Les valeurs sont mises en forme avant d'être passées au template.
    return genericRenderer(template, {
      titre: produit.titre,
      description: produit.description,
      prix: formaterPrix(produit.prix),
      image: CarteProduitView.adresseImage(produit.image),
    });
  },

  dom: function (produit) {
    let fragment = htmlToFragment(CarteProduitView.html(produit));

    let pastilles = produit.couleurs
      .split(",")
      .map((couleur) => htmlToFragment(genericRenderer(templatePastille, { couleur: couleur.trim() })));
    fragment.querySelector('slot[name="couleurs"]').replaceWith(...pastilles);

    return fragment;
  },

  adresseImage: function (image) {
    if (!image) {
      return "";
    }

    if (/^https?:\/\//.test(image)) {
      return image;
    }

    return import.meta.env.BASE_URL + image.replace(/^\//, "");
  },
};

export { CarteProduitView };


