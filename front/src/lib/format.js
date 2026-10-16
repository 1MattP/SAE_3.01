export function formaterPrix(prix) {
  return Number(prix).toFixed(2).replace(".", ",") + " €";
}


export function formaterImage(image) {
  return import.meta.env.BASE_URL + image;
}

