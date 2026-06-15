import axios from 'axios';

export const api = axios.create({
  // ✅ CORRECTION : Utilisation de la passerelle HTTPS sécurisée
  baseURL: 'https://gdome.fr/api',
});

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

// Intercepteur Requête
api.interceptors.request.use((config) => {
  const savedUser = localStorage.getItem('admin_user');
  if (savedUser) {
    const { token } = JSON.parse(savedUser);
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Intercepteur Réponse (Gestion du Refresh Token)
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (originalRequest && originalRequest.url?.includes('/login_app')) {
      return Promise.reject(error);
    }

    if (error.response && error.response.status === 401 && !originalRequest._retry) {
      
      if (isRefreshing) {
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
        
        // ✅ CORRECTION ICI AUSSI : On passe par l'URL HTTPS pour le refresh !
        // Remplace '/refresh_token' par le chemin exact de ton endpoint si nécessaire (ex: '/auth/refresh')
        const response = await axios.post('https://gdome.fr/api/login_app/refresh', {
          refresh_token: refreshToken,
        });

        if (response.status === 200 && response.data?.status === 'OK') {
          const { token: newToken, refresh_token: newRefreshToken } = response.data.data;

          console.log("✅ Web Refresh réussi ! Enregistrement et relance.");

          const updatedUser = {
            ...parsedUser,
            token: newToken,
            refresh_token: newRefreshToken,
          };
          localStorage.setItem('admin_user', JSON.stringify(updatedUser));

          processQueue(null, newToken);
          isRefreshing = false;

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

function handleForceLogout() {
  localStorage.removeItem('admin_user');
  window.location.href = '/login';
}