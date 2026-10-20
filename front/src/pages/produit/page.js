import { ProduitData } from "../../data/produits.js";
import { PanierData } from "../../data/panier.js";
import { StockData } from "../../data/stocks.js";
import { htmlToFragment } from "../../lib/utils.js";
import { DetailProduitView } from "../../ui/detail-produit/index.js";
import { MessageView } from "../../ui/message/index.js";
import template from "./template.html?raw";


let M = {
  produit: null,
  selectedImage: null,
  message: null,
};

let C = {};

C.charger = async function (urlName) {
  M.produit = null;
  M.message = null;

  try {
    let data = await ProduitData.fetchOne(urlName);
    M.produit = data.produit;
    M.selectedImage = M.produit.images[0];
  } catch (erreur) {
    M.message = { type: "erreur", texte: `Impossible d'afficher le produit : ${erreur.message}` };
  }
};

C.handler_choisirImage = function (ev) {
  M.selectedImage = ev.target.dataset.url;
  V.rafraichir();
};

C.handler_ajouterAuPanier = async function () {
  try {
    let lines = PanierData.load();
    let line = lines.find(function (item) {
      return item.urlName === M.produit.urlName;
    });

    let wanted = 1;
    if (line !== undefined) {
      wanted = line.quantity + 1;
    }

    let data = await StockData.verify([{ urlName: M.produit.urlName, quantity: wanted }]);
    let result = data.lines[0];

    if (result.quantity < wanted) {
      let texte = `${M.produit.titre} est épuisé.`;
      if (result.stock > 0) {
        texte = `Stock insuffisant : il ne reste que ${result.stock} exemplaire(s) de ${M.produit.titre}.`;
      }
      M.message = { type: "erreur", texte: texte };
    } else {
      if (line === undefined) {
        lines.push({
          urlName: M.produit.urlName,
          titre: M.produit.titre,
          prix: M.produit.prix,
          image: M.produit.images[0],
          quantity: 1,
          stock: result.stock,
        });
      } else {
        line.quantity = wanted;
        line.stock = result.stock;
      }

      PanierData.save(lines);
      M.message = { type: "succes", texte: "Produit ajouté au panier." };
    }
  } catch (erreur) {
    M.message = { type: "erreur", texte: erreur.message };
  }

  V.rafraichir();
};

C.init = async function (params) {
  await C.charger(params.urlName);
  return V.init();
};


let V = {};

V.racine = null;

V.init = function () {
  let fragment = V.createPageFragment();
  V.racine = fragment.firstElementChild;
  return fragment;
};

V.rafraichir = function () {
  let fragment = V.createPageFragment();
  let nouvelleRacine = fragment.firstElementChild;
  V.racine.replaceWith(fragment);
  V.racine = nouvelleRacine;
};

V.createPageFragment = function () {
  let title = "Produit introuvable | Nike";
  let description = "Ce produit n'existe pas ou n'est plus disponible.";

  if (M.produit !== null) {
    title = `${M.produit.titre} | Nike`;
    description = M.produit.descriptionLongue;
  }

  document.title = title;
  document.head.querySelector('meta[name="description"]').setAttribute("content", description);

  let pageFragment = htmlToFragment(template);

  pageFragment.querySelector('slot[name="message"]').replaceWith(MessageView.dom(M.message));

  if (M.produit === null) {
    pageFragment.querySelector('slot[name="detail"]').remove();
    return pageFragment;
  }

  pageFragment.querySelector("[data-fallback]").remove();
  pageFragment.querySelector('slot[name="detail"]').replaceWith(
    DetailProduitView.dom(
      {
        titre: M.produit.titre,
        subtitle: M.produit.description,
        prix: M.produit.prix,
        categorie: M.produit.categorie,
        description: M.produit.descriptionLongue,
        mainImage: M.selectedImage,
        etatStock: M.produit.etatStock,
        images: M.produit.images,
      },
      {
        thumbnail: C.handler_choisirImage,
        addToCart: C.handler_ajouterAuPanier,
      }
    )
  );

  return pageFragment;
};

export function ProduitPage(params) {
  return C.init(params);
}
