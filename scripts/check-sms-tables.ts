import { prisma } from "@/lib/db";

async function checkTables() {
  try {
    // Check if Organization has SMS fields
    const org = await prisma.organization.findFirst({
      select: {
        id: true,
        smsEnabled: true,
        smsReminderWebhookUrl: true,
        smsFollowUpWebhookUrl: true,
      },
    });
    console.log("✅ Organization SMS fields exist:", org ? "Yes" : "No orgs found");

    // Check if SMSCampaign table exists
    const campaignCount = await prisma.sMSCampaign.count();
    console.log("✅ SMSCampaign table exists. Count:", campaignCount);

    // Check if SMSMessage table exists
    const messageCount = await prisma.sMSMessage.count();
    console.log("✅ SMSMessage table exists. Count:", messageCount);

    // Check if SMSExecution table exists
    const executionCount = await prisma.sMSExecution.count();
    console.log("✅ SMSExecution table exists. Count:", executionCount);

    console.log("\n✅ All SMS tables exist!");
  } catch (error: any) {
    console.error("❌ Error:", error.message);
    if (error.message.includes("does not exist")) {
      console.error("\n⚠️  Tables don't exist. Run the migration SQL file.");
    } else if (error.message.includes("Unknown field")) {
      console.error("\n⚠️  Prisma client is out of sync. Restart your dev server.");
    }
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

checkTables();





