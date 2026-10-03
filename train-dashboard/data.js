// Mumbai suburban network reference. This is a network directory, not a live
// timetable or train-location feed. Update this file when an approved railway
// schedule/real-time source is available.
window.MUMBAI_TRAIN_DATA = {
  updated: "Network reference · timetable feed not connected",
  lines: [
    { id: "western", name: "Western Line", operator: "Western Railway", color: "#e3403b", termini: "Churchgate ↔ Virar", stations: ["Churchgate", "Marine Lines", "Charni Road", "Grant Road", "Mumbai Central", "Mahalaxmi", "Lower Parel", "Prabhadevi", "Dadar", "Matunga Road", "Mahim Junction", "Bandra", "Khar Road", "Santacruz", "Vile Parle", "Andheri", "Jogeshwari", "Goregaon", "Malad", "Kandivali", "Borivali", "Dahisar", "Mira Road", "Bhayandar", "Naigaon", "Vasai Road", "Nallasopara", "Virar"], interchanges: ["Dadar", "Bandra", "Andheri"] },
    { id: "central", name: "Central Line", operator: "Central Railway", color: "#2d69c4", termini: "CSMT ↔ Karjat", stations: ["Chhatrapati Shivaji Maharaj Terminus", "Masjid", "Byculla", "Chinchpokli", "Currey Road", "Parel", "Dadar", "Matunga", "Sion", "Kurla", "Vidyavihar", "Ghatkopar", "Vikhroli", "Kanjurmarg", "Bhandup", "Nahur", "Mulund", "Thane", "Kalwa", "Mumbra", "Diva Junction", "Kopar", "Dombivli", "Thakurli", "Kalyan Junction", "Vithalwadi", "Ulhasnagar", "Ambarnath", "Badlapur", "Vangani", "Shelu", "Neral", "Bhivpuri Road", "Karjat"], interchanges: ["Dadar", "Kurla", "Thane", "Kalyan Junction"] },
    { id: "harbour", name: "Harbour Line", operator: "Central Railway", color: "#f18b25", termini: "CSMT ↔ Panvel", stations: ["Chhatrapati Shivaji Maharaj Terminus", "Masjid", "Sandhurst Road", "Dockyard Road", "Reay Road", "Cotton Green", "Sewri", "Wadala Road", "GTB Nagar", "Chunabhatti", "Kurla", "Tilak Nagar", "Chembur", "Govandi", "Mankhurd", "Vashi", "Sanpada", "Juinagar", "Nerul", "Seawoods–Darave", "CBD Belapur", "Kharghar", "Mansarovar", "Khandeshwar", "Panvel"], interchanges: ["Kurla", "Wadala Road", "Vashi", "Nerul", "Panvel"] },
    { id: "transharbour", name: "Trans-Harbour Line", operator: "Central Railway", color: "#7245a3", termini: "Thane ↔ Nerul", stations: ["Thane", "Airoli", "Rabale", "Ghansoli", "Kopar Khairane", "Turbhe", "Juinagar", "Nerul"], interchanges: ["Thane", "Turbhe", "Juinagar", "Nerul"] }
  ]
};
