import axios from 'axios';

export const api = axios.create({
  baseURL: 'http://51.77.141.175:3000',
});

// Variable pour empêcher les boucles infinies ou les doubles refreshs simultanés
let isRefreshing = false;
let failedQueue: any[] = [];

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

// 1. Intercepteur Requête (Injecte le token actuel)
api.interceptors.request.use((config) => {
  const savedUser = localStorage.getItem('admin_user');
  if (savedUser) {
    const { token } = JSON.parse(savedUser);
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// 2. Intercepteur Réponse (Gestion transparente du Refresh Token)
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Si l'erreur vient de la route de login, on ne fait rien (on laisse l'écran gérer l'erreur)
    if (originalRequest && originalRequest.url?.includes('/login_app')) {
      return Promise.reject(error);
    }

    // Si l'erreur est un 401 et qu'on n'a pas déjà tenté de la rejouer
    if (error.response && error.response.status === 401 && !originalRequest._retry) {
      
      if (isRefreshing) {
        // Si un refresh est déjà en cours, on met la requête en attente
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            return api(originalRequest);
          })
          .catch((err) => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      const savedUser = localStorage.getItem('admin_user');
      if (!savedUser) {
        handleForceLogout();
        return Promise.reject(error);
      }

      try {
        const parsedUser = JSON.parse(savedUser);
        const refreshToken = parsedUser.refresh_token;

        if (!refreshToken) {
          throw new Error("Pas de refresh token disponible");
        }

        console.log("🔄 Web Token expiré. Tentative de rafraîchissement...");
        
        // Appel direct au serveur pour échanger le refresh token (on utilise axios brut pour éviter l'intercepteur)
        const response = await axios.post('http://51.77.141.175:3000/refresh_endpoint_ici', {
          refresh_token: refreshToken,
        });

        if (response.status === 200 && response.data?.status === 'OK') {
          const { token: newToken, refresh_token: newRefreshToken } = response.data.data;

          console.log("✅ Web Refresh réussi ! Enregistrement et relance des requêtes.");

          // On met à jour le localStorage en préservant le reste des infos de l'admin (id_role, pseudo, etc.)
          const updatedUser = {
            ...parsedUser,
            token: newToken,
            refresh_token: newRefreshToken,
          };
          localStorage.setItem('admin_user', JSON.stringify(updatedUser));

          // On libère la file d'attente
          processQueue(null, newToken);
          isRefreshing = false;

          // On rejoue la requête initiale avec le nouveau token
          originalRequest.headers.Authorization = `Bearer ${newToken}`;
          return api(originalRequest);
        }
      } catch (refreshError) {
        console.error("❌ Échec critique du rafraîchissement web. Expulsion.");
        processQueue(refreshError, null);
        isRefreshing = false;
        handleForceLogout();
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

// Fonction centrale pour détruire proprement la session web
function handleForceLogout() {
  localStorage.removeItem('admin_user');
  window.location.href = '/login';
}