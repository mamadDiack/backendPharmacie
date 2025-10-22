import Pharmacie from "../models/pharmacieModel.js";
import { fetchFromNominatim } from "../services/nominatimService.js";
import sanitize from "mongo-sanitize";
import validator from "validator";

// route unique
export const searchPharmacie = async (req, res) => {
  try {
    let { q } = req.query;
    const format = "geojson",
      limit = 1;
    if (!q)
      return res.status(400).json({ error: "paramettre 'q' indisponible" });
    // Nettoyer pour éviter les injections Mongo
    q = sanitize(q);

    // Supprimer les espaces et vérifier la longueur
    q = q.trim();
    if (q.length < 3 || q.length > 100) {
      return res
        .status(400)
        .json({ error: "paramètre 'q' invalide (trop court ou trop long)" });
    }

    // Vérifier qu’il ne contient que des caractères autorisés
    if (!validator.matches(q, /^[a-zA-ZÀ-ÿ0-9\s,'\-]+$/u)) {
      return res
        .status(400)
        .json({ error: "paramètre 'q' contient des caractères non autorisés" });
    }

    // Vérifier dans MongoDB
    let pharmacie = await Pharmacie.findOne({ query: q.toUpperCase() });

    if (pharmacie) {
      const dataRetour = {
        query: pharmacie.query,
        latitude: pharmacie.latitude,
        longitude: pharmacie.longitude,
      };
      console.log("Résultat trouvé en cache local");
      return res.json(dataRetour);
    }

    console.log("Recherche via Nominatim...");
    const data = await fetchFromNominatim(q, format, limit);

    if (!data || !data.features || data.features.length === 0) {
      const dataRetour = {
        query: q,
        latitude: null,
        longitude: null,
      };
      return res.status(200).json(dataRetour);
    }

    const feature = data.features[0];
    const coords = feature.geometry.coordinates;

    // Enregistrer dans MongoDB
    const newPharmacie = new Pharmacie({
      nom: feature.properties.display_name.split(",")[0],
      addresse: feature.properties.display_name,
      ville: feature.properties.address.state,
      localite: q.split(",")[1],
      query: q.toUpperCase(),
      latitude: coords[1],
      longitude: coords[0],
    });

    const dataRetour = {
      query: q.toUpperCase(),
      latitude: coords[1],
      longitude: coords[0],
    };

    await newPharmacie.save();

    console.log("Enregistré en base !");
    return res.json(dataRetour);
  } catch (error) {
    console.error("Erreur searchPharmacie:", error.message);
    res.status(500).json({ error: "Erreur serveur" });
  }
};

// Route multiple
export const searchMultiplePharmacies = async (req, res) => {
  try {
    const { pharmacies } = req.body;

    // Vérification basique du corps de la requête
    if (!pharmacies || !Array.isArray(pharmacies) || pharmacies.length === 0) {
      return res.status(400).json({
        error:
          "Le champ 'pharmacies' est requis et doit être une liste non vide.",
      });
    }

    const results = [];

    // Traitement sécurisé de chaque pharmacie
    for (let rawQ of pharmacies) {
      try {
        // Nettoyage basique
        let q = sanitize(rawQ?.trim() || "");

        // Vérification longueur
        if (q.length < 3 || q.length > 120) {
          results.push({
            query: rawQ,
            message: "Nom de pharmacie invalide (trop court ou trop long)",
          });
          continue;
        }

        // Vérification caractères autorisés
        const regex = /^[a-zA-ZÀ-ÿ0-9\s,'\-]+$/u;
        if (!validator.matches(q, regex)) {
          results.push({
            query: rawQ,
            message: "Nom contient des caractères non autorisés",
          });
          continue;
        }

        // Préparer la requête pour cohérence
        const query = q.toUpperCase();

        // Vérifier dans la base de données
        let pharmacie = await Pharmacie.findOne({ query });

        if (!pharmacie) {
          console.log(`Recherche de "${query}" via Nominatim...`);

          const data = await fetchFromNominatim(query, "geojson", 1);

          if (data?.features?.length > 0) {
            const feature = data.features[0];
            const coords = feature.geometry.coordinates;

            pharmacie = new Pharmacie({
              nom: feature.properties.display_name.split(",")[0],
              addresse: feature.properties.display_name,
              ville: feature.properties.address?.state || null,
              localite: query.split(",")[1]?.trim() || null,
              query,
              latitude: coords[1],
              longitude: coords[0],
            });

            await pharmacie.save();
            console.log(`"${query}" ajouté en base`);
          } else {
            console.warn(`"${query}" introuvable sur Nominatim`);
            results.push({ query, message: "Introuvable" });
            continue;
          }
        }

        // Ajouter le résultat
        results.push({
          query,
          latitude: pharmacie.latitude,
          longitude: pharmacie.longitude,
        });
      } catch (innerErr) {
        console.error(`Erreur interne pour "${rawQ}":`, innerErr.message);
        results.push({
          query: rawQ,
          message: "Erreur lors du traitement de cette pharmacie",
        });
      }
    }

    // 🔚 Réponse finale
    return res.json({ results });
  } catch (error) {
    console.error("Erreur searchMultiplePharmacies:", error.message);
    res.status(500).json({ error: "Erreur serveur" });
  }
};

// cleanInput(value){
//     return (value || "")
//       .trim()
//       .toLowerCase()
//       .replaceAll(/[<>]/g, "")
//       .replaceAll(/["'`]/g, "")
//       .replaceAll(/[(){};]/g, "")
//       .replaceAll(/javascript:/gi, "");
//   };
