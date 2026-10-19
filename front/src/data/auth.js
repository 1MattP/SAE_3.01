import { getRequest, postRequest } from "../lib/api-request.js";

let AuthData = {};

AuthData.register = async function (email, password) {
  return postRequest("register", { email, password });
};

AuthData.login = async function (email, password) {
  return postRequest("login", { email, password });
};

AuthData.logout = async function () {
  return postRequest("logout");
};

AuthData.me = async function () {
  return getRequest("me");
};

export { AuthData };
