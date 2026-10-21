export function trouverVariante(variantes, selection, couleur) {
  return variantes.find(function (variante) {
    return variante.cle === selection.join(",") && variante.couleur === couleur;
  });
}

function estDisponible(variantes, selection, couleur) {
  let variante = trouverVariante(variantes, selection, couleur);
  return variante !== undefined && variante.stock > 0;
}

export function choisirParDefaut(variantes) {
  let variante = variantes.find(function (item) {
    return item.stock > 0;
  });

  if (variante === undefined) {
    variante = variantes[0];
  }

  let selection = [];
  if (variante.cle !== "") {
    selection = variante.cle.split(",");
  }

  return { selection: selection, couleur: variante.couleur };
}

export function marquerIndisponibles(options, couleurs, variantes, selection, couleur) {
  let groupes = options.map(function (groupe, index) {
    return {
      id: groupe.id,
      nom: groupe.nom,
      valeurs: groupe.valeurs.map(function (valeur) {
        let essai = selection.slice();
        essai[index] = `${valeur.id}`;
        return { id: valeur.id, libelle: valeur.libelle, disabled: !estDisponible(variantes, essai, couleur) };
      }),
    };
  });

  let teintes = couleurs.map(function (code) {
    return { code: code, disabled: !estDisponible(variantes, selection, code) };
  });

  return { groupes: groupes, couleurs: teintes };
}
