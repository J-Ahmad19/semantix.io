# Semantix.io

**Semantix.io** is a fast-paced, real-time multiplayer word association party game. Players join a lobby and race against the clock to guess words that are semantically related to a hidden "Target Word." The closer your guess is in meaning, the higher your score!

## 🏗 System Architecture

The application follows a decoupled client-server architecture designed for speed and real-time synchronization.

- **Frontend (Client):** Built with Next.js 14 (App Router), React, and Tailwind CSS. It features a custom, highly responsive 8-bit retro aesthetic. Hosted on Vercel.
- **Backend (Server):** Built with Python and FastAPI. It manages game state, active lobbies, and handles all client connections. Hosted on Render.
- **Communication Layer:** Uses raw **WebSockets** for instantaneous, bidirectional event streaming.
- **AI Engine:** A lightweight, in-memory NLP engine responsible for semantic scoring.

### Real-Time Multiplayer Sync
The game relies on an event-driven architecture over WebSockets. The backend maintains a `ConnectionManager` that maps active WebSocket connections to specific player identities and Lobby IDs. When a player submits a guess or changes settings, a JSON payload is sent to the server. The server processes the game logic, updates the internal state, and broadcasts the new state down to all connected clients in the lobby simultaneously.

---

## 🧠 AI & Semantic Vectors (NLP)

At the core of Semantix.io is the ability to mathematically determine how closely related a player's guess is to the secret target word. This is powered by Natural Language Processing (NLP).

### FastEmbed & ONNX Runtime
Instead of relying on heavy frameworks like PyTorch or paying for external LLM APIs (like OpenAI), Semantix runs inference entirely locally using **FastEmbed** and the **ONNX Runtime**. 
- **Model Used:** We use the highly optimized `BAAI/bge-small-en-v1.5` text embedding model.
- **Memory Optimization:** By explicitly restricting the ONNX runtime to a single CPU thread (`threads=1`), the model avoids trying to scale across host hardware, keeping RAM usage under ~50MB. This makes it capable of running flawlessly on highly constrained free-tier cloud hosting platforms.

### How Scoring Works (Vector Math)
When the backend starts up, it loads the NLP model into memory. During gameplay, the scoring follows a strict mathematical process:

1. **Target Initialization:** When a round begins, the secret target word (e.g., "Ocean") is passed through the model. The model outputs a high-dimensional dense vector array—a mathematical representation of the word's meaning (the "Target Vector").
2. **Guess Embedding:** When a player submits a guess (e.g., "Water"), it is instantly embedded into its own high-dimensional vector (the "Guess Vector").
3. **Cosine Similarity:** The server calculates the exact angle between these two points in multidimensional space using the Cosine Similarity formula:
   `Similarity = (Guess · Target) / (||Guess|| * ||Target||)`
4. **Normalization:** The resulting raw similarity float (typically between -1.0 and 1.0) is mathematically scaled and clamped into a digestible percentage score (0-100%) and broadcasted back to the players.

---

## 🎮 Features
- **Real-Time Multiplayer:** Built on WebSockets for instantaneous gameplay and live global feeds.
- **Semantic Scoring:** Accurate, AI-driven similarity scoring in milliseconds.
- **Lobby System:** Wait in the lobby with up to 7 friends. The first player to join becomes the Host and controls the match settings.
- **Retro UI/UX:** Features a stunning, responsive 8-bit retro interface built with Tailwind CSS.
- **Live Leaderboard:** Watch the leaderboard shift in real-time as players submit hot guesses and climb the ranks.

---

## 💻 Local Development Setup

### 1. Start the Backend
The backend requires Python 3.9+ and the dependencies listed in `requirements.txt`.

```bash
cd backend
# Create a virtual environment
python -m venv venv
source venv/bin/activate

# Install dependencies (FastAPI, Uvicorn, FastEmbed, WebSockets, etc.)
pip install -r requirements.txt

# Run the server
uvicorn src.main:app --reload --port 8000
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
1. Open the app and enter a Nickname and a Room Code (or leave blank to auto-generate).
2. Share the room code with your friends.
3. The Host configures the Rounds and Timer, then clicks **Start Game**.
4. Type words related to the hints. The closer your meaning, the higher your percentage score!
5. Hit 100% to guess the secret word and secure the win!
