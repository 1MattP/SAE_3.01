import { genericRenderer, htmlToFragment } from "../../lib/utils.js";
import { formaterDateHeure } from "../../lib/format.js";
import template from "./template.html?raw";
import templateLigne from "./ligne.html?raw";
import templateVide from "./vide.html?raw";

let JournalCommandesView = {
  html: function () {
    return template;
  },

  dom: function (entrees) {
    let fragment = htmlToFragment(JournalCommandesView.html());

    let lines = [htmlToFragment(templateVide)];

    if (entrees.length > 0) {
      lines = entrees.map(function (entree) {
        return htmlToFragment(genericRenderer(templateLigne, {
          numero: entree.numero,
          ancien: entree.ancien,
          nouveau: entree.nouveau,
          date: formaterDateHeure(entree.date),
          administrateur: entree.administrateur,
        }));
      });
    }
    fragment.querySelector('slot[name="lines"]').replaceWith(...lines);

    return fragment;
  },
};

export { JournalCommandesView };
