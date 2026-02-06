import axios, { AxiosInstance, AxiosError } from 'axios';

const API_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:9000';

export const apiClient: AxiosInstance = axios.create({
  baseURL: `${API_URL}/api`,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});

// Response interceptor - handle errors
apiClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    // Handle 401 - redirect to login
    if (error.response?.status === 401 && typeof window !== 'undefined') {
      window.location.href = '/auth/login';
    }

    // Handle 403 - forbidden
    if (error.response?.status === 403) {
      // eslint-disable-next-line no-console
      console.error('Access forbidden');
    }

    return Promise.reject(error);
  }
);

export default apiClient;
