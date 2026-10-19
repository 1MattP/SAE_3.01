import { genericRenderer, htmlToFragment } from "../../lib/utils.js";
import { formaterPrix } from "../../lib/format.js";
import template from "./template.html?raw";

let RecapitulatifView = {
  html: function (data) {
    return genericRenderer(template, {
      subtotal: formaterPrix(data.subtotal),
      shipping: formaterPrix(data.shipping),
      total: formaterPrix(data.total),
    });
  },

  dom: function (data, actions) {
    let fragment = htmlToFragment(RecapitulatifView.html(data));
    let validate = fragment.querySelector('[data-action="validate"]');

    validate.disabled = data.total === 0;
    validate.addEventListener("click", actions.validate);

    return fragment;
  },
};

export { RecapitulatifView };
