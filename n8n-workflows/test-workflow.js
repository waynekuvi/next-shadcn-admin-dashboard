// Test script for n8n SMS Reminder Workflow
// Usage: node test-workflow.js YOUR_WEBHOOK_URL

const webhookUrl = process.argv[2];

if (!webhookUrl) {
  console.error('❌ Error: Please provide your webhook URL');
  console.log('Usage: node test-workflow.js https://your-n8n-url.com/webhook/sms-reminder');
  process.exit(1);
}

const payload = {
  executionId: 'test-exec-123',
  phoneNumber: '+447911123456',
  variables: {
    name: 'John Doe',
    date: '2024-12-20',
    time: '14:00',
    service: 'Dental Checkup',
    phone: '+447911123456',
    address: '123 Main St, London',
  },
  messages: [
    {
      sequence: 1,
      delay: 0,
      message: 'Hi {{name}}, you have an appointment on {{date}} at {{time}} for {{service}}.',
    },
    {
      sequence: 2,
      delay: 1, // 1 hour for testing (change to 24 for production)
      message: 'Reminder: Your {{service}} appointment is tomorrow at {{time}}. See you at {{address}}!',
    },
  ],
};

console.log('🚀 Testing n8n workflow...');
console.log('📡 Webhook URL:', webhookUrl);
console.log('📦 Payload:', JSON.stringify(payload, null, 2));
console.log('');

fetch(webhookUrl, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(payload),
})
  .then((res) => res.json())
  .then((data) => {
    console.log('✅ Success! Response:', data);
    console.log('\n📊 Check your n8n workflow execution to see the results.');
  })
  .catch((err) => {
    console.error('❌ Error:', err.message);
    process.exit(1);
  });





