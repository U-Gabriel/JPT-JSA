import axios from 'axios';

export const api = axios.create({
  baseURL: 'http://51.77.141.175:3000',
});

// Intercepteur Requête (Injecte le token)
api.interceptors.request.use((config) => {
  const savedUser = localStorage.getItem('admin_user');
  if (savedUser) {
    const { token } = JSON.parse(savedUser);
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Intercepteur Réponse (Gestion intelligente des erreurs)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // 🟢 OPTIMISATION : Si l'erreur vient de la page de login, on ne fait RIEN.
    // On laisse la fonction loginApi renvoyer l'erreur à la page pour l'afficher à l'écran.
    if (error.config && error.config.url?.includes('/login_app')) {
      return Promise.reject(error);
    }

    // Pour TOUTES les autres pages du site :
    if (error.response) {
      if (error.response.status === 401) {
        localStorage.removeItem('admin_user');
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);