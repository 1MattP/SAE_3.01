export function formaterPrix(prix) {
  return Number(prix).toFixed(2).replace(".", ",") + " €";
}


export function formaterImage(image) {
  return import.meta.env.BASE_URL + image;
}


export function formaterDate(date) {
  return new Date(date.replace(" ", "T")).toLocaleDateString("fr-FR");
}
