export function formaterPrix(prix) {
  return Number(prix).toFixed(2).replace(".", ",") + " €";
}

