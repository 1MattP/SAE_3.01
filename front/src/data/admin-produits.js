import { getRequest, postRequest } from "../lib/api-request.js";

let AdminProduitData = {};

AdminProduitData.fetchAll = async function () {
  return getRequest("admin/produits");
};

AdminProduitData.fetchOne = async function (id) {
  return getRequest(`admin/produit?id=${id}`);
};

AdminProduitData.create = async function (produit) {
  return postRequest("admin/produits", produit);
};

AdminProduitData.update = async function (produit) {
  return postRequest("admin/produits/modifier", produit);
};

AdminProduitData.saveStocks = async function (id, stocks) {
  return postRequest("admin/produits/stocks", { id, stocks });
};

AdminProduitData.remove = async function (id) {
  return postRequest("admin/produits/supprimer", { id });
};

export { AdminProduitData };
