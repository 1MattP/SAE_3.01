import { genericRenderer, htmlToFragment } from "../../lib/utils.js";
import template from "./template.html?raw";
import templateGroupe from "./groupe.html?raw";
import templateValeur from "./valeur.html?raw";

let OptionsProduitView = {
  html: function () {
    return template;
  },

  dom: function (data, actions) {
    let fragment = htmlToFragment(OptionsProduitView.html());

    let groupes = data.groupes.map(function (groupe, index) {
      let item = htmlToFragment(genericRenderer(templateGroupe, {
        nom: groupe.nom,
        index: index,
      }));

      let valeurs = groupe.valeurs.map(function (valeur) {
        let bouton = htmlToFragment(genericRenderer(templateValeur, {
          index: index,
          id: valeur.id,
          libelle: valeur.libelle,
        }));

        let element = bouton.firstElementChild;
        element.setAttribute("aria-pressed", `${valeur.id}` === data.selection[index]);
        element.disabled = valeur.disabled;
        element.addEventListener("click", function (ev) {
          actions.choose(ev.currentTarget.dataset.groupe, ev.currentTarget.dataset.valeur);
        });

        return bouton;
      });
      item.querySelector('slot[name="valeurs"]').replaceWith(...valeurs);

      return item;
    });
    fragment.querySelector('slot[name="groupes"]').replaceWith(...groupes);

    return fragment;
  },
};

export { OptionsProduitView };
