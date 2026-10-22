import { genericRenderer, htmlToFragment } from "../../lib/utils.js";
import template from "./template.html?raw";
import iconeErreur from "./icone-erreur.html?raw";
import iconeSucces from "./icone-succes.html?raw";


let MessageView = {
  html: function (data) {
    if (data === null) {
      return "";
    }

    let icone = iconeErreur;
    if (data.type === "succes") {
      icone = iconeSucces;
    }

    return genericRenderer(template, { texte: data.texte }).replace('<slot name="icone"></slot>', icone);
  },

  dom: function (data) {
    return htmlToFragment(MessageView.html(data));
  },
};

export { MessageView };
