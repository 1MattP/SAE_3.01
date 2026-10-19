import { genericRenderer, htmlToFragment } from "../../lib/utils.js";
import { formaterPrix, formaterImage } from "../../lib/format.js";
import template from "./template.html?raw";
import templateLigne from "./ligne.html?raw";
import templateVide from "./vide.html?raw";

let PanierView = {
  html: function () {
    return template;
  },

  dom: function (lines, actions) {
    let fragment = htmlToFragment(PanierView.html());
    let root = fragment.firstElementChild;

    let items = [htmlToFragment(templateVide)];

    if (lines.length > 0) {
      items = lines.map(function (line) {
        let item = htmlToFragment(genericRenderer(templateLigne, {
          urlName: line.urlName,
          link: "/produit/" + line.urlName,
          titre: line.titre,
          image: formaterImage(line.image),
          prix: formaterPrix(line.prix),
          quantity: line.quantity,
          total: formaterPrix(line.total),
        }));
        item.querySelector('[data-action="minus"]').disabled = line.quantity === 1;
        item.querySelector('[data-action="plus"]').disabled = !line.canIncrease;
        return item;
      });
    }

    fragment.querySelector('slot[name="lines"]').replaceWith(...items);

    root.addEventListener("click", function (ev) {
      let button = ev.target.closest("[data-action]");
      if (button === null) {
        return;
      }
      let action = actions[button.dataset.action];
      if (action !== undefined) {
        action(ev);
      }
    });

    return fragment;
  },
};

export { PanierView };
