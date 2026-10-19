import { postRequest } from "../lib/api-request.js";

let CommandesData = {};

CommandesData.create = async function (lines) {
  return postRequest("commandes", { lines });
};

export { CommandesData };
