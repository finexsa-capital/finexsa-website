// FINEXSA Client Portal — UI helpers

export function qs(selector, root = document) {
  return root.querySelector(selector);
}

export function qsa(selector, root = document) {
  return Array.from(root.querySelectorAll(selector));
}

export function setText(selector, value) {
  const el = qs(selector);
  if (el) el.textContent = value == null ? "" : String(value);
}

export function show(selector) {
  const el = qs(selector);
  if (el) el.classList.remove("is-hidden");
}

export function hide(selector) {
  const el = qs(selector);
  if (el) el.classList.add("is-hidden");
}

export function setLoading(button, isLoading, loadingText = "جاري المعالجة...") {
  if (!button) return;
  if (isLoading) {
    button.dataset.originalText = button.textContent;
    button.disabled = true;
    button.textContent = loadingText;
  } else {
    button.disabled = false;
    button.textContent = button.dataset.originalText || button.textContent;
  }
}

export function showAlert(message, type = "error", target = "#page-alert") {
  const el = qs(target);
  if (!el) return;
  el.className = `client-alert ${type}`;
  el.textContent = message || "";
  el.classList.remove("is-hidden");
}

export function clearAlert(target = "#page-alert") {
  const el = qs(target);
  if (!el) return;
  el.textContent = "";
  el.classList.add("is-hidden");
}

export function toast(message, type = "success") {
  let el = qs("#client-toast");
  if (!el) {
    el = document.createElement("div");
    el.id = "client-toast";
    el.className = "client-toast";
    document.body.appendChild(el);
  }

  el.className = `client-toast ${type} show`;
  el.textContent = message;

  window.clearTimeout(window.__finexsaToastTimer);
  window.__finexsaToastTimer = window.setTimeout(() => {
    el.classList.remove("show");
  }, 3200);
}

export function formatDate(value) {
  if (!value) return "—";
  try {
    if (typeof value.toDate === "function") return value.toDate().toLocaleDateString("ar");
    if (value instanceof Date) return value.toLocaleDateString("ar");
    return new Date(value).toLocaleDateString("ar");
  } catch (_) {
    return "—";
  }
}

export function getInitials(nameOrEmail) {
  const txt = String(nameOrEmail || "F").trim();
  if (!txt) return "F";
  const clean = txt.replace(/@.*/, "");
  return clean.slice(0, 2).toUpperCase();
}
