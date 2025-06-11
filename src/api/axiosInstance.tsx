// api/axiosInstance.ts

import axios from 'axios';
import { store } from '../redux/store';
import { setNewAccessToken, clearAuthTokens, logout } from '../redux/userSlice'; // Vos actions

const apiBaseUrl = import.meta.env.VITE_API_BASE_URL;

const axiosInstance = axios.create({
  baseURL: apiBaseUrl,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Intercepteur de REQUÊTES
axiosInstance.interceptors.request.use(
  (config) => {
    // Cette fonction est appelée AVANT que chaque requête ne soit envoyée
    const state = store.getState();
    const accessToken = state.user.accessToken; // Récupère le token actuel

    //console.log(`[Axios Interceptor] URL: ${config.url}, Token found: ${!!accessToken}`); // Ajouté pour le débogage
    // Check if headers exist, and if not, initialize them as an empty object
    if (!config.headers) {
      config.headers = {};
    }

    if (accessToken) {
      config.headers['Authorization'] = `Bearer ${accessToken}`; // Ajoute le token à l'en-tête
    }
    return config; // Retourne la configuration (modifiée) pour que la requête continue
  },
  (error) => {
    // Gère les erreurs AVANT l'envoi de la requête (rare)
    return Promise.reject(error);
  }
);

// Intercepteur de RÉPONSES
axiosInstance.interceptors.response.use(
  (response) => {
    // Cette fonction est appelée si la réponse est un succès (statut 2xx)
    return response; // Retourne la réponse pour qu'elle soit traitée par le .then() de votre code
  },
  async (error) => {
    // Cette fonction est appelée si la réponse est une erreur (statut non-2xx)
    const originalRequest = error.config;
    const state = store.getState();
    const refreshToken = state.user.refreshToken;

    // Logique de rafraîchissement du token si c'est une 401 et que ce n'est pas déjà un retry
    if (error.response.status === 401 && !originalRequest._retry && originalRequest.url !== `${apiBaseUrl}api/token/refresh/`) {
      originalRequest._retry = true; // Marque la requête comme ayant été retentée une fois

      if (refreshToken) {
        try {
          // Tente de rafraîchir le token
          const response = await axios.post<{ access: string; refresh: string }>(`${apiBaseUrl}api/token/refresh/`, {
            refresh: refreshToken,
          });
          // Met à jour le token dans le store Redux
          store.dispatch(setNewAccessToken(response.data));

          // Met à jour l'en-tête de la requête originale avec le nouveau token
          originalRequest.headers['Authorization'] = `Bearer ${response.data.access}`;

          // Re-exécute la requête originale avec le nouveau token
          return axiosInstance(originalRequest);
        } catch (refreshError) {
          // Si le rafraîchissement échoue (token de rafraîchissement expiré/invalide)
          console.error('Refresh token expired or invalid, logging out:', refreshError);
          store.dispatch(clearAuthTokens()); // Nettoie tous les tokens
          store.dispatch(logout()); // Déconnecte l'utilisateur
          return Promise.reject(refreshError);
        }
      } else {
        // Pas de refresh token, l'utilisateur doit se reconnecter
        console.warn('No refresh token available, logging out.');
        store.dispatch(clearAuthTokens());
        store.dispatch(logout());
        return Promise.reject(error);
      }
    }

    // Pour toute autre erreur, la rejeter normalement
    return Promise.reject(error);
  }
);

export default axiosInstance;