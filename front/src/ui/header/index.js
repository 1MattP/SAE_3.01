import { genericRenderer, htmlToFragment } from "../../lib/utils.js";
import { surChangementPanier } from "../../lib/compteur-panier.js";
import { basculerTheme } from "../../lib/theme.js";
import template from "./template.html?raw";


let HeaderView = {
  html: function (data) {
    let count = "";
    if (data.count > 0) {
      count = data.count;
    }

    return genericRenderer(template, { count: count });
  },


  dom: function (data) {
    let fragment = htmlToFragment(HeaderView.html(data));
    let badge = fragment.querySelector("[data-compteur]");

    fragment.querySelector('[data-action="theme"]').addEventListener("click", basculerTheme);

    surChangementPanier(function (total) {
      badge.textContent = total > 0 ? total : "";
    });

    return fragment;
  },
};

export { HeaderView };
