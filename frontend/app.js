const API_BASE = window.BFHL_API_URL || "https://your-app.herokuapp.com";

const EXAMPLE = [
  "A->B", "A->C", "B->D", "C->E", "E->F",
  "X->Y", "Y->Z", "Z->X",
  "P->Q", "Q->R",
  "G->H", "G->H", "G->I",
  "hello", "1->2", "A->"
];

const $id = id => document.getElementById(id);

const savedTheme = localStorage.getItem("bfhl-theme") || "light";
document.documentElement.dataset.theme = savedTheme;

function applyThemeIcon() {
  const isDark = document.documentElement.dataset.theme === "dark";
  const moon = $id("icon-moon");
  const sun  = $id("icon-sun");
  if (moon) moon.hidden = isDark;
  if (sun)  sun.hidden  = !isDark;
}

applyThemeIcon();

document.addEventListener("DOMContentLoaded", () => {
  $id("btn-theme").addEventListener("click", () => {
    const next = document.documentElement.dataset.theme === "dark" ? "light" : "dark";
    document.documentElement.dataset.theme = next;
    localStorage.setItem("bfhl-theme", next);
    applyThemeIcon();
  });
});

const nodeInput  = $id("node-input");
const btnSubmit  = $id("btn-submit");
const btnExample = $id("btn-example");
const btnClear   = $id("btn-clear");
const btnCopy    = $id("btn-copy");
const runStatus  = $id("run-status");
const rsIcon     = $id("rs-icon");
const rsText     = $id("rs-text");
const errorBox   = $id("error-box");
const errorMsg   = $id("error-msg");
const emptyState = $id("empty-state");
const results    = $id("results");
const vtabVisual = $id("vtab-visual");
const vtabJson   = $id("vtab-json");
const hVisual    = $id("h-visual");
const hJson      = $id("h-json");
const hJsonPre   = $id("h-json-pre");

const getUserId = () => $id("field-userid").value.trim();
const getEmail  = () => $id("field-email").value.trim();
const getRoll   = () => $id("field-roll").value.trim();

function clearFeedback() {
  runStatus.hidden = true;
  errorBox.hidden  = true;
  errorMsg.textContent = "";
}

function setStatus(type, text) {
  runStatus.className = "run-status " + type;
  rsIcon.textContent = type === "ok" ? "✓" : "✕";
  rsText.textContent = text;
  runStatus.hidden = false;
}

function showError(msg) {
  errorBox.hidden = false;
  errorMsg.textContent = msg;
  runStatus.hidden = true;
}

btnExample.addEventListener("click", () => {
  nodeInput.value = JSON.stringify(EXAMPLE, null, 2);
  clearFeedback();
});

btnClear.addEventListener("click", () => {
  nodeInput.value = "";
  clearFeedback();
  results.hidden   = true;
  emptyState.hidden = false;
});

vtabVisual.addEventListener("click", () => {
  vtabVisual.classList.add("active");
  vtabJson.classList.remove("active");
  hVisual.hidden = false;
  hJson.hidden   = true;
});

vtabJson.addEventListener("click", () => {
  vtabJson.classList.add("active");
  vtabVisual.classList.remove("active");
  hVisual.hidden = true;
  hJson.hidden   = false;
});

btnCopy.addEventListener("click", () => {
  navigator.clipboard.writeText($id("raw-pre").textContent).then(() => {
    const orig = btnCopy.innerHTML;
    btnCopy.textContent = "Copied!";
    setTimeout(() => { btnCopy.innerHTML = orig; }, 2000);
  });
});

btnSubmit.addEventListener("click", async () => {
  clearFeedback();

  const raw = nodeInput.value.trim();
  if (!raw) { showError("Enter a JSON array of node strings."); return; }

  let parsed;
  try { parsed = JSON.parse(raw); }
  catch { showError('Invalid JSON. Example: ["A->B", "B->C"]'); return; }

  if (!Array.isArray(parsed)) { showError("Input must be a JSON array."); return; }

  const userId = getUserId();
  if (!userId) { showError("User ID cannot be empty."); return; }

  const label   = btnSubmit.querySelector(".s-label");
  const icon    = btnSubmit.querySelector(".s-icon");
  const spinner = btnSubmit.querySelector(".s-spinner");

  btnSubmit.disabled = true;
  label.hidden   = true;
  icon.hidden    = true;
  spinner.hidden = false;

  try {
    const res = await fetch(`${API_BASE}/bfhl`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        data: parsed,
        user_id: userId,
        email_id: getEmail(),
        college_roll_number: getRoll()
      })
    });

    const data = await res.json();

    if (!res.ok) { showError(data.error || "API error: " + res.status); return; }

    renderResults(data);
    const g = (data.hierarchies || []).length;
    setStatus("ok", `200 OK — ${g} group${g !== 1 ? "s" : ""} found`);
    emptyState.hidden = true;
    results.hidden    = false;

  } catch {
    showError("Could not reach the API. Check the API_BASE URL in app.js.");
  } finally {
    btnSubmit.disabled = false;
    label.hidden   = false;
    icon.hidden    = false;
    spinner.hidden = true;
  }
});

function animCount(id, target) {
  const el = $id(id);
  const t0 = performance.now();
  const dur = 500;
  const raf = now => {
    const p = Math.min((now - t0) / dur, 1);
    el.textContent = Math.round(target * (1 - Math.pow(1 - p, 3)));
    if (p < 1) requestAnimationFrame(raf);
  };
  requestAnimationFrame(raf);
}

function renderResults(data) {
  const s = data.summary || {};
  animCount("stat-trees",  s.total_trees  || 0);
  animCount("stat-cycles", s.total_cycles || 0);
  $id("stat-largest").textContent = s.largest_tree_root || "—";

  renderTags("list-invalid", data.invalid_entries || [], "tag-invalid");
  renderTags("list-dup",     data.duplicate_edges || [], "tag-dup");

  renderHierarchies(data.hierarchies || []);
  hJsonPre.textContent = JSON.stringify(data.hierarchies || [], null, 2);
  $id("raw-pre").textContent = JSON.stringify(data, null, 2);

  vtabVisual.classList.add("active");
  vtabJson.classList.remove("active");
  hVisual.hidden = false;
  hJson.hidden   = true;
}

function renderTags(containerId, items, cls) {
  const el = $id(containerId);
  el.innerHTML = "";
  if (!items.length) {
    const s = document.createElement("span");
    s.className = "tag tag-none";
    s.textContent = "None";
    el.appendChild(s);
    return;
  }
  items.forEach(item => {
    const s = document.createElement("span");
    s.className = "tag " + cls;
    s.textContent = item;
    el.appendChild(s);
  });
}

function renderHierarchies(list) {
  hVisual.innerHTML = "";
  if (!list.length) {
    hVisual.innerHTML = '<span style="color:var(--text-3);font-size:13px;font-style:italic">No hierarchies.</span>';
    return;
  }
  list.forEach((h, i) => {
    const card = document.createElement("div");
    card.className = "hcard" + (h.has_cycle ? " cyclic" : "");
    card.style.animationDelay = (i * 45) + "ms";

    const head = document.createElement("div");
    head.className = "hcard-head";

    const root = document.createElement("span");
    root.className = "hcard-root";
    root.textContent = h.root;
    head.appendChild(root);

    const b = document.createElement("span");
    if (h.has_cycle) {
      b.className = "badge badge-cycle";
      b.textContent = "CYCLE";
    } else if (h.depth !== undefined) {
      b.className = "badge badge-depth";
      b.textContent = "depth " + h.depth;
    }
    head.appendChild(b);
    card.appendChild(head);

    if (h.has_cycle) {
      const note = document.createElement("span");
      note.className = "cyclenote";
      note.textContent = "Cyclic — tree not built.";
      card.appendChild(note);
    } else {
      card.appendChild(buildTreeEl(h.root, h.tree || {}, true));
    }

    hVisual.appendChild(card);
  });
}

function buildTreeEl(key, subtree, isRoot) {
  const wrap = document.createElement("div");
  wrap.className = "tree-wrap";

  const row = document.createElement("div");
  row.className = "tree-row";

  const lbl = document.createElement("span");
  lbl.className = "tree-lbl";
  lbl.textContent = key;
  row.appendChild(lbl);
  wrap.appendChild(row);

  let children = {};
  if (isRoot && subtree[key] !== undefined) children = subtree[key];
  else if (!isRoot) children = subtree;

  const keys = Object.keys(children).sort();
  if (keys.length) {
    const cw = document.createElement("div");
    cw.className = "tree-children";
    keys.forEach((ck, ci) => {
      const isLast = ci === keys.length - 1;
      const crow = document.createElement("div");
      crow.className = "tree-row";
      const arm = document.createElement("span");
      arm.className = "tree-arm";
      arm.textContent = isLast ? "└ " : "├ ";
      crow.appendChild(arm);
      crow.appendChild(buildTreeEl(ck, children[ck], false));
      cw.appendChild(crow);
    });
    wrap.appendChild(cw);
  }

  return wrap;
}
