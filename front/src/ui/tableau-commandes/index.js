import { genericRenderer, htmlToFragment } from "../../lib/utils.js";
import { formaterDate, formaterPrix } from "../../lib/format.js";
import template from "./template.html?raw";
import templateLigne from "./ligne.html?raw";

let TableauCommandesView = {
  html: function () {
    return template;
  },

  dom: function (data, actions) {
    let fragment = htmlToFragment(TableauCommandesView.html());

    let toutes = fragment.querySelector('[data-action="toggleAll"]');
    toutes.checked = data.commandes.length > 0 && data.selection.length === data.commandes.length;
    toutes.addEventListener("change", actions.toggleAll);

    let lines = data.commandes.map(function (commande) {
      let line = htmlToFragment(genericRenderer(templateLigne, {
        numero: commande.numero,
        lien: "/admin/commandes/" + commande.numero,
        client: commande.client,
        date: formaterDate(commande.date),
        articles: commande.articles,
        statut: commande.statut,
        total: formaterPrix(commande.total),
      }));

      let case_ = line.querySelector('[data-action="toggle"]');
      case_.checked = data.selection.includes(commande.numero);
      case_.addEventListener("change", actions.toggle);

      return line;
    });
    fragment.querySelector('slot[name="lines"]').replaceWith(...lines);

    return fragment;
  },
};

export { TableauCommandesView };
