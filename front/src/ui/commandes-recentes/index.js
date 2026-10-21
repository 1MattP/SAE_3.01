import { genericRenderer, htmlToFragment } from "../../lib/utils.js";
import { formaterDate, formaterPrix } from "../../lib/format.js";
import template from "./template.html?raw";
import templateLigne from "./ligne.html?raw";
import templateVide from "./vide.html?raw";

let CommandesRecentesView = {
  html: function () {
    return template;
  },

  dom: function (commandes) {
    let fragment = htmlToFragment(CommandesRecentesView.html());

    let lines = [htmlToFragment(templateVide)];

    if (commandes.length > 0) {
      lines = commandes.map(function (commande) {
        return htmlToFragment(genericRenderer(templateLigne, {
          numero: commande.numero,
          date: formaterDate(commande.date),
          articles: commande.articles,
          statut: commande.statut,
          total: formaterPrix(commande.total),
        }));
      });
    }
    fragment.querySelector('slot[name="lines"]').replaceWith(...lines);

    return fragment;
  },
};

export { CommandesRecentesView };
