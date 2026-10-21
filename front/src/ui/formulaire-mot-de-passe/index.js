import { htmlToFragment } from "../../lib/utils.js";
import template from "./template.html?raw";

let FormulaireMotDePasseView = {
  html: function () {
    return template;
  },

  dom: function (actions) {
    let fragment = htmlToFragment(FormulaireMotDePasseView.html());
    let form = fragment.querySelector("form");

    form.addEventListener("submit", function (ev) {
      ev.preventDefault();
      actions.submit(form.elements.actuel.value, form.elements.nouveau.value, form.elements.confirmation.value);
    });

    return fragment;
  },
};

export { FormulaireMotDePasseView };
