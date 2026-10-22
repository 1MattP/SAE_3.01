import { genericRenderer, htmlToFragment } from "../../lib/utils.js";
import template from "./template.html?raw";
import templateLigne from "./ligne.html?raw";
import templateVide from "./vide.html?raw";

let AlertesStockView = {
  html: function (data) {
    return genericRenderer(template, { titre: data.titre });
  },

  dom: function (data) {
    let fragment = htmlToFragment(AlertesStockView.html(data));

    let lines = [htmlToFragment(templateVide)];

    if (data.alertes.length > 0) {
      lines = data.alertes.map(function (alerte) {
        let etat = `Stock : ${alerte.stock}`;
        if (alerte.stock === 0) {
          etat = "Épuisé";
        }

        return htmlToFragment(genericRenderer(templateLigne, {
          produit: alerte.produit,
          etat: etat,
        }));
      });
    }
    fragment.querySelector('slot[name="lines"]').replaceWith(...lines);

    return fragment;
  },
};

export { AlertesStockView };
