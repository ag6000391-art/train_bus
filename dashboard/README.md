# Mumbai Bus Dashboard

This is a lightweight local dashboard built from the compatible GTFS feed. It lists every route, lets you search by route number, destination, operator, or stop name, and shows the ordered stop sequence for each direction.

## Run it

From the repository root, first create the dashboard data:

```powershell
node dashboard/build-data.mjs
```

Then either double-click `dashboard/index.html` to open it directly in a browser, or run the optional local server below and open `http://localhost:4173`:

```powershell
node dashboard/server.mjs
```

Run `node dashboard/build-data.mjs` again whenever the `gtfs_compat` feed is replaced or updated.

## Data note

The supplied GTFS feed contains scheduled route and stop data, but no GTFS-Realtime vehicle-position or delay feed. The dashboard is interactive and always reflects the generated feed snapshot; it does not claim live bus GPS locations.
