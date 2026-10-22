import { genericRenderer, htmlToFragment } from "../../lib/utils.js";
import { formaterDate, formaterPrix } from "../../lib/format.js";
import { PastilleCouleurView } from "../pastille-couleur/index.js";
import template from "./template.html?raw";
import templateLigne from "./ligne.html?raw";

let DetailCommandeView = {
  html: function (data) {
    return genericRenderer(template, {
      numero: data.numero,
      date: formaterDate(data.date),
      statut: data.statut,
      total: formaterPrix(data.total),
      libelleReduction: data.code === "" ? "Réduction" : `Code promo ${data.code}`,
      reduction: formaterPrix(data.remise),
    });
  },

  dom: function (data, actions) {
    let fragment = htmlToFragment(DetailCommandeView.html(data));

    if (data.remise === 0) {
      fragment.querySelector("[data-reduction]").remove();
    }

    let lines = data.lignes.map(function (ligne) {
      let item = htmlToFragment(genericRenderer(templateLigne, {
        titre: ligne.titre,
        options: ligne.options,
        quantite: ligne.quantite,
        prix: formaterPrix(ligne.prix),
        total: formaterPrix(ligne.total),
      }));

      let slot = item.querySelector('slot[name="couleur"]');
      if (ligne.couleur === "") {
        slot.remove();
      } else {
        slot.replaceWith(PastilleCouleurView.dom({ couleur: ligne.couleur }));
      }

      return item;
    });
    fragment.querySelector('slot[name="lines"]').replaceWith(...lines);

    let bouton = fragment.querySelector('[data-action="reorder"]');
    if (actions === undefined) {
      bouton.remove();
    } else {
      bouton.addEventListener("click", actions.reorder);
    }

    return fragment;
  },
};

export { DetailCommandeView };
