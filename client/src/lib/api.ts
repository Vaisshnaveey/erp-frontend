import { apiRequest } from "./queryClient";
import { buildUrl } from "@shared/routes";

export async function fetchJson<T>(url: string): Promise<T> {
  const res = await fetch(url, { credentials: "include" });
  if (!res.ok) {
    const error = await res.json().catch(() => ({ message: res.statusText }));
    throw new Error(error.message || "Request failed");
  }
  return res.json();
}

export async function postJson<T>(url: string, data: unknown): Promise<T> {
  const res = await apiRequest("POST", url, data);
  if (res.status === 204) return undefined as T;
  return res.json();
}

export async function deleteJson(url: string): Promise<void> {
  await apiRequest("DELETE", url);
}

export { buildUrl };
