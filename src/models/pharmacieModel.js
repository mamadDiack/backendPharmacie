import mongoose from "mongoose";

const PharmacieSchema = new mongoose.Schema({
  nom: { type: String, required: true, index: true },
  addresse: String,
  localite: String,
  ville: String,
  query: { type: String, index: true },
  latitude: Number,
  longitude: Number,
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.model("Pharmacie", PharmacieSchema);
