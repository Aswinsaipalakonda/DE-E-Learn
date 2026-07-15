const { createClient } = require("@supabase/supabase-js");

// Read from env file manually since this is a standalone node script
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

if (!supabaseUrl || !supabaseAnonKey) {
  console.error("Missing Supabase credentials in .env.local");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: { persistSession: false }
});

const adminEmail = "admin@mvgrce.edu.in";
const adminPassword = "AdminPassword123!";

async function run() {
  console.log(`Registering admin account: ${adminEmail}...`);
  
  const { data: authData, error: authError } = await supabase.auth.signUp({
    email: adminEmail,
    password: adminPassword,
    options: {
      data: {
        name: "System Administrator",
        role: "admin"
      }
    }
  });

  if (authError) {
    console.error("Signup failed:", authError.message);
    
    // If user already exists in auth, we will try to insert the profile anyway
    if (authError.message.includes("already registered")) {
      console.log("Auth user already exists. Checking profile database...");
      // Let's sign in to fetch their user ID
      const { data: signInData, signInError } = await supabase.auth.signInWithPassword({
        email: adminEmail,
        password: adminPassword
      });
      
      if (signInError || !signInData.user) {
        console.error("Failed to authenticate existing auth user:", signInError?.message);
        process.exit(1);
      }
      
      await insertProfile(signInData.user.id);
    } else {
      process.exit(1);
    }
  } else if (authData.user) {
    console.log("Auth user registered successfully! User ID:", authData.user.id);
    await insertProfile(authData.user.id);
  }
}

async function insertProfile(userId) {
  console.log("Inserting admin profile record...");
  
  const { error: profileError } = await supabase
    .from("users")
    .upsert({
      id: userId,
      email: adminEmail,
      name: "System Administrator",
      role: "admin",
      status: "active",
      first_login_pending: false // Admins bypass forced reset on initial setup
    });

  if (profileError) {
    console.error("Failed to insert admin profile:", profileError.message);
    process.exit(1);
  }

  console.log("\n==========================================");
  console.log("🎉 DEFAULT ADMINISTRATOR ACCOUNT SETUP COMPLETE!");
  console.log("==========================================");
  console.log("Email:    ", adminEmail);
  console.log("Password: ", adminPassword);
  console.log("==========================================\n");
}

run();
