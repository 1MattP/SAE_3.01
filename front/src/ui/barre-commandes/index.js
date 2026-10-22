import { genericRenderer, htmlToFragment } from "../../lib/utils.js";
import template from "./template.html?raw";

let BarreCommandesView = {
  html: function (data) {
    return genericRenderer(template, { nombre: data.nombre });
  },

  dom: function (data, actions) {
    let fragment = htmlToFragment(BarreCommandesView.html(data));

    let tri = fragment.querySelector('select[name="tri"]');
    tri.value = data.tri;
    tri.addEventListener("change", function () {
      actions.tri(tri.value);
    });

    let boutons = ["disponible", "retiree", "annuler"];
    for (let nom of boutons) {
      let bouton = fragment.querySelector(`[data-action="${nom}"]`);
      bouton.disabled = data.nombre === 0;
      bouton.addEventListener("click", actions[nom]);
    }

    return fragment;
  },
};

export { BarreCommandesView };
