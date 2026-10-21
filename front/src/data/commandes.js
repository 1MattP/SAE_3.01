import { getRequest, postRequest } from "../lib/api-request.js";

let CommandesData = {};

CommandesData.create = async function (lines) {
  return postRequest("commandes", { lines });
};

CommandesData.fetchPage = async function (page, filtres) {
  let uri = `commandes?page=${page}`;

  if (filtres !== null) {
    uri += `&statut=${filtres.statut}&du=${filtres.du}&au=${filtres.au}`;
  }

  return getRequest(uri);
};

CommandesData.fetchOne = async function (numero) {
  return getRequest(`commande?numero=${numero}`);
};

export { CommandesData };
