import { genericRenderer, htmlToFragment } from "../../lib/utils.js";
import template from "./template.html?raw";
import templateOption from "./option.html?raw";

let FormulaireProduitView = {
  html: function (data) {
    return genericRenderer(template, {
      title: data.title,
      button: data.button,
      titre: data.values.titre,
      urlName: data.values.urlName,
      description: data.values.description,
      descriptionLongue: data.values.descriptionLongue,
      prix: data.values.prix,
      stock: data.values.stock,
      couleurs: data.values.couleurs,
      image: data.values.image,
    });
  },

  dom: function (data, actions) {
    let fragment = htmlToFragment(FormulaireProduitView.html(data));
    let form = fragment.querySelector("form");

    let options = data.categories.map(function (categorie) {
      let selected = "";
      if (`${categorie.id}` === `${data.values.categorieId}`) {
        selected = "selected";
      }

      return htmlToFragment(genericRenderer(templateOption, {
        id: categorie.id,
        libelle: categorie.libelle,
        selected: selected,
      }));
    });
    fragment.querySelector('slot[name="categories"]').replaceWith(...options);

    form.addEventListener("submit", function (ev) {
      ev.preventDefault();
      actions.submit({
        titre: form.elements.titre.value,
        urlName: form.elements.urlName.value,
        description: form.elements.description.value,
        descriptionLongue: form.elements.descriptionLongue.value,
        prix: form.elements.prix.value,
        stock: form.elements.stock.value,
        categorieId: form.elements.categorieId.value,
        couleurs: form.elements.couleurs.value,
        image: form.elements.image.value,
      });
    });

    return fragment;
  },
};

export { FormulaireProduitView };
