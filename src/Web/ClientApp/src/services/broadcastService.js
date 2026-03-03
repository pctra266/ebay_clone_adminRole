import endpoints from "./endpoints";
import { apiRequest } from "./httpClient";

export function getBroadcasts(query) {
  return apiRequest(endpoints.broadcasts, { query });
}

export function sendBroadcast(payload) {
  return apiRequest(endpoints.broadcasts, {
    method: "POST",
    body: payload,
  });
}

export function scheduleBroadcast(payload) {
  return apiRequest(`${endpoints.broadcasts}/schedule`, {
    method: "POST",
    body: payload,
  });
}

