import axios from 'axios';

// Configuration de base d'axios
const apiClient = axios.create({
  baseURL: 'http://localhost:3000',
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true // Pour permettre l'envoi de cookies CSRF si nécessaire
});

// Intercepteur pour ajouter le token d'authentification à chaque requête
apiClient.interceptors.request.use(
  config => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  error => {
    return Promise.reject(error);
  }
);

// Intercepteur pour gérer les réponses et les erreurs
apiClient.interceptors.response.use(
  response => {
    return response;
  },
  error => {
    // Gérer les erreurs d'authentification (401)
    if (error.response && error.response.status