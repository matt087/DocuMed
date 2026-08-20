const AdmZip = require("adm-zip");
const path = require("path");

const carpetaOrigen = path.join(__dirname, "..", "electron", "resources-backend");
const rutaZipDestino = path.join(__dirname, "..", "electron", "backend.zip");

console.log(`Comprimiendo ${carpetaOrigen} -> ${rutaZipDestino}...`);

const zip = new AdmZip();
zip.addLocalFolder(carpetaOrigen);
zip.writeZip(rutaZipDestino);

console.log("Compresión completa.");