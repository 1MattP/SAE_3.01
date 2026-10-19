import { genericRenderer, htmlToFragment } from "../../lib/utils.js";
import template from "./template.html?raw";


let HeaderView = {
  html: function (data) {
    let count = "";
    if (data.count > 0) {
      count = data.count;
    }

    return genericRenderer(template, { count: count });
  },


  dom: function (data) {
    return htmlToFragment(HeaderView.html(data));
  },
};

export { HeaderView };
