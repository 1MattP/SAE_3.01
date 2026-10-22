import { getRequest } from "../lib/api-request.js";

let StatistiquesData = {};

StatistiquesData.fetch = async function () {
  return getRequest("admin/statistiques");
};

export { StatistiquesData };
