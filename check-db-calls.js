// Quick script to check what's in the VoiceCall database
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function checkCalls() {
  try {
    console.log('\n🔍 Querying VoiceCall table...\n');
    
    const calls = await prisma.voiceCall.findMany({
      orderBy: { createdAt: 'desc' },
      take: 10,
    });

    console.log(`📊 Found ${calls.length} call(s) in database:\n`);
    console.log('═'.repeat(80));

    if (calls.length === 0) {
      console.log('❌ No calls found in database');
    } else {
      calls.forEach((call, index) => {
        console.log(`\n📞 Call #${index + 1}:`);
        console.log(`   ID: ${call.id}`);
        console.log(`   Vapi Call ID: ${call.vapiCallId}`);
        console.log(`   Status: ${call.status}`);
        console.log(`   From: ${call.fromNumber || 'Unknown'}`);
        console.log(`   To: ${call.toNumber || 'N/A'}`);
        console.log(`   Started: ${call.startedAt ? call.startedAt.toISOString() : 'N/A'}`);
        console.log(`   Ended: ${call.endedAt ? call.endedAt.toISOString() : 'N/A'}`);
        console.log(`   Duration: ${call.duration ? `${call.duration}s` : 'N/A'}`);
        console.log(`   Cost: ${call.cost ? `$${call.cost.toFixed(4)}` : 'N/A'}`);
        console.log(`   Assistant ID: ${call.assistantId || 'N/A'}`);
        console.log(`   Assistant Name: ${call.assistantName || 'N/A'}`);
        console.log(`   Summary: ${call.summary ? call.summary.substring(0, 100) + '...' : 'N/A'}`);
        console.log(`   Outcome: ${call.outcome || 'N/A'}`);
        console.log(`   Organization ID: ${call.organizationId}`);
        console.log(`   Created: ${call.createdAt.toISOString()}`);
        console.log(`   Updated: ${call.updatedAt.toISOString()}`);
        console.log('─'.repeat(80));
      });
    }

    // Also check organization
    if (calls.length > 0) {
      const orgId = calls[0].organizationId;
      const org = await prisma.organization.findUnique({
        where: { id: orgId },
        select: { id: true, name: true },
      });
      
      if (org) {
        console.log(`\n🏢 Organization: ${org.name} (${org.id})`);
      } else {
        console.log(`\n⚠️  Organization not found for ID: ${orgId}`);
      }
    }

  } catch (error) {
    console.error('❌ Error querying database:', error.message);
    if (error.code === 'P2022') {
      console.error('   This is a database connection issue (prepared statement error)');
    }
  } finally {
    await prisma.$disconnect();
  }
}

checkCalls();

