import { PrismaClient, Role, OrgRole, ActionType } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding demo data...");

  // 1. Find or create a demo organization
  let organization = await prisma.organization.findFirst({
    where: { name: "Brigstock Dental" },
  });

  if (!organization) {
    console.log("Creating demo organization...");
    organization = await prisma.organization.create({
      data: {
        name: "Brigstock Dental",
        joinCode: "BRI-DEMO1",
        googleSheetId: process.env.GOOGLE_SHEET_ID || "demo-sheet-id",
        logo: null,
        contactEmail: "contact@brigstockdental.com",
        timezone: "America/New_York",
        isActive: true,
      },
    });
    console.log("✅ Organization created:", organization.name);
  } else {
    console.log("✅ Organization already exists:", organization.name);
  }

  // 2. Find all users without an organization and assign them
  const usersWithoutOrg = await prisma.user.findMany({
    where: { organizationId: null },
  });

  if (usersWithoutOrg.length > 0) {
    console.log(`Found ${usersWithoutOrg.length} users without organization. Assigning...`);
    
    for (const user of usersWithoutOrg) {
      // First user becomes OWNER, rest become MEMBERS
      const isFirstUser = usersWithoutOrg[0].id === user.id;
      
      await prisma.user.update({
        where: { id: user.id },
        data: {
          organizationId: organization.id,
          orgRole: isFirstUser ? OrgRole.OWNER : OrgRole.MEMBER,
        },
      });
      
      console.log(`✅ Assigned ${user.email} to ${organization.name} as ${isFirstUser ? 'OWNER' : 'MEMBER'}`);
    }
  }

  // 3. Create sample leads if none exist
  const existingLeads = await prisma.lead.count({
    where: { organizationId: organization.id },
  });

  if (existingLeads === 0) {
    console.log("Creating sample leads...");
    
    const sampleLeads = [
      {
        name: "John Smith",
        email: "john.smith@example.com",
        phone: "+1-555-0101",
        source: "Website",
        status: "NEW",
        category: "HOT",
        score: 85,
        organizationId: organization.id,
      },
      {
        name: "Sarah Johnson",
        email: "sarah.j@example.com",
        phone: "+1-555-0102",
        source: "Referral",
        status: "CONTACTED",
        category: "WARM",
        score: 65,
        organizationId: organization.id,
      },
      {
        name: "Michael Brown",
        email: "m.brown@example.com",
        phone: "+1-555-0103",
        source: "Facebook",
        status: "QUALIFIED",
        category: "HOT",
        score: 90,
        organizationId: organization.id,
      },
      {
        name: "Emily Davis",
        email: "emily.davis@example.com",
        phone: "+1-555-0104",
        source: "Google Ads",
        status: "NEW",
        category: "COLD",
        score: 45,
        organizationId: organization.id,
      },
      {
        name: "David Wilson",
        email: "d.wilson@example.com",
        phone: "+1-555-0105",
        source: "Website",
        status: "CONTACTED",
        category: "WARM",
        score: 70,
        organizationId: organization.id,
      },
      {
        name: "Jennifer Martinez",
        email: "jen.martinez@example.com",
        phone: "+1-555-0106",
        source: "Instagram",
        status: "QUALIFIED",
        category: "HOT",
        score: 88,
        organizationId: organization.id,
      },
      {
        name: "Robert Taylor",
        email: "rob.taylor@example.com",
        phone: "+1-555-0107",
        source: "Referral",
        status: "NEW",
        category: "WARM",
        score: 60,
        organizationId: organization.id,
      },
      {
        name: "Lisa Anderson",
        email: "lisa.a@example.com",
        phone: "+1-555-0108",
        source: "Website",
        status: "CLOSED",
        category: "HOT",
        score: 95,
        organizationId: organization.id,
      },
    ];

    await prisma.lead.createMany({
      data: sampleLeads,
    });

    console.log(`✅ Created ${sampleLeads.length} sample leads`);
  } else {
    console.log(`✅ Organization already has ${existingLeads} leads`);
  }

  // 4. Create sample reminders if none exist
  const existingReminders = await prisma.reminder.count({
    where: { organizationId: organization.id },
  });

  if (existingReminders === 0) {
    console.log("Creating sample reminders...");
    
    const now = new Date();
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    const nextWeek = new Date(now);
    nextWeek.setDate(nextWeek.getDate() + 7);

    const sampleReminders = [
      {
        patientName: "Alice Cooper",
        appointmentDate: tomorrow,
        reminderType: "SMS",
        confirmed: true,
        showedUp: null,
        organizationId: organization.id,
      },
      {
        patientName: "Bob Dylan",
        appointmentDate: nextWeek,
        reminderType: "EMAIL",
        confirmed: false,
        showedUp: null,
        organizationId: organization.id,
      },
      {
        patientName: "Charlie Parker",
        appointmentDate: new Date(now.getTime() - 86400000), // Yesterday
        reminderType: "SMS",
        confirmed: true,
        showedUp: true,
        organizationId: organization.id,
      },
    ];

    await prisma.reminder.createMany({
      data: sampleReminders,
    });

    console.log(`✅ Created ${sampleReminders.length} sample reminders`);
  } else {
    console.log(`✅ Organization already has ${existingReminders} reminders`);
  }

  // 5. Create sample activity logs
  const existingLogs = await prisma.activityLog.count({
    where: { organizationId: organization.id },
  });

  if (existingLogs === 0) {
    console.log("Creating sample activity logs...");
    
    const sampleLogs = [
      {
        organizationId: organization.id,
        actorName: "System",
        action: ActionType.CREATE,
        entityType: "LEAD",
        details: "New lead created: John Smith",
        metadata: { source: "Website", score: 85 },
      },
      {
        organizationId: organization.id,
        actorName: "System",
        action: ActionType.CREATE,
        entityType: "LEAD",
        details: "New lead created: Sarah Johnson",
        metadata: { source: "Referral", score: 65 },
      },
      {
        organizationId: organization.id,
        actorName: "System",
        action: ActionType.UPDATE,
        entityType: "LEAD",
        details: "Lead status updated: Michael Brown",
        metadata: { oldStatus: "NEW", newStatus: "QUALIFIED" },
      },
    ];

    await prisma.activityLog.createMany({
      data: sampleLogs,
    });

    console.log(`✅ Created ${sampleLogs.length} sample activity logs`);
  } else {
    console.log(`✅ Organization already has ${existingLogs} activity logs`);
  }

  console.log("\n🎉 Demo data seeding complete!");
  console.log("\n📋 Summary:");
  console.log(`   Organization: ${organization.name}`);
  console.log(`   Join Code: ${organization.joinCode}`);
  console.log(`   Google Sheet ID: ${organization.googleSheetId}`);
  
  const totalUsers = await prisma.user.count({
    where: { organizationId: organization.id },
  });
  console.log(`   Users: ${totalUsers}`);
  
  const totalLeads = await prisma.lead.count({
    where: { organizationId: organization.id },
  });
  console.log(`   Leads: ${totalLeads}`);
  
  const totalReminders = await prisma.reminder.count({
    where: { organizationId: organization.id },
  });
  console.log(`   Reminders: ${totalReminders}`);
}

main()
  .catch((e) => {
    console.error("❌ Error seeding data:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

