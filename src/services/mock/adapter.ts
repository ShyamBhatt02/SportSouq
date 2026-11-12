import { AxiosError, AxiosHeaders, type AxiosAdapter, type AxiosResponse, type InternalAxiosRequestConfig } from 'axios';
import { ApiError, dispatch } from './router';
import './handlers';

/** Simulated network latency so loading states behave like production. */
function latency(method: string, path: string): number {
  if (path.includes('/suggest')) return 120 + Math.random() * 120;
  if (method !== 'get') return 450 + Math.random() * 450;
  return 220 + Math.random() * 380;
}

function toSearchParams(params: unknown): URLSearchParams {
  if (params instanceof URLSearchParams) return params;
  const sp = new URLSearchParams();
  if (params && typeof params === 'object') {
    for (const [k, v] of Object.entries(params as Record<string, unknown>)) {
      if (v === undefined || v === null || v === '') continue;
      sp.set(k, Array.isArray(v) ? v.join(',') : String(v));
    }
  }
  return sp;
}

function parseBody(data: unknown): Record<string, unknown> {
  if (!data) return {};
  if (typeof data === 'string') {
    try {
      const parsed: unknown = JSON.parse(data);
      return parsed && typeof parsed === 'object' ? (parsed as Record<string, unknown>) : {};
    } catch {
      return {};
    }
  }
  return typeof data === 'object' ? (data as Record<string, unknown>) : {};
}

export const mockAdapter: AxiosAdapter = async (config: InternalAxiosRequestConfig): Promise<AxiosResponse> => {
  const method = (config.method ?? 'get').toLowerCase();
  const [rawPath, inlineQuery] = (config.url ?? '/').split('?');
  const path = rawPath.startsWith('/') ? rawPath : '/' + rawPath;
  const query = toSearchParams(config.params);
  if (inlineQuery) new URLSearchParams(inlineQuery).forEach((v, k) => query.set(k, v));
  const auth = config.headers?.get?.('Authorization');
  const token = typeof auth === 'string' && auth.startsWith('Bearer ') ? auth.slice(7) : null;

  await new Promise((r) => setTimeout(r, latency(method, path)));

  try {
    const { status, data } = await dispatch(method, path, { query, body: parseBody(config.data), token });
    // Deep-clone so callers can never mutate the mock "server" state by reference.
    return { data: structuredClone(data), status, statusText: 'OK', headers: new AxiosHeaders(), config, request: {} };
  } catch (err) {
    const apiErr = err instanceof ApiError ? err : new ApiError(500, 'Something went wrong. Please try again.', 'server_error');
    if (!(err instanceof ApiError)) console.error('[mock-api]', err);
    const response: AxiosResponse = {
      data: { message: apiErr.message, code: apiErr.code, fields: apiErr.fields },
      status: apiErr.status,
      statusText: apiErr.code,
      headers: new AxiosHeaders(),
      config,
      request: {},
    };
    throw new AxiosError(apiErr.message, apiErr.status >= 500 ? AxiosError.ERR_BAD_RESPONSE : AxiosError.ERR_BAD_REQUEST, config, {}, response);
  }
};
