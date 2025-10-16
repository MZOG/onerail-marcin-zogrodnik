import axios from "axios";
import { useAuthStore } from "@/store/useAuthStore";

const api = axios.create({
  baseURL: "https://api.escuelajs.co/api/v1",
});

api.interceptors.request.use(
  (config) => {
    const { accessToken } = useAuthStore.getState();
    if (accessToken) {
      config.headers = config.headers || {};
      config.headers.Authorization = `Bearer ${accessToken}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

let isRefreshing = false;
let failedQueue: Array<{
  resolve: (token?: string) => void;
  reject: (err: any) => void;
}> = [];

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) prom.reject(error);
    else prom.resolve(token || "");
  });
  failedQueue = [];
};

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    const { refreshToken, refresh } = useAuthStore.getState();

    if (
      error.response?.status === 401 &&
      refreshToken &&
      !originalRequest._retry
    ) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            if (token) {
              originalRequest.headers.Authorization = `Bearer ${token}`;
            }
            return api(originalRequest);
          })
          .catch(Promise.reject);
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        await refresh();
        const newToken = useAuthStore.getState().accessToken;
        processQueue(null, newToken);
        if (newToken) {
          originalRequest.headers.Authorization = `Bearer ${newToken}`;
        }
        return api(originalRequest);
      } catch (err) {
        processQueue(err, null);
        throw err;
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

export { api };
