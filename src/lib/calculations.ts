import { isSameMonth, parseISO, subDays, isAfter } from "date-fns";

import { Lead, Reminder, PracticeSettings } from "./sheets";

export interface Metrics {
  moneySaved: number;
  leadsCaptured: number;
  noShowRate: number;
  baselineNoShowRate: number;
  previousPeriodNoShowRate: number; // Added for dynamic comparison
  timeSaved: number;
  potentialMoneySaved: number;
  roi: {
    savings: number;
    costs: number;
    profit: number;
    multiple: number;
  };
  lastUpdated: string;
}

export function calculateMetrics(leads: Lead[], reminders: Reminder[], settings: PracticeSettings): Metrics {
  const now = new Date();
  const thirtyDaysAgo = subDays(now, 30);
  const sixtyDaysAgo = subDays(now, 60);

  // Helper to check date ranges
  const parseDate = (dateString: string) => {
    try {
      if (!dateString) return null;
      let date = new Date(dateString);
      if (isNaN(date.getTime())) {
        const standardized = dateString.replace(/\//g, "-").replace(" ", "T");
        date = new Date(standardized);
      }
      return isNaN(date.getTime()) ? null : date;
    } catch (e) {
      console.warn(`[Metrics] Error parsing date: "${dateString}"`, e);
      return null;
    }
  };

  // Helper to check if date is within last 30 days
  const isRecent = (dateString: string) => {
    const date = parseDate(dateString);
    return date ? isAfter(date, thirtyDaysAgo) : false;
  };

  // Helper to check if date is in previous 30 days (30-60 days ago)
  const isPreviousPeriod = (dateString: string) => {
    const date = parseDate(dateString);
    return date ? isAfter(date, sixtyDaysAgo) && !isAfter(date, thirtyDaysAgo) : false;
  };

  // Filter for last 30 days
  const currentPeriodLeads = leads.filter((l) => isRecent(l.timestamp));
  const currentPeriodReminders = reminders.filter((r) => isRecent(r.timestamp));

  // Filter for previous 30 days
  const previousPeriodReminders = reminders.filter((r) => isPreviousPeriod(r.timestamp));

  console.log(`[Metrics] Leads: Total ${leads.length}, Last 30 Days ${currentPeriodLeads.length}`);
  console.log(`[Metrics] Reminders: Total ${reminders.length}, Last 30 Days ${currentPeriodReminders.length}`);

  // C) No-Show Rate (Current Period)
  const totalReminders = currentPeriodReminders.length;
  const noShows = currentPeriodReminders.filter((r) => {
      const showedUp = r.showed_up?.trim().toLowerCase();
      return showedUp === "no";
  }).length;
  
  const currentNoShowRate = totalReminders > 0 ? noShows / totalReminders : 0; // as decimal
  const currentNoShowPercent = currentNoShowRate * 100;
  
  // Previous Period No-Show Rate
  const totalPrevReminders = previousPeriodReminders.length;
  const prevNoShows = previousPeriodReminders.filter((r) => {
      const showedUp = r.showed_up?.trim().toLowerCase();
      return showedUp === "no";
  }).length;

  // If no previous data, default to baseline setting
  const prevNoShowRate = totalPrevReminders > 0 ? prevNoShows / totalPrevReminders : (settings.baseline_noshow_percent / 100);
  const prevNoShowPercent = prevNoShowRate * 100;

  console.log(`[Metrics] No-Shows: ${noShows}, Total Reminders: ${totalReminders}, Rate: ${currentNoShowPercent}%`);

  // A) Money Saved
  const baselineNoShow = settings.baseline_noshow_percent / 100;
  const moneySavedCurrentNoShow = 0.04; // Hardcoded as per business logic requirements

  const saved =
    (baselineNoShow - moneySavedCurrentNoShow) * settings.monthly_appointments * settings.avg_appointment_value;

  // B) Leads Captured
  const leadsCaptured = currentPeriodLeads.length;

  // D) Time Saved
  // reminders_sent = count Reminders this month
  const remindersSent = totalReminders;
  const minutesPerManualCall = 5; // Increased from 2 to 5 for Dental (more thorough follow-up)
  const totalMinutes = remindersSent * minutesPerManualCall;
  const hoursSaved = Math.round((totalMinutes / 60) * 10) / 10; // Round to 1 decimal

  // E) ROI Calculation
  // Dental Niche: Invisalign/Veneers Leads are high value.
  // Avg Case: £3,500. Weighted value (10-20% conversion): ~£350-£700.
  const hotLeads = currentPeriodLeads.filter((l) => l.category === "HOT").length;
  const warmLeads = currentPeriodLeads.filter((l) => l.category === "WARM").length;
  const otherLeads = leadsCaptured - hotLeads - warmLeads;

  // Potential Revenue from Leads (Weighted Pipeline)
  const leadValueHot = 500;
  const leadValueWarm = 250;
  const leadValueOther = 50;
  
  const pipelineValue = hotLeads * leadValueHot + warmLeads * leadValueWarm + otherLeads * leadValueOther;

  const totalSavings = saved + pipelineValue;
  const totalCosts = settings.subscription_cost + settings.sms_cost_per_month; // simple sum
  const netProfit = totalSavings - totalCosts;
  const roiMultiple = totalCosts > 0 ? netProfit / totalCosts : 0;

  // Calculate Potential Money Saved (Total possible savings if no-shows were 0%)
  // This serves as a dynamic target instead of hardcoding
  const potentialMoneySaved = 
    (baselineNoShow) * settings.monthly_appointments * settings.avg_appointment_value;

  return {
    moneySaved: Math.round(saved),
    leadsCaptured: leadsCaptured,
    noShowRate: Math.round(currentNoShowPercent),
    baselineNoShowRate: settings.baseline_noshow_percent,
    previousPeriodNoShowRate: Math.round(prevNoShowPercent), // Return the calculated previous rate
    timeSaved: Math.round(hoursSaved),
    potentialMoneySaved: Math.round(potentialMoneySaved),
    roi: {
      savings: Math.round(totalSavings),
      costs: Math.round(totalCosts),
      profit: Math.round(netProfit),
      multiple: Number(roiMultiple.toFixed(1)),
    },
    lastUpdated: now.toISOString(),
  };
}
