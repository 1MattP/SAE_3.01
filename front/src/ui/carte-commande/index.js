import { genericRenderer, htmlToFragment } from "../../lib/utils.js";
import template from "./template.html?raw";
import templateConfirmer from "./confirmer.html?raw";

let CarteCommandeView = {
  html: function (data) {
    if (data.numero === "") {
      return genericRenderer(templateConfirmer, { button: data.button });
    }

    return genericRenderer(template, { numero: data.numero });
  },

  dom: function (data, actions) {
    let fragment = htmlToFragment(CarteCommandeView.html(data));

    if (data.numero === "") {
      fragment.querySelector('[data-action="confirm"]').addEventListener("click", actions.confirm);
    }

    return fragment;
  },
};

export { CarteCommandeView };
