import { net } from "electron";
import { ChildProcess } from "child_process";

function backendEstaListo(url: string): Promise<boolean> {
  return new Promise((resolve) => {
    try {
      const request = net.request(url);

      request.on("response", (response) => {
        resolve(
          response.statusCode >= 200 &&
          response.statusCode < 300
        );
      });

      request.on("error", (error) => {
        console.log(
          "DEBUG net.request falló:",
          error.message
        );

        resolve(false);
      });

      request.end();
    } catch (error) {
      console.log(
        "DEBUG error creando request:",
        error
      );

      resolve(false);
    }
  });
}

export async function esperarBackend(
  url: string,
  procesoBackend: ChildProcess,
  timeoutMs = 60000,
  intervaloMs = 500
): Promise<void> {
  const inicio = Date.now();

  while (Date.now() - inicio < timeoutMs) {
    if (procesoBackend.exitCode !== null) {
      throw new Error(
        `El proceso del backend terminó antes de estar disponible. ` +
        `Código: ${procesoBackend.exitCode}`
      );
    }

    if (await backendEstaListo(url)) {
      console.log("Backend respondió correctamente.");
      return;
    }

    await new Promise((resolve) =>
      setTimeout(resolve, intervaloMs)
    );
  }

  throw new Error(
    `El backend no respondió en ${timeoutMs}ms. ` +
    `Verifica que haya arrancado correctamente.`
  );
}