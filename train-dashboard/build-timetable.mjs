import { readdirSync, readFileSync, writeFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const source = join(here, "..", "train-timetable-source", "Mumbai-Local-TimeTable-Extractor-main", "data");
const target = join(here, "timetable.js");
const time = /^(?:[01]\d|2[0-3]):[0-5]\d$/;
function parseCsv(line) {
  const out = []; let value = ""; let quoted = false;
  for (let i = 0; i < line.length; i += 1) {
    const c = line[i];
    if (c === '"') { if (quoted && line[i + 1] === '"') { value += c; i += 1; } else quoted = !quoted; }
    else if (c === "," && !quoted) { out.push(value); value = ""; }
    else value += c;
  }
  out.push(value.replace(/\r$/, "")); return out;
}
function tableNumber(file) { return Number(file.match(/(\d+)/)?.[1] || 0); }
const files = readdirSync(source).filter(file => file.endsWith(".csv")).sort((a, b) => tableNumber(a) - tableNumber(b));
const services = [];
for (const file of files) {
  const rows = readFileSync(join(source, file), "utf8").split(/\n/).filter(Boolean).map(parseCsv);
  // TrainHelp places several timetable blocks inside one HTML table. A row
  // labelled "Stations" or "Train No." starts a new block, so it must not be
  // flattened into one impossible multi-hundred-stop service.
  const headerIndexes = rows.flatMap((row, index) => /station|train\s*no\.?|trains/i.test((row[0] || "").trim()) ? [index] : []);
  for (let block = 0; block < headerIndexes.length; block += 1) {
    const start = headerIndexes[block];
    const end = headerIndexes[block + 1] ?? rows.length;
    const headers = rows[start];
    const stationRows = rows.slice(start + 1, end);
    for (let column = 1; column < headers.length; column += 1) {
      const label = (headers[column] || "").trim();
      const stops = stationRows.map(row => ({ station: (row[0] || "").trim(), time: (row[column] || "").trim() })).filter(stop => stop.station && time.test(stop.time));
      if (stops.length < 2 || stops.length > 80) continue;
      const code = label.match(/\b\d{4,6}[A-Z]?\b/)?.[0] || `Table ${tableNumber(file)}-${block + 1}-${column}`;
      services.push({ id: `${tableNumber(file)}-${block + 1}-${column}`, code, label: label || code, from: stops[0].station, to: stops.at(-1).station, departure: stops[0].time, arrival: stops.at(-1).time, stops });
    }
  }
}
services.sort((a, b) => a.departure.localeCompare(b.departure) || a.code.localeCompare(b.code));
const stationCount = new Set(services.flatMap(service => service.stops.map(stop => stop.station))).size;
const payload = { source: "TrainHelp.in timetable snapshot, extracted by Umang-Lodaya/Mumbai-Local-TimeTable-Extractor", generatedAt: new Date().toISOString(), stats: { services: services.length, stations: stationCount, tables: files.length }, services };
writeFileSync(target, `window.MUMBAI_TRAIN_TIMETABLE=${JSON.stringify(payload)};`);
console.log(`Created ${target}: ${services.length} scheduled services across ${stationCount} station labels.`);
