import { JWT } from "google-auth-library";
import { GoogleSpreadsheet } from "google-spreadsheet";

// Initialize the sheet - handling potential missing env vars
const getDoc = async (googleSheetId?: string) => {
  if (!process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL || !process.env.GOOGLE_PRIVATE_KEY) {
    throw new Error("Google Sheets credentials missing from environment variables");
  }
  
  // Use provided sheet ID or fallback to env var (for backward compat or development)
  const sheetId = googleSheetId || process.env.GOOGLE_SHEET_ID;
  
  if (!sheetId) {
    throw new Error("Google Sheet ID missing (not provided and not in env)");
  }

  const privateKey = process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, "\n");

  // Simple validation to help debugging
  if (!privateKey.includes("BEGIN PRIVATE KEY")) {
    console.error("Error: GOOGLE_PRIVATE_KEY does not appear to be a valid PEM private key.");
    console.error("It should start with '-----BEGIN PRIVATE KEY-----'");
  }

  const serviceAccountAuth = new JWT({
    email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
    key: privateKey,
    scopes: ["https://www.googleapis.com/auth/spreadsheets"],
  });

  const doc = new GoogleSpreadsheet(sheetId, serviceAccountAuth);
  await doc.loadInfo();
  return doc;
};

// Type definitions
export interface Lead {
  timestamp: string;
  name: string;
  phone: string;
  email: string;
  score: number;
  category: string;
  status: string;
  source: string;
}

export interface Reminder {
  timestamp: string;
  patient_name: string;
  appointment_date: string;
  reminder_type: string;
  confirmed: string;
  showed_up: string;
}

export interface PracticeSettings {
  practice_name: string;
  baseline_noshow_percent: number;
  monthly_appointments: number;
  avg_appointment_value: number;
  subscription_cost: number;
  sms_cost_per_month: number;
}

export const getLeads = async (googleSheetId?: string): Promise<Lead[]> => {
  try {
    const doc = await getDoc(googleSheetId);
    const sheet = doc.sheetsByTitle["Leads"];
    if (!sheet) {
      console.warn("Sheet 'Leads' not found");
      return [];
    }
    const rows = await sheet.getRows();
    // console.log(`Fetched ${rows.length} rows from Leads sheet`);
    return rows.map((row) => ({
      timestamp: row.get("timestamp"),
      name: row.get("name"),
      phone: row.get("phone"),
      email: row.get("email"),
      score: Number(row.get("score")),
      category: row.get("category"),
      status: row.get("status"),
      source: row.get("source"),
    }));
  } catch (error) {
    console.error("Error in getLeads:", error);
    throw error;
  }
};

export const addLead = async (lead: Omit<Lead, "timestamp">, googleSheetId?: string): Promise<boolean> => {
  try {
    const doc = await getDoc(googleSheetId);
    const sheet = doc.sheetsByTitle["Leads"];
    if (!sheet) {
      throw new Error("Sheet 'Leads' not found");
    }
    
    const timestamp = new Date().toISOString().replace("T", " ").substring(0, 19); // Simple format YYYY-MM-DD HH:mm:ss
    
    await sheet.addRow({
      timestamp,
      ...lead,
    });
    return true;
  } catch (error) {
    console.error("Error in addLead:", error);
    return false;
  }
};

export const updateLead = async (originalLead: Lead, newLead: Lead, googleSheetId?: string): Promise<boolean> => {
  try {
    const doc = await getDoc(googleSheetId);
    const sheet = doc.sheetsByTitle["Leads"];
    if (!sheet) {
      throw new Error("Sheet 'Leads' not found");
    }

    const rows = await sheet.getRows();
    // Find row by unique combination (timestamp + email) as we don't have IDs yet
    const rowToUpdate = rows.find(
      (row) => row.get("timestamp") === originalLead.timestamp && row.get("email") === originalLead.email
    );

    if (!rowToUpdate) {
      console.warn("Lead to update not found");
      return false;
    }

    rowToUpdate.assign({
      timestamp: newLead.timestamp, // Usually shouldn't change, but allowing it
      name: newLead.name,
      phone: newLead.phone,
      email: newLead.email,
      score: newLead.score,
      category: newLead.category,
      status: newLead.status,
      source: newLead.source,
    });

    await rowToUpdate.save();
    return true;
  } catch (error) {
    console.error("Error in updateLead:", error);
    return false;
  }
};

export const deleteLead = async (lead: Lead, googleSheetId?: string): Promise<boolean> => {
  try {
    const doc = await getDoc(googleSheetId);
    const sheet = doc.sheetsByTitle["Leads"];
    if (!sheet) {
      throw new Error("Sheet 'Leads' not found");
    }

    const rows = await sheet.getRows();
    const rowToDelete = rows.find(
      (row) => row.get("timestamp") === lead.timestamp && row.get("email") === lead.email
    );

    if (!rowToDelete) {
      console.warn("Lead to delete not found");
      return false;
    }

    await rowToDelete.delete();
    return true;
  } catch (error) {
    console.error("Error in deleteLead:", error);
    return false;
  }
};

export const getReminders = async (googleSheetId?: string): Promise<Reminder[]> => {
  try {
    const doc = await getDoc(googleSheetId);
    const sheet = doc.sheetsByTitle["Reminders"];
    if (!sheet) {
      console.warn("Sheet 'Reminders' not found");
      return [];
    }
    const rows = await sheet.getRows();
    // console.log(`Fetched ${rows.length} rows from Reminders sheet`);
    // console.log(`Reminders Headers: ${sheet.headerValues.join(", ")}`);
    // if (rows.length > 0) {
    //   console.log("Sample Reminder Row keys:", rows[0].toObject());
    // }
    return rows.map((row) => ({
      timestamp: row.get("timestamp"),
      patient_name: row.get("patient_name"),
      appointment_date: row.get("appointment_date"),
      reminder_type: row.get("reminder_type"),
      confirmed: row.get("confirmed"),
      showed_up: row.get("showed_up"),
    }));
  } catch (error) {
    console.error("Error in getReminders:", error);
    throw error;
  }
};

export const addReminder = async (reminder: Omit<Reminder, "timestamp">, googleSheetId?: string): Promise<boolean> => {
  try {
    const doc = await getDoc(googleSheetId);
    const sheet = doc.sheetsByTitle["Reminders"];
    if (!sheet) {
      throw new Error("Sheet 'Reminders' not found");
    }
    
    const timestamp = new Date().toISOString().replace("T", " ").substring(0, 19);
    
    await sheet.addRow({
      timestamp,
      ...reminder,
    });
    return true;
  } catch (error) {
    console.error("Error in addReminder:", error);
    return false;
  }
};

export const updateReminder = async (original: Reminder, updated: Reminder, googleSheetId?: string): Promise<boolean> => {
  try {
    const doc = await getDoc(googleSheetId);
    const sheet = doc.sheetsByTitle["Reminders"];
    if (!sheet) {
      throw new Error("Sheet 'Reminders' not found");
    }

    const rows = await sheet.getRows();
    // Find row by unique combination (timestamp + patient_name)
    const rowToUpdate = rows.find(
      (row) => row.get("timestamp") === original.timestamp && row.get("patient_name") === original.patient_name
    );

    if (!rowToUpdate) {
      console.warn("Reminder to update not found");
      return false;
    }

    rowToUpdate.assign({
      timestamp: updated.timestamp,
      patient_name: updated.patient_name,
      appointment_date: updated.appointment_date,
      reminder_type: updated.reminder_type,
      confirmed: updated.confirmed,
      showed_up: updated.showed_up,
    });

    await rowToUpdate.save();
    return true;
  } catch (error) {
    console.error("Error in updateReminder:", error);
    return false;
  }
};

export const deleteReminder = async (reminder: Reminder, googleSheetId?: string): Promise<boolean> => {
  try {
    const doc = await getDoc(googleSheetId);
    const sheet = doc.sheetsByTitle["Reminders"];
    if (!sheet) {
      throw new Error("Sheet 'Reminders' not found");
    }

    const rows = await sheet.getRows();
    const rowToDelete = rows.find(
      (row) => row.get("timestamp") === reminder.timestamp && row.get("patient_name") === reminder.patient_name
    );

    if (!rowToDelete) {
      console.warn("Reminder to delete not found");
      return false;
    }

    await rowToDelete.delete();
    return true;
  } catch (error) {
    console.error("Error in deleteReminder:", error);
    return false;
  }
};

export const getPracticeSettings = async (googleSheetId?: string): Promise<PracticeSettings | null> => {
  try {
    const doc = await getDoc(googleSheetId);
    const sheet = doc.sheetsByTitle["Practice_Settings"];
    if (!sheet) {
      console.warn("Sheet 'Practice_Settings' not found");
      return null;
    }
    const rows = await sheet.getRows();
    if (rows.length === 0) return null;
    const row = rows[0];
    return {
      practice_name: row.get("practice_name"),
      baseline_noshow_percent: Number(row.get("baseline_noshow_percent")),
      monthly_appointments: Number(row.get("monthly_appointments")),
      avg_appointment_value: Number(row.get("avg_appointment_value")),
      subscription_cost: Number(row.get("subscription_cost")),
      sms_cost_per_month: Number(row.get("sms_cost_per_month")),
    };
  } catch (error) {
    console.error("Error in getPracticeSettings:", error);
    throw error;
  }
};
