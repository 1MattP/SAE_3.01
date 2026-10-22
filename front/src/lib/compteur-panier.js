// Prévient l'en-tête quand le panier change, sans que les modules data/
// touchent au DOM : l'en-tête s'abonne, le panier annonce son total.
let ecouteur = null;

export function surChangementPanier(fonction) {
  ecouteur = fonction;
}

export function annoncerPanier(total) {
  if (ecouteur !== null) {
    ecouteur(total);
  }
}
