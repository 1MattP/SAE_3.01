import { genericRenderer, htmlToFragment } from "../../lib/utils.js";
import template from "./template.html?raw";

let ConfirmationAnnulationView = {
  html: function (data) {
    return genericRenderer(template, { titre: data.titre });
  },

  dom: function (data, actions) {
    let fragment = htmlToFragment(ConfirmationAnnulationView.html(data));

    fragment.querySelector('[data-action="confirm"]').addEventListener("click", actions.confirm);
    fragment.querySelector('[data-action="cancel"]').addEventListener("click", actions.cancel);

    return fragment;
  },
};

export { ConfirmationAnnulationView };
