import { genericRenderer, htmlToFragment } from "../../lib/utils.js";
import { formaterPrix } from "../../lib/format.js";
import template from "./template.html?raw";
import templateLigne from "./ligne.html?raw";
import templateConfirmation from "./ligne-confirmation.html?raw";

let TableauCodesPromoView = {
  html: function () {
    return template;
  },

  dom: function (data, actions) {
    let fragment = htmlToFragment(TableauCodesPromoView.html());
    let root = fragment.firstElementChild;

    let lines = data.map(function (code) {
      let rowTemplate = templateLigne;
      if (code.confirming) {
        rowTemplate = templateConfirmation;
      }

      return htmlToFragment(genericRenderer(rowTemplate, {
        id: code.id,
        code: code.code,
        pourcentage: code.pourcentage,
        utilisations: code.utilisations,
        remises: formaterPrix(code.remises),
        lien: "/admin/codes-promo/" + code.id,
      }));
    });
    fragment.querySelector('slot[name="lines"]').replaceWith(...lines);

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

export { TableauCodesPromoView };
