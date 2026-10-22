import { genericRenderer, htmlToFragment } from "../../lib/utils.js";
import template from "./template.html?raw";
import templateCarte from "./carte.html?raw";

let CartesStatistiquesView = {
  html: function () {
    return template;
  },

  dom: function (cartes) {
    let fragment = htmlToFragment(CartesStatistiquesView.html());

    let items = cartes.map(function (carte) {
      return htmlToFragment(genericRenderer(templateCarte, { valeur: carte.valeur, libelle: carte.libelle }));
    });
    fragment.querySelector('slot[name="cartes"]').replaceWith(...items);

    return fragment;
  },
};

export { CartesStatistiquesView };
