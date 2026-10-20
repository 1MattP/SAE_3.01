(function(){let e=document.createElement(`link`).relList;if(e&&e.supports&&e.supports(`modulepreload`))return;for(let e of document.querySelectorAll(`link[rel="modulepreload"]`))n(e);new MutationObserver(e=>{for(let t of e)if(t.type===`childList`)for(let e of t.addedNodes)e.tagName===`LINK`&&e.rel===`modulepreload`&&n(e)}).observe(document,{childList:!0,subtree:!0});function t(e){let t={};return e.integrity&&(t.integrity=e.integrity),e.referrerPolicy&&(t.referrerPolicy=e.referrerPolicy),t.credentials=e.crossOrigin===`use-credentials`?`include`:e.crossOrigin===`anonymous`?`omit`:`same-origin`,t}function n(e){if(e.ep)return;e.ep=!0;let n=t(e);fetch(e.href,n)}})();var e=class{constructor(e,t={}){this.root=document.getElementById(e),this.routes=[],this.layouts={},this.base=(t.base??`/`).replace(/\/$/,``),this.navigation=0,window.addEventListener(`popstate`,()=>this.handleRoute()),document.addEventListener(`click`,e=>{let t=e.target.closest(`a[data-link]`);t!==null&&(e.button!==0||e.metaKey||e.ctrlKey||e.shiftKey||e.altKey||(e.preventDefault(),this.navigate(this.routePath(t.pathname))))})}addLayout(e,t){return this.layouts[e]=t,this}findLayout(e){let t=null,n=0;for(let[r,i]of Object.entries(this.layouts))e.startsWith(r)&&r.length>n&&(t=i,n=r.length);return t}addRoute(e,t,n={}){return this.routes.push({path:e,regex:this.pathToRegex(e),keys:this.extractParams(e),handler:t,useLayout:n.useLayout!==!1}),this}pathToRegex(e){if(e===`*`)return/.*/;let t=e.replace(/\//g,`\\/`).replace(/:(\w+)/g,`([^\\/]+)`).replace(/\*/g,`.*`);return RegExp(`^`+t+`$`)}extractParams(e){let t=[];for(let n of e.matchAll(/:(\w+)/g))t.push(n[1]);return t}getParams(e,t){let n=t.match(e.regex);if(!n)return{};let r={};return e.keys.forEach((e,t)=>{r[e]=decodeURIComponent(n[t+1])}),r}routePath(e){return e===this.base?`/`:e.startsWith(this.base+`/`)?e.slice(this.base.length):e}url(e){return this.base+e}navigate(e){window.history.pushState(null,``,this.url(e)),this.handleRoute()}async handleRoute(){let e=++this.navigation,t=this.routePath(window.location.pathname),n=this.routes.find(e=>e.regex.test(t));if(!n)return;let r=await n.handler(this.getParams(n,t));e===this.navigation&&this.renderContent(r,n,t)}renderContent(e,t,n){let r=e;if(!(r instanceof DocumentFragment)){let e=document.createElement(`template`);e.innerHTML=r,r=e.content}let i=t.useLayout?this.findLayout(n):null;if(i){let e=i();e.querySelector(`slot:not([name])`).replaceWith(r),r=e}this.root.replaceChildren(r),this.updateLinks(n),window.scrollTo(0,0)}updateLinks(e){for(let t of this.root.querySelectorAll(`a[data-link]`)){let n=this.routePath(t.pathname);t.setAttribute(`href`,this.url(n)),n===e?t.setAttribute(`aria-current`,`page`):t.removeAttribute(`aria-current`)}}start(){this.handleRoute()}},t={};t.load=function(){let e=localStorage.getItem(`panier`);return e===null?[]:JSON.parse(e)},t.save=function(e){localStorage.setItem(`panier`,JSON.stringify(e))};function n(e){return String(e).replaceAll(`&`,`&amp;`).replaceAll(`<`,`&lt;`).replaceAll(`>`,`&gt;`).replaceAll(`"`,`&quot;`).replaceAll(`'`,`&#39;`)}var r=function(e,t){let r=e;for(let e in t)r=r.replaceAll(`{{${e}}}`,()=>n(t[e]));return r};function i(e){let t=document.createElement(`template`);return t.innerHTML=e.trim(),t.content}var a=`<header class="sticky top-0 z-10 border-b border-border-default bg-background-default">
  <div class="mx-auto flex  max-w-5xl flex-wrap items-center gap-6 px-6 py-3">
    <a href="/" data-link class="text-body-sm font-semibold tracking-tight">SAE301-Starter</a>

    <nav class="mr-auto flex gap-5 text-body-sm">
      <a href="/" data-link class="text-text-secondary transition-colors hover:text-text-primary aria-[current=page]:font-medium aria-[current=page]:text-text-primary">Catalogue</a>
      <a href="/admin" data-link class="text-text-secondary transition-colors hover:text-text-primary aria-[current=page]:font-medium aria-[current=page]:text-text-primary">Administration</a>
    </nav>

    <div class="flex items-center gap-2">
      <a href="/connexion" data-link class="flex size-9 items-center justify-center rounded-full hover:bg-surface-hover">
        <span class="sr-only">Connexion</span>
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" class="size-5"><path stroke-linecap="round" stroke-linejoin="round" d="M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8Zm-7 8a7 7 0 0 1 14 0"/></svg>
      </a>

      <a href="/panier" data-link class="relative flex size-9 items-center justify-center rounded-full hover:bg-surface-hover">
        <span class="sr-only">Panier</span>
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" class="size-5"><path stroke-linecap="round" stroke-linejoin="round" d="M5 8h14l-1 12H6L5 8Zm4 0V7a3 3 0 0 1 6 0v1"/></svg>
        <span class="absolute empty:hidden -top-0.5 -right-0.5 flex min-w-4 items-center justify-center rounded-full bg-action-primary-background px-1 text-caption-xs font-semibold text-action-primary-foreground">{{count}}</span>
      </a>
    </div>
  </div>
</header>
`,o={html:function(e){let t=``;return e.count>0&&(t=e.count),r(a,{count:t})},dom:function(e){return i(o.html(e))}},ee=`<div class="min-h-screen">
  <slot name="header"></slot>
  <main>
    <!-- Le slot sans nom reçoit la page affichée (voir lib/router.js). -->
    <slot></slot>
  </main>
</div>
`;function te(){let e=i(ee),n=0;for(let e of t.load())n+=e.quantity;return e.querySelector(`slot[name="header"]`).replaceWith(o.dom({count:n})),e}var ne=`/~pages39/SAE301/Base/api/`,s=class extends Error{constructor(e,t){super(e),this.name=`ErreurApi`,this.statut=t}},re=async function(e,t){let n=await fetch(ne+e,t),r=null;try{r=await n.json()}catch{throw new s(`Réponse illisible du serveur.`,n.status)}if(!n.ok)throw new s(r?.erreur??`Erreur ${n.status}`,n.status);return r},c=function(e){return re(e,{method:`GET`,headers:{Accept:`application/json`}})},l=function(e,t={}){return re(e,{method:`POST`,headers:{Accept:`application/json`,"Content-Type":`application/json`},body:JSON.stringify(t)})},u={};u.fetchPage=async function(e,t){let n=`produits?page=${e}`;return t!==void 0&&t.categorie!==null&&(n+=`&categorie=${t.categorie}`),c(n)},u.fetchOne=async function(e){return c(`produit?urlName=${e}`)};var ie=`<nav aria-label="Catégories" class="flex flex-col sm:flex-row sm:items-start rounded-1.5 mb-15">
  <slot name="onglets"></slot>
</nav>
`,ae=`<a href="{{lien}}"  data-link class="flex w-full sm:w-75.5 h-15.5 px-6  items-center gap-5  rounded-none border border-border-default bg-surface-disabled hover:bg-surface-hover font-body text-body-sm font-semibold text-text-secondary aria-[current=page]:bg-background-inverse aria-[current=page]:text-text-inverse aria-[current=page]:hover:bg-background-inverse">
  <span>{{libelle}}</span>
  <span>({{nombre}})</span>
</a>
`,d={html:function(e){return r(ie,e)},dom:function(e){let t=i(d.html(e)),n=e.categories.map(function(e){let t=`/`;return e.id!==0&&(t=`/categorie/`+encodeURIComponent(e.libelle)),i(r(ae,{lien:t,libelle:e.libelle,nombre:e.nombre}))});return t.querySelector(`slot[name="onglets"]`).replaceWith(...n),t}};function f(e){return Number(e).toFixed(2).replace(`.`,`,`)+` €`}function p(e){return`/~pages39/SAE301/Base/`+e}var oe=`<article class="relative flex flex-col items-start p-0 gap-0 flex-1">
  <div class="relative flex h-55 p-0 flex-col justify-center items-center gap-0  overflow-hidden">
    <img src="{{image}}" alt="{{titre}}" class="flex-1 self-stretch">
    <div class="absolute top-3 left-3">
      <slot name="stock"></slot>
    </div>
  </div>

  <div class="flex flex-col items-start px-4 pt-4 pb-5 gap-3">
    <div class="flex items-center gap-1.5 p-0">
      <slot name="couleurs"></slot>
    </div>
    
    <div class="flex flex-col items-start gap-1 p-0">
        <h2 class="text-text-primary font-body text-sm font-semibold "><a href="{{lien}}" data-link class="after:absolute after:inset-0">{{titre}}</a></h2>
        <p class="text-text-secondary font-body text-xs font-normal">{{description}}</p>
    </div>

    <p class="text-text-primary font-body text-base font-bold">{{prix}}</p>
  </div>
</article>
`,se=`<p class="inline-flex w-fit items-center gap-1  border px-1.5 py-0.5 text-caption-xs font-semibold {{classes}}">
  <span class="size-1.5 rounded-full bg-current"></span>
  {{libelle}}
</p>
`,ce={en_stock:{libelle:`En stock`,classes:`border-border-active bg-background-default text-text-primary`},bientot_epuise:{libelle:`Bientôt épuisé`,classes:`border-border-active bg-background-inverse text-text-inverse`},epuise:{libelle:`Épuisé`,classes:`border-border-default bg-surface-disabled text-text-disabled line-through`}},m={html:function(e){return r(se,ce[e.etat])},dom:function(e){return i(m.html(e))}},le=`<span class="w-4.5 h-4.5 rounded-full border border-border-default bg-(--couleur)" style="--couleur: {{couleur}}"></span>
`,h={html:function(e){return r(oe,{titre:e.titre,lien:`/produit/`+e.urlName,description:e.description,prix:f(e.prix),image:p(e.image)})},dom:function(e){let t=i(h.html(e)),n=e.couleurs.split(`,`).map(function(e){return i(r(le,{couleur:e.trim()}))});return t.querySelector(`slot[name="couleurs"]`).replaceWith(...n),t.querySelector(`slot[name="stock"]`).replaceWith(m.dom({etat:e.etatStock})),t}},ue=`<div class="grid grid-cols-[repeat(auto-fill,minmax(200px,1fr))] gap-4">
  <slot name="cartes"></slot>
</div>`,de=`<p class="text-sm text-zinc-500 dark:text-zinc-400">Aucun produit à afficher.</p>
`,fe={dom:function(e){if(e.length===0)return i(de);let t=i(ue),n=e.map(function(e){return h.dom(e)});return t.querySelector(`slot[name="cartes"]`).replaceWith(...n),t}},pe=`<p role="status" class="mb-6 rounded-md border px-4 py-3 text-sm {{couleurs}}">{{texte}}</p>
`,me={erreur:`border-red-700 text-red-700 dark:border-red-400 dark:text-red-400`,succes:`border-green-700 text-green-700 dark:border-green-400 dark:text-green-400`},g={html:function(e){return e===null?``:r(pe,{texte:e.texte,couleurs:me[e.type]})},dom:function(e){return i(g.html(e))}},he=`<nav class="mt-10 flex items-center justify-center gap-4">
  <button type="button" data-action="precedente" class="h-9 rounded-md border border-zinc-200 px-4 text-sm font-medium transition-colors hover:bg-zinc-100 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:bg-transparent dark:border-zinc-800 dark:hover:bg-zinc-800">
    Précédent
  </button>

  <span class="text-sm text-zinc-500 dark:text-zinc-400">Page {{page}} sur {{pagesTotal}}</span>

  <button type="button" data-action="suivante" class="h-9 rounded-md border border-zinc-200 px-4 text-sm font-medium transition-colors hover:bg-zinc-100 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:bg-transparent dark:border-zinc-800 dark:hover:bg-zinc-800">
    Suivant
  </button>
</nav>
`,_={html:function(e){return r(he,e)},dom:function(e,t){let n=i(_.html(e)),r=n.querySelector(`[data-action="precedente"]`),a=n.querySelector(`[data-action="suivante"]`);return r.disabled=e.page<=1,a.disabled=e.page>=e.pagesTotal,r.addEventListener(`click`,()=>t.surPage(e.page-1)),a.addEventListener(`click`,()=>t.surPage(e.page+1)),n}},ge=`<section class="mx-auto max-w-5xl px-6 pt-10 pb-16">
  
  <slot name="message"></slot>
  <slot name="categorie"></slot>
  <slot name="grille"></slot>
  <slot name="pagination"></slot>
</section>
`,v={catalogue:null,categories:[],categorie:null,message:null},y={};y.charger=async function(e){try{v.catalogue=await u.fetchPage(e,{categorie:v.categorie}),v.categories=v.catalogue.categories,v.message=null}catch(e){v.catalogue=null,v.message={type:`erreur`,texte:`Impossible de charger le catalogue : ${e.message}`}}},y.handler_changerPage=async function(e){await y.charger(e),b.rafraichir(),window.scrollTo({top:0,behavior:`smooth`})},y.init=async function(e){return v.categorie=null,e.nom!==void 0&&(v.categorie=e.nom),await y.charger(1),b.init()};var b={};b.racine=null,b.init=function(){let e=b.createPageFragment();return b.racine=e.firstElementChild,e},b.rafraichir=function(){let e=b.createPageFragment(),t=e.firstElementChild;b.racine.replaceWith(e),b.racine=t},b.createPageFragment=function(){let e=i(ge);if(e.querySelector(`slot[name="message"]`).replaceWith(g.dom(v.message)),v.catalogue===null){for(let t of e.querySelectorAll(`slot`))t.remove();return e}return e.querySelector(`slot[name="categorie"]`).replaceWith(d.dom({categories:v.categories})),e.querySelector(`slot[name="grille"]`).replaceWith(fe.dom(v.catalogue.produits)),e.querySelector(`slot[name="pagination"]`).replaceWith(_.dom(v.catalogue,{surPage:y.handler_changerPage})),e};function x(e){return y.init(e)}var S={};S.verify=async function(e){return l(`panier/verifier`,{lines:e})},S.adjust=async function(e){let t=[],n=[];if(e.length===0)return{lines:t,messages:n};let r=e.map(function(e){return{urlName:e.urlName,quantity:e.quantity}}),i=await S.verify(r);for(let r=0;r<e.length;r++){let a=i.lines[r];a.quantity===0?n.push(`${e[r].titre} a été retiré de votre panier (épuisé).`):(a.quantity<e[r].quantity&&n.push(`La quantité de ${e[r].titre} a été ramenée à ${a.quantity} (stock disponible).`),e[r].quantity=a.quantity,e[r].stock=a.stock,t.push(e[r]))}return{lines:t,messages:n}};var _e=`<article class="mx-auto max-w-6xl px-6 py-6 font-body text-text-primary">
  <div class="grid gap-8 lg:grid-cols-3">
    <div class="flex flex-col-reverse gap-3 lg:col-span-2 lg:flex-row">
      <div class="flex gap-3 lg:flex-col">
        <slot name="thumbnails"></slot>
      </div>
      <div class="aspect-square flex-1 overflow-hidden rounded-lg bg-surface-image">
        <img src="{{mainImage}}" alt="{{titre}}" class="size-full object-cover">
      </div>
    </div>

    <div class="flex flex-col gap-5">
      <slot name="stock"></slot>

      <div class="flex flex-col gap-1">
        <h1 class="text-heading-lg font-bold">{{titre}}</h1>
        <p class="text-body-sm text-text-secondary">{{subtitle}}</p>
      </div>

      <div class="flex flex-col gap-1 border-b border-border-default pb-5">
        <p class="text-caption text-text-secondary">Prix</p>
        <p class="text-heading-sm font-bold">{{prix}}</p>
      </div>

      <button type="button" data-action="addToCart" class="h-11 w-full rounded-full bg-action-primary-background text-body-sm font-semibold text-action-primary-foreground hover:bg-action-primary-hover disabled:cursor-not-allowed disabled:bg-action-primary-hover">
        Ajouter au panier
      </button>

      <a href="{{categoryLink}}" data-link class="flex h-11 w-full items-center justify-center rounded-full border border-border-active text-body-sm font-semibold text-action-secondary-foreground hover:bg-surface-hover">
        Retour au catalogue
      </a>
    </div>
  </div>

  <section class="mt-14 border-t border-border-default pt-6">
    <h2 class="inline-block border-b-2 border-border-active pb-1 text-body-sm font-semibold">Description</h2>
    <p class="mt-5 max-w-xl text-body-sm text-text-secondary">{{description}}</p>
    <p class="mt-4 max-w-xl text-body-sm text-text-secondary">Le prix de ce modèle est de {{prix}}. Vous pouvez ajouter le produit à votre panier ou revenir à la catégorie {{categorie}} pour comparer les autres modèles.</p>
  </section>
</article>
`,ve=`<button type="button" data-action="thumbnail" data-url="{{url}}" class="size-16 shrink-0 overflow-hidden rounded-md border border-border-default bg-surface-image hover:border-border-strong">
  <img src="{{image}}" alt="" class="pointer-events-none size-full object-cover">
</button>
`,C={html:function(e){return r(_e,{titre:e.titre,subtitle:e.subtitle,prix:f(e.prix),categorie:e.categorie,categoryLink:`/categorie/`+e.categorie,description:e.description,mainImage:p(e.mainImage)})},dom:function(e,t){let n=i(C.html(e)),a=n.firstElementChild,o=e.images.map(function(e){return i(r(ve,{url:e,image:p(e)}))});return n.querySelector(`slot[name="thumbnails"]`).replaceWith(...o),n.querySelector(`slot[name="stock"]`).replaceWith(m.dom({etat:e.etatStock})),a.querySelector(`[data-action="addToCart"]`).disabled=e.etatStock===`epuise`,a.addEventListener(`click`,function(e){let n=e.target.closest(`[data-action]`);if(n===null)return;let r=t[n.dataset.action];r!==void 0&&r(e)}),n}},ye=`<section class="mx-auto max-w-6xl">
  <div class="px-6 pt-6">
    <slot name="message"></slot>
    <a href="/" data-link data-fallback class="inline-flex h-11 items-center justify-center rounded-full border border-border-active px-6 font-body text-body-sm font-semibold text-action-secondary-foreground hover:bg-surface-hover">Retour au catalogue</a>
  </div>
  <slot name="detail"></slot>
</section>
`,w={produit:null,selectedImage:null,message:null};w.load=async function(e){w.produit=null,w.message=null,w.produit=(await u.fetchOne(e)).produit,w.selectedImage=w.produit.images[0]},w.addToCart=async function(){let e=t.load(),n=e.find(function(e){return e.urlName===w.produit.urlName}),r=1;n!==void 0&&(r=n.quantity+1);let i=(await S.verify([{urlName:w.produit.urlName,quantity:r}])).lines[0];if(i.quantity<r){let e=`${w.produit.titre} est épuisé.`;i.stock>0&&(e=`Stock insuffisant : il ne reste que ${i.stock} exemplaire(s) de ${w.produit.titre}.`),w.message={type:`erreur`,texte:e}}else n===void 0?e.push({urlName:w.produit.urlName,titre:w.produit.titre,prix:w.produit.prix,image:w.produit.images[0],quantity:1,stock:i.stock}):(n.quantity=r,n.stock=i.stock),t.save(e),w.message={type:`succes`,texte:`Produit ajouté au panier.`}},w.getPage=function(){return w.produit===null?{message:w.message,detail:null,title:`Produit introuvable | Nike`,description:`Ce produit n'existe pas ou n'est plus disponible.`}:{message:w.message,title:`${w.produit.titre} | Nike`,description:w.produit.descriptionLongue,detail:{titre:w.produit.titre,subtitle:w.produit.description,prix:w.produit.prix,categorie:w.produit.categorie,description:w.produit.descriptionLongue,mainImage:w.selectedImage,etatStock:w.produit.etatStock,images:w.produit.images}}};var T={};T.handler_clickOnThumbnail=function(e){w.selectedImage=e.target.dataset.url,E.rafraichir(w.getPage())},T.handler_clickOnAddToCart=async function(e){try{await w.addToCart()}catch(e){w.message={type:`erreur`,texte:e.message}}E.rafraichir(w.getPage())},T.init=async function(e){try{await w.load(e.urlName)}catch(e){w.message={type:`erreur`,texte:`Impossible d'afficher le produit : ${e.message}`}}return E.init(w.getPage())};var E={};E.racine=null,E.init=function(e){let t=E.createPageFragment(e);return E.racine=t.firstElementChild,t},E.rafraichir=function(e){let t=E.createPageFragment(e),n=t.firstElementChild;E.racine.replaceWith(t),E.racine=n},E.createPageFragment=function(e){document.title=e.title,document.head.querySelector(`meta[name="description"]`).setAttribute(`content`,e.description);let t=i(ye);return t.querySelector(`slot[name="message"]`).replaceWith(g.dom(e.message)),e.detail===null?(t.querySelector(`slot[name="detail"]`).remove(),t):(t.querySelector(`[data-fallback]`).remove(),t.querySelector(`slot[name="detail"]`).replaceWith(C.dom(e.detail,{thumbnail:T.handler_clickOnThumbnail,addToCart:T.handler_clickOnAddToCart})),t)};function be(e){return T.init(e)}var xe=`<div>
  <slot name="lines"></slot>
</div>
`,Se=`<div class="flex flex-wrap items-center gap-x-4 gap-y-3 border-b border-border-default py-5">
  <img src="{{image}}" alt="{{titre}}" class="size-16 shrink-0 rounded-md bg-surface-image object-cover">

  <div class="flex min-w-0 flex-1 flex-col gap-1">
    <a href="{{link}}" data-link class="text-body-sm font-semibold">{{titre}}</a>
    <p class="text-caption text-text-secondary">Prix unitaire : {{prix}}</p>
  </div>

  <div class="flex w-full items-center justify-between gap-4 sm:w-auto">
    <div class="flex items-center gap-2">
      <button type="button" data-action="minus" data-url-name="{{urlName}}" class="size-8 rounded-sm bg-surface-image hover:bg-surface-hover disabled:cursor-not-allowed disabled:text-text-disabled">−</button>
      <span class="w-6 text-center text-body-sm">{{quantity}}</span>
      <button type="button" data-action="plus" data-url-name="{{urlName}}" class="size-8 rounded-sm bg-surface-image hover:bg-surface-hover disabled:cursor-not-allowed disabled:text-text-disabled">+</button>
    </div>

    <p class="text-right text-body-sm font-semibold sm:w-20">{{total}}</p>

    <button type="button" data-action="delete" data-url-name="{{urlName}}" class="flex size-8 items-center justify-center rounded-md border border-border-default hover:bg-surface-hover">
      <span class="sr-only pointer-events-none">Supprimer {{titre}}</span>
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" class="pointer-events-none size-4"><path stroke-linecap="round" stroke-linejoin="round" d="M6 7h12M9 7V5h6v2m-8 0 1 12h8l1-12M10 11v5m4-5v5"/></svg>
    </button>
  </div>
</div>
`,Ce=`<div class="flex flex-col items-start gap-4 border-b border-border-default py-10">
  <h2 class="text-body-lg font-bold">Votre panier est vide</h2>
  <p class="max-w-xs text-body-sm text-text-secondary">Découvrez notre sélection de produits et ajoutez vos articles favoris à votre panier.</p>
  <a href="/" data-link class="inline-flex h-10 items-center bg-action-primary-background px-6 text-body-sm font-semibold text-action-primary-foreground hover:bg-action-primary-hover">Découvrir la boutique →</a>
</div>
`,D={html:function(){return xe},dom:function(e,t){let n=i(D.html()),a=n.firstElementChild,o=[i(Ce)];return e.length>0&&(o=e.map(function(e){let t=i(r(Se,{urlName:e.urlName,link:`/produit/`+e.urlName,titre:e.titre,image:p(e.image),prix:f(e.prix),quantity:e.quantity,total:f(e.total)}));return t.querySelector(`[data-action="minus"]`).disabled=e.quantity===1,t.querySelector(`[data-action="plus"]`).disabled=!e.canIncrease,t})),n.querySelector(`slot[name="lines"]`).replaceWith(...o),a.addEventListener(`click`,function(e){let n=e.target.closest(`[data-action]`);if(n===null)return;let r=t[n.dataset.action];r!==void 0&&r(e)}),n}},we=`<div class=" rounded-lg p-6">
  <h2 class="border-b border-border-default pb-4 text-heading-sm font-bold">Récapitulatif</h2>

  <div class="mt-4 flex flex-col gap-3 text-body-sm">
    <div class="flex justify-between">
      <p class="text-text-secondary">Sous-total</p>
      <p>{{subtotal}}</p>
    </div>
    <div class="flex justify-between">
      <p class="text-text-secondary">Coût de livraison</p>
      <p>{{shipping}}</p>
    </div>
    <div class="flex justify-between border-y border-border-default py-3 text-body font-bold">
      <p>Total</p>
      <p>{{total}}</p>
    </div>
  </div>

  <button type="button" data-action="validate" class="mt-6 h-12 w-full rounded-full bg-action-primary-background text-body-sm font-semibold text-action-primary-foreground hover:bg-action-primary-hover disabled:cursor-not-allowed disabled:bg-action-primary-hover">
    Passer à la validation
  </button>
</div>
`,O={html:function(e){return r(we,{subtotal:f(e.subtotal),shipping:f(e.shipping),total:f(e.total)})},dom:function(e,t){let n=i(O.html(e)),r=n.querySelector(`[data-action="validate"]`);return r.disabled=e.total===0,r.addEventListener(`click`,t.validate),n}},Te=`<section class="mx-auto max-w-6xl px-4 py-6 sm:px-6 sm:py-10 font-body text-text-primary">
  <div class="grid gap-8 lg:grid-cols-3 lg:gap-10">
    <div class="lg:col-span-2">
      <h1 class="border-b border-border-default pb-4 text-heading-lg font-bold sm:text-heading-section">Panier</h1>
      <div class="mt-6">
        <slot name="message"></slot>
      </div>

      <slot name="panier"></slot>
    </div>

    <slot name="recapitulatif"></slot>
  </div>
</section>
`,k={lines:[],message:null};k.load=function(){k.lines=t.load()},k.sync=async function(){let e=await S.adjust(k.lines);k.lines=e.lines,t.save(k.lines),k.message=null,e.messages.length>0&&(k.message={type:`erreur`,texte:e.messages.join(` `)})},k.changeQuantity=async function(e,n){let r=k.lines.find(function(t){return t.urlName===e});r.quantity+n>0&&(r.quantity+=n,t.save(k.lines),await k.sync())},k.remove=function(e){k.lines=k.lines.filter(function(t){return t.urlName!==e}),t.save(k.lines),k.message=null},k.getPage=function(){let e=0,t=k.lines.map(function(t){let n=t.prix*t.quantity;return e+=n,{urlName:t.urlName,titre:t.titre,prix:t.prix,image:t.image,quantity:t.quantity,canIncrease:t.quantity<t.stock,total:n}});return{message:k.message,lines:t,subtotal:e,shipping:0,total:e}};var A={};A.handler_clickOnPlus=async function(e){try{await k.changeQuantity(e.target.dataset.urlName,1)}catch(e){k.message={type:`erreur`,texte:e.message}}j.rafraichir(k.getPage())},A.handler_clickOnMinus=async function(e){try{await k.changeQuantity(e.target.dataset.urlName,-1)}catch(e){k.message={type:`erreur`,texte:e.message}}j.rafraichir(k.getPage())},A.handler_clickOnDelete=function(e){k.remove(e.target.dataset.urlName),j.rafraichir(k.getPage())},A.handler_clickOnValidate=function(e){j.redirect(`validation`)},A.init=async function(){k.load(),k.message=null;try{await k.sync()}catch(e){k.message={type:`erreur`,texte:e.message}}return j.init(k.getPage())};var j={};j.racine=null,j.init=function(e){let t=j.createPageFragment(e);return j.racine=t.firstElementChild,t},j.rafraichir=function(e){let t=j.createPageFragment(e),n=t.firstElementChild;j.racine.replaceWith(t),j.racine=n},j.redirect=function(e){window.location.assign(`/~pages39/SAE301/Base/`+e)},j.createPageFragment=function(e){let t=i(Te);return t.querySelector(`slot[name="message"]`).replaceWith(g.dom(e.message)),t.querySelector(`slot[name="panier"]`).replaceWith(D.dom(e.lines,{plus:A.handler_clickOnPlus,minus:A.handler_clickOnMinus,delete:A.handler_clickOnDelete})),t.querySelector(`slot[name="recapitulatif"]`).replaceWith(O.dom(e,{validate:A.handler_clickOnValidate})),t};function Ee(){return A.init()}var M={};M.register=async function(e,t){return l(`register`,{email:e,password:t})},M.login=async function(e,t){return l(`login`,{email:e,password:t})},M.logout=async function(){return l(`logout`)},M.me=async function(){return c(`me`)};var De=`<div class="mx-auto w-full max-w-sm text-center font-body text-text-primary">
  <h1 class="border-b border-border-default pb-6 text-heading-lg font-bold">Mon compte</h1>
  <p class="mt-6 text-body-sm text-text-secondary">Vous êtes connecté avec {{email}}.</p>
  <button type="button" data-action="logout" class="mt-6 h-12 w-full rounded-md bg-action-primary-background text-body-sm font-semibold text-action-primary-foreground hover:bg-action-primary-hover">Se déconnecter</button>
</div>
`,N={html:function(e){return r(De,e)},dom:function(e,t){let n=i(N.html(e));return n.querySelector(`[data-action="logout"]`).addEventListener(`click`,t.logout),n}},Oe=`<div class="mx-auto w-full max-w-sm font-body text-text-primary">
  <div class="border-b border-border-default pb-6 text-center">
    <h1 class="text-heading-lg font-bold">{{title}}</h1>
    <p class="mt-2 text-caption text-text-secondary">{{subtitle}}</p>
  </div>

  <form novalidate class="mt-6 flex flex-col gap-5">
    <label class="flex flex-col gap-2 text-caption font-semibold">
      Email
      <input name="email" type="email" autocomplete="email" placeholder="vous@exemple.fr" value="{{email}}" class="h-11 rounded-md border border-border-default bg-background-default px-3 text-body-sm font-normal hover:border-border-strong focus:border-border-active" />
    </label>

    <label class="flex flex-col gap-2 text-caption font-semibold">
      Mot de passe
      <input name="password" type="password" autocomplete="{{autocomplete}}" class="h-11 rounded-md border border-border-default bg-background-default px-3 text-body-sm font-normal hover:border-border-strong focus:border-border-active" />
    </label>

    <button type="submit" class="h-12 w-full bg-action-primary-background text-body-sm font-semibold text-action-primary-foreground hover:bg-action-primary-hover">{{button}}</button>
  </form>

  <p class="mt-6 text-center text-caption text-text-secondary">
    {{linkText}}
    <a href="{{link}}" data-link class="font-semibold text-text-primary underline">{{linkLabel}}</a>
  </p>
</div>
`,P={html:function(e){return r(Oe,e)},dom:function(e,t){let n=i(P.html(e)),r=n.querySelector(`form`);return r.addEventListener(`submit`,function(e){e.preventDefault(),t.submit(r.elements.email.value.trim(),r.elements.password.value)}),n}},ke=`<section class="mx-auto max-w-6xl px-4 py-10 sm:px-6 sm:py-16">
  <slot name="formulaire"></slot>

  <div class="mx-auto mt-8 max-w-xl">
    <slot name="message"></slot>
  </div>
</section>
`,F={email:``,connectedEmail:null,message:null};F.load=async function(){F.connectedEmail=(await M.me()).email},F.getPage=function(){return{message:F.message,connectedEmail:F.connectedEmail,form:{title:`Connexion`,subtitle:`Bienvenue. Connectez-vous à votre compte Nike.`,email:F.email,autocomplete:`current-password`,button:`Se connecter`,linkText:`Pas encore de compte ?`,linkLabel:`Créer un compte`,link:`/inscription`}}};var I={};I.handler_submit=async function(e,t){F.email=e;try{await M.login(e,t),await F.load(),F.message={type:`succes`,texte:`Connexion réussie.`}}catch(e){F.message={type:`erreur`,texte:e.message}}L.rafraichir(F.getPage())},I.handler_clickOnLogout=async function(){try{await M.logout(),await F.load(),F.message={type:`succes`,texte:`Vous êtes déconnecté.`}}catch(e){F.message={type:`erreur`,texte:e.message}}L.rafraichir(F.getPage())},I.init=async function(){F.message=null;try{await F.load()}catch(e){F.connectedEmail=null,F.message={type:`erreur`,texte:`Impossible de vérifier votre session : ${e.message}`}}return L.init(F.getPage())};var L={};L.racine=null,L.init=function(e){let t=L.createPageFragment(e);return L.racine=t.firstElementChild,t},L.rafraichir=function(e){let t=L.createPageFragment(e),n=t.firstElementChild;L.racine.replaceWith(t),L.racine=n},L.createPageFragment=function(e){let t=i(ke);return e.connectedEmail===null?t.querySelector(`slot[name="formulaire"]`).replaceWith(P.dom(e.form,{submit:I.handler_submit})):t.querySelector(`slot[name="formulaire"]`).replaceWith(N.dom({email:e.connectedEmail},{logout:I.handler_clickOnLogout})),t.querySelector(`slot[name="message"]`).replaceWith(g.dom(e.message)),t};function Ae(){return I.init()}var je=`<section class="mx-auto max-w-6xl px-4 py-10 sm:px-6 sm:py-16">
  <slot name="formulaire"></slot>

  <div class="mx-auto mt-8 max-w-xl">
    <slot name="message"></slot>
  </div>
</section>
`,R={email:``,connectedEmail:null,message:null};R.load=async function(){R.connectedEmail=(await M.me()).email},R.getPage=function(){return{message:R.message,connectedEmail:R.connectedEmail,form:{title:`Créer un compte`,subtitle:`Renseignez votre email et choisissez un mot de passe.`,email:R.email,autocomplete:`new-password`,button:`Créer mon compte`,linkText:`Déjà un compte ?`,linkLabel:`Se connecter`,link:`/connexion`}}};var z={};z.handler_submit=async function(e,t){R.email=e;try{await M.register(e,t),await R.load(),R.message={type:`succes`,texte:`Compte créé. Vous êtes connecté.`}}catch(e){R.message={type:`erreur`,texte:e.message}}B.rafraichir(R.getPage())},z.handler_clickOnLogout=async function(){try{await M.logout(),await R.load(),R.message={type:`succes`,texte:`Vous êtes déconnecté.`}}catch(e){R.message={type:`erreur`,texte:e.message}}B.rafraichir(R.getPage())},z.init=async function(){R.message=null;try{await R.load()}catch(e){R.connectedEmail=null,R.message={type:`erreur`,texte:`Impossible de vérifier votre session : ${e.message}`}}return B.init(R.getPage())};var B={};B.racine=null,B.init=function(e){let t=B.createPageFragment(e);return B.racine=t.firstElementChild,t},B.rafraichir=function(e){let t=B.createPageFragment(e),n=t.firstElementChild;B.racine.replaceWith(t),B.racine=n},B.createPageFragment=function(e){let t=i(je);return e.connectedEmail===null?t.querySelector(`slot[name="formulaire"]`).replaceWith(P.dom(e.form,{submit:z.handler_submit})):t.querySelector(`slot[name="formulaire"]`).replaceWith(N.dom({email:e.connectedEmail},{logout:z.handler_clickOnLogout})),t.querySelector(`slot[name="message"]`).replaceWith(g.dom(e.message)),t};function Me(){return z.init()}var Ne={};Ne.create=async function(e){return l(`commandes`,{lines:e})};var Pe=`<div class="h-fit  p-6 text-center font-body text-text-primary">
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" class="mx-auto size-16"><circle cx="12" cy="12" r="10"/><path stroke-linecap="round" stroke-linejoin="round" d="m8 12.5 3 3 5-6"/></svg>

  <h2 class="mt-6 text-heading-sm font-bold">Commande validée !</h2>
  <p class="mt-2 text-body-sm text-text-secondary">Votre commande a bien été enregistrée.</p>

  <p class="mt-6 text-caption-xs uppercase text-text-secondary">Numéro de commande</p>
  <p class="mt-2 rounded-md border border-border-default py-4 text-body-sm font-bold">{{numero}}</p>

  <a href="/" data-link class="mt-6 flex h-12 w-full items-center justify-center bg-action-primary-background text-body-sm font-semibold text-action-primary-foreground hover:bg-action-primary-hover">Continuer mes achats</a>
</div>
`,Fe=`<div class="h-fit p-6 font-body text-text-primary">
  <h2 class="text-heading-sm font-bold">Valider la commande</h2>
  <p class="mt-2 text-body-sm text-text-secondary">Vérifiez votre récapitulatif puis confirmez votre commande.</p>
  <button type="button" data-action="confirm" class="mt-6 h-12 w-full  bg-action-primary-background text-body-sm font-semibold text-action-primary-foreground hover:bg-action-primary-hover empty:hidden">{{button}}</button>
</div>
`,V={html:function(e){return e.numero===``?r(Fe,{button:e.button}):r(Pe,{numero:e.numero})},dom:function(e,t){let n=i(V.html(e));return e.numero===``&&n.querySelector(`[data-action="confirm"]`).addEventListener(`click`,t.confirm),n}},Ie=`<div class="mt-6 font-body text-text-primary">
  <div>
    <slot name="lines"></slot>
  </div>

  <div class="mt-6 flex flex-col gap-2 text-body-sm">
    <div class="flex justify-between">
      <p class="text-text-secondary">Sous-total</p>
      <p class="text-text-secondary">{{subtotal}}</p>
    </div>
    <div class="flex justify-between">
      <p class="text-text-secondary">Coût de livraison</p>
      <p class="text-text-secondary">{{shipping}}</p>
    </div>
    <div class="flex justify-between border-t border-border-default pt-3 font-bold">
      <p>Total</p>
      <p>{{total}}</p>
    </div>
  </div>
</div>
`,Le=`<div class="flex items-center gap-4 border-b border-border-default py-4">
  <img src="{{image}}" alt="{{titre}}" class="size-12 shrink-0 rounded-md bg-surface-image object-cover">

  <div class="flex flex-1 flex-col gap-1">
    <p class="text-body-sm font-semibold">{{titre}}</p>
    <p class="text-caption text-text-secondary">Quantité : {{quantity}} · Prix unitaire : {{prix}}</p>
  </div>

  <p class="text-body-sm font-bold">{{total}}</p>
</div>
`,H={html:function(e){return r(Ie,{subtotal:f(e.subtotal),shipping:f(e.shipping),total:f(e.total)})},dom:function(e){let t=i(H.html(e)),n=e.lines.map(function(e){return i(r(Le,{titre:e.titre,image:p(e.image),quantity:e.quantity,prix:f(e.prix),total:f(e.total)}))});return t.querySelector(`slot[name="lines"]`).replaceWith(...n),t}},Re=`<section class="mx-auto max-w-6xl px-4 py-6 font-body text-text-primary sm:px-6 sm:py-10">
  <div class="grid gap-8 lg:grid-cols-5 lg:items-center lg:gap-10">
    <div class="lg:col-span-3">
      <h1 class="border-b border-border-default pb-4 text-heading-lg font-bold sm:text-heading-section">Récapitulatif</h1>

      <div class="mt-6">
        <slot name="message"></slot>
      </div>

      <slot name="lignes"></slot>
    </div>

    <div class="lg:col-span-2">
      <slot name="carte"></slot>
    </div>
  </div>
</section>
`,U={lines:[],connectedEmail:null,images:[],order:null,message:null};U.sync=async function(){let e=await S.adjust(U.lines);return U.lines=e.lines,t.save(U.lines),e.messages},U.load=async function(){U.connectedEmail=(await M.me()).email,U.lines=t.load();let e=await U.sync();e.length>0&&(U.message={type:`erreur`,texte:e.join(` `)})},U.confirm=async function(){let e=U.lines.map(function(e){return{urlName:e.urlName,quantity:e.quantity}}),n=null;try{n=await Ne.create(e)}catch(e){if(e.statut===409){let t=await U.sync();throw t.unshift(e.message),Error(t.join(` `))}throw e}U.order=n.commande,U.images=U.lines.map(function(e){return e.image}),U.lines=[],t.save([])},U.getPage=function(){if(U.order!==null)return{message:null,lines:U.order.lignes.map(function(e,t){return{titre:e.titre,image:U.images[t],prix:e.prix,quantity:e.quantite,total:e.total}}),subtotal:U.order.total,shipping:0,total:U.order.total,numero:U.order.numero,button:``};let e=0,t=U.lines.map(function(t){let n=t.prix*t.quantity;return e+=n,{titre:t.titre,image:t.image,prix:t.prix,quantity:t.quantity,total:n}}),n=U.message;n===null&&t.length===0&&(n={type:`erreur`,texte:`Votre panier est vide.`});let r=``;return U.connectedEmail!==null&&t.length>0&&(r=`Confirmer ma commande`),{message:n,lines:t,subtotal:e,shipping:0,total:e,numero:``,button:r}};var W={};W.handler_clickOnConfirm=async function(){try{await U.confirm(),U.message=null}catch(e){U.message={type:`erreur`,texte:e.message}}G.rafraichir(U.getPage())},W.init=async function(){U.order=null,U.message=null;try{await U.load()}catch(e){return U.message={type:`erreur`,texte:`Impossible de vérifier votre session ou votre panier : ${e.message}`},G.init(U.getPage())}return U.connectedEmail===null&&G.redirect(`connexion`),G.init(U.getPage())};var G={};G.racine=null,G.init=function(e){let t=G.createPageFragment(e);return G.racine=t.firstElementChild,t},G.rafraichir=function(e){let t=G.createPageFragment(e),n=t.firstElementChild;G.racine.replaceWith(t),G.racine=n},G.redirect=function(e){window.location.assign(`/~pages39/SAE301/Base/`+e)},G.createPageFragment=function(e){let t=i(Re);return t.querySelector(`slot[name="message"]`).replaceWith(g.dom(e.message)),e.lines.length===0?(t.querySelector(`slot[name="lignes"]`).remove(),t.querySelector(`slot[name="carte"]`).remove(),t):(t.querySelector(`slot[name="lignes"]`).replaceWith(H.dom(e)),t.querySelector(`slot[name="carte"]`).replaceWith(V.dom(e,{confirm:W.handler_clickOnConfirm})),t)};function ze(){return W.init()}var K={};K.login=async function(e,t){return l(`admin/login`,{email:e,password:t})},K.logout=async function(){return l(`admin/logout`)},K.me=async function(){return c(`admin/me`)};var q={};q.fetch=async function(){return c(`admin/stats`)};var Be=`<nav class="flex flex-wrap items-center gap-2 border-b border-border-default pb-4 font-body">
  <slot name="items"></slot>
  <button type="button" data-action="logout" class="ml-auto h-9 rounded-md border border-border-default bg-surface-default px-4 text-caption font-semibold text-text-primary hover:bg-surface-hover">Se déconnecter</button>
</nav>
`,Ve=`<p class="rounded-md px-3 py-2 text-body-sm text-text-secondary">{{label}}</p>
`,J={html:function(){return Be},dom:function(e,t){let n=i(J.html()),a=e.map(function(e){return i(r(Ve,{label:e}))});return n.querySelector(`slot[name="items"]`).replaceWith(...a),n.querySelector(`[data-action="logout"]`).addEventListener(`click`,t.logout),n}},He=`<div class="mt-8 font-body text-text-primary">
  <h1 class="text-heading-lg font-bold">Tableau de bord</h1>

  <div class="mt-6 grid gap-4 sm:grid-cols-2">
    <slot name="cards"></slot>
  </div>
</div>
`,Ue=`<div class="rounded-lg border border-border-default bg-surface-default p-6">
  <p class="text-caption text-text-secondary">{{label}}</p>
  <p class="mt-2 text-heading-section font-bold">{{value}}</p>
</div>
`,Y={html:function(){return He},dom:function(e){let t=i(Y.html()),n=e.map(function(e){return i(r(Ue,{label:e.label,value:e.value}))});return t.querySelector(`slot[name="cards"]`).replaceWith(...n),t}},We=`<section class="mx-auto max-w-6xl px-4 py-8 font-body text-text-primary sm:px-6 sm:py-10">
  <slot name="formulaire"></slot>
  <slot name="nav"></slot>

  <div class="mt-6">
    <slot name="message"></slot>
  </div>

  <slot name="indicateurs"></slot>
</section>
`,X={email:``,adminEmail:null,stats:null,message:null};X.load=async function(){X.adminEmail=(await K.me()).email,X.stats=null,X.adminEmail!==null&&(X.stats=await q.fetch())},X.getPage=function(){let e=[];return X.stats!==null&&(e=[{label:`Produits`,value:X.stats.produits},{label:`Commandes`,value:X.stats.commandes}]),{message:X.message,connected:X.adminEmail!==null,sections:[`Produits`,`Commandes`,`Catégories`,`Statistiques`],indicators:e,form:{title:`Administration`,subtitle:`Connectez-vous à l'espace d'administration.`,email:X.email,autocomplete:`current-password`,button:`Se connecter`,linkText:`Espace réservé aux administrateurs.`,linkLabel:`Retour au site`,link:`/`}}};var Z={};Z.handler_submit=async function(e,t){X.email=e;try{await K.login(e,t),await X.load(),X.message=null}catch(e){X.message={type:`erreur`,texte:e.message}}Q.rafraichir(X.getPage())},Z.handler_clickOnLogout=async function(){try{await K.logout(),await X.load(),X.message={type:`succes`,texte:`Vous êtes déconnecté.`}}catch(e){X.message={type:`erreur`,texte:e.message}}Q.rafraichir(X.getPage())},Z.init=async function(){X.message=null;try{await X.load()}catch(e){X.adminEmail=null,X.message={type:`erreur`,texte:e.message}}return Q.init(X.getPage())};var Q={};Q.racine=null,Q.init=function(e){let t=Q.createPageFragment(e);return Q.racine=t.firstElementChild,t},Q.rafraichir=function(e){let t=Q.createPageFragment(e),n=t.firstElementChild;Q.racine.replaceWith(t),Q.racine=n},Q.createPageFragment=function(e){let t=i(We);return t.querySelector(`slot[name="message"]`).replaceWith(g.dom(e.message)),e.connected?(t.querySelector(`slot[name="formulaire"]`).remove(),t.querySelector(`slot[name="nav"]`).replaceWith(J.dom(e.sections,{logout:Z.handler_clickOnLogout})),t.querySelector(`slot[name="indicateurs"]`).replaceWith(Y.dom(e.indicators)),t):(t.querySelector(`slot[name="nav"]`).remove(),t.querySelector(`slot[name="indicateurs"]`).remove(),t.querySelector(`slot[name="formulaire"]`).replaceWith(P.dom(e.form,{submit:Z.handler_submit})),t)};function Ge(){return Z.init()}var Ke=`<section class="mx-auto max-w-5xl px-6 pt-10 pb-16">
  <h1 class="mb-6 text-2xl font-semibold tracking-tight">Page introuvable</h1>
  <p class="mb-6 text-sm text-zinc-500 dark:text-zinc-400">Cette page n'existe pas.</p>
  <a href="/" data-link class="text-sm font-medium underline underline-offset-4">Retour au catalogue</a>
</section>
`;function qe(){return Ke}var $=new e(`app`,{base:`/~pages39/SAE301/Base/`});$.addLayout(`/`,te),$.addRoute(`/categorie/:nom`,x),$.addRoute(`/produit/:urlName`,be),$.addRoute(`/panier`,Ee),$.addRoute(`/connexion`,Ae),$.addRoute(`/inscription`,Me),$.addRoute(`/validation`,ze),$.addRoute(`/`,x),$.addRoute(`/admin`,Ge),$.addRoute(`*`,qe),$.start();