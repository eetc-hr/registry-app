async function api(action, payload = {}) {
  const token = localStorage.getItem("token") || "";
  const res = await fetch(GAS_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(Object.assign({}, payload, { action: action, token: token }))
  });
  const j = await res.json();
  if (j && j.error && String(j.error).indexOf("غير مصرح") !== -1) {
    logout();
  }
  return j;
}

function can(screen, mode) {
  const u = getUser();
  if (!u || !u.perms) return false;
  const p = u.perms[screen];
  if (!p) return false;
  if (mode === "w") return p === "rw" || p === "w";
  return p === "r" || p === "rw" || p === "w";
}

function applyPermissions() {
  const u = getUser();
  if (!u) return;
  document.querySelectorAll("[data-screen]").forEach(function (el) {
    const screen = el.getAttribute("data-screen");
    const mode = el.getAttribute("data-mode") || "r";
    if (!can(screen, mode)) el.style.display = "none";
  });
}

function fileToBase64(file) {
  return new Promise(function (resolve, reject) {
    const r = new FileReader();
    r.onload = function () { resolve(r.result); };
    r.onerror = reject;
    r.readAsDataURL(file);
  });
}

function esc(s) {
  return String(s === undefined || s === null ? "" : s)
    .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}
