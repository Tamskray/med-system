import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";

// Load the variables from the .env file
dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_KEY;

// Export the connected client
export const supabase = createClient(supabaseUrl, supabaseKey);
