
#!/usr/bin/env node

/**
 *
 * Règles automatiques :
 * 1. data/ ne manipule pas le DOM et ne charge pas de templates HTML.
 * 2. ui/ ne dépend pas de data/ et n'appelle pas directement l'API.
 * 3. ui/ transmet les événements à des callbacks, sauf exceptions explicites.
 * 4. Les templates utilisent un mécanisme d'échappement des valeurs.
 * 5. Signale les points à vérifier manuellement par l'agent.
 *
 *
 * Code de sortie :
 * 0 = aucun problème automatique détecté
 * 1 = au moins une violation automatique
 */

const fs = require("node:fs");
const path = require("node:path");

const args = process.argv.slice(2);

if (args.includes("--help") || args.includes("-h")) {
  console.log(`
Usage :
  node .agents/SKILLS/verifier-mvc/scripts/check-mvc.js [racine]

Contrôles :
  - data/ : interdiction du DOM et des templates HTML.
  - ui/ : interdiction des appels API directs et des imports data/.
  - ui/ : contrôle indicatif des callbacks d'événements.
  - Sécurité : présence de l'échappement dans genericRenderer.
  - Affichage des contrôles nécessitant une revue manuelle.

Code de sortie :
  0 : aucune violation automatique détectée.
  1 : violations automatiques détectées.
`);
  process.exit(0);
}

const root = path.resolve(
  args.find(arg => !arg.startsWith("-")) || "."
);

const front = path.join(root, "front", "src");
const violations = [];
const warnings = [];
const checked = [];

function relative(file) {
  return path.relative(root, file).replace(/\\/g, "/");
}

function exists(file) {
  return fs.existsSync(path.join(root, file));
}

function report(message) {
  violations.push(message);
}

function warning(message) {
  warnings.push(message);
}

if (!fs.existsSync(front)) {
  console.error(
    "ERREUR : front/src introuvable. Lance le script depuis la racine du projet."
  );
  process.exit(1);
}

function walk(dir) {
  if (!fs.existsSync(dir)) return [];

  const result = [];

  for (const entry of fs.readdirSync(dir, {
    withFileTypes: true
  })) {
    if (
      entry.name === "node_modules" ||
      entry.name === "dist"
    ) {
      continue;
    }

    const file = path.join(dir, entry.name);

    if (entry.isDirectory()) {
      result.push(...walk(file));
    } else if (entry.isFile() && entry.name.endsWith(".js")) {
      result.push(file);
    }
  }

  return result;
}

function stripCommentsAndStrings(source) {
  let output = "";
  let i = 0;

  while (i < source.length) {
    const start = i;
    const char = source[i];
    const next = source[i + 1];

    // Commentaire sur une ligne.
    if (char === "/" && next === "/") {
      i += 2;
      while (i < source.length && source[i] !== "\n") i++;
      output += " ".repeat(i - start);
      continue;
    }

    if (char === "/" && next === "*") {
      i += 2;
      while (
        i < source.length &&
        !(source[i] === "*" && source[i + 1] === "/")
      ) i++;

      if (i < source.length) i += 2;

      output += source.slice(start, i).replace(/[^\n]/g, " ");
      continue;
    }

    if (char === "'" || char === '"') {
      const quote = char;
      i++;

      while (i < source.length) {
        if (source[i] === "\\") {
          i += 2;
          continue;
        }

        if (source[i] === quote) {
          i++;
          break;
        }

        i++;
      }

      output += source.slice(start, i).replace(/[^\n]/g, " ");
      continue;
    }

    if (char === "`") {
      i++;

      while (i < source.length) {
        if (source[i] === "\\") {
          i += 2;
          continue;
        }

        if (source[i] === "`") {
          i++;
          break;
        }

        i++;
      }

      output += source.slice(start, i).replace(/[^\n]/g, " ");
      continue;
    }

    output += char;
    i++;
  }

  return output;
}

function lineAt(source, index) {
  return source.slice(0, index).split("\n").length;
}

function addLineViolation(file, source, index, message) {
  report(`${relative(file)}:${lineAt(source, index)} : ${message}`);
}

const files = walk(front);


const dataFiles = files.filter(file =>
  relative(file).startsWith("front/src/data/")
);

for (const file of dataFiles) {
  const source = fs.readFileSync(file, "utf8");
  const clean = stripCommentsAndStrings(source);

  checked.push(relative(file));

  // Aucun accès direct au DOM.
  const domRegex =
    /\b(document|window|HTMLElement|Element|Node)\b|\b(?:querySelector|querySelectorAll|createElement|addEventListener|innerHTML)\b/g;

  let match;

  while ((match = domRegex.exec(clean)) !== null) {
    addLineViolation(
      file,
      source,
      match.index,
      `data/ ne doit pas manipuler le DOM (${match[0]}).`
    );
  }

  const htmlImport =
    /^\s*import\b[^;\n]*\.(?:html|htm)(?:\?raw)?/gm;

  while ((match = htmlImport.exec(source)) !== null) {
    addLineViolation(
      file,
      source,
      match.index,
      "data/ ne doit pas importer de template HTML."
    );
  }
}


const uiFiles = files.filter(file =>
  relative(file).startsWith("front/src/ui/")
);

for (const file of uiFiles) {
  const source = fs.readFileSync(file, "utf8");
  const clean = stripCommentsAndStrings(source);
  const rel = relative(file);

  checked.push(rel);

  const dataImport =
    /\b(?:import|export)\b[\s\S]*?\bfrom\s*["']([^"']+)["']/g;

  let match;

  while ((match = dataImport.exec(source)) !== null) {
    const specifier = match[1];

    if (
      specifier.startsWith("../data/") ||
      specifier.startsWith("../../data/") ||
      specifier.includes("/data/")
    ) {
      addLineViolation(
        file,
        source,
        match.index,
        `ui/ ne doit pas importer data/ (${specifier}).`
      );
    }
  }

  const fetchRegex = /\bfetch\s*\(/g;

  while ((match = fetchRegex.exec(clean)) !== null) {
    addLineViolation(
      file,
      source,
      match.index,
      "ui/ ne doit pas appeler directement fetch(). Utiliser data/ via la page."
    );
  }

  const apiImportRegex =
    /\b(?:import|export)\b[^;\n]*\bfrom\s*["']([^"']*api-request\.js)["']/g;

  while ((match = apiImportRegex.exec(source)) !== null) {
    addLineViolation(
      file,
      source,
      match.index,
      "ui/ ne doit pas importer directement api-request.js."
    );
  }

  const hasListener = /\baddEventListener\s*\(/.test(clean);
  const hasCallback = /\bactions\s*\.\s*\w+/.test(clean);
  const isHeaderTheme = /\/header\//.test(rel);

  if (hasListener && !hasCallback && !isHeaderTheme) {
    warning(
      `${rel} : vérifier que les événements délèguent les actions à des callbacks de page.`
    );
  }
}


const utilsFile = path.join(front, "lib", "utils.js");

if (!fs.existsSync(utilsFile)) {
  report("front/src/lib/utils.js absent : échappement non vérifiable.");
} else {
  const utils = fs.readFileSync(utilsFile, "utf8");

  if (!/\bfunction\s+escapeHtml\b|\bescapeHtml\s*=/.test(utils)) {
    report(
      "front/src/lib/utils.js : fonction escapeHtml introuvable."
    );
  }

  if (!/\bgenericRenderer\b/.test(utils)) {
    report(
      "front/src/lib/utils.js : genericRenderer introuvable."
    );
  } else if (!/escapeHtml\s*\(/.test(utils)) {
    report(
      "front/src/lib/utils.js : genericRenderer ne semble pas utiliser escapeHtml()."
    );
  }

  if (!/replaceAll\s*\(/.test(utils)) {
    warning(
      "utils.js : vérifier que les placeholders HTML sont remplacés sans interpréter les valeurs comme du HTML."
    );
  }
}



const manualChecks = [
  "Les modules data/ ne contiennent aucune règle d'affichage ni logique métier de page.",
  "Les pages coordonnent le modèle, les composants UI et les callbacks.",
  "Les composants UI restent principalement chargés de l'affichage et des événements.",
  "Les valeurs utilisateur sont échappées avant leur insertion dans les templates.",
  "Les erreurs réseau et les statuts HTTP 401/403 sont traités lorsqu'ils sont concernés.",
  "Les états de chargement et les états vides sont traités lorsqu'ils sont nécessaires.",
  "Les fichiers modifiés ont été lus et leurs imports directs ont été examinés.",
  "Le build Vite a été exécuté séparément et son résultat a été vérifié."
];


console.log("\n=== Vérification MVC du front SAE301 ===\n");
console.log(`Racine : ${root}`);
console.log(`Fichiers JavaScript examinés : ${checked.length}`);

if (violations.length > 0) {
  console.error(`\n${violations.length} violation(s) détectée(s) :`);

  for (const item of violations) {
    console.error(`- ${item}`);
  }
} else {
  console.log("\nAucune violation automatique détectée.");
}

if (warnings.length > 0) {
  console.log(`\n${warnings.length} avertissement(s) à examiner :`);

  for (const item of warnings) {
    console.log(`- ${item}`);
  }
}

console.log("\n=== Revue manuelle requise par le skill ===");

for (const item of manualChecks) {
  console.log(`[À vérifier] ${item}`);
}

console.log(
  "\nAttention : les contrôles statiques ne remplacent pas la lecture du code."
);

if (violations.length > 0) {
  process.exitCode = 1;
} else {
  process.exitCode = 0;
}
