import { genericRenderer, htmlToFragment } from "../../lib/utils.js";
import template from "./template.html?raw";
import templatePastille from "./pastille.html?raw";

let CouleursProduitView = {
  html: function () {
    return template;
  },

  dom: function (data, actions) {
    if (data.couleurs.length === 0) {
      return document.createDocumentFragment();
    }

    let fragment = htmlToFragment(CouleursProduitView.html());

    let pastilles = data.couleurs.map(function (couleur) {
      let pastille = htmlToFragment(genericRenderer(templatePastille, {
        code: couleur,
      }));

      let element = pastille.firstElementChild;
      element.setAttribute("aria-pressed", couleur === data.selection);
      element.addEventListener("click", function (ev) {
        actions.choose(ev.currentTarget.dataset.code);
      });

      return pastille;
    });
    fragment.querySelector('slot[name="couleurs"]').replaceWith(...pastilles);

    return fragment;
  },
};

export { CouleursProduitView };
