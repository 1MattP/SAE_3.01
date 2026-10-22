import { getRequest, postRequest } from "../lib/api-request.js";

let AdminCommandeData = {};

AdminCommandeData.fetchPage = async function (page, tri) {
  let uri = `admin/commandes?page=${page}`;

  if (tri !== null) {
    uri += `&tri=${tri}`;
  }

  return getRequest(uri);
};

AdminCommandeData.fetchOne = async function (numero) {
  return getRequest(`admin/commande?numero=${numero}`);
};

AdminCommandeData.updateStatut = async function (numeros, statut) {
  return postRequest("admin/commandes/statut", { numeros, statut });
};

export { AdminCommandeData };
