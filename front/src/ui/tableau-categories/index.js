import { genericRenderer, htmlToFragment } from "../../lib/utils.js";
import template from "./template.html?raw";
import templateLigne from "./ligne.html?raw";
import templateConfirmation from "./ligne-confirmation.html?raw";

let TableauCategoriesView = {
  html: function () {
    return template;
  },

  dom: function (data, actions) {
    let fragment = htmlToFragment(TableauCategoriesView.html());
    let root = fragment.firstElementChild;

    let lines = data.map(function (categorie) {
      let rowTemplate = templateLigne;
      if (categorie.confirming) {
        rowTemplate = templateConfirmation;
      }

      return htmlToFragment(genericRenderer(rowTemplate, {
        id: categorie.id,
        libelle: categorie.libelle,
        description: categorie.description,
        nombre: categorie.nombre,
        lien: "/admin/categories/" + categorie.id,
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

export { TableauCategoriesView };
