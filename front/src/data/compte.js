import { getRequest, postRequest } from "../lib/api-request.js";

let CompteData = {};

CompteData.fetch = async function () {
  return getRequest("compte");
};

CompteData.saveProfil = async function (nom, email) {
  return postRequest("compte/profil", { nom, email });
};

CompteData.savePassword = async function (actuel, nouveau) {
  return postRequest("compte/mot-de-passe", { actuel, nouveau });
};

export { CompteData };
