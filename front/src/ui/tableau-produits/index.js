import { genericRenderer, htmlToFragment } from "../../lib/utils.js";
import { formaterPrix, formaterImage } from "../../lib/format.js";
import template from "./template.html?raw";
import templateLigne from "./ligne.html?raw";
import templateConfirmation from "./ligne-confirmation.html?raw";

let TableauProduitsView = {
  html: function () {
    return template;
  },

  dom: function (data, actions) {
    let fragment = htmlToFragment(TableauProduitsView.html());
    let root = fragment.firstElementChild;

    let lines = data.map(function (produit) {
      let rowTemplate = templateLigne;
      if (produit.confirming) {
        rowTemplate = templateConfirmation;
      }

      return htmlToFragment(genericRenderer(rowTemplate, {
        id: produit.id,
        titre: produit.titre,
        lien: "/admin/produits/" + produit.id,
        categorie: produit.categorie,
        prix: formaterPrix(produit.prix),
        stock: produit.stock,
        image: formaterImage(produit.image),
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

export { TableauProduitsView };
