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

ProduitData.fetchOne = async function (urlName) {
  return getRequest(`produit?urlName=${urlName}`);
};

export { ProduitData };
