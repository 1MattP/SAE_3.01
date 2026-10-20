import { genericRenderer, htmlToFragment } from "../../lib/utils.js";
import template from "./template.html?raw";
import templateItem from "./item.html?raw";
import templateItemInactif from "./item-inactif.html?raw";

let AdminNavView = {
  html: function () {
    return template;
  },

  dom: function (stats, actions) {
    let fragment = htmlToFragment(AdminNavView.html());

    let items = [
      htmlToFragment(genericRenderer(templateItem, { lien: "/admin/produits", label: "Produits", count: `(${stats.produits})` })),
      htmlToFragment(genericRenderer(templateItemInactif, { label: "Commandes", count: `(${stats.commandes})` })),
      htmlToFragment(genericRenderer(templateItemInactif, { label: "Catégories", count: `(${stats.categories})` })),
      htmlToFragment(genericRenderer(templateItemInactif, { label: "Statistiques", count: "" })),
    ];
    fragment.querySelector('slot[name="items"]').replaceWith(...items);

    fragment.querySelector('[data-action="logout"]').addEventListener("click", actions.logout);

    return fragment;
  },
};

export { AdminNavView };
