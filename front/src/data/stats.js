import { getRequest } from "../lib/api-request.js";

let StatsData = {};

StatsData.fetch = async function () {
  return getRequest("admin/stats");
};

export { StatsData };
