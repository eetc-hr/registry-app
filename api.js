async function api(action, payload) {
  const body = Object.assign({}, payload || {}, {
    action: action,
    token: localStorage.getItem("token") || ""
  });
  const res = await fetch(GAS_URL, {
    method: "POST",
    headers: { "Content-Type": "text/plain;charset=UTF-8" },
    body: JSON.stringify(body)
  });
  const txt = await res.text();
  let j;
  try { j = JSON.parse(txt); }
  catch (e) { throw new Error("رد غير صالح من الخادم (" + res.status + ")"); }
  if (j && j.error && (String(j.error).indexOf("غير مصرح") !== -1 || String(j.error).indexOf("الحساب معطل") !== -1)) {
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
    .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;").replace(/'/g, "&#39;");
}

function lines(v) {
  return String(v || "").split("\n").map(function (s) { return s.trim(); }).filter(function (s) { return s.length; });
}

/* select with a leading empty/placeholder option, e.g. fillSelect(sel, arr, "الكل") */
function fillSelect(sel, arr, firstLabel, firstValue) {
  if (!sel) return;
  const cur = sel.value;
  sel.innerHTML = "";
  if (firstLabel !== undefined && firstLabel !== null) {
    const f = document.createElement("option");
    f.value = firstValue === undefined ? "" : firstValue;
    f.textContent = firstLabel;
    sel.appendChild(f);
  }
  (arr || []).forEach(function (v) {
    const o = document.createElement("option");
    o.value = v; o.textContent = v;
    sel.appendChild(o);
  });
  if (Array.prototype.some.call(sel.options, function (x) { return x.value === cur; })) sel.value = cur;
}

/* combobox = select with an extra free-text option ("أخرى...") */
function fillCombo(sel, arr, allowOther) {
  if (!sel) return;
  const cur = sel.value;
  sel.innerHTML = "";
  (arr || []).forEach(function (v) {
    const o = document.createElement("option");
    o.value = v; o.textContent = v;
    sel.appendChild(o);
  });
  if (allowOther) {
    const o = document.createElement("option");
    o.value = "__other__"; o.textContent = "أخرى (اكتب...)";
    sel.appendChild(o);
  }
  if (cur && Array.prototype.some.call(sel.options, function (x) { return x.value === cur; })) sel.value = cur;
}
