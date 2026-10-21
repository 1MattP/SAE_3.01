import { genericRenderer, htmlToFragment } from "../../lib/utils.js";
import { formaterPrix, formaterImage } from "../../lib/format.js";
import template from "./template.html?raw";
import templateLigne from "./ligne.html?raw";
import templatePastille from "./pastille.html?raw";

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
      let item = htmlToFragment(genericRenderer(templateLigne, {
        titre: line.titre,
        options: line.options,
        image: formaterImage(line.image),
        quantity: line.quantity,
        prix: formaterPrix(line.prix),
        total: formaterPrix(line.total),
      }));

      let slot = item.querySelector('slot[name="couleur"]');
      if (line.couleur === "") {
        slot.remove();
      } else {
        slot.replaceWith(htmlToFragment(genericRenderer(templatePastille, { couleur: line.couleur })));
      }

      return item;
    });
    fragment.querySelector('slot[name="lines"]').replaceWith(...lines);

    return fragment;
  },
};

export { LignesCommandeView };
