class ApiError extends Error {
  status;
  code;
  details;
  constructor(status, body) {
    super(body.error?.message ?? "N\xE3o foi poss\xEDvel concluir a opera\xE7\xE3o.");
    this.status = status;
    this.code = body.error?.code ?? "ERROR";
    this.details = body.error?.details;
  }
}
const TOKEN_KEY = "caragua360.token";
const tokenStore = {
  get: () => typeof window === "undefined" ? null : window.localStorage.getItem(TOKEN_KEY),
  set: (token) => window.localStorage.setItem(TOKEN_KEY, token),
  clear: () => window.localStorage.removeItem(TOKEN_KEY)
};
async function request(path, options = {}) {
  const headers = new Headers(options.headers);
  const token = tokenStore.get();
  if (token) headers.set("Authorization", `Bearer ${token}`);
  if (options.body && !(options.body instanceof FormData)) {
    headers.set("Content-Type", "application/json");
  }
  const response = await fetch(`/api${path}`, {
    ...options,
    headers,
    credentials: "include"
  });
  const isJson = response.headers.get("content-type")?.includes("application/json");
  const body = isJson ? await response.json() : null;
  if (!response.ok) {
    throw new ApiError(response.status, body ?? {});
  }
  return body;
}
const api = {
  get: (path) => request(path),
  post: (path, data) => request(path, { method: "POST", body: data === void 0 ? void 0 : JSON.stringify(data) }),
  put: (path, data) => request(path, { method: "PUT", body: JSON.stringify(data) }),
  patch: (path, data) => request(path, { method: "PATCH", body: data === void 0 ? void 0 : JSON.stringify(data) }),
  delete: (path) => request(path, { method: "DELETE" }),
  upload: (path, file, folder) => {
    const form = new FormData();
    form.append("photo", file);
    if (folder) form.append("folder", folder);
    return request(path, { method: "POST", body: form });
  }
};
function assetUrl(url) {
  if (!url) return "";
  return url;
}
function formatDate(value, opts) {
  if (!value) return "Data a confirmar";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Data a confirmar";
  return date.toLocaleDateString("pt-BR", opts ?? { day: "2-digit", month: "short", year: "numeric" });
}
function formatMonth(value) {
  if (!value) return "Data a confirmar";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Data a confirmar";
  return date.toLocaleDateString("pt-BR", { day: "2-digit", month: "long" });
}
export {
  ApiError,
  api,
  assetUrl,
  formatDate,
  formatMonth,
  tokenStore
};
