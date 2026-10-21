import { genericRenderer, htmlToFragment } from "../../lib/utils.js";
import { formaterDate } from "../../lib/format.js";
import template from "./template.html?raw";

let InfosCompteView = {
  html: function (data) {
    return genericRenderer(template, {
      nom: data.nom,
      email: data.email,
      depuis: formaterDate(data.dateCreation),
    });
  },

  dom: function (data) {
    return htmlToFragment(InfosCompteView.html(data));
  },
};

export { InfosCompteView };
