import { genericRenderer, htmlToFragment } from "../../lib/utils.js";
import template from "./template.html?raw";

let CompteConnecteView = {
  html: function (data) {
    return genericRenderer(template, data);
  },

  dom: function (data, actions) {
    let fragment = htmlToFragment(CompteConnecteView.html(data));

    fragment.querySelector('[data-action="logout"]').addEventListener("click", actions.logout);

    return fragment;
  },
};

export { CompteConnecteView };
