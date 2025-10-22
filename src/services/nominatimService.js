import axios from "axios";
import dotenv from "dotenv";
dotenv.config();

const BASE_URL = process.env.NOMINATIM_URL;

export const fetchFromNominatim = async (
  query,
  format = "geojson",
  limit = 1
) => {
  const url = `${BASE_URL}/search`;
  const params = {
    q: query,
    format,
    limit,
    addressdetails: 1,
  };
  const headers = {
    "User-Agent": "YourAppName/1.0",
  };

  const response = await axios.get(url, { params, headers });
  return response.data;
};
