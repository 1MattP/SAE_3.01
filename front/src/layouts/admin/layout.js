import { PanierData } from "../../data/panier.js";
import { htmlToFragment } from "../../lib/utils.js";
import { HeaderView } from "../../ui/header/index.js";
import template from "./template.html?raw";

export function AdminLayout() {
  let layout = htmlToFragment(template);

  let count = 0;
  for (let line of PanierData.load()) {
    count += line.quantity;
  }

  layout.querySelector('slot[name="header"]').replaceWith(HeaderView.dom({ count: count }));
  return layout;
}
