// Stadium data for 2026 FIFA World Cup (USA, Canada, Mexico)
const stadiums = {
  "AT&T Stadium": {
    city: "Arlington",
    timezone: "America/Chicago"
  },
  "Empower Field": {
    city: "Denver",
    timezone: "America/Denver"
  },
  "GEHA Field at Arrowhead Stadium": {
    city: "Kansas City",
    timezone: "America/Chicago"
  },
  "Lumen Field": {
    city: "Seattle",
    timezone: "America/Los_Angeles"
  },
  "MetLife Stadium": {
    city: "East Rutherford",
    timezone: "America/New_York"
  },
  "NRG Stadium": {
    city: "Houston",
    timezone: "America/Chicago"
  },
  "SoFi Stadium": {
    city: "Inglewood",
    timezone: "America/Los_Angeles"
  },
  "Lincoln Financial Field": {
    city: "Philadelphia",
    timezone: "America/New_York"
  },
  "Mercedes-Benz Stadium": {
    city: "Atlanta",
    timezone: "America/New_York"
  },
  "Hard Rock Stadium": {
    city: "Miami Gardens",
    timezone: "America/New_York"
  },
  "BC Place": {
    city: "Vancouver",
    timezone: "America/Vancouver"
  },
  "Commonwealth Stadium": {
    city: "Edmonton",
    timezone: "America/Edmonton"
  },
  "Toronto": {
    city: "Toronto",
    timezone: "America/Toronto"
  },
  "Estadio Azteca": {
    city: "Mexico City",
    timezone: "America/Mexico_City"
  },
  "Estadio BBVA": {
    city: "Guadalupe",
    timezone: "America/Monterrey"
  },
  "Estadio Akron": {
    city: "Guadalajara",
    timezone: "America/Mexico_City"
  }
};

export function getStadiumInfo(stadiumName) {
  // Find the stadium by name, case-insensitive
  const normalizedName = stadiumName?.toLowerCase().trim();
  if (!normalizedName) {
    return { city: "Unknown", timezone: "UTC" };
  }

  // Check direct match first
  if (stadiums[stadiumName]) {
    return stadiums[stadiumName];
  }

  // Check partial match
  for (const [name, info] of Object.entries(stadiums)) {
    if (name.toLowerCase().includes(normalizedName) || normalizedName.includes(name.toLowerCase())) {
      return info;
    }
  }

  // Default fallback
  return { city: "Unknown", timezone: "UTC" };
}
