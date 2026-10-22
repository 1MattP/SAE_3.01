import { postRequest } from "../lib/api-request.js";

let CodePromoData = {};

CodePromoData.verify = async function (code) {
  return postRequest("codes-promo/verifier", { code });
};

export { CodePromoData };
