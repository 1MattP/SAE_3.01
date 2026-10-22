import { htmlToFragment } from "../../lib/utils.js";
import template from "./template.html?raw";

let EnteteStatistiquesView = {
  html: function () {
    return template;
  },

  dom: function (actions) {
    let fragment = htmlToFragment(EnteteStatistiquesView.html());

    fragment.querySelector('[data-action="export"]').addEventListener("click", actions.export);

    return fragment;
  },
};

export { EnteteStatistiquesView };
