const state = { data: null, query: "", agency: "ALL", selectedId: null, patternIndex: 0 };
const $ = selector => document.querySelector(selector);
const list = $("#routeList");
const cardTemplate = $("#routeCard");

function filteredRoutes() {
  const q = state.query.trim().toLowerCase();
  return state.data.routes.filter(route => {
    const matchesAgency = state.agency === "ALL" || route.agencyId === state.agency;
    if (!q) return matchesAgency;
    const words = [route.number, route.name, route.agency, ...route.patterns.flatMap(p => [p.headsign, ...p.stops.map(stop => stop.name)])].join(" ").toLowerCase();
    return matchesAgency && words.includes(q);
  });
}
function showList() {
  const routes = filteredRoutes();
  $("#resultCount").textContent = `${routes.length.toLocaleString("en-IN")} routes shown`;
  list.replaceChildren();
  if (!routes.length) { list.innerHTML = '<p style="color:#70808e;font-size:12px;padding:15px">No route matched your search.</p>'; return; }
  for (const route of routes) {
    const node = cardTemplate.content.cloneNode(true);
    const button = node.querySelector("button");
    button.dataset.id = route.id;
    button.classList.toggle("selected", route.id === state.selectedId);
    node.querySelector(".route-number").textContent = route.number;
    node.querySelector("strong").textContent = route.name;
    const count = route.patterns[0]?.stops.length || 0;
    node.querySelector("small").textContent = `${route.agencyId} · ${count} stops${route.patterns.length > 1 ? ` · ${route.patterns.length} directions` : ""}`;
    button.addEventListener("click", () => { state.selectedId = route.id; state.patternIndex = 0; showList(); showDetail(); });
    list.append(node);
  }
}
function showDetail() {
  const route = state.data.routes.find(item => item.id === state.selectedId);
  if (!route) return;
  const pattern = route.patterns[state.patternIndex];
  if (!pattern) { $("#detail").innerHTML = '<div class="empty"><h2>Stop pattern unavailable</h2><p>This route does not have a scheduled stop sequence in the source feed.</p></div>'; return; }
  $("#detail").innerHTML = `<div class="detail-top"><span class="route-badge">${escapeHtml(route.number)}</span><h2>${escapeHtml(route.name)}</h2><p class="meta">${escapeHtml(route.agency)} · Route ID ${escapeHtml(route.id)}</p><div class="directions">${route.patterns.map((item, index) => `<button class="${index === state.patternIndex ? "active" : ""}" data-pattern="${index}">${escapeHtml(item.headsign)}${item.direction ? ` · Direction ${escapeHtml(item.direction)}` : ""}</button>`).join("")}</div></div><div class="stop-head"><h3>Stop sequence</h3><span>${pattern.stops.length} STOPS · TO ${escapeHtml(pattern.headsign).toUpperCase()}</span></div><div class="stops">${pattern.stops.map((stop, index) => `<div class="stop"><span class="seq">${index + 1}</span><span class="node"></span><div><div class="stop-name">${escapeHtml(stop.name)}</div><div class="stop-id">${escapeHtml(stop.id)}</div></div></div>`).join("")}</div>`;
  document.querySelectorAll("[data-pattern]").forEach(button => button.addEventListener("click", () => { state.patternIndex = Number(button.dataset.pattern); showDetail(); }));
}
function escapeHtml(value) { return String(value).replace(/[&<>'"]/g, char => ({ "&":"&amp;", "<":"&lt;", ">":"&gt;", "'":"&#39;", '"':"&quot;" }[char])); }
function renderTabs() {
  const entries = [["ALL", "All"] , ...Object.entries(state.data.agencies).map(([id, name]) => [id, id])];
  $("#agencyTabs").replaceChildren(...entries.map(([id, label]) => { const button = document.createElement("button"); button.textContent = label; button.className = id === state.agency ? "active" : ""; button.onclick = () => { state.agency = id; showList(); renderTabs(); }; return button; }));
}
async function init() {
  // Use the generated script first so double-clicking index.html works without
  // a local web server. Fetch remains a convenient fallback for hosted copies.
  if (window.MUMBAI_BUS_DATA) state.data = window.MUMBAI_BUS_DATA;
  else {
    const response = await fetch("data/routes.json");
    if (!response.ok) throw new Error("Route data could not be loaded");
    state.data = await response.json();
  }
  $("#routeTotal").textContent = state.data.stats.routes.toLocaleString("en-IN");
  $("#stopTotal").textContent = state.data.stats.stops.toLocaleString("en-IN");
  $("#agencyTotal").textContent = state.data.stats.agencies.toLocaleString("en-IN");
  $("#patternTotal").textContent = state.data.stats.patterns.toLocaleString("en-IN");
  $("#updated").textContent = `Feed updated ${new Intl.DateTimeFormat("en-IN", { dateStyle: "medium" }).format(new Date(state.data.generatedAt))}`;
  renderTabs(); showList();
  $("#query").addEventListener("input", event => { state.query = event.target.value; showList(); });
}
init().catch(error => { $("#detail").innerHTML = `<div class="empty"><h2>Dashboard unavailable</h2><p>${escapeHtml(error.message)}. Run the data build once, then reload.</p></div>`; });
