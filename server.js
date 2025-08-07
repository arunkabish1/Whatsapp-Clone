const express = require('express');
const cors = require('cors');
const connectToDatabase = require('./db');
const { ObjectId } = require('mongodb');
const path = require('path');

const app = express();
const port = 3001;
app.use(express.json());
app.use(cors());

let db;
let client;

async function startServer() {
    try {
        const dbInstance = await connectToDatabase();
        db = dbInstance;
        client = dbInstance.client;

        app.get('/conversations', async (req, res) => {
            try {
                const conversations = await db.collection('processed_messages').aggregate([
                    {
                        $sort: { timestamp: -1 }
                    },
                    {
                        $group: {
                            _id: "$wa_id",
                            lastMessage: { $first: "$text" },
                            name: { $first: "$name" },
                            lastTimestamp: { $first: "$timestamp" }
                        }
                    },
                    {
                        $sort: { lastTimestamp: -1 }
                    }
                ]).toArray();
                res.json(conversations);
            } catch (err) {
                res.status(500).json({ error: 'Failed to fetch conversations.' });
            }
        });

        app.get('/messages/:wa_id', async (req, res) => {
            try {
                const wa_id = req.params.wa_id;
                const messages = await db.collection('processed_messages').find({ wa_id: wa_id }).sort({ timestamp: 1 }).toArray();
                res.json(messages);
            } catch (err) {
                res.status(500).json({ error: 'Failed to fetch messages for this conversation.' });
            }
        });

        app.post('/messages', async (req, res) => {
            try {
                const newMessage = req.body;
                newMessage.id = `wamid.HBgMOTE5OTY3NTc4NzIwFQIAEhgg${new ObjectId().toString()}`;
                newMessage.from = "918329446654";
                newMessage.status = 'sent';
                newMessage.timestamp = Date.now();
                await db.collection('processed_messages').insertOne(newMessage);
                res.status(201).json(newMessage);
            } catch (err) {
                console.error('Failed to save new message:', err);
                res.status(500).json({ error: 'Failed to send message.' });
            }
        });
        
        app.use(express.static(path.join(__dirname, 'whatsapp-frontend/build')));
        app.get('*', (req, res) => {
            res.sendFile(path.join(__dirname, 'whatsapp-frontend/build', 'index.html'));
        });

        app.listen(port, () => {
            console.log(`Chat backend listening at http://localhost:${port}`);
        });

    } catch (err) {
        console.error('Failed to start the server:', err);
        if (client) {
            await client.close();
        }
        process.exit(1);
    }
}

startServer();

process.on('SIGINT', async () => {
    console.log('Shutting down server...');
    if (client) {
        await client.close();
        console.log('MongoDB connection closed.');
    }
    process.exit(0);
});