import { htmlToFragment } from "../../lib/utils.js";
import template from "./template.html?raw";

let ActionsCommandeView = {
  html: function () {
    return template;
  },

  dom: function (data, actions) {
    let fragment = htmlToFragment(ActionsCommandeView.html());

    let disponible = fragment.querySelector('[data-action="disponible"]');
    let retiree = fragment.querySelector('[data-action="retiree"]');
    let annuler = fragment.querySelector('[data-action="annuler"]');

    if (data.statut !== "en cours") {
      disponible.remove();
    }
    if (data.statut !== "disponible") {
      retiree.remove();
    }
    if (data.statut === "retirée" || data.statut === "annulée") {
      annuler.remove();
    }

    disponible?.addEventListener("click", actions.disponible);
    retiree?.addEventListener("click", actions.retiree);
    annuler?.addEventListener("click", actions.annuler);

    return fragment;
  },
};

export { ActionsCommandeView };
