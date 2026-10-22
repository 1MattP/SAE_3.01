import { genericRenderer, htmlToFragment } from "../../lib/utils.js";
import { formaterPrix } from "../../lib/format.js";
import template from "./template.html?raw";
import templateStatut from "./statut.html?raw";

let CodePromoView = {
  html: function (data) {
    return genericRenderer(template, { saisie: data.saisie });
  },

  dom: function (data, actions) {
    let fragment = htmlToFragment(CodePromoView.html(data));
    let form = fragment.querySelector("form");
    let slot = fragment.querySelector('slot[name="statut"]');

    if (data.code !== null) {
      let statut = htmlToFragment(genericRenderer(templateStatut, {
        texte: "Code accepté · Remise appliquée",
        montant: `-${formaterPrix(data.remise)}`,
      }));
      statut.firstElementChild.classList.add("text-green-700", "dark:text-green-400");
      statut.querySelector('[data-action="remove"]').addEventListener("click", actions.remove);
      slot.replaceWith(statut);
    } else if (data.erreur !== null) {
      let statut = htmlToFragment(genericRenderer(templateStatut, { texte: data.erreur, montant: "" }));
      statut.firstElementChild.classList.add("text-red-700", "dark:text-red-400");
      statut.querySelector('[data-action="remove"]').remove();
      slot.replaceWith(statut);
    } else {
      slot.remove();
    }

    form.addEventListener("submit", function (ev) {
      ev.preventDefault();
      actions.apply(form.elements.code.value.trim());
    });

    return fragment;
  },
};

export { CodePromoView };
