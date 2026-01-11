# Debate Fight Club

A full-stack web application for AI-powered debate practice and conversation training. Practice your argumentation skills, engage in free-form conversations with AI personalities, or train for specific scenarios with real-time coaching.

## Features

### 🗣️ Debate Mode
- **AI vs AI Debates**: Watch two AI debaters argue on any topic you choose
- **User Interruptions**: Record your voice to interrupt and add your perspective
- **Audio Playback**: Listen to arguments with realistic text-to-speech
- **Automatic Progression**: Debates automatically alternate between pro and con arguments
- **Debate History**: View and replay past debates

### 🎭 Sandbox Mode
- **Free-Form Conversations**: Chat naturally with AI personalities
- **6 Personality Types**:
  - Supportive Friend
  - Wise Mentor
  - Patient Teacher
  - Devil's Advocate
  - Motivational Coach
  - Calm Therapist
- **Voice Input/Output**: Speak naturally and hear responses

### 🥋 Dojo Mode
- **Scenario Practice**: Train for real-world conversations
- **Practice Scenarios**: Salary negotiations, interviews, difficult conversations, and more
- **Real-Time Coaching**: Get instant feedback on your responses
- **Scoring System**: Track your performance with a 0-100 score
- **Visual Feedback**: Circular progress indicator (red → orange → yellow → green)

## Tech Stack

### Frontend
- **React 19** with TypeScript
- **Vite** for build tooling
- **tRPC** for type-safe API communication
- **Tailwind CSS** for styling
- **Radix UI** components
- **Framer Motion** for animations
- **Wouter** for routing
- **React Query** for data fetching

### Backend
- **Node.js** with Express
- **tRPC** for type-safe APIs
- **TypeScript** throughout
- **Drizzle ORM** for database management
- **MySQL** database

### AI & Voice Services
- **Google Gemini** - AI conversation and debate generation
- **ElevenLabs** - Text-to-speech for natural voice output
- **Deepgram** - Speech-to-text for voice input

### Infrastructure
- **AWS S3** - Audio file storage
- **Manus OAuth** - User authentication

## Getting Started

### Prerequisites
- Node.js 18+ 
- pnpm (package manager)
- MySQL database
- API keys for:
  - Google Gemini
  - ElevenLabs
  - Deepgram
  - AWS S3
  - Manus OAuth

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd debate-fight-club
```

2. Install dependencies:
```bash
pnpm install
```

3. Set up environment variables:
Create a `.env` file in the root directory with the following:
```env
# Database
DATABASE_URL=mysql://user:password@localhost:3306/debate_fight_club

# API Keys
GEMINI_API_KEY=your_gemini_api_key
ELEVENLABS_API_KEY=your_elevenlabs_api_key
DEEPGRAM_API_KEY=your_deepgram_api_key

# AWS S3
AWS_ACCESS_KEY_ID=your_aws_access_key
AWS_SECRET_ACCESS_KEY=your_aws_secret_key
AWS_REGION=your_aws_region
AWS_S3_BUCKET_NAME=your_bucket_name

# OAuth (Manus)
MANUS_OAUTH_CLIENT_ID=your_client_id
MANUS_OAUTH_CLIENT_SECRET=your_client_secret
MANUS_OAUTH_REDIRECT_URI=your_redirect_uri

# Server
PORT=3000
NODE_ENV=development
```

4. Set up the database:
```bash
pnpm db:push
```

5. Start the development server:
```bash
pnpm dev
```

The application will be available at `http://localhost:3000`

## Project Structure

```
debate-fight-club/
├── client/                 # Frontend React application
│   ├── src/
│   │   ├── pages/         # Page components (Debate, Sandbox, Dojo, Home)
│   │   ├── components/    # Reusable UI components
│   │   ├── contexts/      # React contexts (Theme, etc.)
│   │   ├── hooks/         # Custom React hooks
│   │   └── lib/           # Utilities and tRPC client
│   └── index.html
├── server/                 # Backend Node.js application
│   ├── _core/             # Core server infrastructure
│   ├── services/          # Business logic services
│   ├── routers.ts         # tRPC route definitions
│   └── db.ts              # Database operations
├── drizzle/               # Database schema and migrations
│   ├── schema.ts          # Database schema definitions
│   └── migrations/        # Migration files
└── shared/                # Shared types and constants
```

## Scripts

- `pnpm dev` - Start development server
- `pnpm build` - Build for production
- `pnpm start` - Start production server
- `pnpm test` - Run tests
- `pnpm check` - Type check without emitting files
- `pnpm format` - Format code with Prettier
- `pnpm db:push` - Generate and run database migrations

## Database Schema

The application uses the following main tables:
- `users` - User accounts and authentication
- `debates` - Debate sessions
- `debateMessages` - Messages in debates (pro/con/user)
- `sandboxConversations` - Sandbox mode conversations
- `sandboxMessages` - Messages in sandbox conversations
- `dojoPracticeSessions` - Dojo practice sessions
- `dojoMessages` - Messages in dojo sessions with scores

## Architecture

### API Layer (tRPC)
The backend exposes type-safe APIs through tRPC:
- `debate.*` - Debate creation, message generation, interruptions
- `sandbox.*` - Sandbox conversation management
- `dojo.*` - Dojo scenario practice and scoring
- `auth.*` - Authentication endpoints

### Services Layer
- `debateOrchestrator` - Manages debate flow and turn-taking
- `geminiService` - Handles AI conversation generation
- `elevenLabsService` - Text-to-speech conversion
- `deepgramService` - Speech-to-text transcription
- `sandboxService` - Sandbox conversation logic
- `dojoService` - Dojo scenario and coaching logic

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run tests and type checking
5. Submit a pull request

## License

MIT
