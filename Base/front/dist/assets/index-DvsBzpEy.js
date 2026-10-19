(function(){let e=document.createElement(`link`).relList;if(e&&e.supports&&e.supports(`modulepreload`))return;for(let e of document.querySelectorAll(`link[rel="modulepreload"]`))n(e);new MutationObserver(e=>{for(let t of e)if(t.type===`childList`)for(let e of t.addedNodes)e.tagName===`LINK`&&e.rel===`modulepreload`&&n(e)}).observe(document,{childList:!0,subtree:!0});function t(e){let t={};return e.integrity&&(t.integrity=e.integrity),e.referrerPolicy&&(t.referrerPolicy=e.referrerPolicy),t.credentials=e.crossOrigin===`use-credentials`?`include`:e.crossOrigin===`anonymous`?`omit`:`same-origin`,t}function n(e){if(e.ep)return;e.ep=!0;let n=t(e);fetch(e.href,n)}})();var e=class{constructor(e,t={}){this.root=document.getElementById(e),this.routes=[],this.layouts={},this.base=(t.base??`/`).replace(/\/$/,``),this.navigation=0,window.addEventListener(`popstate`,()=>this.handleRoute()),document.addEventListener(`click`,e=>{let t=e.target.closest(`a[data-link]`);t!==null&&(e.button!==0||e.metaKey||e.ctrlKey||e.shiftKey||e.altKey||(e.preventDefault(),this.navigate(this.routePath(t.pathname))))})}addLayout(e,t){return this.layouts[e]=t,this}findLayout(e){let t=null,n=0;for(let[r,i]of Object.entries(this.layouts))e.startsWith(r)&&r.length>n&&(t=i,n=r.length);return t}addRoute(e,t,n={}){return this.routes.push({path:e,regex:this.pathToRegex(e),keys:this.extractParams(e),handler:t,useLayout:n.useLayout!==!1}),this}pathToRegex(e){if(e===`*`)return/.*/;let t=e.replace(/\//g,`\\/`).replace(/:(\w+)/g,`([^\\/]+)`).replace(/\*/g,`.*`);return RegExp(`^`+t+`$`)}extractParams(e){let t=[];for(let n of e.matchAll(/:(\w+)/g))t.push(n[1]);return t}getParams(e,t){let n=t.match(e.regex);if(!n)return{};let r={};return e.keys.forEach((e,t)=>{r[e]=decodeURIComponent(n[t+1])}),r}routePath(e){return e===this.base?`/`:e.startsWith(this.base+`/`)?e.slice(this.base.length):e}url(e){return this.base+e}navigate(e){window.history.pushState(null,``,this.url(e)),this.handleRoute()}async handleRoute(){let e=++this.navigation,t=this.routePath(window.location.pathname),n=this.routes.find(e=>e.regex.test(t));if(!n)return;let r=await n.handler(this.getParams(n,t));e===this.navigation&&this.renderContent(r,n,t)}renderContent(e,t,n){let r=e;if(!(r instanceof DocumentFragment)){let e=document.createElement(`template`);e.innerHTML=r,r=e.content}let i=t.useLayout?this.findLayout(n):null;if(i){let e=i();e.querySelector(`slot:not([name])`).replaceWith(r),r=e}this.root.replaceChildren(r),this.updateLinks(n),window.scrollTo(0,0)}updateLinks(e){for(let t of this.root.querySelectorAll(`a[data-link]`)){let n=this.routePath(t.pathname);t.setAttribute(`href`,this.url(n)),n===e?t.setAttribute(`aria-current`,`page`):t.removeAttribute(`aria-current`)}}start(){this.handleRoute()}},t={};t.load=function(){let e=localStorage.getItem(`panier`);return e===null?[]:JSON.parse(e)},t.save=function(e){localStorage.setItem(`panier`,JSON.stringify(e))};function n(e){return String(e).replaceAll(`&`,`&amp;`).replaceAll(`<`,`&lt;`).replaceAll(`>`,`&gt;`).replaceAll(`"`,`&quot;`).replaceAll(`'`,`&#39;`)}var r=function(e,t){let r=e;for(let e in t)r=r.replaceAll(`{{${e}}}`,()=>n(t[e]));return r};function i(e){let t=document.createElement(`template`);return t.innerHTML=e.trim(),t.content}var a=`<header class="sticky top-0 z-10 border-b border-border-default bg-background-default">
  <div class="mx-auto flex  max-w-5xl flex-wrap items-center gap-6 px-6 py-3">
    <a href="/" data-link class="text-body-sm font-semibold tracking-tight">SAE301-Starter</a>

    <nav class="mr-auto flex gap-5 text-body-sm">
      <a href="/" data-link class="text-text-secondary transition-colors hover:text-text-primary aria-[current=page]:font-medium aria-[current=page]:text-text-primary">Catalogue</a>
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
`;function te(){let e=i(ee),n=0;for(let e of t.load())n+=e.quantity;return e.querySelector(`slot[name="header"]`).replaceWith(o.dom({count:n})),e}var ne=`/~pages39/SAE301/Base/api/`,s=class extends Error{constructor(e,t){super(e),this.name=`ErreurApi`,this.statut=t}},c=async function(e,t){let n=await fetch(ne+e,t),r=null;try{r=await n.json()}catch{throw new s(`Réponse illisible du serveur.`,n.status)}if(!n.ok)throw new s(r?.erreur??`Erreur ${n.status}`,n.status);return r},l=function(e){return c(e,{method:`GET`,headers:{Accept:`application/json`}})},u=function(e,t={}){return c(e,{method:`POST`,headers:{Accept:`application/json`,"Content-Type":`application/json`},body:JSON.stringify(t)})},d={};d.fetchPage=async function(e,t){let n=`produits?page=${e}`;return t!==void 0&&t.categorie!==null&&(n+=`&categorie=${t.categorie}`),l(n)},d.fetchOne=async function(e){return l(`produit?urlName=${e}`)};var re=`<nav aria-label="Catégories" class="flex flex-col sm:flex-row sm:items-start rounded-1.5 mb-15">
  <slot name="onglets"></slot>
</nav>
`,f=`<a href="{{lien}}"  data-link class="flex w-full sm:w-75.5 h-15.5 px-6  items-center gap-5  rounded-none border border-border-default bg-surface-disabled hover:bg-surface-hover font-body text-body-sm font-semibold text-text-secondary aria-[current=page]:bg-background-inverse aria-[current=page]:text-text-inverse aria-[current=page]:hover:bg-background-inverse">
  <span>{{libelle}}</span>
  <span>({{nombre}})</span>
</a>
`,p={html:function(e){return r(re,e)},dom:function(e){let t=i(p.html(e)),n=e.categories.map(function(e){let t=`/`;return e.id!==0&&(t=`/categorie/`+encodeURIComponent(e.libelle)),i(r(f,{lien:t,libelle:e.libelle,nombre:e.nombre}))});return t.querySelector(`slot[name="onglets"]`).replaceWith(...n),t}};function m(e){return Number(e).toFixed(2).replace(`.`,`,`)+` €`}function h(e){return`/~pages39/SAE301/Base/`+e}var g=`<article class="relative flex flex-col items-start p-0 gap-0 flex-1">
  <div class="flex h-55 p-0 flex-col justify-center items-center gap-0  overflow-hidden">
    <img src="{{image}}" alt="{{titre}}" class="flex-1 self-stretch">
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
`,_=`<span class="w-4.5 h-4.5 rounded-full border border-border-default bg-(--couleur)" style="--couleur: {{couleur}}"></span>
`,v={html:function(e){return r(g,{titre:e.titre,lien:`/produit/`+e.urlName,description:e.description,prix:m(e.prix),image:h(e.image)})},dom:function(e){let t=i(v.html(e)),n=e.couleurs.split(`,`).map(function(e){return i(r(_,{couleur:e.trim()}))});return t.querySelector(`slot[name="couleurs"]`).replaceWith(...n),t}},ie=`<div class="grid grid-cols-[repeat(auto-fill,minmax(200px,1fr))] gap-4">
  <slot name="cartes"></slot>
</div>`,ae=`<p class="text-sm text-zinc-500 dark:text-zinc-400">Aucun produit à afficher.</p>
`,oe={dom:function(e){if(e.length===0)return i(ae);let t=i(ie),n=e.map(function(e){return v.dom(e)});return t.querySelector(`slot[name="cartes"]`).replaceWith(...n),t}},se=`<p role="status" class="mb-6 rounded-md border px-4 py-3 text-sm {{couleurs}}">{{texte}}</p>
`,ce={erreur:`border-red-700 text-red-700 dark:border-red-400 dark:text-red-400`,succes:`border-green-700 text-green-700 dark:border-green-400 dark:text-green-400`},y={html:function(e){return e===null?``:r(se,{texte:e.texte,couleurs:ce[e.type]})},dom:function(e){return i(y.html(e))}},le=`<nav class="mt-10 flex items-center justify-center gap-4">
  <button type="button" data-action="precedente" class="h-9 rounded-md border border-zinc-200 px-4 text-sm font-medium transition-colors hover:bg-zinc-100 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:bg-transparent dark:border-zinc-800 dark:hover:bg-zinc-800">
    Précédent
  </button>

  <span class="text-sm text-zinc-500 dark:text-zinc-400">Page {{page}} sur {{pagesTotal}}</span>

  <button type="button" data-action="suivante" class="h-9 rounded-md border border-zinc-200 px-4 text-sm font-medium transition-colors hover:bg-zinc-100 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:bg-transparent dark:border-zinc-800 dark:hover:bg-zinc-800">
    Suivant
  </button>
</nav>
`,b={html:function(e){return r(le,e)},dom:function(e,t){let n=i(b.html(e)),r=n.querySelector(`[data-action="precedente"]`),a=n.querySelector(`[data-action="suivante"]`);return r.disabled=e.page<=1,a.disabled=e.page>=e.pagesTotal,r.addEventListener(`click`,()=>t.surPage(e.page-1)),a.addEventListener(`click`,()=>t.surPage(e.page+1)),n}},ue=`<section class="mx-auto max-w-5xl px-6 pt-10 pb-16">
  
  <slot name="message"></slot>
  <slot name="categorie"></slot>
  <slot name="grille"></slot>
  <slot name="pagination"></slot>
</section>
`,x={catalogue:null,categories:[],categorie:null,message:null},S={};S.charger=async function(e){try{x.catalogue=await d.fetchPage(e,{categorie:x.categorie}),x.categories=x.catalogue.categories,x.message=null}catch(e){x.catalogue=null,x.message={type:`erreur`,texte:`Impossible de charger le catalogue : ${e.message}`}}},S.handler_changerPage=async function(e){await S.charger(e),C.rafraichir(),window.scrollTo({top:0,behavior:`smooth`})},S.init=async function(e){return x.categorie=null,e.nom!==void 0&&(x.categorie=e.nom),await S.charger(1),C.init()};var C={};C.racine=null,C.init=function(){let e=C.createPageFragment();return C.racine=e.firstElementChild,e},C.rafraichir=function(){let e=C.createPageFragment(),t=e.firstElementChild;C.racine.replaceWith(e),C.racine=t},C.createPageFragment=function(){let e=i(ue);if(e.querySelector(`slot[name="message"]`).replaceWith(y.dom(x.message)),x.catalogue===null){for(let t of e.querySelectorAll(`slot`))t.remove();return e}return e.querySelector(`slot[name="categorie"]`).replaceWith(p.dom({categories:x.categories})),e.querySelector(`slot[name="grille"]`).replaceWith(oe.dom(x.catalogue.produits)),e.querySelector(`slot[name="pagination"]`).replaceWith(b.dom(x.catalogue,{surPage:S.handler_changerPage})),e};function w(e){return S.init(e)}var de=`<article class="mx-auto max-w-6xl px-6 py-6 font-body text-text-primary">
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
      <div class="flex flex-col gap-1">
        <h1 class="text-heading-lg font-bold">{{titre}}</h1>
        <p class="text-body-sm text-text-secondary">{{subtitle}}</p>
      </div>

      <div class="flex flex-col gap-1 border-b border-border-default pb-5">
        <p class="text-caption text-text-secondary">Prix</p>
        <p class="text-heading-sm font-bold">{{prix}}</p>
      </div>

      <button type="button" data-action="addToCart" class="h-11 w-full rounded-full bg-action-primary-background text-body-sm font-semibold text-action-primary-foreground hover:bg-action-primary-hover">
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
`,fe=`<button type="button" data-action="thumbnail" data-url="{{url}}" class="size-16 shrink-0 overflow-hidden rounded-md border border-border-default bg-surface-image hover:border-border-strong">
  <img src="{{image}}" alt="" class="pointer-events-none size-full object-cover">
</button>
`,T={html:function(e){return r(de,{titre:e.titre,subtitle:e.subtitle,prix:m(e.prix),categorie:e.categorie,categoryLink:`/categorie/`+e.categorie,description:e.description,mainImage:h(e.mainImage)})},dom:function(e,t){let n=i(T.html(e)),a=n.firstElementChild,o=e.images.map(function(e){return i(r(fe,{url:e,image:h(e)}))});return n.querySelector(`slot[name="thumbnails"]`).replaceWith(...o),a.addEventListener(`click`,function(e){let n=e.target.closest(`[data-action]`);if(n===null)return;let r=t[n.dataset.action];r!==void 0&&r(e)}),n}},pe=`<section class="mx-auto max-w-6xl">
  <div class="px-6 pt-6">
    <slot name="message"></slot>
    <a href="/" data-link data-fallback class="inline-flex h-11 items-center justify-center rounded-full border border-border-active px-6 font-body text-body-sm font-semibold text-action-secondary-foreground hover:bg-surface-hover">Retour au catalogue</a>
  </div>
  <slot name="detail"></slot>
</section>
`,E={produit:null,selectedImage:null,message:null};E.load=async function(e){E.produit=null,E.message=null,E.produit=(await d.fetchOne(e)).produit,E.selectedImage=E.produit.images[0]},E.addToCart=function(){let e=t.load(),n=e.find(function(e){return e.urlName===E.produit.urlName});n===void 0?e.push({urlName:E.produit.urlName,titre:E.produit.titre,prix:E.produit.prix,image:E.produit.images[0],quantity:1}):n.quantity+=1,t.save(e),E.message={type:`succes`,texte:`Produit ajouté au panier.`}},E.getPage=function(){return E.produit===null?{message:E.message,detail:null,title:`Produit introuvable | Nike`,description:`Ce produit n'existe pas ou n'est plus disponible.`}:{message:E.message,title:`${E.produit.titre} | Nike`,description:E.produit.descriptionLongue,detail:{titre:E.produit.titre,subtitle:E.produit.description,prix:E.produit.prix,categorie:E.produit.categorie,description:E.produit.descriptionLongue,mainImage:E.selectedImage,images:E.produit.images}}};var D={};D.handler_clickOnThumbnail=function(e){E.selectedImage=e.target.dataset.url,O.rafraichir(E.getPage())},D.handler_clickOnAddToCart=function(e){E.addToCart(),O.rafraichir(E.getPage())},D.init=async function(e){try{await E.load(e.urlName)}catch(e){E.message={type:`erreur`,texte:`Impossible d'afficher le produit : ${e.message}`}}return O.init(E.getPage())};var O={};O.racine=null,O.init=function(e){let t=O.createPageFragment(e);return O.racine=t.firstElementChild,t},O.rafraichir=function(e){let t=O.createPageFragment(e),n=t.firstElementChild;O.racine.replaceWith(t),O.racine=n},O.createPageFragment=function(e){document.title=e.title,document.head.querySelector(`meta[name="description"]`).setAttribute(`content`,e.description);let t=i(pe);return t.querySelector(`slot[name="message"]`).replaceWith(y.dom(e.message)),e.detail===null?(t.querySelector(`slot[name="detail"]`).remove(),t):(t.querySelector(`[data-fallback]`).remove(),t.querySelector(`slot[name="detail"]`).replaceWith(T.dom(e.detail,{thumbnail:D.handler_clickOnThumbnail,addToCart:D.handler_clickOnAddToCart})),t)};function k(e){return D.init(e)}var me=`<div>
  <slot name="lines"></slot>
</div>
`,he=`<div class="flex flex-wrap items-center gap-x-4 gap-y-3 border-b border-border-default py-5">
  <img src="{{image}}" alt="{{titre}}" class="size-16 shrink-0 rounded-md bg-surface-image object-cover">

  <div class="flex min-w-0 flex-1 flex-col gap-1">
    <a href="{{link}}" data-link class="text-body-sm font-semibold">{{titre}}</a>
    <p class="text-caption text-text-secondary">Prix unitaire : {{prix}}</p>
  </div>

  <div class="flex w-full items-center justify-between gap-4 sm:w-auto">
    <div class="flex items-center gap-2">
      <button type="button" data-action="minus" data-url-name="{{urlName}}" class="size-8 rounded-sm bg-surface-image hover:bg-surface-hover disabled:cursor-not-allowed disabled:text-text-disabled">−</button>
      <span class="w-6 text-center text-body-sm">{{quantity}}</span>
      <button type="button" data-action="plus" data-url-name="{{urlName}}" class="size-8 rounded-sm bg-surface-image hover:bg-surface-hover">+</button>
    </div>

    <p class="text-right text-body-sm font-semibold sm:w-20">{{total}}</p>

    <button type="button" data-action="delete" data-url-name="{{urlName}}" class="flex size-8 items-center justify-center rounded-md border border-border-default hover:bg-surface-hover">
      <span class="sr-only pointer-events-none">Supprimer {{titre}}</span>
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" class="pointer-events-none size-4"><path stroke-linecap="round" stroke-linejoin="round" d="M6 7h12M9 7V5h6v2m-8 0 1 12h8l1-12M10 11v5m4-5v5"/></svg>
    </button>
  </div>
</div>
`,ge=`<div class="flex flex-col items-start gap-4 border-b border-border-default py-10">
  <h2 class="text-body-lg font-bold">Votre panier est vide</h2>
  <p class="max-w-xs text-body-sm text-text-secondary">Découvrez notre sélection de produits et ajoutez vos articles favoris à votre panier.</p>
  <a href="/" data-link class="inline-flex h-10 items-center bg-action-primary-background px-6 text-body-sm font-semibold text-action-primary-foreground hover:bg-action-primary-hover">Découvrir la boutique →</a>
</div>
`,A={html:function(){return me},dom:function(e,t){let n=i(A.html()),a=n.firstElementChild,o=[i(ge)];return e.length>0&&(o=e.map(function(e){let t=i(r(he,{urlName:e.urlName,link:`/produit/`+e.urlName,titre:e.titre,image:h(e.image),prix:m(e.prix),quantity:e.quantity,total:m(e.total)}));return t.querySelector(`[data-action="minus"]`).disabled=e.quantity===1,t})),n.querySelector(`slot[name="lines"]`).replaceWith(...o),a.addEventListener(`click`,function(e){let n=e.target.closest(`[data-action]`);if(n===null)return;let r=t[n.dataset.action];r!==void 0&&r(e)}),n}},_e=`<div class=" rounded-lg p-6">
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
`,j={html:function(e){return r(_e,{subtotal:m(e.subtotal),shipping:m(e.shipping),total:m(e.total)})},dom:function(e,t){let n=i(j.html(e)),r=n.querySelector(`[data-action="validate"]`);return r.disabled=e.total===0,r.addEventListener(`click`,t.validate),n}},M=`<section class="mx-auto max-w-6xl px-4 py-6 sm:px-6 sm:py-10 font-body text-text-primary">
  <div class="grid gap-8 lg:grid-cols-3 lg:gap-10">
    <div class="lg:col-span-2">
      <h1 class="border-b border-border-default pb-4 text-heading-lg font-bold sm:text-heading-section">Panier</h1>
      <slot name="panier"></slot>
    </div>

    <slot name="recapitulatif"></slot>
  </div>
</section>
`,N={lines:[]};N.load=function(){N.lines=t.load()},N.changeQuantity=function(e,n){let r=N.lines.find(function(t){return t.urlName===e});r.quantity+n>0&&(r.quantity+=n,t.save(N.lines))},N.remove=function(e){N.lines=N.lines.filter(function(t){return t.urlName!==e}),t.save(N.lines)},N.getPage=function(){let e=0;return{lines:N.lines.map(function(t){let n=t.prix*t.quantity;return e+=n,{urlName:t.urlName,titre:t.titre,prix:t.prix,image:t.image,quantity:t.quantity,total:n}}),subtotal:e,shipping:0,total:e}};var P={};P.handler_clickOnPlus=function(e){N.changeQuantity(e.target.dataset.urlName,1),F.rafraichir(N.getPage())},P.handler_clickOnMinus=function(e){N.changeQuantity(e.target.dataset.urlName,-1),F.rafraichir(N.getPage())},P.handler_clickOnDelete=function(e){N.remove(e.target.dataset.urlName),F.rafraichir(N.getPage())},P.handler_clickOnValidate=function(e){F.redirect(`validation`)},P.init=function(){return N.load(),F.init(N.getPage())};var F={};F.racine=null,F.init=function(e){let t=F.createPageFragment(e);return F.racine=t.firstElementChild,t},F.rafraichir=function(e){let t=F.createPageFragment(e),n=t.firstElementChild;F.racine.replaceWith(t),F.racine=n},F.redirect=function(e){window.location.assign(`/~pages39/SAE301/Base/`+e)},F.createPageFragment=function(e){let t=i(M);return t.querySelector(`slot[name="panier"]`).replaceWith(A.dom(e.lines,{plus:P.handler_clickOnPlus,minus:P.handler_clickOnMinus,delete:P.handler_clickOnDelete})),t.querySelector(`slot[name="recapitulatif"]`).replaceWith(j.dom(e,{validate:P.handler_clickOnValidate})),t};function I(){return P.init()}var L={};L.register=async function(e,t){return u(`register`,{email:e,password:t})},L.login=async function(e,t){return u(`login`,{email:e,password:t})},L.logout=async function(){return u(`logout`)},L.me=async function(){return l(`me`)};var ve=`<div class="mx-auto w-full max-w-sm text-center font-body text-text-primary">
  <h1 class="border-b border-border-default pb-6 text-heading-lg font-bold">Mon compte</h1>
  <p class="mt-6 text-body-sm text-text-secondary">Vous êtes connecté avec {{email}}.</p>
  <button type="button" data-action="logout" class="mt-6 h-12 w-full rounded-md bg-action-primary-background text-body-sm font-semibold text-action-primary-foreground hover:bg-action-primary-hover">Se déconnecter</button>
</div>
`,R={html:function(e){return r(ve,e)},dom:function(e,t){let n=i(R.html(e));return n.querySelector(`[data-action="logout"]`).addEventListener(`click`,t.logout),n}},ye=`<div class="mx-auto w-full max-w-sm font-body text-text-primary">
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
`,z={html:function(e){return r(ye,e)},dom:function(e,t){let n=i(z.html(e)),r=n.querySelector(`form`);return r.addEventListener(`submit`,function(e){e.preventDefault(),t.submit(r.elements.email.value.trim(),r.elements.password.value)}),n}},B=`<section class="mx-auto max-w-6xl px-4 py-10 sm:px-6 sm:py-16">
  <slot name="formulaire"></slot>

  <div class="mx-auto mt-8 max-w-xl">
    <slot name="message"></slot>
  </div>
</section>
`,V={email:``,connectedEmail:null,message:null};V.load=async function(){V.connectedEmail=(await L.me()).email},V.getPage=function(){return{message:V.message,connectedEmail:V.connectedEmail,form:{title:`Connexion`,subtitle:`Bienvenue. Connectez-vous à votre compte Nike.`,email:V.email,autocomplete:`current-password`,button:`Se connecter`,linkText:`Pas encore de compte ?`,linkLabel:`Créer un compte`,link:`/inscription`}}};var H={};H.handler_submit=async function(e,t){V.email=e;try{await L.login(e,t),await V.load(),V.message={type:`succes`,texte:`Connexion réussie.`}}catch(e){V.message={type:`erreur`,texte:e.message}}U.rafraichir(V.getPage())},H.handler_clickOnLogout=async function(){try{await L.logout(),await V.load(),V.message={type:`succes`,texte:`Vous êtes déconnecté.`}}catch(e){V.message={type:`erreur`,texte:e.message}}U.rafraichir(V.getPage())},H.init=async function(){V.message=null;try{await V.load()}catch(e){V.connectedEmail=null,V.message={type:`erreur`,texte:`Impossible de vérifier votre session : ${e.message}`}}return U.init(V.getPage())};var U={};U.racine=null,U.init=function(e){let t=U.createPageFragment(e);return U.racine=t.firstElementChild,t},U.rafraichir=function(e){let t=U.createPageFragment(e),n=t.firstElementChild;U.racine.replaceWith(t),U.racine=n},U.createPageFragment=function(e){let t=i(B);return e.connectedEmail===null?t.querySelector(`slot[name="formulaire"]`).replaceWith(z.dom(e.form,{submit:H.handler_submit})):t.querySelector(`slot[name="formulaire"]`).replaceWith(R.dom({email:e.connectedEmail},{logout:H.handler_clickOnLogout})),t.querySelector(`slot[name="message"]`).replaceWith(y.dom(e.message)),t};function be(){return H.init()}var xe=`<section class="mx-auto max-w-6xl px-4 py-10 sm:px-6 sm:py-16">
  <slot name="formulaire"></slot>

  <div class="mx-auto mt-8 max-w-xl">
    <slot name="message"></slot>
  </div>
</section>
`,W={email:``,connectedEmail:null,message:null};W.load=async function(){W.connectedEmail=(await L.me()).email},W.getPage=function(){return{message:W.message,connectedEmail:W.connectedEmail,form:{title:`Créer un compte`,subtitle:`Renseignez votre email et choisissez un mot de passe.`,email:W.email,autocomplete:`new-password`,button:`Créer mon compte`,linkText:`Déjà un compte ?`,linkLabel:`Se connecter`,link:`/connexion`}}};var G={};G.handler_submit=async function(e,t){W.email=e;try{await L.register(e,t),await W.load(),W.message={type:`succes`,texte:`Compte créé. Vous êtes connecté.`}}catch(e){W.message={type:`erreur`,texte:e.message}}K.rafraichir(W.getPage())},G.handler_clickOnLogout=async function(){try{await L.logout(),await W.load(),W.message={type:`succes`,texte:`Vous êtes déconnecté.`}}catch(e){W.message={type:`erreur`,texte:e.message}}K.rafraichir(W.getPage())},G.init=async function(){W.message=null;try{await W.load()}catch(e){W.connectedEmail=null,W.message={type:`erreur`,texte:`Impossible de vérifier votre session : ${e.message}`}}return K.init(W.getPage())};var K={};K.racine=null,K.init=function(e){let t=K.createPageFragment(e);return K.racine=t.firstElementChild,t},K.rafraichir=function(e){let t=K.createPageFragment(e),n=t.firstElementChild;K.racine.replaceWith(t),K.racine=n},K.createPageFragment=function(e){let t=i(xe);return e.connectedEmail===null?t.querySelector(`slot[name="formulaire"]`).replaceWith(z.dom(e.form,{submit:G.handler_submit})):t.querySelector(`slot[name="formulaire"]`).replaceWith(R.dom({email:e.connectedEmail},{logout:G.handler_clickOnLogout})),t.querySelector(`slot[name="message"]`).replaceWith(y.dom(e.message)),t};function Se(){return G.init()}var q={};q.create=async function(e){return u(`commandes`,{lines:e})};var Ce=`<div class="h-fit  p-6 text-center font-body text-text-primary">
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" class="mx-auto size-16"><circle cx="12" cy="12" r="10"/><path stroke-linecap="round" stroke-linejoin="round" d="m8 12.5 3 3 5-6"/></svg>

  <h2 class="mt-6 text-heading-sm font-bold">Commande validée !</h2>
  <p class="mt-2 text-body-sm text-text-secondary">Votre commande a bien été enregistrée.</p>

  <p class="mt-6 text-caption-xs uppercase text-text-secondary">Numéro de commande</p>
  <p class="mt-2 rounded-md border border-border-default py-4 text-body-sm font-bold">{{numero}}</p>

  <a href="/" data-link class="mt-6 flex h-12 w-full items-center justify-center bg-action-primary-background text-body-sm font-semibold text-action-primary-foreground hover:bg-action-primary-hover">Continuer mes achats</a>
</div>
`,we=`<div class="h-fit p-6 font-body text-text-primary">
  <h2 class="text-heading-sm font-bold">Valider la commande</h2>
  <p class="mt-2 text-body-sm text-text-secondary">Vérifiez votre récapitulatif puis confirmez votre commande.</p>
  <button type="button" data-action="confirm" class="mt-6 h-12 w-full  bg-action-primary-background text-body-sm font-semibold text-action-primary-foreground hover:bg-action-primary-hover empty:hidden">{{button}}</button>
</div>
`,J={html:function(e){return e.numero===``?r(we,{button:e.button}):r(Ce,{numero:e.numero})},dom:function(e,t){let n=i(J.html(e));return e.numero===``&&n.querySelector(`[data-action="confirm"]`).addEventListener(`click`,t.confirm),n}},Te=`<div class="mt-6 font-body text-text-primary">
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
`,Ee=`<div class="flex items-center gap-4 border-b border-border-default py-4">
  <img src="{{image}}" alt="{{titre}}" class="size-12 shrink-0 rounded-md bg-surface-image object-cover">

  <div class="flex flex-1 flex-col gap-1">
    <p class="text-body-sm font-semibold">{{titre}}</p>
    <p class="text-caption text-text-secondary">Quantité : {{quantity}} · Prix unitaire : {{prix}}</p>
  </div>

  <p class="text-body-sm font-bold">{{total}}</p>
</div>
`,Y={html:function(e){return r(Te,{subtotal:m(e.subtotal),shipping:m(e.shipping),total:m(e.total)})},dom:function(e){let t=i(Y.html(e)),n=e.lines.map(function(e){return i(r(Ee,{titre:e.titre,image:h(e.image),quantity:e.quantity,prix:m(e.prix),total:m(e.total)}))});return t.querySelector(`slot[name="lines"]`).replaceWith(...n),t}},De=`<section class="mx-auto max-w-6xl px-4 py-6 font-body text-text-primary sm:px-6 sm:py-10">
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
`,X={lines:[],connectedEmail:null,images:[],order:null,message:null};X.load=async function(){X.connectedEmail=(await L.me()).email,X.lines=t.load()},X.confirm=async function(){let e=X.lines.map(function(e){return{urlName:e.urlName,quantity:e.quantity}});X.order=(await q.create(e)).commande,X.images=X.lines.map(function(e){return e.image}),X.lines=[],t.save([])},X.getPage=function(){if(X.order!==null)return{message:null,lines:X.order.lignes.map(function(e,t){return{titre:e.titre,image:X.images[t],prix:e.prix,quantity:e.quantite,total:e.total}}),subtotal:X.order.total,shipping:0,total:X.order.total,numero:X.order.numero,button:``};let e=0,t=X.lines.map(function(t){let n=t.prix*t.quantity;return e+=n,{titre:t.titre,image:t.image,prix:t.prix,quantity:t.quantity,total:n}}),n=X.message;n===null&&t.length===0&&(n={type:`erreur`,texte:`Votre panier est vide.`});let r=``;return X.connectedEmail!==null&&t.length>0&&(r=`Confirmer ma commande`),{message:n,lines:t,subtotal:e,shipping:0,total:e,numero:``,button:r}};var Z={};Z.handler_clickOnConfirm=async function(){try{await X.confirm(),X.message=null}catch(e){X.message={type:`erreur`,texte:e.message}}Q.rafraichir(X.getPage())},Z.init=async function(){X.order=null,X.message=null;try{await X.load()}catch(e){return X.message={type:`erreur`,texte:`Impossible de vérifier votre session : ${e.message}`},Q.init(X.getPage())}return X.connectedEmail===null&&Q.redirect(`connexion`),Q.init(X.getPage())};var Q={};Q.racine=null,Q.init=function(e){let t=Q.createPageFragment(e);return Q.racine=t.firstElementChild,t},Q.rafraichir=function(e){let t=Q.createPageFragment(e),n=t.firstElementChild;Q.racine.replaceWith(t),Q.racine=n},Q.redirect=function(e){window.location.assign(`/~pages39/SAE301/Base/`+e)},Q.createPageFragment=function(e){let t=i(De);return t.querySelector(`slot[name="message"]`).replaceWith(y.dom(e.message)),e.lines.length===0?(t.querySelector(`slot[name="lignes"]`).remove(),t.querySelector(`slot[name="carte"]`).remove(),t):(t.querySelector(`slot[name="lignes"]`).replaceWith(Y.dom(e)),t.querySelector(`slot[name="carte"]`).replaceWith(J.dom(e,{confirm:Z.handler_clickOnConfirm})),t)};function Oe(){return Z.init()}var ke=`<section class="mx-auto max-w-5xl px-6 pt-10 pb-16">
  <h1 class="mb-6 text-2xl font-semibold tracking-tight">Page introuvable</h1>
  <p class="mb-6 text-sm text-zinc-500 dark:text-zinc-400">Cette page n'existe pas.</p>
  <a href="/" data-link class="text-sm font-medium underline underline-offset-4">Retour au catalogue</a>
</section>
`;function Ae(){return ke}var $=new e(`app`,{base:`/~pages39/SAE301/Base/`});$.addLayout(`/`,te),$.addRoute(`/categorie/:nom`,w),$.addRoute(`/produit/:urlName`,k),$.addRoute(`/panier`,I),$.addRoute(`/connexion`,be),$.addRoute(`/inscription`,Se),$.addRoute(`/validation`,Oe),$.addRoute(`/`,w),$.addRoute(`*`,Ae),$.start();