let PanierData = {};

PanierData.load = function () {
  let saved = localStorage.getItem("panier");

  if (saved === null) {
    return [];
  }

  return JSON.parse(saved);
};

PanierData.save = function (lines) {
  localStorage.setItem("panier", JSON.stringify(lines));
};

export { PanierData };
