import { genericRenderer, htmlToFragment } from "../../lib/utils.js";
import template from "./template.html?raw";

let FormulaireCategorieView = {
  html: function (data) {
    return genericRenderer(template, {
      title: data.title,
      button: data.button,
      libelle: data.values.libelle,
      description: data.values.description,
    });
  },

  dom: function (data, actions) {
    let fragment = htmlToFragment(FormulaireCategorieView.html(data));
    let form = fragment.querySelector("form");

    form.addEventListener("submit", function (ev) {
      ev.preventDefault();
      actions.submit({
        libelle: form.elements.libelle.value,
        description: form.elements.description.value,
      });
    });

    return fragment;
  },
};

export { FormulaireCategorieView };
