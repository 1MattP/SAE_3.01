import { genericRenderer, htmlToFragment } from "../../lib/utils.js";
import template from "./template.html?raw";
import templatePage from "./page.html?raw";
import templateEllipse from "./ellipse.html?raw";

// Navigation entre les pages : précédente, numéros (1 … 3 4 5 … 6) et suivante.
let PaginationView = {
  html: function () {
    return template;
  },

  /**
   * @param {{page: number, pagesTotal: number}} data
   * @param {{surPage: (page: number) => void}} actions
   */
  dom: function (data, actions) {
    let fragment = htmlToFragment(PaginationView.html());
    let precedente = fragment.querySelector('[data-action="precedente"]');
    let suivante = fragment.querySelector('[data-action="suivante"]');

    precedente.disabled = data.page <= 1;
    suivante.disabled = data.page >= data.pagesTotal;

    precedente.addEventListener("click", function () {
      actions.surPage(data.page - 1);
    });
    suivante.addEventListener("click", function () {
      actions.surPage(data.page + 1);
    });

    let debut = Math.max(1, Math.min(data.page - 1, data.pagesTotal - 2));
    let fin = Math.min(data.pagesTotal, debut + 2);

    let numeros = [];
    if (debut > 1) {
      numeros.push(1);
    }
    for (let numero = debut; numero <= fin; numero++) {
      numeros.push(numero);
    }
    if (fin < data.pagesTotal) {
      numeros.push(data.pagesTotal);
    }

    let items = [];
    for (let i = 0; i < numeros.length; i++) {
      if (i > 0 && numeros[i] - numeros[i - 1] > 1) {
        items.push(htmlToFragment(templateEllipse));
      }

      let cible = numeros[i];
      let item = htmlToFragment(genericRenderer(templatePage, { page: cible }));
      let bouton = item.firstElementChild;

      if (cible === data.page) {
        bouton.classList.add("bg-background-inverse", "text-text-inverse", "border-background-inverse", "hover:bg-background-inverse");
        bouton.setAttribute("aria-current", "page");
      }

      bouton.addEventListener("click", function () {
        actions.surPage(cible);
      });

      items.push(item);
    }
    fragment.querySelector('slot[name="pages"]').replaceWith(...items);

    return fragment;
  },
};

export { PaginationView };
