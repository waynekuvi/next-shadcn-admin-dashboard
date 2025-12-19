import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function updateChannelNames() {
  try {
    // Update support channels with "Support" name
    const result1 = await prisma.channel.updateMany({
      where: {
        type: 'SUPPORT',
        name: 'Support'
      },
      data: {
        name: 'Atliso Support Team'
      }
    });
    
    // Update support channels with null name
    const result2 = await prisma.channel.updateMany({
      where: {
        type: 'SUPPORT',
        name: { equals: null } as any
      },
      data: {
        name: 'Atliso Support Team'
      }
    });
    
    console.log(`Updated ${result1.count + result2.count} channels to "Atliso Support Team"`);
  } catch (error) {
    console.error('Error updating channels:', error);
  } finally {
    await prisma.$disconnect();
  }
}

updateChannelNames();
