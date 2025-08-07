const fs = require('fs').promises;
const path = require('path');
const connectToDatabase = require('./db');

async function processPayloads() {
  let client;
  try {
    const db = await connectToDatabase();
    client = db.client;
    const collection = db.collection('processed_messages');

    const payloadsDir = path.join(__dirname, 'payloads');
    const files = await fs.readdir(payloadsDir);

    for (const file of files) {
      const filePath = path.join(payloadsDir, file);
      const data = await fs.readFile(filePath, 'utf-8');
      const payload = JSON.parse(data);
      
      if (!payload.metaData || !payload.metaData.entry || !payload.metaData.entry[0] || !payload.metaData.entry[0].changes || !payload.metaData.entry[0].changes[0]) {
        console.error(`Skipping file ${file} due to unexpected payload structure.`);
        continue;
      }

      const changes = payload.metaData.entry[0].changes[0].value;
      
      if (changes.statuses) {
        const message = changes.statuses[0];
        const filter = { id: message.id };
        const updateDoc = {
          $set: { status: message.status, timestamp: parseInt(message.timestamp) },
        };
        await collection.updateOne(filter, updateDoc);
        console.log(`Updated status for message ID: ${message.id}`);
      } else if (changes.messages) {
        const message = changes.messages[0];
        const wa_id = changes.contacts && changes.contacts[0] ? changes.contacts[0].wa_id : 'unknown';
        const contactName = changes.contacts && changes.contacts[0] && changes.contacts[0].profile ? changes.contacts[0].profile.name : 'Unknown User';

        const newMessage = {
          id: message.id,
          wa_id: wa_id,
          name: contactName,
          from: message.from,
          text: message.text.body,
          timestamp: parseInt(message.timestamp),
          status: 'sent', 
        };
        
        await collection.updateOne(
          { id: newMessage.id }, 
          { $set: newMessage },
          { upsert: true }
        );
        console.log(`Processed new message from: ${wa_id}`);
      } else {
        console.log(`Skipping file ${file} as it is not a message or status payload.`);
      }
    }
    console.log('Finished processing all payloads.');
  } catch (err) {
    console.error('An error occurred during payload processing:', err);
  } finally {
    if (client) {
      await client.close();
      console.log('MongoDB connection closed.');
    }
  }
}

processPayloads().catch(console.error);
