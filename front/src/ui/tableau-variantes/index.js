import { genericRenderer, htmlToFragment } from "../../lib/utils.js";
import { PastilleCouleurView } from "../pastille-couleur/index.js";
import template from "./template.html?raw";
import templateLigne from "./ligne.html?raw";

let TableauVariantesView = {
  html: function () {
    return template;
  },

  dom: function (data, actions) {
    let fragment = htmlToFragment(TableauVariantesView.html());
    let form = fragment.querySelector("form");

    let lines = data.map(function (variante) {
      let line = htmlToFragment(genericRenderer(templateLigne, {
        id: variante.id,
        libelle: variante.libelle,
        stock: variante.stock,
      }));

      let slot = line.querySelector('slot[name="couleur"]');
      if (variante.couleur === "") {
        slot.remove();
      } else {
        slot.replaceWith(PastilleCouleurView.dom({ couleur: variante.couleur }));
      }

      return line;
    });
    fragment.querySelector('slot[name="lines"]').replaceWith(...lines);

    form.addEventListener("submit", function (ev) {
      ev.preventDefault();

      let stocks = [];
      for (let input of form.querySelectorAll("input[data-id]")) {
        stocks.push({ id: input.dataset.id, stock: input.value });
      }

      actions.submit(stocks);
    });

    return fragment;
  },
};

export { TableauVariantesView };
