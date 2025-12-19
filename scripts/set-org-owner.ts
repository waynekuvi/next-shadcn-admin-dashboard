
import { PrismaClient, OrgRole } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const email = "waynekuvi@gmail.com";

  const user = await prisma.user.findUnique({
    where: { email },
  });

  if (!user) {
    console.log(`User ${email} not found.`);
    return;
  }

  if (!user.organizationId) {
    console.log(`User ${email} is not in an organization.`);
    return;
  }

  const updatedUser = await prisma.user.update({
    where: { email },
    data: {
      orgRole: OrgRole.OWNER,
    },
  });

  console.log(`Successfully updated ${email} to OrgRole: ${updatedUser.orgRole}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

