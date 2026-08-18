import { net } from "electron";

function backendEstaListo(url: string): Promise<boolean> {
  return new Promise((resolve) => {
    const request = net.request(url);

    request.on("response", (response) => {
      resolve(response.statusCode >= 200 && response.statusCode < 300);
    });

    request.on("error", (error) => {
      console.log("DEBUG net.request falló:", error.message);
      resolve(false);
    });

    request.end();
  });
}

export async function esperarBackend(url: string, timeoutMs = 30000, intervaloMs = 500): Promise<void> {
  const inicio = Date.now();

  while (Date.now() - inicio < timeoutMs) {
    if (await backendEstaListo(url)) {
      return;
    }
    await new Promise((resolve) => setTimeout(resolve, intervaloMs));
  }

  throw new Error(`El backend no respondió en ${timeoutMs}ms. Verifica que haya arrancado correctamente.`);
}