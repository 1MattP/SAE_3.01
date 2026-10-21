let PanierData = {};

PanierData.load = function () {
  let saved = localStorage.getItem("panier");

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
  localStorage.setItem("panier", JSON.stringify(lines));
};

export { PanierData };
