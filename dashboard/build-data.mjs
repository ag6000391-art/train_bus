import { createReadStream, mkdirSync, writeFileSync } from "node:fs";
import { createInterface } from "node:readline";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const feed = join(here, "..", "gtfs_compat");
const output = join(here, "data", "routes.json");
const scriptOutput = join(here, "data", "routes.js");

function parseCsv(line) {
  const fields = [];
  let value = "";
  let quoted = false;
  for (let i = 0; i < line.length; i += 1) {
    const char = line[i];
    if (char === '"') {
      if (quoted && line[i + 1] === '"') { value += '"'; i += 1; }
      else quoted = !quoted;
    } else if (char === "," && !quoted) { fields.push(value); value = ""; }
    else value += char;
  }
  fields.push(value.replace(/\r$/, ""));
  return fields;
}

async function readCsv(name, callback) {
  const input = createReadStream(join(feed, name), { encoding: "utf8" });
  const lines = createInterface({ input, crlfDelay: Infinity });
  let headers;
  for await (const line of lines) {
    if (!headers) { headers = parseCsv(line); continue; }
    if (!line) continue;
    const values = parseCsv(line);
    const record = Object.fromEntries(headers.map((key, index) => [key, values[index] ?? ""]));
    callback(record);
  }
}

const agencies = new Map();
const stops = new Map();
const routes = new Map();

console.log("Reading operators…");
await readCsv("agency.txt", row => agencies.set(row.agency_id, row.agency_name));
console.log("Reading stops…");
await readCsv("stops.txt", row => stops.set(row.stop_id, { name: row.stop_name, lat: Number(row.stop_lat), lon: Number(row.stop_lon) }));
console.log("Reading routes…");
await readCsv("routes.txt", row => routes.set(row.route_id, {
  id: row.route_id, agencyId: row.agency_id, agency: agencies.get(row.agency_id) || row.agency_id,
  number: row.route_short_name || "—", name: row.route_long_name || "Route details unavailable", patterns: []
}));

// One scheduled trip is retained for each route and direction. It keeps the web
// download compact while preserving an ordered, usable stop sequence.
const chosenTrips = new Map();
console.log("Selecting scheduled patterns…");
await readCsv("trips.txt", row => {
  const key = `${row.route_id}|${row.direction_id || "0"}`;
  if (routes.has(row.route_id) && !chosenTrips.has(key)) {
    chosenTrips.set(key, { tripId: row.trip_id, routeId: row.route_id, direction: row.direction_id || "0", headsign: row.trip_headsign });
  }
});

const tripLookup = new Map([...chosenTrips.values()].map(trip => [trip.tripId, { ...trip, stops: [] }]));
console.log("Reading stop sequences…");
await readCsv("stop_times.txt", row => {
  const trip = tripLookup.get(row.trip_id);
  if (trip) trip.stops.push({ id: row.stop_id, sequence: Number(row.stop_sequence) });
});

for (const trip of tripLookup.values()) {
  trip.stops.sort((a, b) => a.sequence - b.sequence);
  const route = routes.get(trip.routeId);
  route.patterns.push({
    direction: trip.direction, headsign: trip.headsign || "Destination not listed",
    stops: trip.stops.map(({ id }) => ({ id, ...(stops.get(id) || { name: id, lat: null, lon: null }) }))
  });
}

const routeList = [...routes.values()]
  .map(route => ({ ...route, patterns: route.patterns.sort((a, b) => a.direction.localeCompare(b.direction)) }))
  .sort((a, b) => a.number.localeCompare(b.number, undefined, { numeric: true }) || a.agencyId.localeCompare(b.agencyId));
const stats = {
  routes: routeList.length,
  stops: stops.size,
  agencies: agencies.size,
  patterns: routeList.reduce((total, route) => total + route.patterns.length, 0)
};

mkdirSync(dirname(output), { recursive: true });
const dashboardData = { generatedAt: new Date().toISOString(), stats, agencies: Object.fromEntries(agencies), routes: routeList };
const serialized = JSON.stringify(dashboardData);
writeFileSync(output, serialized);
// Loading this as a script also works when index.html is opened directly from
// Windows Explorer, where browsers block fetch() requests to local JSON files.
writeFileSync(scriptOutput, `window.MUMBAI_BUS_DATA=${serialized};`);
console.log(`Created dashboard data: ${stats.routes} routes and ${stats.patterns} stop patterns.`);
