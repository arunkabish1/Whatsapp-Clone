# WhatsApp Web Clone (RapidQuest Assignment)

A full-stack web application replicating the core features and UI of WhatsApp Web.  
It processes simulated webhook data from the WhatsApp Business API, displays conversations in a clean, responsive interface, and allows users to send new messages persisted in a MongoDB database.

---

## Key Features 
- **Webhook Data Processing:**  
  Node.js script reads JSON payloads to manage messages and statuses in MongoDB.

- **WhatsApp Web-Like UI:**  
  Responsive, authentic frontend built with React and Tailwind CSS.

- **Real-time Conversations:**  
  Shows conversations grouped by user (`wa_id`), displaying all messages with status icons.

- **Message Sending:**  
  Compose and send new messages that update instantly and persist in the database.

- **Full-Stack Architecture:**  
  React frontend and Node.js Express backend seamlessly integrated.

---

## Tech Stack

**Frontend:**  
- React  
- Tailwind CSS

**Backend:**  
- Node.js  
- Express.js  
- MongoDB (Atlas)

---

## Getting Started 

**1. Clone the Repository** 

```bash
git clone https://github.com/arunkabish1/Whatsapp-Clone.git
cd Whatsapp-Clone
```



** 2. Setup MongoDB** 

- Create a cluster on MongoDB Atlas.

- Add a database user and whitelist your IP (or allow access for dev).

- Copy the connection string and create a .env file in the root:
```
MONGO_URI=your_mongodb_atlas_connection_string
```
**3. Process Webhook Payloads** 
This populates the database with sample data:
```
npm install
node processPayloads.js
```
**4. Run the Application Locally** 
Open two terminals:

**Terminal 1: Backend** 
```
npm install
node server.js
```
**Terminal 2: Frontend** 
```
cd whatsapp-frontend
npm install
npm start
```

Visit http://localhost:3000 in your browser.

**Deployment** 
-The backend serves the React frontend build from whatsapp-frontend/build.

-Deploy on Render or any Node.js hosting service.

-Use node server.js as the start command.

-Set the environment variable MONGO_URI on the server.

-Run npm run build inside whatsapp-frontend before deployment to generate the production build.

**Folder Structure** 
```
Whatsapp-Clone/
├── whatsapp-frontend/    # React frontend source
├── processPayloads.js    # Webhook data processor
├── server.js             # Express backend server
├── .env                  # Environment variables (not committed)
└── README.md
```
** Contact** 
For questions or feedback, please reach out to [arunkabish1@gmail.com] or open an issue on GitHub.



Thank you for checking out this project...! 



