import endpoints from "./endpoints";
import { apiRequest } from "./httpClient";

export function getUsers(query) {
  return apiRequest(endpoints.users, { query });
}

export function getUserById(userId) {
  return apiRequest(`${endpoints.users}/${userId}`);
}

export function approveUser(userId, adminId) {
  return apiRequest(`${endpoints.users}/${userId}/approve`, {
    method: "POST",
    body: { adminId },
  });
}

export function rejectUser(userId, reason, adminId) {
  return apiRequest(`${endpoints.users}/${userId}/reject`, {
    method: "POST",
    body: { reason, adminId },
  });
}

export function banUser(userId, reason, adminId) {
  return apiRequest(`${endpoints.users}/${userId}/ban`, {
    method: "POST",
    body: { reason, adminId },
  });
}

export function unbanUser(userId, adminId) {
  return apiRequest(`${endpoints.users}/${userId}/unban`, {
    method: "POST",
    body: { adminId },
  });
}

export function updateUserStatus(userId, status, adminId) {
  return apiRequest(`${endpoints.users}/${userId}/status`, {
    method: "PUT",
    body: { status, adminId },
  });
}

