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

M.load = async function (urlName) {
  M.produit = null;
  M.message = null;
  let data = await ProduitData.fetchOne(urlName);
  M.produit = data.produit;
  M.selectedImage = M.produit.images[0];
};

M.addToCart = async function () {
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
    return;
  }

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
};

M.getPage = function () {
  if (M.produit === null) {
    return {
      message: M.message,
      detail: null,
      title: "Produit introuvable | Nike",
      description: "Ce produit n'existe pas ou n'est plus disponible.",
    };
  }

  return {
    message: M.message,
    title: `${M.produit.titre} | Nike`,
    description: M.produit.descriptionLongue,
    detail: {
      titre: M.produit.titre,
      subtitle: M.produit.description,
      prix: M.produit.prix,
      categorie: M.produit.categorie,
      description: M.produit.descriptionLongue,
      mainImage: M.selectedImage,
      etatStock: M.produit.etatStock,
      images: M.produit.images,
    },
  };
};


let C = {};

C.handler_clickOnThumbnail = function (ev) {
  M.selectedImage = ev.target.dataset.url;
  V.rafraichir(M.getPage());
};

C.handler_clickOnAddToCart = async function (ev) {
  try {
    await M.addToCart();
  } catch (erreur) {
    M.message = { type: "erreur", texte: erreur.message };
  }

  V.rafraichir(M.getPage());
};

C.init = async function (params) {
  try {
    await M.load(params.urlName);
  } catch (erreur) {
    M.message = { type: "erreur", texte: `Impossible d'afficher le produit : ${erreur.message}` };
  }

  return V.init(M.getPage());
};


let V = {};

V.racine = null;

V.init = function (data) {
  let fragment = V.createPageFragment(data);
  V.racine = fragment.firstElementChild;
  return fragment;
};

V.rafraichir = function (data) {
  let fragment = V.createPageFragment(data);
  let nouvelleRacine = fragment.firstElementChild;
  V.racine.replaceWith(fragment);
  V.racine = nouvelleRacine;
};

V.createPageFragment = function (data) {
  document.title = data.title;
  document.head.querySelector('meta[name="description"]').setAttribute("content", data.description);

  let pageFragment = htmlToFragment(template);

  pageFragment.querySelector('slot[name="message"]').replaceWith(MessageView.dom(data.message));

  if (data.detail === null) {
    pageFragment.querySelector('slot[name="detail"]').remove();
    return pageFragment;
  }

  pageFragment.querySelector("[data-fallback]").remove();
  pageFragment.querySelector('slot[name="detail"]').replaceWith(
    DetailProduitView.dom(data.detail, {
      thumbnail: C.handler_clickOnThumbnail,
      addToCart: C.handler_clickOnAddToCart,
    })
  );

  return pageFragment;
};

export function ProduitPage(params) {
  return C.init(params);
}
