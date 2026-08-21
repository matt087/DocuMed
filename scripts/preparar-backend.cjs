const fs = require("fs");
const path = require("path");

const raiz = path.join(__dirname, "..");
const backendDir = path.join(raiz, "backend");
const destino = path.join(raiz, "electron", "resources-backend");

function copiarDir(origen, dest) {
  fs.mkdirSync(dest, { recursive: true });
  for (const entrada of fs.readdirSync(origen, { withFileTypes: true })) {
    const rutaOrigen = path.join(origen, entrada.name);
    const rutaDest = path.join(dest, entrada.name);
    if (entrada.isDirectory()) copiarDir(rutaOrigen, rutaDest);
    else fs.copyFileSync(rutaOrigen, rutaDest);
  }
}

console.log("Limpiando resources-backend...");
fs.rmSync(destino, { recursive: true, force: true });
fs.mkdirSync(destino, { recursive: true });

console.log("Copiando backend compilado...");
copiarDir(path.join(backendDir, "dist"), path.join(destino, "dist"));

console.log("Copiando prisma/ (schema + migrations, leídas por nuestro runner propio)...");
copiarDir(path.join(backendDir, "prisma"), path.join(destino, "prisma"));

console.log("Copiando variables de entorno...");
fs.copyFileSync(path.join(backendDir, ".env"), path.join(destino, ".env"));

console.log("Copiando better-sqlite3 (único módulo nativo necesario)...");
copiarDir(
  path.join(backendDir, "node_modules", "better-sqlite3"),
  path.join(destino, "deps-nativas", "better-sqlite3")
);

console.log("resources-backend preparado correctamente.");