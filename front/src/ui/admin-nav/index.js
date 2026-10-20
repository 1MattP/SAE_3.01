import { genericRenderer, htmlToFragment } from "../../lib/utils.js";
import template from "./template.html?raw";
import templateItem from "./item.html?raw";

let AdminNavView = {
  html: function () {
    return template;
  },

  dom: function (sections, actions) {
    let fragment = htmlToFragment(AdminNavView.html());

    let items = sections.map(function (section) {
      return htmlToFragment(genericRenderer(templateItem, { label: section }));
    });
    fragment.querySelector('slot[name="items"]').replaceWith(...items);

    fragment.querySelector('[data-action="logout"]').addEventListener("click", actions.logout);

    return fragment;
  },
};

export { AdminNavView };
