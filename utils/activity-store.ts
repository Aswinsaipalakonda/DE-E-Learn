import fs from "fs";
import path from "path";

export interface ActivityEventRecord {
  id: string;
  type: "view" | "download";
  actor_id: string;
  target_id: string;
  actor_roll: string;
  actor_name?: string;
  actor_email?: string;
  file_id?: string;
  file_name?: string;
  action_detail?: string;
  created_at: string;
}

const DATA_DIR = path.join(process.cwd(), ".data");
const EVENTS_FILE = path.join(DATA_DIR, "activity_events.json");

// Ensure directory exists
function ensureDataFile() {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    if (!fs.existsSync(EVENTS_FILE)) {
      fs.writeFileSync(EVENTS_FILE, JSON.stringify([]), "utf-8");
    }
  } catch (e) {
    console.warn("Could not ensure activity events file:", e);
  }
}

export function saveServerActivityEvent(event: ActivityEventRecord): void {
  try {
    ensureDataFile();
    let events: ActivityEventRecord[] = [];
    if (fs.existsSync(EVENTS_FILE)) {
      const content = fs.readFileSync(EVENTS_FILE, "utf-8");
      if (content.trim()) {
        events = JSON.parse(content);
      }
    }

    // Add new event at start
    events.unshift(event);
    if (events.length > 2000) events = events.slice(0, 2000);

    fs.writeFileSync(EVENTS_FILE, JSON.stringify(events, null, 2), "utf-8");
  } catch (e) {
    console.warn("Failed to write server activity event:", e);
  }
}

export function getServerActivityEvents(targetId?: string): ActivityEventRecord[] {
  try {
    ensureDataFile();
    if (!fs.existsSync(EVENTS_FILE)) return [];
    const content = fs.readFileSync(EVENTS_FILE, "utf-8");
    if (!content.trim()) return [];
    const events: ActivityEventRecord[] = JSON.parse(content);
    if (targetId) {
      return events.filter((e) => e.target_id === targetId);
    }
    return events;
  } catch (e) {
    console.warn("Failed to read server activity events:", e);
    return [];
  }
}
