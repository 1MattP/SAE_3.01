import { getRequest, postRequest } from "../lib/api-request.js";

let AdminCategorieData = {};

AdminCategorieData.fetchAll = async function () {
  return getRequest("admin/categories");
};

AdminCategorieData.fetchOne = async function (id) {
  return getRequest(`admin/categorie?id=${id}`);
};

AdminCategorieData.create = async function (categorie) {
  return postRequest("admin/categories", categorie);
};

AdminCategorieData.update = async function (categorie) {
  return postRequest("admin/categories/modifier", categorie);
};

AdminCategorieData.remove = async function (id) {
  return postRequest("admin/categories/supprimer", { id });
};

export { AdminCategorieData };
