import { getRequest, postRequest } from "../lib/api-request.js";

let AdminData = {};

AdminData.login = async function (email, password) {
  return postRequest("admin/login", { email, password });
};

AdminData.logout = async function () {
  return postRequest("admin/logout");
};

AdminData.me = async function () {
  return getRequest("admin/me");
};

export { AdminData };
