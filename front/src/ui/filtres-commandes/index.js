import { genericRenderer, htmlToFragment } from "../../lib/utils.js";
import template from "./template.html?raw";

let FiltresCommandesView = {
  html: function (data) {
    return genericRenderer(template, { du: data.du, au: data.au });
  },

  dom: function (data, actions) {
    let fragment = htmlToFragment(FiltresCommandesView.html(data));
    let form = fragment.querySelector("form");

    form.elements.statut.value = data.statut;

    form.addEventListener("submit", function (ev) {
      ev.preventDefault();
    });

    form.addEventListener("change", function () {
      actions.submit(form.elements.statut.value, form.elements.du.value, form.elements.au.value);
    });

    return fragment;
  },
};

export { FiltresCommandesView };
