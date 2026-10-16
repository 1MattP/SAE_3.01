import { getRequest } from "../lib/api-request.js";

let ProduitData = {};


ProduitData.fetchPage = async function (page, reglages) {
  let uri = `produits?page=${page}`;

  if (reglages !== undefined) {
    if (reglages.categorie !== null) {
      uri += `&categorie=${reglages.categorie}`;
    }
  }


  return getRequest(uri);
};

export { ProduitData };
