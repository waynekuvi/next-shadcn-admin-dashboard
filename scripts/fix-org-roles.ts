
import { PrismaClient, OrgRole } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const superAdminEmail = "waynekuvi@gmail.com";
  const clientOwnerEmail = "waynekuvii@gmail.com";

  // 1. Remove Super Admin from the Organization
  const superAdmin = await prisma.user.findUnique({
    where: { email: superAdminEmail },
  });

  if (superAdmin) {
    await prisma.user.update({
      where: { email: superAdminEmail },
      data: {
        organizationId: null, // Remove from org
        orgRole: "MEMBER",    // Reset role
      },
    });
    console.log(`Removed ${superAdminEmail} from organization.`);
  } else {
    console.log(`Super Admin ${superAdminEmail} not found.`);
  }

  // 2. Promote Client User to Owner
  const clientUser = await prisma.user.findUnique({
    where: { email: clientOwnerEmail },
  });

  if (clientUser) {
    await prisma.user.update({
      where: { email: clientOwnerEmail },
      data: {
        orgRole: OrgRole.OWNER,
      },
    });
    console.log(`Promoted ${clientOwnerEmail} to OrgRole: OWNER`);
  } else {
    console.log(`Client User ${clientOwnerEmail} not found.`);
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

