import { genericRenderer, htmlToFragment } from "../../lib/utils.js";
import template from "./template.html?raw";
import { CouleursProduitView } from "../couleurs-produit/index.js";
import { OptionsProduitView } from "../options-produit/index.js";

let EditionOptionsView = {
  html: function (data) {
    return genericRenderer(template, { cle: data.cle });
  },

  dom: function (data, actions) {
    let fragment = htmlToFragment(EditionOptionsView.html(data));

    fragment.querySelector('slot[name="couleurs"]').replaceWith(
      CouleursProduitView.dom(
        { couleurs: data.couleurs, selection: data.couleur },
        { choose: actions.color }
      )
    );
    fragment.querySelector('slot[name="options"]').replaceWith(
      OptionsProduitView.dom(
        { groupes: data.options, selection: data.selection },
        { choose: actions.option }
      )
    );

    return fragment;
  },
};

export { EditionOptionsView };
