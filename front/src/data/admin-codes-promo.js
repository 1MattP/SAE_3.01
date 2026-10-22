import { getRequest, postRequest } from "../lib/api-request.js";

let AdminCodePromoData = {};

AdminCodePromoData.fetchAll = async function () {
  return getRequest("admin/codes-promo");
};

AdminCodePromoData.fetchOne = async function (id) {
  return getRequest(`admin/code-promo?id=${id}`);
};

AdminCodePromoData.create = async function (code) {
  return postRequest("admin/codes-promo", code);
};

AdminCodePromoData.update = async function (code) {
  return postRequest("admin/codes-promo/modifier", code);
};

AdminCodePromoData.remove = async function (id) {
  return postRequest("admin/codes-promo/supprimer", { id });
};

export { AdminCodePromoData };
