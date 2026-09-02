import fs from "fs";
import path from "path";
import { createClient } from "@/utils/supabase/server";
import { cookies } from "next/headers";

export interface ExamSchedule {
  id: string;
  title: string;
  semesters: number[];
  branch: string; // "ALL" or specific e.g. "CIC"
  start_date: string; // ISO date or "YYYY-MM-DD"
  end_date: string; // ISO date or "YYYY-MM-DD"
  is_daily_recurring: boolean;
  daily_start_time: string; // "10:00" (24hr format)
  daily_end_time: string; // "11:30" (24hr format)
  active: boolean;
  created_by?: string;
  created_at: string;
}

export interface ExamLockoutStatus {
  isLocked: boolean;
  examTitle?: string;
  semesters?: number[];
  branch?: string;
  startTimeText?: string;
  endTimeText?: string;
  message?: string;
}

const DATA_DIR = path.join(process.cwd(), ".data");
const SCHEDULES_FILE = path.join(DATA_DIR, "exam_schedules.json");

function ensureSchedulesFile() {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    if (!fs.existsSync(SCHEDULES_FILE)) {
      fs.writeFileSync(SCHEDULES_FILE, JSON.stringify([]), "utf-8");
    }
  } catch (e) {
    console.warn("Could not ensure exam schedules file:", e);
  }
}

export function readLocalExamSchedules(): ExamSchedule[] {
  try {
    ensureSchedulesFile();
    if (!fs.existsSync(SCHEDULES_FILE)) return [];
    const content = fs.readFileSync(SCHEDULES_FILE, "utf-8");
    if (!content.trim()) return [];
    return JSON.parse(content);
  } catch (e) {
    console.warn("Failed to read local exam schedules:", e);
    return [];
  }
}

export function saveLocalExamSchedules(schedules: ExamSchedule[]): void {
  try {
    ensureSchedulesFile();
    fs.writeFileSync(SCHEDULES_FILE, JSON.stringify(schedules, null, 2), "utf-8");
  } catch (e) {
    console.warn("Failed to save local exam schedules:", e);
  }
}

/**
 * Checks whether a given semester (and branch) is currently under an active exam lockout window.
 */
export async function getActiveExamLockout(
  semester: number,
  branch?: string | null
): Promise<ExamLockoutStatus> {
  const localSchedules = readLocalExamSchedules();
  let dbSchedules: ExamSchedule[] = [];

  try {
    const cookieStore = await cookies();
    const supabase = createClient(cookieStore);
    const { data } = await supabase
      .from("exam_schedules")
      .select("*")
      .eq("active", true);
    if (data && Array.isArray(data)) {
      dbSchedules = data as ExamSchedule[];
    }
  } catch {}

  const allSchedules = [...localSchedules, ...dbSchedules].filter((s) => s.active);
  const now = new Date();

  // Parse Indian Standard Time (IST) components
  const istFormatter = new Intl.DateTimeFormat("en-US", {
    timeZone: "Asia/Kolkata",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });

  const parts = istFormatter.formatToParts(now);
  const partMap: Record<string, string> = {};
  parts.forEach((p) => {
    partMap[p.type] = p.value;
  });

  const currentYear = parseInt(partMap.year, 10);
  const currentMonth = parseInt(partMap.month, 10);
  const currentDay = parseInt(partMap.day, 10);
  const currentHour = parseInt(partMap.hour, 10);
  const currentMinute = parseInt(partMap.minute, 10);
  const currentTotalMinutes = currentHour * 60 + currentMinute;
  const currentDateKey = `${currentYear}-${String(currentMonth).padStart(2, "0")}-${String(currentDay).padStart(2, "0")}`;

  for (const sched of allSchedules) {
    // 1. Check Semester Scope
    if (!sched.semesters || !sched.semesters.includes(semester)) {
      continue;
    }

    // 2. Check Branch Scope
    if (sched.branch && sched.branch !== "ALL" && branch && sched.branch !== branch) {
      continue;
    }

    // 3. Check Date Boundaries
    const startDateKey = sched.start_date.slice(0, 10);
    const endDateKey = sched.end_date.slice(0, 10);

    if (currentDateKey < startDateKey || currentDateKey > endDateKey) {
      continue;
    }

    // 4. Check Time Windows
    if (sched.is_daily_recurring) {
      // Daily Window: e.g. "10:00" to "11:30"
      const [startH, startM] = (sched.daily_start_time || "10:00").split(":").map((v) => parseInt(v, 10));
      const [endH, endM] = (sched.daily_end_time || "11:30").split(":").map((v) => parseInt(v, 10));
      const startTotalMinutes = startH * 60 + startM;
      const endTotalMinutes = endH * 60 + endM;

      if (currentTotalMinutes >= startTotalMinutes && currentTotalMinutes < endTotalMinutes) {
        return {
          isLocked: true,
          examTitle: sched.title,
          semesters: sched.semesters,
          branch: sched.branch,
          startTimeText: sched.daily_start_time,
          endTimeText: sched.daily_end_time,
          message: `Evaluation session active (${sched.daily_start_time} - ${sched.daily_end_time}). Semester ${semester} materials are temporarily hidden during examination. Access resumes automatically at ${sched.daily_end_time}.`,
        };
      }
    } else {
      // Full Continuous Block
      const startDateTime = new Date(sched.start_date).getTime();
      const endDateTime = new Date(sched.end_date).getTime();
      const nowTime = now.getTime();

      if (nowTime >= startDateTime && nowTime <= endDateTime) {
        return {
          isLocked: true,
          examTitle: sched.title,
          semesters: sched.semesters,
          branch: sched.branch,
          startTimeText: new Date(sched.start_date).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" }),
          endTimeText: new Date(sched.end_date).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" }),
          message: `Examination in progress. Semester ${semester} study materials are locked until ${new Date(sched.end_date).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })}.`,
        };
      }
    }
  }

  return { isLocked: false };
}
