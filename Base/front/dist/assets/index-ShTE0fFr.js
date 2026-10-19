(function(){let e=document.createElement(`link`).relList;if(e&&e.supports&&e.supports(`modulepreload`))return;for(let e of document.querySelectorAll(`link[rel="modulepreload"]`))n(e);new MutationObserver(e=>{for(let t of e)if(t.type===`childList`)for(let e of t.addedNodes)e.tagName===`LINK`&&e.rel===`modulepreload`&&n(e)}).observe(document,{childList:!0,subtree:!0});function t(e){let t={};return e.integrity&&(t.integrity=e.integrity),e.referrerPolicy&&(t.referrerPolicy=e.referrerPolicy),t.credentials=e.crossOrigin===`use-credentials`?`include`:e.crossOrigin===`anonymous`?`omit`:`same-origin`,t}function n(e){if(e.ep)return;e.ep=!0;let n=t(e);fetch(e.href,n)}})();var e=class{constructor(e,t={}){this.root=document.getElementById(e),this.routes=[],this.layouts={},this.base=(t.base??`/`).replace(/\/$/,``),this.navigation=0,window.addEventListener(`popstate`,()=>this.handleRoute()),document.addEventListener(`click`,e=>{let t=e.target.closest(`a[data-link]`);t!==null&&(e.button!==0||e.metaKey||e.ctrlKey||e.shiftKey||e.altKey||(e.preventDefault(),this.navigate(this.routePath(t.pathname))))})}addLayout(e,t){return this.layouts[e]=t,this}findLayout(e){let t=null,n=0;for(let[r,i]of Object.entries(this.layouts))e.startsWith(r)&&r.length>n&&(t=i,n=r.length);return t}addRoute(e,t,n={}){return this.routes.push({path:e,regex:this.pathToRegex(e),keys:this.extractParams(e),handler:t,useLayout:n.useLayout!==!1}),this}pathToRegex(e){if(e===`*`)return/.*/;let t=e.replace(/\//g,`\\/`).replace(/:(\w+)/g,`([^\\/]+)`).replace(/\*/g,`.*`);return RegExp(`^`+t+`$`)}extractParams(e){let t=[];for(let n of e.matchAll(/:(\w+)/g))t.push(n[1]);return t}getParams(e,t){let n=t.match(e.regex);if(!n)return{};let r={};return e.keys.forEach((e,t)=>{r[e]=decodeURIComponent(n[t+1])}),r}routePath(e){return e===this.base?`/`:e.startsWith(this.base+`/`)?e.slice(this.base.length):e}url(e){return this.base+e}navigate(e){window.history.pushState(null,``,this.url(e)),this.handleRoute()}async handleRoute(){let e=++this.navigation,t=this.routePath(window.location.pathname),n=this.routes.find(e=>e.regex.test(t));if(!n)return;let r=await n.handler(this.getParams(n,t));e===this.navigation&&this.renderContent(r,n,t)}renderContent(e,t,n){let r=e;if(!(r instanceof DocumentFragment)){let e=document.createElement(`template`);e.innerHTML=r,r=e.content}let i=t.useLayout?this.findLayout(n):null;if(i){let e=i();e.querySelector(`slot:not([name])`).replaceWith(r),r=e}this.root.replaceChildren(r),this.updateLinks(n),window.scrollTo(0,0)}updateLinks(e){for(let t of this.root.querySelectorAll(`a[data-link]`)){let n=this.routePath(t.pathname);t.setAttribute(`href`,this.url(n)),n===e?t.setAttribute(`aria-current`,`page`):t.removeAttribute(`aria-current`)}}start(){this.handleRoute()}};function t(e){return String(e).replaceAll(`&`,`&amp;`).replaceAll(`<`,`&lt;`).replaceAll(`>`,`&gt;`).replaceAll(`"`,`&quot;`).replaceAll(`'`,`&#39;`)}var n=function(e,n){let r=e;for(let e in n)r=r.replaceAll(`{{${e}}}`,()=>t(n[e]));return r};function r(e){let t=document.createElement(`template`);return t.innerHTML=e.trim(),t.content}var i=`<div class="min-h-screen">
  <main>
    <!-- Le slot sans nom reçoit la page affichée (voir lib/router.js). -->
    <slot></slot>
  </main>
</div>
`;function a(){return r(i)}var o=`/~pages39/SAE301/Base/api/`,s=class extends Error{constructor(e,t){super(e),this.name=`ErreurApi`,this.statut=t}},c=async function(e,t){let n=await fetch(o+e,t),r=null;try{r=await n.json()}catch{throw new s(`Réponse illisible du serveur.`,n.status)}if(!n.ok)throw new s(r?.erreur??`Erreur ${n.status}`,n.status);return r},l=function(e){return c(e,{method:`GET`,headers:{Accept:`application/json`}})},u={};u.fetchPage=async function(e,t){let n=`produits?page=${e}`;return t!==void 0&&t.categorie!==null&&(n+=`&categorie=${t.categorie}`),l(n)},u.fetchOne=async function(e){return l(`produit?urlName=${e}`)};var d=`<nav aria-label="Catégories" class="flex items-start rounded-1.5 mb-15">
  <slot name="onglets"></slot>
</nav>
`,f=`<a href="{{lien}}"  data-link class="flex w-75.5 h-15.5 px-6  items-center gap-5  rounded-none border border-border-default bg-surface-disabled hover:bg-surface-hover font-body text-body-sm font-semibold text-text-secondary aria-[current=page]:bg-background-inverse aria-[current=page]:text-text-inverse aria-[current=page]:hover:bg-background-inverse">
  <span>{{libelle}}</span>
  <span>({{nombre}})</span>
</a>
`,p={html:function(e){return n(d,e)},dom:function(e){let t=r(p.html(e)),i=e.categories.map(function(e){let t=`/`;return e.id!==0&&(t=`/categorie/`+encodeURIComponent(e.libelle)),r(n(f,{lien:t,libelle:e.libelle,nombre:e.nombre}))});return t.querySelector(`slot[name="onglets"]`).replaceWith(...i),t}};function m(e){return Number(e).toFixed(2).replace(`.`,`,`)+` €`}function h(e){return`/~pages39/SAE301/Base/`+e}var g=`<article class="relative flex flex-col items-start p-0 gap-0 flex-1">
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
`,v={html:function(e){return n(g,{titre:e.titre,lien:`/produit/`+e.urlName,description:e.description,prix:m(e.prix),image:h(e.image)})},dom:function(e){let t=r(v.html(e)),i=e.couleurs.split(`,`).map(function(e){return r(n(_,{couleur:e.trim()}))});return t.querySelector(`slot[name="couleurs"]`).replaceWith(...i),t}},y=`<div class="grid grid-cols-[repeat(auto-fill,minmax(200px,1fr))] gap-4">
  <slot name="cartes"></slot>
</div>`,b=`<p class="text-sm text-zinc-500 dark:text-zinc-400">Aucun produit à afficher.</p>
`,x={dom:function(e){if(e.length===0)return r(b);let t=r(y),n=e.map(function(e){return v.dom(e)});return t.querySelector(`slot[name="cartes"]`).replaceWith(...n),t}},S=`<p role="status" class="mb-6 rounded-md border px-4 py-3 text-sm {{couleurs}}">{{texte}}</p>
`,C={erreur:`border-red-700 text-red-700 dark:border-red-400 dark:text-red-400`,succes:`border-green-700 text-green-700 dark:border-green-400 dark:text-green-400`},w={html:function(e){return e===null?``:n(S,{texte:e.texte,couleurs:C[e.type]})},dom:function(e){return r(w.html(e))}},T=`<nav class="mt-10 flex items-center justify-center gap-4">
  <button type="button" data-action="precedente" class="h-9 rounded-md border border-zinc-200 px-4 text-sm font-medium transition-colors hover:bg-zinc-100 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:bg-transparent dark:border-zinc-800 dark:hover:bg-zinc-800">
    Précédent
  </button>

  <span class="text-sm text-zinc-500 dark:text-zinc-400">Page {{page}} sur {{pagesTotal}}</span>

  <button type="button" data-action="suivante" class="h-9 rounded-md border border-zinc-200 px-4 text-sm font-medium transition-colors hover:bg-zinc-100 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:bg-transparent dark:border-zinc-800 dark:hover:bg-zinc-800">
    Suivant
  </button>
</nav>
`,E={html:function(e){return n(T,e)},dom:function(e,t){let n=r(E.html(e)),i=n.querySelector(`[data-action="precedente"]`),a=n.querySelector(`[data-action="suivante"]`);return i.disabled=e.page<=1,a.disabled=e.page>=e.pagesTotal,i.addEventListener(`click`,()=>t.surPage(e.page-1)),a.addEventListener(`click`,()=>t.surPage(e.page+1)),n}},D=`<section class="mx-auto max-w-5xl px-6 pt-10 pb-16">
  
  <slot name="message"></slot>
  <slot name="categorie"></slot>
  <slot name="grille"></slot>
  <slot name="pagination"></slot>
</section>
`,O={catalogue:null,categories:[],categorie:null,message:null},k={};k.charger=async function(e){try{O.catalogue=await u.fetchPage(e,{categorie:O.categorie}),O.categories=O.catalogue.categories,O.message=null}catch(e){O.catalogue=null,O.message={type:`erreur`,texte:`Impossible de charger le catalogue : ${e.message}`}}},k.handler_changerPage=async function(e){await k.charger(e),A.rafraichir(),window.scrollTo({top:0,behavior:`smooth`})},k.init=async function(e){return O.categorie=null,e.nom!==void 0&&(O.categorie=e.nom),await k.charger(1),A.init()};var A={};A.racine=null,A.init=function(){let e=A.createPageFragment();return A.racine=e.firstElementChild,e},A.rafraichir=function(){let e=A.createPageFragment(),t=e.firstElementChild;A.racine.replaceWith(e),A.racine=t},A.createPageFragment=function(){let e=r(D);if(e.querySelector(`slot[name="message"]`).replaceWith(w.dom(O.message)),O.catalogue===null){for(let t of e.querySelectorAll(`slot`))t.remove();return e}return e.querySelector(`slot[name="categorie"]`).replaceWith(p.dom({categories:O.categories})),e.querySelector(`slot[name="grille"]`).replaceWith(x.dom(O.catalogue.produits)),e.querySelector(`slot[name="pagination"]`).replaceWith(E.dom(O.catalogue,{surPage:k.handler_changerPage})),e};function j(e){return k.init(e)}var M=`<article class="mx-auto max-w-6xl px-6 py-6 font-body text-text-primary">
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
`,N=`<button type="button" data-action="thumbnail" data-url="{{url}}" class="size-16 shrink-0 overflow-hidden rounded-md border border-border-default bg-surface-image hover:border-border-strong">
  <img src="{{image}}" alt="" class="pointer-events-none size-full object-cover">
</button>
`,P={html:function(e){return n(M,{titre:e.titre,subtitle:e.subtitle,prix:m(e.prix),categorie:e.categorie,categoryLink:`/categorie/`+e.categorie,description:e.description,mainImage:h(e.mainImage)})},dom:function(e,t){let i=r(P.html(e)),a=i.firstElementChild,o=e.images.map(function(e){return r(n(N,{url:e,image:h(e)}))});return i.querySelector(`slot[name="thumbnails"]`).replaceWith(...o),a.addEventListener(`click`,function(e){let n=e.target.closest(`[data-action]`);if(n===null)return;let r=t[n.dataset.action];r!==void 0&&r(e)}),i}},F=`<section class="mx-auto max-w-6xl">
  <div class="px-6 pt-6">
    <slot name="message"></slot>
    <a href="/" data-link data-fallback class="inline-flex h-11 items-center justify-center rounded-full border border-border-active px-6 font-body text-body-sm font-semibold text-action-secondary-foreground hover:bg-surface-hover">Retour au catalogue</a>
  </div>
  <slot name="detail"></slot>
</section>
`,I={produit:null,selectedImage:null,message:null};I.load=async function(e){I.produit=(await u.fetchOne(e)).produit,I.selectedImage=I.produit.images[0]},I.getPage=function(){return I.produit===null?{message:I.message,detail:null,title:`Produit introuvable | Nike`,description:`Ce produit n'existe pas ou n'est plus disponible.`}:{message:null,title:`${I.produit.titre} | Nike`,description:I.produit.descriptionLongue,detail:{titre:I.produit.titre,subtitle:I.produit.description,prix:I.produit.prix,categorie:I.produit.categorie,description:I.produit.descriptionLongue,mainImage:I.selectedImage,images:I.produit.images}}};var L={};L.handler_clickOnThumbnail=function(e){I.selectedImage=e.target.dataset.url,R.rafraichir(I.getPage())},L.handler_clickOnAddToCart=function(e){},L.init=async function(e){try{await I.load(e.urlName)}catch(e){I.message={type:`erreur`,texte:`Impossible d'afficher le produit : ${e.message}`}}return R.init(I.getPage())};var R={};R.racine=null,R.init=function(e){let t=R.createPageFragment(e);return R.racine=t.firstElementChild,t},R.rafraichir=function(e){let t=R.createPageFragment(e),n=t.firstElementChild;R.racine.replaceWith(t),R.racine=n},R.createPageFragment=function(e){document.title=e.title,document.head.querySelector(`meta[name="description"]`).setAttribute(`content`,e.description);let t=r(F);return t.querySelector(`slot[name="message"]`).replaceWith(w.dom(e.message)),e.detail===null?(t.querySelector(`slot[name="detail"]`).remove(),t):(t.querySelector(`[data-fallback]`).remove(),t.querySelector(`slot[name="detail"]`).replaceWith(P.dom(e.detail,{thumbnail:L.handler_clickOnThumbnail,addToCart:L.handler_clickOnAddToCart})),t)};function z(e){return L.init(e)}var B=`<section class="mx-auto max-w-5xl px-6 pt-10 pb-16">
  <h1 class="mb-6 text-2xl font-semibold tracking-tight">Page introuvable</h1>
  <p class="mb-6 text-sm text-zinc-500 dark:text-zinc-400">Cette page n'existe pas.</p>
  <a href="/" data-link class="text-sm font-medium underline underline-offset-4">Retour au catalogue</a>
</section>
`;function V(){return B}var H=new e(`app`,{base:`/~pages39/SAE301/Base/`});H.addLayout(`/`,a),H.addRoute(`/categorie/:nom`,j),H.addRoute(`/produit/:urlName`,z),H.addRoute(`/`,j),H.addRoute(`*`,V),H.start();