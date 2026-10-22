import { genericRenderer, htmlToFragment } from "../../lib/utils.js";
import template from "./template.html?raw";
import templateLigne from "./ligne.html?raw";
import templateVide from "./vide.html?raw";

let GraphiqueBarresView = {
  html: function (data) {
    return genericRenderer(template, { titre: data.titre });
  },

  dom: function (data) {
    let fragment = htmlToFragment(GraphiqueBarresView.html(data));

    let lines = [htmlToFragment(templateVide)];

    if (data.lignes.length > 0) {
      lines = data.lignes.map(function (ligne) {
        return htmlToFragment(genericRenderer(templateLigne, {
          libelle: ligne.libelle,
          valeur: ligne.valeur,
          pourcentage: ligne.pourcentage,
        }));
      });
    }
    fragment.querySelector('slot[name="lines"]').replaceWith(...lines);

    return fragment;
  },
};

export { GraphiqueBarresView };
