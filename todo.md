# Debate Fight Club - TODO

## Database & Backend
- [x] Design and implement debate schema (debates table, messages table)
- [x] Create database migrations
- [x] Implement debate CRUD operations
- [x] Set up Gemini API integration for pro/con arguments
- [x] Implement debate orchestration logic (turn-taking, message generation)
- [x] Add user interruption handling and response generation
- [x] Implement debate history retrieval

## API Integration
- [x] Request and configure Gemini API credentials
- [x] Request and configure ElevenLabs API credentials
- [x] Request and configure Deepgram API credentials
- [x] Implement Gemini debate message generation
- [x] Implement ElevenLabs text-to-speech conversion
- [x] Implement Deepgram speech-to-text for interruptions
- [ ] Add error handling and retry logic for external APIs

## Frontend - Core UI
- [x] Design elegant debate interface layout
- [x] Create debate topic input form
- [x] Build real-time message display with speaker distinction
- [ ] Implement message typing animation
- [x] Add audio playback controls (play, pause, stop)
- [x] Create past debates list view
- [x] Build debate detail/history view

## Frontend - Voice Features
- [x] Implement audio recording for user interruptions
- [x] Add microphone permission handling
- [x] Create visual feedback for recording state
- [x] Implement audio playback for debate messages
- [x] Add speaker identification visual indicators

## Frontend - Real-time & State
- [ ] Set up WebSocket or polling for real-time debate updates
- [x] Implement debate state management
- [x] Add loading states and error handling
- [ ] Implement optimistic UI updates

## Testing & Optimization
- [x] Write vitest tests for debate API procedures
- [ ] Test debate flow end-to-end (manual testing)
- [ ] Optimize API call pacing (implemented via audio playback controls)
- [ ] Test interruption handling (manual testing)
- [ ] Verify audio playback timing (manual testing)

## Deployment
- [ ] Create checkpoint for initial release
- [ ] Verify all features working in production

## Bug Fixes
- [x] Fix 404 error on root route with query parameters

## Feature Enhancements
- [x] Implement automatic debate progression (pro -> con -> pro alternating)
- [x] Add configurable delay between arguments
- [x] Add pause/resume controls for auto-progression

## Audio Playback Improvements
- [x] Auto-play audio when argument is generated
- [x] Replay button to restart audio playback
- [ ] Pause/resume audio controls

## Sandbox Feature
- [x] Create Sandbox database schema for conversations
- [x] Implement 6 AI personality types (Supportive Friend, Wise Mentor, Patient Teacher, Devil's Advocate, Motivational Coach, Calm Therapist)
- [x] Build Sandbox conversation interface with personality selector
- [x] Implement free-form conversation with selected AI personality
- [x] Add voice input/output for Sandbox conversations
- [x] Create Sandbox page component

## Dojo Feature
- [x] Create Dojo database schema for scenarios and practice sessions
- [x] Implement scenario selection (salary negotiation, interview, breakup, etc.)
- [x] Build scoring algorithm based on response quality (1-100)
- [x] Create circular progress indicator (red -> orange -> yellow -> green)
- [x] Implement live score updates during conversation
- [x] Build Dojo page component with Live Coach feedback
- [x] Add voice input/output for Dojo scenarios

## Home Page Updates
- [x] Update home page with Sandbox, Dojo, and Debate tabs
- [x] Add navigation between three modes
- [x] Create feature cards for each mode

## UI Fixes & Testing
- [x] Fix text overflow in Sandbox message cards
- [x] Fix text overflow in Dojo message cards
- [x] Add back button to Sandbox page
- [x] Add back button to Dojo page
- [x] Implement shorter initial responses (first paragraph only)
- [x] Add expandable content for longer responses
- [x] Test Sandbox page layout and text wrapping
- [x] Test Dojo page layout and text wrapping
- [x] Verify message display on different screen sizes

## Message Layout Redesign
- [x] Redesign Sandbox message display as discussion forum style
- [x] Redesign Dojo message display as discussion forum style
- [x] Make message boxes dynamically size to content
- [x] Stack messages vertically for natural conversation flow
- [x] Test message layout with various content lengths
