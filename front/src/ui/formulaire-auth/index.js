import { genericRenderer, htmlToFragment } from "../../lib/utils.js";
import template from "./template.html?raw";

let FormulaireAuthView = {
  html: function (data) {
    return genericRenderer(template, data);
  },

  dom: function (data, actions) {
    let fragment = htmlToFragment(FormulaireAuthView.html(data));
    let form = fragment.querySelector("form");

    form.addEventListener("submit", function (ev) {
      ev.preventDefault();
      actions.submit(form.elements.email.value.trim(), form.elements.password.value);
    });

    return fragment;
  },
};

export { FormulaireAuthView };
