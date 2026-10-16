import { genericRenderer, htmlToFragment } from "../../lib/utils.js";
import template from "./template.html?raw";
import templateOnglet from "./onglet.html?raw";

let CategoriesView = {
  html: function (data) {
    return genericRenderer(template, data);
  },

  /**
   * @param {{categories: Array<{id: number, libelle: string, nombre: number}>}} data
   */
  dom: function (data) {
    let fragment = htmlToFragment(CategoriesView.html(data));

    let onglets = data.categories.map((categorie) => {
  
      let lien = "/";
      if (categorie.id !== 0) {
        lien = "/categorie/" + encodeURIComponent(categorie.libelle);
      }

      return htmlToFragment(genericRenderer(templateOnglet, {
        lien: lien,
        libelle: categorie.libelle,
        nombre: categorie.nombre,
      }));
    });

    fragment.querySelector('slot[name="onglets"]').replaceWith(...onglets);
    return fragment;
  },
};

export { CategoriesView };
