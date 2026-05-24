import axios from 'axios';

const PRODUCTION_API_URL = 'https://demandforge-5.onrender.com';

const normalizeBaseUrl = (url) => String(url || '').replace(/\/+$/, '');

export const API_BASE_URL = normalizeBaseUrl(
  import.meta.env.VITE_API_URL || PRODUCTION_API_URL
);

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
  timeout: 60000,
});

apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('kiranaiq_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export const loginUser = async (username, password) => {
  const formData = new URLSearchParams();
  formData.append('username', username);
  formData.append('password', password);

  const response = await apiClient.post('/auth/login', formData, {
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
  });
  return response.data;
};

export const registerUser = async (username, email, password) => {
  const response = await apiClient.post('/auth/register', {
    username,
    email,
    password,
  });
  return response.data;
};

export const checkApiHealth = async (retries = 1) => {
  const start = performance.now();
  try {
    const response = await apiClient.get('/');
    const end = performance.now();
    const latency = Math.round(end - start);
    const data = response.data;
    const online =
      data?.model_loaded === true &&
      (data?.status === 'healthy' || data?.database === 'online');

    return { online, latency, data };
  } catch (error) {
    const status = error.response?.status;
    const isWakeUp =
      !error.response ||
      status === 502 ||
      status === 503 ||
      error.code === 'ECONNABORTED' ||
      error.message === 'Network Error';

    if (retries > 0 && isWakeUp) {
      await new Promise((r) => setTimeout(r, 2500));
      return checkApiHealth(retries - 1);
    }

    const end = performance.now();
    return {
      online: false,
      latency: Math.round(end - start),
      data: null,
      error: error.message,
    };
  }
};

export const predictDemand = async (predictionData) => {
  const start = performance.now();
  const response = await apiClient.post('/predict', predictionData);
  const latency = Math.round(performance.now() - start);
  const body = response.data;
  const pred = body.prediction || body;

  return {
    predicted_units_sold: pred.predicted_demand,
    latency,
    insights: body.insights || null,
    meta: {
      product_name: body.product_name,
      store_name: body.store_name,
      category_name: body.category_name,
    },
    data: body,
  };
};

export const getPredictionHistory = async () => {
  const response = await apiClient.get('/predictions/history');
  return response.data;
};

export const getProducts = async () => {
  const response = await apiClient.get('/predictions/products');
  return response.data;
};

export const getStores = async () => {
  const response = await apiClient.get('/predictions/stores');
  return response.data;
};
