import { genericRenderer, htmlToFragment } from "../../lib/utils.js";
import template from "./template.html?raw";

let FormulaireProfilView = {
  html: function (data) {
    return genericRenderer(template, { nom: data.nom, email: data.email });
  },

  dom: function (data, actions) {
    let fragment = htmlToFragment(FormulaireProfilView.html(data));
    let form = fragment.querySelector("form");

    form.addEventListener("submit", function (ev) {
      ev.preventDefault();
      actions.submit(form.elements.nom.value.trim(), form.elements.email.value.trim());
    });

    return fragment;
  },
};

export { FormulaireProfilView };
