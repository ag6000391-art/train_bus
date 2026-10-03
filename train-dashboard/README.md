# Mumbai Train Dashboard

Open `index.html` directly in a browser. It is a standalone Mumbai Local timetable dashboard with train-wise departure, arrival and stop timestamps.

The timetable snapshot was generated from the public TrainHelp.in tables via the community `Mumbai-Local-TimeTable-Extractor` source. It contains scheduled times only; it intentionally shows **0 live feeds** and does not claim real-time train positions or delays. Rebuild `timetable.js` with `node build-timetable.mjs` after updating the source CSV files.
