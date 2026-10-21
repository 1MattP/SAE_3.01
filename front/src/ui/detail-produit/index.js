import { genericRenderer, htmlToFragment } from "../../lib/utils.js";
import { formaterPrix, formaterImage } from "../../lib/format.js";
import { BadgeStockView } from "../badge-stock/index.js";
import { CouleursProduitView } from "../couleurs-produit/index.js";
import { OptionsProduitView } from "../options-produit/index.js";
import template from "./template.html?raw";
import templateMiniature from "./miniature.html?raw";

let DetailProduitView = {
  html: function (data) {
    return genericRenderer(template, {
      titre: data.titre,
      subtitle: data.subtitle,
      prix: formaterPrix(data.prix),
      categorie: data.categorie,
      categoryLink: "/categorie/" + data.categorie,
      description: data.description,
      mainImage: formaterImage(data.mainImage),
    });
  },

  dom: function (data, actions) {
    let fragment = htmlToFragment(DetailProduitView.html(data));
    let root = fragment.firstElementChild;

    let thumbnails = data.images.map(function (url) {
      return htmlToFragment(genericRenderer(templateMiniature, {
        url: url,
        image: formaterImage(url),
      }));
    });
    fragment.querySelector('slot[name="thumbnails"]').replaceWith(...thumbnails);
    fragment.querySelector('slot[name="couleurs"]').replaceWith(
      CouleursProduitView.dom({ couleurs: data.couleurs, selection: data.couleur }, { choose: actions.couleur })
    );
    fragment.querySelector('slot[name="options"]').replaceWith(
      OptionsProduitView.dom({ groupes: data.options, selection: data.selection }, { choose: actions.option })
    );
    fragment.querySelector('slot[name="stock"]').replaceWith(BadgeStockView.dom({ etat: data.etatStock }));

    root.querySelector('[data-action="addToCart"]').disabled = data.bloque;

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

export { DetailProduitView };
