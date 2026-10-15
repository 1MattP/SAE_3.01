import { getRequest } from "../lib/api-request.js";

let ProduitData = {};

/**
 * Une page du catalogue : GET /api/films?page=…
 *
 * reglages ({ tri, parPage }) n'est fourni qu'après un choix de l'utilisateur.
 * Sans lui, le serveur applique les préférences qu'il a mémorisées.
 *
 * La réponse contient les films et les réglages réellement appliqués :
 * { films, tri, parPage, page, pagesTotal, total }
 */
ProduitData.fetchPage = async function (page) {
  let uri = `produits?page=${page}`;

  return getRequest(uri);
};

export { ProduitData };
