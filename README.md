# 🤖 AI Workflow Builder - Enterprise Edition

A powerful, AI-driven automation platform that transforms natural language descriptions into fully functional workflows with real Slack integration.

## ✨ Features

### 🎯 Core Capabilities
- **AI-Powered Generation**: Create workflows from plain English descriptions
- **Visual Editor**: Professional drag-and-drop workflow builder with React Flow
- **Real Slack Integration**: Send actual notifications to your Slack workspace
- **Real-Time Monitoring**: Live execution tracking and status updates
- **Smart Scheduling**: Automated workflow execution with cron support
- **Rich Analytics**: Performance metrics and execution insights
- **Template Library**: Pre-built workflows for common automation tasks

### 🛠️ Technical Stack
- **Frontend**: Next.js 15, TypeScript, React Flow, shadcn/ui, Tailwind CSS
- **Backend**: Next.js API routes, Prisma ORM, SQLite
- **Real-time**: Socket.IO for live updates
- **AI**: z-ai-web-dev-sdk for intelligent workflow generation
- **Integrations**: @slack/web-api for real Slack messages
- **Scheduling**: node-cron for automated executions

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- npm or yarn
- Git

### 1. Clone and Install
```bash
git clone https://github.com/youlyank/Depo.git
cd Depo
npm install
```

### 2. Environment Setup
Create a `.env` file in the root directory:
```env
# Database
DATABASE_URL="file:./dev.db"

# AI SDK (already configured)
# Z_AI_SDK_KEY="your-key-here" # Auto-configured

# Optional: Slack Integration (for real notifications)
SLACK_BOT_TOKEN="xoxb-your-bot-token"
SLACK_DEFAULT_CHANNEL="#general"
```

### 3. Database Setup
```bash
npm run db:push
```

### 4. Start Development Server
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to start building workflows!

## 📖 Usage Guide

### Creating Your First Workflow

1. **Go to Builder Tab**
2. **Enter a prompt** like:
   - "Send daily sales report to Slack at 9 AM"
   - "When user signs up, add to Google Sheets and send welcome email"
   - "Monitor website errors and send Discord alerts"

3. **Click "Generate Workflow"** - AI creates a complete workflow
4. **Visualize & Edit** - Drag nodes, adjust connections
5. **Run Workflow** - Execute immediately or schedule for later

### Setting Up Slack Integration

1. **Create Slack App**:
   - Visit [api.slack.com/apps](https://api.slack.com/apps)
   - Create new app → "From scratch"
   - Add bot permissions: `chat:write`, `channels:read`, `groups:read`

2. **Configure in App**:
   - Go to **Integrations** tab
   - Enter your Bot Token (starts with `xoxb-`)
   - Set default channel
   - Test connection

3. **Use in Workflows**:
   - Generate workflows with Slack nodes
   - Messages will be sent to your actual Slack workspace!

### Advanced Features

#### 📊 Analytics Tab
- Monitor execution success rates
- Track performance metrics
- View usage patterns and trends

#### ⏰ Schedule Tab
- Set up recurring executions
- Use cron expressions or common schedules
- Background automation

#### 🔍 Monitor Tab
- Real-time execution tracking
- Detailed execution logs
- Error monitoring and debugging

#### 📚 Templates Tab
- Pre-built workflow templates
- Categorized by use case and difficulty
- One-click workflow generation

## 🏗️ Project Structure

```
├── src/
│   ├── app/
│   │   ├── api/                    # API endpoints
│   │   │   ├── workflows/          # Workflow CRUD & execution
│   │   │   ├── integrations/       # Slack integration
│   │   │   ├── templates/          # Workflow templates
│   │   │   └── executions/         # Execution monitoring
│   │   └── page.tsx               # Main application
│   ├── components/                 # UI components
│   │   ├── execution-monitor.tsx   # Real-time monitoring
│   │   ├── slack-integration.tsx   # Slack setup UI
│   │   ├── workflow-analytics.tsx  # Analytics dashboard
│   │   ├── workflow-scheduler.tsx  # Scheduling interface
│   │   └── workflow-templates.tsx  # Template gallery
│   └── lib/                        # Core logic
│       ├── slack.ts                # Slack service
│       ├── workflow-generator.ts   # AI workflow creation
│       ├── workflow-scheduler.ts   # Cron scheduling
│       └── db.ts                   # Database client
├── prisma/
│   └── schema.prisma               # Database schema
├── public/                         # Static assets
└── package.json                    # Dependencies
```

## 🔧 Available Scripts

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint
npm run db:push      # Push database schema
npm run db:generate  # Generate Prisma client
npm run db:migrate   # Run database migrations
```

## 🤖 AI Workflow Examples

### Business Automation
- "Send daily sales report to #sales at 9 AM"
- "When Stripe payment received, update CRM and notify #finance"
- "Monitor inventory levels and alert when stock is low"

### Development Operations
- "When GitHub issue is created, assign to team and notify #devops"
- "Run tests every night and send results to #engineering"
- "Monitor server uptime and alert #devops if down"

### Marketing Automation
- "Post new blog articles to social media automatically"
- "When user subscribes, add to Mailchimp and send welcome email"
- "Weekly analytics report sent to #marketing"

## 🔌 Integration Setup

### Slack Integration (Real Notifications)
1. Create Slack app at [api.slack.com/apps](https://api.slack.com/apps)
2. Add OAuth scopes: `chat:write`, `channels:read`, `groups:read`
3. Install to workspace
4. Copy Bot User OAuth Token
5. Configure in **Integrations** tab

### Environment Variables
```env
# Required
DATABASE_URL="file:./dev.db"

# Optional - Slack Integration
SLACK_BOT_TOKEN="xoxb-your-token"
SLACK_DEFAULT_CHANNEL="#general"
```

## 🐛 Troubleshooting

### Common Issues

**Database not found:**
```bash
npm run db:push
```

**Slack integration not working:**
1. Verify bot token starts with `xoxb-`
2. Check bot has required permissions
3. Ensure bot is invited to target channels
4. Test connection in **Integrations** tab

**Workflows not executing:**
1. Check workflow is active (toggle switch)
2. Verify trigger nodes are properly configured
3. Monitor execution in **Monitor** tab

**AI generation failing:**
1. Check internet connection
2. Verify prompt is descriptive enough
3. Try simpler prompts first

### Getting Help

1. Check the **Monitor** tab for execution errors
2. Review browser console for frontend issues
3. Check server logs: `tail -f dev.log`
4. Verify all environment variables are set

## 🎯 Production Deployment

### Environment Setup
```bash
# Build for production
npm run build

# Start production server
npm run start
```

### Database
- SQLite is used for development
- For production, consider PostgreSQL
- Update `DATABASE_URL` in production environment

### Security
- Bot tokens should be stored securely
- Use environment variables for sensitive data
- Enable HTTPS in production
- Consider rate limiting for API endpoints

## 📄 License

This project is licensed under the MIT License.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 🎉 Acknowledgments

- Built with Next.js 15 and TypeScript
- UI components by shadcn/ui
- Workflow visualization by React Flow
- AI integration by z-ai-web-dev-sdk
- Real-time updates by Socket.IO

---

**🚀 Ready to automate your workflows with AI? Start building now!**

For support, open an issue on GitHub or check the troubleshooting guide above.