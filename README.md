💸 Smart Expense Splitter

An intelligent expense management platform that makes splitting bills, managing group expenses, and calculating settlements simple and effortless.

Smart Expense Splitter is a full-stack web application designed to simplify shared expense management among friends, roommates, classmates, and groups.

The application helps users record expenses, split costs, track individual contributions, and automatically determine who owes whom.

It also features Guest Mode, an account-free expense splitting experience that uses Google Gemini to process uploaded receipts and extract expense information.

🌐 Live Demo

🚀 Live Application:
https://smart-expense-splitter-git-main-aakash-5827.vercel.app

💻 GitHub Repository:
https://github.com/aakashtripathi011/smart-expense-splitter

✨ Features
🔐 Authentication
User registration and login
JWT-based authentication
Password hashing with bcrypt
Protected user-specific functionality
Secure environment-based configuration

👥 Group Expense Management
Create expense groups
Add members to groups
View group details
Add shared expenses
Track who paid for an expense
Track individual shares
Calculate balances automatically
Determine who owes whom


🧾 AI-Powered Receipt Processing

Upload a bill or receipt and let AI extract the relevant expense information.

The application uses Google Gemini API to process uploaded receipt images and identify information such as:

Items
Prices
Quantities
Total amount
Other relevant bill information

The extracted information can be reviewed and modified before the final expense calculation.


⚡ Guest Mode

Guest Mode allows users to calculate a one-time expense without creating an account.

Guest Mode Flow
Upload Receipt
      ↓
Gemini Processing
      ↓
Extract Expense Information
      ↓
Review & Edit
      ↓
Add Participants
      ↓
Select Payers
      ↓
Assign Items
      ↓
Calculate Shares
      ↓
Calculate Settlements
      ↓
Download PDF

This makes the application useful when users simply want to split a bill quickly without signing up.


💰 Smart Settlement

After calculating the individual shares, the application determines the final balances between participants.

Instead of manually figuring out multiple transactions, users can see simplified results such as:

A owes B ₹500
C owes B ₹250

This makes the final settlement easier to understand.

📄 PDF Export

The final expense calculation can be downloaded as a PDF.

This allows users to:

Keep a record of the calculation
Share the result with participants
Refer back to the settlement later


🛠️ Tech Stack

Technology	Purpose
Next.js 16	Frontend framework
React 19	Frontend UI
TypeScript	Type-safe development
Tailwind CSS 4	Styling
Node.js	Backend runtime
Express.js 5	REST API
PostgreSQL	Database
Neon	Cloud PostgreSQL database

JWT	Authentication
bcryptjs	Password hashing
Multer	File/image upload handling
Google Gemini API	AI-powered receipt processing
Vercel	Frontend deployment
Render	Backend deployment


🏗️ System Architecture
```text
                         ┌──────────────────────┐
                         │        User          │
                         └──────────┬───────────┘
                                    │
                                    ▼
                         ┌──────────────────────┐
                         │      Frontend        │
                         │  Next.js + React      │
                         │   TypeScript + CSS    │
                         └──────────┬───────────┘
                                    │
                              HTTP / REST API
                                    │
                                    ▼
                         ┌──────────────────────┐
                         │       Backend        │
                         │   Node.js + Express   │
                         └──────────┬───────────┘
                                    │
                    ┌───────────────┼───────────────┐
                    │               │               │
                    ▼               ▼               ▼
             ┌────────────┐  ┌─────────────┐  ┌──────────────┐
             │ PostgreSQL │  │ Gemini API  │  │ File Upload  │
             │    Neon    │  │ AI / Receipt│  │   Multer     │
             └────────────┘  │ Processing   │  └──────────────┘
                             └─────────────┘
```
Architecture Overview
Frontend: Next.js and React provide the user interface.
Backend: Node.js and Express handle API requests and application logic.
Database: PostgreSQL stores users, groups, expenses, and related data.
AI Processing: Google Gemini processes uploaded receipt images.
File Handling: Multer handles receipt/image uploads.
Authentication: JWT is used to protect authenticated functionality.
                      


🔄 Application Flow

Regular User Flow

Register / Login
       ↓
Dashboard
       ↓
Create / Join Group
       ↓
Add Members
       ↓
Add Expense
       ↓
Select Payer
       ↓
Select Participants
       ↓
Calculate Individual Shares
       ↓
Calculate Balances
       ↓
Show Final Settlement


Guest Mode Flow

Guest Mode
     ↓
Upload Receipt
     ↓
Gemini Processing
     ↓
Extract Items & Prices
     ↓
Review Information
     ↓
Add Participant Names
     ↓
Select Who Paid
     ↓
Assign Items
     ↓
Calculate Expense Split
     ↓
Generate Settlement
     ↓
Download PDF
🤖 AI Receipt Processing

Smart Expense Splitter uses the Google Gemini API to understand uploaded receipt images.


Processing Pipeline

Receipt Image
      ↓
File Upload
      ↓
Gemini API
      ↓
Receipt Understanding
      ↓
Structured Expense Data
      ↓
User Review
      ↓
Expense Calculation

The extracted information is presented to the user for review rather than being treated as automatically final.

Users can make corrections before the final split is calculated.


📊 Expense Calculation

The application considers information such as:

Total bill amount
Individual items
Item prices
Quantity
Payer
Participants
Individual shares
Amount already paid

The system then calculates the final balance for each participant.

Example
Total Expense: ₹1500

A paid: ₹1000
B paid: ₹500

A's share: ₹600
B's share: ₹500
C's share: ₹400

Final Settlement:

C → A : ₹400
🔐 Security

The application uses JWT-based authentication for protected functionality.

Passwords are securely handled using bcryptjs, while sensitive credentials are stored through environment variables.

The following should never be committed to the repository:

.env files
Database passwords
JWT secrets
Gemini API keys
Other private credentials


📁 Project Structure
```text
smart-expense-splitter/
│
└── USICT024/
    │
    ├── frontend/
    │   ├── app/
    │   ├── public/
    │   ├── middleware.ts
    │   ├── next.config.ts
    │   ├── package.json
    │   └── tsconfig.json
    │
    ├── backend/
    │   ├── config/
    │   ├── controllers/
    │   ├── middleware/
    │   ├── routes/
    │   ├── services/
    │   ├── server.js
    │   ├── testSplit.js
    │   └── package.json
    │
    ├── screenshots/
    │   ├── login.jpeg
    │   ├── dashboard.jpeg
    │   ├── groups.jpeg
    │   ├── expenses.jpeg
    │   ├── guest-mode.jpeg
    │   └── receipt.jpeg
    │
    └── README.md
```

    
⚙️ Installation & Setup
1. Clone the Repository
git clone https://github.com/aakashtripathi011/smart-expense-splitter.git
cd smart-expense-splitter/USICT024
2. Frontend Setup
cd frontend
npm install

Create the required environment variables according to the frontend configuration.

Start the development server:

npm run dev
3. Backend Setup

Open another terminal:

cd backend
npm install

Create a .env file inside the backend directory with the required database, authentication, and Gemini credentials.

Example:

PORT=3000

DB_USER=your_database_user
DB_HOST=your_database_host
DB_NAME=your_database_name
DB_PASSWORD=your_database_password
DB_PORT=5432

JWT_SECRET=your_jwt_secret

GEMINI_API_KEY=your_gemini_api_key

Start the backend:

npm start

Make sure the environment variable names match the configuration used by your application.

## 📸 Screenshots

### 🔐 Login / Signup

[![Login Page](./screenshots/login.jpeg)](./screenshots/login.jpeg)

### 🏠 Dashboard

[![Dashboard](./screenshots/dashboard.jpeg)](./screenshots/dashboard.jpeg)

### 👥 Groups

[![Groups](./screenshots/groups.jpeg)](./screenshots/groups.jpeg)

### 💰 Expenses

[![Expenses](./screenshots/expenses.jpeg)](./screenshots/expenses.jpeg)

### ⚡ Guest Mode

[![Guest Mode](./screenshots/guest-mode.jpeg)](./screenshots/guest-mode.jpeg)

### 🧾 AI Receipt Processing

[![AI Receipt Processing](./screenshots/receipt.jpeg)](./screenshots/receipt.jpeg

🚀 Deployment
Component	Platform
Frontend	Vercel
Backend	Render
Database	Neon
AI Processing	Google Gemini
Production

🚀 Frontend:
https://smart-expense-splitter-git-main-aakash-5827.vercel.app

💻 GitHub:
https://github.com/aakashtripathi011/smart-expense-splitter

🔮 Future Improvements
Real-time group expense updates
Expense analytics and visualizations
Expense history
Notifications and payment reminders
Improved receipt recognition
Multiple currency support
Advanced settlement optimization
Mobile application
Additional export formats
Enhanced group collaboration


🎯 Project Objective

The main objective of Smart Expense Splitter is to remove the complexity from shared expense management.

Instead of manually figuring out:

Who paid?

Who consumed what?

How much does everyone owe?

Who should pay whom?

the application performs the calculations and presents the final settlement in a simple and understandable format.

The AI-powered Guest Mode further reduces manual data entry by extracting expense information directly from uploaded receipts.


🏆 Project Highlights

Smart Expense Splitter combines:

Full-Stack Web Development
AI-powered receipt processing
REST APIs
PostgreSQL database management
JWT authentication
Automated expense calculations
Group expense management
Account-free Guest Mode
PDF generation

📌 Project Status

🚧 Under Development

Smart Expense Splitter is an actively developed project, with ongoing improvements to its functionality, user experience, AI processing, and overall performance.

📄 License

This project is currently intended for educational, development, and project demonstration purposes.
