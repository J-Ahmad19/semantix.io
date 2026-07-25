# Semantix.io

**Semantix.io** is a fast-paced, real-time multiplayer word association party game. Players join a lobby and race against the clock to guess words that are semantically related to a hidden "Target Word." The closer your guess is in meaning, the higher your score!

## Features
- **Real-Time Multiplayer:** Built on WebSockets for instantaneous gameplay and live global feeds.
- **Semantic Scoring:** Leverages an NLP engine (Natural Language Processing) to calculate the semantic similarity (0-100%) between player guesses and the target word.
- **Lobby System:** Wait in the lobby with up to 7 friends. The first player to join becomes the Host and controls when the match starts.
- **Juicy UI/UX:** Features a stunning, responsive interface built with Tailwind CSS and buttery smooth micro-interactions powered by Framer Motion.
- **Live Leaderboard:** Watch the leaderboard shift in real-time as players submit hot guesses and climb the ranks.

## Tech Stack
- **Frontend:** Next.js 14 (App Router), React, Tailwind CSS, Shadcn UI, Framer Motion, TypeScript.
- **Backend:** Python, FastAPI, WebSockets, Uvicorn, NLP Semantic Engine.

## Local Development Setup

### 1. Start the Backend
The backend runs on Python and requires dependencies for FastAPI and NLP.

```bash
cd backend
# Create a virtual environment (optional but recommended)
python -m venv venv
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt # (or run via Makefile if configured)

# Run the server
make backend
# The WebSocket server will start on ws://localhost:8000
```

### 2. Start the Frontend
The frontend is a standard Next.js application.

```bash
cd frontend

# Install dependencies
npm install

# Run the development server
npm run dev
# The app will be available at http://localhost:3000
```

## How to Play
1. Open the app and create a room (e.g., enter your name and a room code like "PARTY").
2. Share the room code with your friends.
3. The Host clicks **Start Game**.
4. Type words related to the hints. The closer your meaning, the higher your percentage score!
5. Hit 100% to guess the secret word and secure the win!
