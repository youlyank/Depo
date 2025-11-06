# 📋 AI Workflow Builder - Complete Setup Guide

## 🚀 Complete Setup Instructions

### 1. Repository Setup
```bash
# Clone the repository
git clone https://github.com/youlyank/Depo.git
cd Depo

# Install dependencies
npm install
```

### 2. Environment Configuration
Create a `.env` file in the root directory:

```env
# Database Configuration (Required)
DATABASE_URL="file:./dev.db"

# Slack Integration (Optional but Recommended)
SLACK_BOT_TOKEN="xoxb-your-slack-bot-token"
SLACK_DEFAULT_CHANNEL="#general"

# Google Sheets Integration (Optional)
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_EMAIL="your-service-account-email"
GOOGLE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n..."

# Discord Integration (Optional)
DISCORD_BOT_TOKEN="your-discord-bot-token"
DISCORD_DEFAULT_CHANNEL_ID="your-channel-id"

# Email Integration (Optional)
SMTP_HOST="smtp.gmail.com"
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER="your-email@gmail.com"
SMTP_PASS="your-app-password"
SMTP_FROM="AI Workflow Builder <your-email@gmail.com>"

# Note: z-ai-web-dev-sdk is pre-configured
# No additional AI keys needed
```

### 3. Database Initialization
```bash
# Push database schema
npm run db:push

# Generate Prisma client
npm run db:generate
```

### 4. Start the Application
```bash
# Development mode
npm run dev

# Application will be available at http://localhost:3000
```

## 🔌 Integration Setup (Optional but Recommended)

### 📊 Google Sheets Integration
1. **Create Google Cloud Project**
   - Go to [Google Cloud Console](https://console.cloud.google.com)
   - Create new project
   - Enable "Google Sheets API"

2. **Create Service Account**
   - Go to "IAM & Admin" → "Service Accounts"
   - Click "Create Service Account"
   - Enter name and click "Create and Continue"
   - Skip granting roles (optional)
   - Click "Done"

3. **Generate Key**
   - Find your service account and click on it
   - Go to "Keys" tab
   - Click "Add Key" → "Create new key"
   - Select "JSON" and click "Create"
   - Download the JSON file

4. **Configure Service Account**
   - Open the JSON file and copy:
     - `client_id`
     - `client_email` 
     - `private_key` (the full key including "-----BEGIN PRIVATE KEY-----")

5. **Share Spreadsheet**
   - Open your Google Sheet
   - Click "Share" → "Add people and groups"
   - Paste the service account email
   - Give "Editor" permissions

6. **Configure in App**
   - Go to **Integrations** tab → **Google Sheets**
   - Enter the copied credentials
   - Test connection

### 🎮 Discord Integration
1. **Create Discord Application**
   - Go to [Discord Developer Portal](https://discord.com/developers/applications)
   - Click "New Application"
   - Enter app name and click "Create"

2. **Create Bot**
   - Go to "Bot" tab
   - Click "Add Bot"
   - Choose "Yes" for public bot (optional)
   - Copy the Bot Token (starts with "MTA..." or similar)

3. **Enable Intents**
   - In Bot settings, enable:
     - `SERVER MEMBERS INTENT`
     - `MESSAGE CONTENT INTENT`
     - `GUILD MESSAGES INTENT`

4. **Invite Bot to Server**
   - Go to "OAuth2" → "URL Generator"
   - Select scopes: `bot`, `applications.commands`
   - Copy the generated URL
   - Paste in browser and invite to your server

5. **Get Channel ID**
   - In Discord, enable Developer Mode (User Settings → Advanced)
   - Right-click on the channel and "Copy Channel ID"

6. **Configure in App**
   - Go to **Integrations** tab → **Discord**
   - Enter Bot Token and Channel ID
   - Test connection

### 📧 Email Integration
1. **Choose SMTP Provider**
   - **Gmail**: Most popular option
   - **Outlook**: Microsoft email
   - **SendGrid**: Transactional email service
   - **Custom**: Your own SMTP server

2. **Gmail Setup (Recommended)**
   - Enable 2-Factor Authentication
   - Go to Google Account settings
   - Security → 2-Step Verification → App passwords
   - Generate new app password
   - Use 16-character password (not your regular password)

3. **Configure in App**
   - Go to **Integrations** tab → **Email**
   - Choose provider preset or enter custom settings
   - Enter SMTP credentials
   - Test with "Send Test Message"

### 💬 Slack Integration
1. **Create Slack App**
   - Visit [Slack API](https://api.slack.com/apps)
   - Click "Create New App" → "From scratch"
   - Enter app name and select workspace

2. **Configure Permissions**
   - Go to "OAuth & Permissions"
   - Add Bot Token Scopes:
     - `chat:write` (Send messages)
     - `channels:read` (Read channel info)
     - `groups:read` (Read private channels)

3. **Install App**
   - Scroll down to "Install App"
   - Click "Install to Workspace"
   - Copy the "Bot User OAuth Token" (starts with `xoxb-`)

4. **Invite Bot to Channels**
   - In Slack, type `/invite @your-bot-name`
   - Add bot to channels you want to send messages to

5. **Configure in App**
   - Go to **Integrations** tab → **Slack**
   - Enter Bot Token and default channel
   - Test connection

## 🎯 Quick Test

### Test AI Workflow Generation
1. Go to **Builder** tab
2. Enter this prompt: `"Read data from Google Sheets and send to Slack"`
3. Click **Generate Workflow**
4. Click **Run** to execute
5. Check results in **Monitor** tab

### Test Multi-Integration Workflow
1. Enter this prompt: `"When user signs up, add to Google Sheets, send Discord notification, and email welcome"`
2. Generate and run the workflow
3. Check all three platforms for real notifications!

## 📁 Project Structure Overview

```
Depo/
├── src/
│   ├── app/
│   │   ├── api/                    # Backend API endpoints
│   │   │   ├── workflows/          # Workflow management
│   │   │   ├── integrations/       # All 4 integrations
│   │   │   │   ├── slack/          # Slack API
│   │   │   │   ├── google-sheets/  # Google Sheets API
│   │   │   │   ├── discord/        # Discord API
│   │   │   │   └── email/          # Email API
│   │   │   ├── templates/          # Workflow templates
│   │   │   └── executions/         # Execution monitoring
│   │   └── page.tsx               # Main application UI
│   ├── components/                 # React components
│   │   ├── execution-monitor.tsx   # Real-time monitoring
│   │   ├── slack-integration.tsx   # Slack setup UI
│   │   ├── google-sheets-integration.tsx # Google Sheets UI
│   │   ├── discord-integration.tsx # Discord setup UI
│   │   ├── email-integration.tsx   # Email setup UI
│   │   ├── workflow-analytics.tsx  # Analytics dashboard
│   │   ├── workflow-scheduler.tsx  # Scheduling interface
│   │   └── workflow-templates.tsx  # Template gallery
│   └── lib/                        # Core business logic
│       ├── slack.ts                # Slack API service
│       ├── google-sheets.ts        # Google Sheets service
│       ├── discord.ts              # Discord service
│       ├── email.ts                # Email service
│       ├── workflow-generator.ts   # AI workflow creation
│       ├── workflow-scheduler.ts   # Cron scheduling
│       └── db.ts                   # Database client
├── prisma/
│   └── schema.prisma               # Database schema
├── public/                         # Static assets
├── .env                            # Environment variables
├── package.json                    # Dependencies
└── README.md                       # Full documentation
```

## 🛠️ Available Commands

```bash
# Development
npm run dev              # Start development server
npm run build            # Build for production
npm run start            # Start production server

# Database
npm run db:push          # Push schema to database
npm run db:generate      # Generate Prisma client
npm run db:migrate       # Run migrations

# Code Quality
npm run lint             # Run ESLint
```

## 🎯 Feature Checklist

### ✅ Core Features
- [x] AI-powered workflow generation
- [x] Visual workflow editor (React Flow)
- [x] Real-time execution monitoring
- [x] Workflow scheduling with cron
- [x] Analytics and metrics dashboard
- [x] Template library
- [x] 4 real integrations (Slack, Google Sheets, Discord, Email)

### ✅ Real Integrations
- [x] Slack - Real message sending
- [x] Google Sheets - Read/write/append operations
- [x] Discord - Rich embeds and notifications
- [x] Email - SMTP sending with HTML templates

### ✅ Technical Features
- [x] Next.js 15 with TypeScript
- [x] Prisma ORM with SQLite
- [x] Socket.IO for real-time updates
- [x] shadcn/ui components
- [x] Responsive design
- [x] Error handling and logging

## 🐛 Common Issues & Solutions

### Database Issues
```bash
# If database not found
npm run db:push

# If Prisma client issues
npm run db:generate
```

### Integration Issues
1. **Slack**: Verify token starts with `xoxb-`
2. **Google Sheets**: Check service account permissions
3. **Discord**: Ensure bot has required intents
4. **Email**: Use App Password for Gmail

### Port Already in Use
```bash
# Kill process on port 3000
lsof -ti:3000 | xargs kill -9

# Or use different port
PORT=3001 npm run dev
```

## 📞 Support

If you encounter issues:

1. Check browser console for errors
2. Review server logs: `tail -f dev.log`
3. Verify all environment variables are set
4. Check the full README.md for detailed documentation
5. Test each integration in the **Integrations** tab

## 🎉 Ready to Go!

Once setup is complete:
1. Open http://localhost:3000
2. Go to **Builder** tab
3. Try this prompt: `"Send a welcome message to Slack, Discord, and email when user signs up"`
4. Watch the AI create a complete workflow!
5. Run it and see real notifications on all platforms!

Your AI Workflow Builder is now ready for production use with 4 real integrations! 🚀