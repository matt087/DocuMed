import "dotenv/config";
import express, {Request, Response} from "express";
import cors from "cors";

import pacienteRoutes from "./routes/paciente.routes";
import { contactoRoutesFlat } from "./routes/contacto.routes";
import { antecedenteRoutesFlat } from "./routes/antecedente.routes";
import { consultaRoutesFlat } from "./routes/consulta.routes";
import { indicacionRoutesFlat } from "./routes/indicaciones.routes";
import { examenRoutesFlat } from "./routes/examen.routes";

const app = express();
const PORT = process.env.PORT ? Number(process.env.PORT) : 3000;

app.use(
  cors({
    origin: "http://localhost:4200",
  })
);
app.use(express.json());

app.get("/", (_req: Request, res: Response)=>{
    res.json({
        status: "ok",
        timestamp: new Date().toISOString(),
    });
});

app.use("/pacientes", pacienteRoutes);
app.use("/contactos", contactoRoutesFlat);
app.use("/antecedentes", antecedenteRoutesFlat);
app.use("/consultas", consultaRoutesFlat);
app.use("/indicaciones", indicacionRoutesFlat);
app.use("/examenes", examenRoutesFlat);

app.listen(PORT, () =>{
    console.log(`Servidor backend corriendo en http://localhost:${PORT}`);
});