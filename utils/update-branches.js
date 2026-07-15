const { createClient } = require("@supabase/supabase-js");
const fs = require("fs");
const path = require("path");

let supabaseUrl = "";
let supabaseAnonKey = "";

try {
  const envContent = fs.readFileSync(path.join(__dirname, "../.env.local"), "utf8");
  const urlMatch = envContent.match(/NEXT_PUBLIC_SUPABASE_URL=(.+)/);
  const keyMatch = envContent.match(/NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=(.+)/);
  if (urlMatch) supabaseUrl = urlMatch[1].trim();
  if (keyMatch) supabaseAnonKey = keyMatch[1].trim();
} catch (e) {
  console.error("Failed to read .env.local file:", e.message);
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function updateBranches() {
  console.log("Updating branch classifications in database...");

  const branches = [
    { code: "CIC", name: "Cyber Security, IoT with BlockChain", active: true },
    { code: "CSD", name: "Data Science", active: true },
    { code: "CSM", name: "Artificial Intelligence and Machine Learning", active: true }
  ];

  for (const b of branches) {
    const { error } = await supabase
      .from("branches")
      .upsert(b);

    if (error) {
      console.error(`Failed to upsert branch ${b.code}:`, error.message);
    } else {
      console.log(`Successfully updated branch: ${b.code} -> ${b.name}`);
    }
  }
}

updateBranches();
