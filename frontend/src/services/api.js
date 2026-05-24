import axios from 'axios';

const PRODUCTION_API_URL = 'https://demandforge-5.onrender.com';

/** Backoff delays for Render cold start (free tier can take 30–90s). */
const WAKE_DELAYS_MS = [0, 2000, 4000, 8000, 12000, 18000, 25000];

const normalizeBaseUrl = (url) => String(url || '').replace(/\/+$/, '');

export const API_BASE_URL = normalizeBaseUrl(
  import.meta.env.VITE_API_URL || PRODUCTION_API_URL
);

const isRetriableError = (error) => {
  const status = error?.response?.status;
  return (
    !error?.response ||
    status === 502 ||
    status === 503 ||
    status === 504 ||
    error?.code === 'ECONNABORTED' ||
    error?.message === 'Network Error'
  );
};

const parseHealthPayload = (data) => {
  const modelLoaded = data?.model_loaded === true || data?.ready === true;
  const online =
    data?.status === 'ok' ||
    data?.status === 'healthy' ||
    modelLoaded ||
    (data?.database === 'online' && data?.model_loaded !== false);

  return {
    online: Boolean(online),
    ready: modelLoaded,
    data,
  };
};

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
  timeout: 90000,
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

apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const config = error.config;
    if (!config || config.__retryCount >= 2 || !isRetriableError(error)) {
      return Promise.reject(error);
    }
    config.__retryCount = (config.__retryCount || 0) + 1;
    await new Promise((r) => setTimeout(r, 2000 * config.__retryCount));
    return apiClient.request(config);
  }
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

/**
 * Ping backend; retries on cold start. Uses /health then / for full metadata.
 */
export const checkApiHealth = async (options = {}) => {
  const { attempt = 0, maxAttempts = 1 } = options;
  const start = performance.now();

  try {
    let data = null;

    try {
      const healthRes = await apiClient.get('/health', { timeout: 90000 });
      data = healthRes.data;
    } catch {
      const rootRes = await apiClient.get('/', { timeout: 90000 });
      data = rootRes.data;
    }

    if (data && data.status === 'ok' && data.model_loaded === undefined) {
      try {
        const fullRes = await apiClient.get('/', { timeout: 30000 });
        data = { ...data, ...fullRes.data };
      } catch {
        /* /health alone is enough to mark process up */
      }
    }

    const end = performance.now();
    const parsed = parseHealthPayload(data);
    return {
      online: parsed.online,
      ready: parsed.ready,
      latency: Math.round(end - start),
      data: parsed.data,
    };
  } catch (error) {
    if (attempt + 1 < maxAttempts && isRetriableError(error)) {
      const delay = WAKE_DELAYS_MS[Math.min(attempt + 1, WAKE_DELAYS_MS.length - 1)];
      await new Promise((r) => setTimeout(r, delay));
      return checkApiHealth({ attempt: attempt + 1, maxAttempts });
    }

    const end = performance.now();
    return {
      online: false,
      ready: false,
      latency: Math.round(end - start),
      data: null,
      error: error.message,
    };
  }
};

/** Aggressive warm-up on first page load (Render sleep). */
export const warmUpApiConnection = () =>
  checkApiHealth({ maxAttempts: WAKE_DELAYS_MS.length });

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
