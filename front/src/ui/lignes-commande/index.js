import { genericRenderer, htmlToFragment } from "../../lib/utils.js";
import { formaterPrix, formaterImage } from "../../lib/format.js";
import template from "./template.html?raw";
import templateLigne from "./ligne.html?raw";

let LignesCommandeView = {
  html: function (data) {
    return genericRenderer(template, {
      subtotal: formaterPrix(data.subtotal),
      shipping: formaterPrix(data.shipping),
      total: formaterPrix(data.total),
    });
  },

  dom: function (data) {
    let fragment = htmlToFragment(LignesCommandeView.html(data));

    let lines = data.lines.map(function (line) {
      return htmlToFragment(genericRenderer(templateLigne, {
        titre: line.titre,
        image: formaterImage(line.image),
        quantity: line.quantity,
        prix: formaterPrix(line.prix),
        total: formaterPrix(line.total),
      }));
    });
    fragment.querySelector('slot[name="lines"]').replaceWith(...lines);

    return fragment;
  },
};

export { LignesCommandeView };
