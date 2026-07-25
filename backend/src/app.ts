import "dotenv/config";
import express, {Request, Response} from "express";
import pacienteRoutes from "./routes/paciente.routes";
import { contactoRoutesFlat } from "./routes/contacto.routes";

const app = express();
const PORT = process.env.PORT ? Number(process.env.PORT) : 3000;

app.use(express.json());

app.get("/", (_req: Request, res: Response)=>{
    res.json({
        status: "ok",
        timestamp: new Date().toISOString(),
    });
});

app.use("/pacientes", pacienteRoutes);
app.use("/contactos", contactoRoutesFlat);


app.listen(PORT, () =>{
    console.log(`Servidor backend corriendo en http://localhost:${PORT}`);
});