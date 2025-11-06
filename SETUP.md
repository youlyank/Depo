# 📋 AI Workflow Builder - Setup Guide

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

## 🔧 Slack Integration Setup (Optional)

### Step 1: Create Slack App
1. Visit [Slack API](https://api.slack.com/apps)
2. Click "Create New App" → "From scratch"
3. Enter app name and select workspace
4. Click "Create App"

### Step 2: Configure Permissions
1. Go to "OAuth & Permissions"
2. Add these Bot Token Scopes:
   - `chat:write` (Send messages)
   - `channels:read` (Read channel info)
   - `groups:read` (Read private channels)

### Step 3: Install App
1. Scroll to "OAuth & Permissions"
2. Click "Install to Workspace"
3. Authorize the permissions
4. Copy the "Bot User OAuth Token" (starts with `xoxb-`)

### Step 4: Configure in App
1. Open the AI Workflow Builder
2. Go to **Integrations** tab
3. Enter your Bot Token
4. Set default channel (e.g., `#general`)
5. Click "Connect to Slack"
6. Test the connection

## 🎯 Quick Test

### Test AI Workflow Generation
1. Go to **Builder** tab
2. Enter this prompt: `"Send a test message to Slack when workflow runs"`
3. Click "Generate Workflow"
4. Click "Run" to execute
5. Check your Slack channel for the message!

### Test Slack Integration
1. Go to **Integrations** tab → **Test Connection**
2. Click "Send Test Message"
3. Verify message appears in your Slack workspace

## 📁 Project Structure Overview

```
Depo/
├── src/
│   ├── app/
│   │   ├── api/                    # Backend API endpoints
│   │   │   ├── workflows/          # Workflow management
│   │   │   ├── integrations/       # Slack integration
│   │   │   ├── templates/          # Workflow templates
│   │   │   └── executions/         # Execution monitoring
│   │   └── page.tsx               # Main application UI
│   ├── components/                 # React components
│   │   ├── execution-monitor.tsx   # Real-time monitoring
│   │   ├── slack-integration.tsx   # Slack setup UI
│   │   ├── workflow-analytics.tsx  # Analytics dashboard
│   │   ├── workflow-scheduler.tsx  # Scheduling interface
│   │   └── workflow-templates.tsx  # Template gallery
│   └── lib/                        # Core business logic
│       ├── slack.ts                # Slack API service
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
- [x] Real Slack integration

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

### Slack Integration Issues
1. Verify token starts with `xoxb-`
2. Check bot has required permissions
3. Ensure bot is invited to target channels
4. Test connection in Integrations tab

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

## 🎉 Ready to Go!

Once setup is complete:
1. Open http://localhost:3000
2. Go to **Builder** tab
3. Try this prompt: `"Send a welcome message to Slack when user signs up"`
4. Watch the AI create a complete workflow!
5. Run it and see real Slack notifications!

Your AI Workflow Builder is now ready for production use! 🚀