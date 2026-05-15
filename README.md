# Pharmacie Backend API

Ce projet est une API backend permettant de rechercher les coordonnées géographiques (latitude et longitude) de pharmacies. Elle utilise l'API Nominatim (OpenStreetMap) pour le géocodage et MongoDB pour mettre en cache les résultats afin d'optimiser les performances et de réduire les appels aux services externes.

## Fonctionnalités

- **Recherche de pharmacie unique** : Récupère les coordonnées d'une pharmacie à partir de son nom ou de son adresse.
- **Recherche multiple** : Traite une liste de pharmacies en une seule requête.
- **Mise en cache (Caching)** : Stocke les résultats dans une base de données MongoDB pour des recherches ultérieures plus rapides.
- **Sécurisation** : Utilise `mongo-sanitize` et `validator` pour protéger contre les injections NoSQL et valider les entrées.

## Technologies Utilisées

- **Node.js** & **Express** : Framework backend.
- **MongoDB** & **Mongoose** : Base de données et modélisation.
- **Axios** : Client HTTP pour interroger Nominatim.
- **Nominatim API** : Service de géocodage open-source.
- **Dotenv** : Gestion des variables d'environnement.

## Installation

1. **Cloner le projet** :

   ```bash
   git clone https://https://github.com/mamadDiack/backendPharmacie.git
   cd backendPharmacie
   ```

2. **Installer les dépendances** :

   ```bash
   npm install
   ```

3. **Configurer les variables d'environnement** :
   Créez un fichier `.env` à la racine du projet et ajoutez les informations suivantes :
   ```env
   MONGO_URI=mongodb://localhost:27017/pharmacie
   PORT=3000
   ```

## Utilisation

### Lancer le serveur en mode développement

```bash
npm run dev
```

Le serveur sera accessible sur `http://localhost:3000`.

## API Endpoints

### 1. Recherche d'une seule pharmacie

**URL** : `/search`  
**Méthode** : `GET`  
**Paramètres de requête** :

- `q` (string, requis) : Le nom ou l'adresse de la pharmacie (ex: `Pharmacie de la Paix, Dakar`).

**Exemple de réponse** :

```json
{
  "query": "PHARMACIE DE LA PAIX",
  "latitude": 14.6784,
  "longitude": -17.4452
}
```

### 2. Recherche de plusieurs pharmacies

**URL** : `/search/multiple`  
**Méthode** : `POST`  
**Corps de la requête (JSON)** :

```json
{
  "pharmacies": [
    "Pharmacie de la Paix, Dakar",
    "Pharmacie Cheikh Anta Diop, Dakar"
  ]
}
```

**Exemple de réponse** :

```json
{
  "results": [
    {
      "nomPharmacie": "PHARMACIE DE LA PAIX",
      "latitude": 14.6784,
      "longitude": -17.4452
    },
    {
      "nomPharmacie": "PHARMACIE CHEIKH ANTA DIOP",
      "latitude": 14.6911,
      "longitude": -17.4623
    }
  ]
}
```

## Structure du Projet

- `src/app.js` : Point d'entrée de l'application.
- `src/controllers/` : Logique de traitement des requêtes.
- `src/models/` : Modèles Mongoose (Schéma Pharmacie).
- `src/routes/` : Définition des routes API.
- `src/services/` : Intégrations de services tiers (Nominatim).

## Sécurité

L'API implémente des validations strictes sur les entrées :

- Longueur des requêtes limitée (3 à 120 caractères).
- Filtrage des caractères spéciaux via Regex.
- Protection contre les injections NoSQL.
