import { postRequest } from "../lib/api-request.js";

let StockData = {};

StockData.verify = async function (lines) {
  return postRequest("panier/verifier", { lines });
};

StockData.adjust = async function (lines) {
  let adjusted = [];
  let messages = [];

  if (lines.length === 0) {
    return { lines: adjusted, messages: messages };
  }

  let items = lines.map(function (line) {
    return { urlName: line.urlName, quantity: line.quantity };
  });
  let data = await StockData.verify(items);

  for (let i = 0; i < lines.length; i++) {
    let result = data.lines[i];

    if (result.quantity === 0) {
      messages.push(`${lines[i].titre} a été retiré de votre panier (épuisé).`);
    } else {
      if (result.quantity < lines[i].quantity) {
        messages.push(`La quantité de ${lines[i].titre} a été ramenée à ${result.quantity} (stock disponible).`);
      }
      lines[i].quantity = result.quantity;
      lines[i].stock = result.stock;
      adjusted.push(lines[i]);
    }
  }

  return { lines: adjusted, messages: messages };
};

export { StockData };
