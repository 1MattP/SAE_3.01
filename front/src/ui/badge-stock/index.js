import { genericRenderer, htmlToFragment } from "../../lib/utils.js";
import template from "./template.html?raw";

let ETATS = {
  en_stock: {
    libelle: "En stock",
    classes: "border-border-active bg-background-default text-text-primary",
  },
  bientot_epuise: {
    libelle: "Bientôt épuisé",
    classes: "border-border-active bg-background-inverse text-text-inverse",
  },
  epuise: {
    libelle: "Épuisé",
    classes: "border-border-default bg-surface-disabled text-text-disabled line-through",
  },
};

let BadgeStockView = {
  html: function (data) {
    return genericRenderer(template, ETATS[data.etat]);
  },

  dom: function (data) {
    return htmlToFragment(BadgeStockView.html(data));
  },
};

export { BadgeStockView };
