import axios, { AxiosError } from 'axios';
import { STORAGE_KEYS } from '@/config/site';
import type { AuthSession } from '@/types';
import { readStorage, isObject } from '@/utils/storage';

const USE_MOCK = (import.meta.env.VITE_USE_MOCK_API as string | undefined) !== 'false';

/**
 * Single Axios instance used by every service. While the backend is not yet
 * built, requests are served by an in-browser mock adapter with realistic
 * latency. Set VITE_USE_MOCK_API=false to point at VITE_API_BASE_URL instead —
 * no component or hook changes required.
 */
export const api = axios.create({
  baseURL: USE_MOCK ? '/api' : (import.meta.env.VITE_API_BASE_URL as string | undefined),
  timeout: 15_000,
  headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
});

if (USE_MOCK) {
  // Lazily attach the mock adapter so it is code-split away when disabled.
  const adapterPromise = import('../mock/adapter').then((m) => m.mockAdapter);
  api.defaults.adapter = async (config) => {
    const adapter = await adapterPromise;
    const url = (config.url ?? '').replace(/^\/?api/, '');
    return adapter({ ...config, url });
  };
}

api.interceptors.request.use((config) => {
  const session = readStorage<AuthSession | null>(STORAGE_KEYS.session, null, (v): v is AuthSession => isObject(v));
  if (session?.token) config.headers.set('Authorization', 'Bearer ' + session.token);
  return config;
});

export interface ApiErrorBody {
  message?: string;
  code?: string;
  fields?: Record<string, string>;
}

export function getErrorMessage(error: unknown, fallback = 'Something went wrong. Please try again.'): string {
  if (error instanceof AxiosError) {
    const body = error.response?.data as ApiErrorBody | undefined;
    if (body?.message) return body.message;
    if (error.code === 'ECONNABORTED') return 'The request timed out. Please check your connection.';
    if (!error.response) return 'Network error — please check your connection.';
  }
  if (error instanceof Error && error.message) return error.message;
  return fallback;
}

export function getErrorStatus(error: unknown): number | undefined {
  return error instanceof AxiosError ? error.response?.status : undefined;
}
