import { genericRenderer, htmlToFragment } from "../../lib/utils.js";
import template from "./template.html?raw";
import templateItem from "./item.html?raw";

let CompteNavView = {
  html: function () {
    return template;
  },

  dom: function (actions) {
    let fragment = htmlToFragment(CompteNavView.html());

    let items = [
      htmlToFragment(genericRenderer(templateItem, { lien: "/compte", label: "Aperçu" })),
      htmlToFragment(genericRenderer(templateItem, { lien: "/compte/commandes", label: "Mes commandes" })),
      htmlToFragment(genericRenderer(templateItem, { lien: "/compte/profil", label: "Mon profil" })),
    ];
    fragment.querySelector('slot[name="items"]').replaceWith(...items);

    fragment.querySelector('[data-action="logout"]').addEventListener("click", actions.logout);

    return fragment;
  },
};

export { CompteNavView };
