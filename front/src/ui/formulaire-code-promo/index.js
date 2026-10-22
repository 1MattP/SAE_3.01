import { genericRenderer, htmlToFragment } from "../../lib/utils.js";
import template from "./template.html?raw";

let FormulaireCodePromoView = {
  html: function (data) {
    return genericRenderer(template, {
      title: data.title,
      button: data.button,
      code: data.values.code,
      pourcentage: data.values.pourcentage,
    });
  },

  dom: function (data, actions) {
    let fragment = htmlToFragment(FormulaireCodePromoView.html(data));
    let form = fragment.querySelector("form");

    form.addEventListener("submit", function (ev) {
      ev.preventDefault();
      actions.submit({
        code: form.elements.code.value,
        pourcentage: form.elements.pourcentage.value,
      });
    });

    return fragment;
  },
};

export { FormulaireCodePromoView };
