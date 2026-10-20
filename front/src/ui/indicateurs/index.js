import { genericRenderer, htmlToFragment } from "../../lib/utils.js";
import template from "./template.html?raw";
import templateCarte from "./carte.html?raw";

let IndicateursView = {
  html: function () {
    return template;
  },

  dom: function (indicators) {
    let fragment = htmlToFragment(IndicateursView.html());

    let cards = indicators.map(function (indicator) {
      return htmlToFragment(genericRenderer(templateCarte, {
        label: indicator.label,
        value: indicator.value,
      }));
    });
    fragment.querySelector('slot[name="cards"]').replaceWith(...cards);

    return fragment;
  },
};

export { IndicateursView };
