import { ProduitData } from "../../data/produits.js";
import { PanierData } from "../../data/panier.js";
import { StockData } from "../../data/stocks.js";
import { htmlToFragment } from "../../lib/utils.js";
import { marquerIndisponibles } from "../../lib/variantes.js";
import { MessageView } from "../../ui/message/index.js";
import { PanierView } from "../../ui/panier/index.js";
import { RecapitulatifView } from "../../ui/recapitulatif/index.js";
import template from "./template.html?raw";


let M = {
  lines: [],
  subtotal: 0,
  shipping: 0,
  total: 0,
  edition: null,
  message: null,
};

let C = {};

C.charger = function () {
  M.lines = PanierData.load();
};

C.enregistrer = function () {
  PanierData.save(M.lines.map(function (line) {
    return {
      urlName: line.urlName,
      titre: line.titre,
      prix: line.prix,
      prixBarre: line.prixBarre,
      options: line.options,
      couleur: line.couleur,
      optionsTexte: line.optionsTexte,
      image: line.image,
      quantity: line.quantity,
      stock: line.stock,
    };
  }));
};

C.calculer = function () {
  let sum = 0;

  for (let line of M.lines) {
    line.total = line.prix * line.quantity;
    line.canIncrease = line.quantity < line.stock;
    sum += line.total;
  }

  M.subtotal = sum;
  M.total = sum;
};

C.synchroniser = async function () {
  M.message = null;

  try {
    let result = await StockData.adjust(M.lines);

    M.lines = result.lines;
    C.enregistrer();

    if (result.messages.length > 0) {
      M.message = { type: "erreur", texte: result.messages.join(" ") };
    }
  } catch (erreur) {
    M.message = { type: "erreur", texte: erreur.message };
  }

  C.calculer();
};

C.handler_augmenterQuantite = async function (ev) {
  let line = M.lines.find(function (item) {
    return item.cle === ev.target.dataset.cle;
  });

  line.quantity += 1;
  C.enregistrer();

  await C.synchroniser();
  V.rafraichir();
};

C.handler_diminuerQuantite = function (ev) {
  let line = M.lines.find(function (item) {
    return item.cle === ev.target.dataset.cle;
  });

  if (line.quantity > 1) {
    line.quantity -= 1;
  }

  M.message = null;
  C.enregistrer();
  C.calculer();
  V.rafraichir();
};

C.handler_supprimerLigne = function (ev) {
  M.lines = M.lines.filter(function (item) {
    return item.cle !== ev.target.dataset.cle;
  });

  M.message = null;
  C.enregistrer();
  C.calculer();
  V.rafraichir();
};

C.handler_modifierOptions = async function (ev) {
  let line = M.lines.find(function (item) {
    return item.cle === ev.target.dataset.cle;
  });

  try {
    let data = await ProduitData.fetchOne(line.urlName);

    let selection = data.produit.options.map(function (groupe) {
      let valeur = groupe.valeurs.find(function (item) {
        return line.options.includes(`${item.id}`);
      });

      if (valeur === undefined) {
        valeur = groupe.valeurs[0];
      }

      return `${valeur.id}`;
    });

    let couleur = line.couleur;
    if (!data.produit.couleurs.includes(couleur)) {
      couleur = data.produit.couleurs[0];
    }

    M.edition = {
      cle: line.cle,
      produit: data.produit,
      selection: selection,
      couleur: couleur,
      groupes: [],
      teintes: [],
    };
    C.calculerEdition();
    M.message = null;
  } catch (erreur) {
    M.message = { type: "erreur", texte: erreur.message };
  }

  V.rafraichir();
};

C.calculerEdition = function () {
  let etat = marquerIndisponibles(
    M.edition.produit.options,
    M.edition.produit.couleurs,
    M.edition.produit.variantes,
    M.edition.selection,
    M.edition.couleur
  );

  M.edition.groupes = etat.groupes;
  M.edition.teintes = etat.couleurs;
};

C.handler_choisirOption = function (groupe, valeur) {
  M.edition.selection[groupe] = valeur;
  C.calculerEdition();
  V.rafraichir();
};

C.handler_choisirCouleur = function (code) {
  M.edition.couleur = code;
  C.calculerEdition();
  V.rafraichir();
};

C.handler_annulerModification = function () {
  M.edition = null;
  V.rafraichir();
};

C.handler_enregistrerOptions = async function () {
  let line = M.lines.find(function (item) {
    return item.cle === M.edition.cle;
  });

  let textes = [];
  for (let i = 0; i < M.edition.produit.options.length; i++) {
    let groupe = M.edition.produit.options[i];
    let valeur = groupe.valeurs.find(function (item) {
      return `${item.id}` === M.edition.selection[i];
    });
    textes.push(`${groupe.nom} : ${valeur.libelle}`);
  }

  line.options = M.edition.selection;
  line.optionsTexte = textes.join(", ");
  line.couleur = M.edition.couleur;
  line.cle = line.urlName + "|" + line.options.join(",") + "|" + line.couleur;

  let autre = M.lines.find(function (item) {
    return item !== line && item.cle === line.cle;
  });
  if (autre !== undefined) {
    autre.quantity += line.quantity;
    M.lines = M.lines.filter(function (item) {
      return item !== line;
    });
  }

  M.edition = null;
  C.enregistrer();
  await C.synchroniser();
  V.rafraichir();
};

C.handler_validerPanier = function () {
  V.redirect("validation");
};

C.init = async function () {
  C.charger();
  await C.synchroniser();
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

V.redirect = function (path) {
  window.location.assign(import.meta.env.BASE_URL + path);
};

V.createPageFragment = function () {
  let pageFragment = htmlToFragment(template);

  pageFragment.querySelector('slot[name="message"]').replaceWith(MessageView.dom(M.message));

  let lignes = M.lines.map(function (line) {
    let edition = null;
    if (M.edition !== null && M.edition.cle === line.cle) {
      edition = M.edition;
    }

    return {
      cle: line.cle,
      urlName: line.urlName,
      titre: line.titre,
      image: line.image,
      prix: line.prix,
      prixBarre: line.prixBarre,
      quantity: line.quantity,
      total: line.total,
      canIncrease: line.canIncrease,
      optionsTexte: line.optionsTexte,
      couleur: line.couleur,
      editable: line.options.length > 0 || line.couleur !== "",
      edition: edition,
    };
  });

  pageFragment.querySelector('slot[name="panier"]').replaceWith(
    PanierView.dom(lignes, {
      plus: C.handler_augmenterQuantite,
      minus: C.handler_diminuerQuantite,
      delete: C.handler_supprimerLigne,
      edit: C.handler_modifierOptions,
      option: C.handler_choisirOption,
      color: C.handler_choisirCouleur,
      saveEdit: C.handler_enregistrerOptions,
      cancelEdit: C.handler_annulerModification,
    })
  );

  pageFragment.querySelector('slot[name="recapitulatif"]').replaceWith(
    RecapitulatifView.dom(
      { subtotal: M.subtotal, shipping: M.shipping, total: M.total },
      { validate: C.handler_validerPanier }
    )
  );

  return pageFragment;
};

export function PanierPage() {
  return C.init();
}
