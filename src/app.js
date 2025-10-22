import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import pharmacieRoute from "./routes/pharmacieRoute.js";

dotenv.config();
const app = express();

// Connexion MongoDB
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB connecté"))
  .catch((err) => console.error("Erreur Mongo:", err.message));

app.use(express.json());
app.use("/", pharmacieRoute);

const PORT = process.env.PORT || 3000;
app.listen(PORT, "0.0.0.0", () =>
  console.log(`Serveur lancé sur http://localhost:${PORT}`)
);
