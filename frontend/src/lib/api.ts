import { IDispatch } from "../reducers";
const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

export function apiFetch(path: string, config?: any) {
  return fetch(`${BACKEND_URL}${path}`, config).then(res => res.json());
}

export function apiPost(path: string, body: object) {
  return apiFetch(path, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body)
  });
}

export function getState(deviceId: string) {
  return apiFetch(`/state/${deviceId}`);
}

export function syncState(deviceId: string, actions: IDispatch[]) {
  return apiPost(`/state/${deviceId}`, { actions });
}
