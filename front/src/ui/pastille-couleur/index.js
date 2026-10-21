import { genericRenderer, htmlToFragment } from "../../lib/utils.js";
import template from "./template.html?raw";

let PastilleCouleurView = {
  html: function (data) {
    return genericRenderer(template, { couleur: data.couleur });
  },

  dom: function (data) {
    return htmlToFragment(PastilleCouleurView.html(data));
  },
};

export { PastilleCouleurView };
