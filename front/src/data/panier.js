let PanierData = {};

let CLE = import.meta.env.BASE_URL + "panier";

PanierData.load = function () {
  let saved = localStorage.getItem(CLE);

  if (saved === null) {
    return [];
  }

  let lines = JSON.parse(saved);

  for (let line of lines) {
    if (line.options === undefined) {
      line.options = [];
      line.optionsTexte = "";
    }
    if (line.couleur === undefined) {
      line.couleur = "";
    }
    line.cle = line.urlName + "|" + line.options.join(",") + "|" + line.couleur;
  }

  return lines;
};

PanierData.save = function (lines) {
  localStorage.setItem(CLE, JSON.stringify(lines));
};

PanierData.ajouter = function (nouvelles) {
  let lines = PanierData.load();
  let messages = [];

  for (let nouvelle of nouvelles) {
    let cle = nouvelle.urlName + "|" + nouvelle.options.join(",") + "|" + nouvelle.couleur;
    let line = lines.find(function (item) {
      return item.cle === cle;
    });

    if (line === undefined) {
      lines.push(nouvelle);
    } else {
      line.quantity += nouvelle.quantity;
      line.stock = nouvelle.stock;

      if (line.quantity > line.stock) {
        line.quantity = line.stock;
        messages.push(`${nouvelle.titre} : quantité limitée au stock disponible (${line.stock}).`);
      }
    }
  }

  PanierData.save(lines);

  return messages;
};

export { PanierData };
