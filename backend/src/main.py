import os
# Set thread limits before any heavy ML libraries load to prevent deadlocks on 512MB RAM instances
os.environ["OMP_NUM_THREADS"] = "1"
os.environ["MKL_NUM_THREADS"] = "1"

from fastapi import FastAPI
from contextlib import asynccontextmanager
from .core.nlp_engine import nlp_engine
from .services.redis_client import redis_client
from .ws.game_router import router as ws_router

import asyncio

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    print("Starting up Semantix.io Backend...")
    
    def _load():
        nlp_engine.load_model()
    
    # Load model in background thread to prevent Render port scan timeout
    asyncio.create_task(asyncio.to_thread(_load))
    
    await redis_client.connect()
    print("Startup complete. Model loading in background...")
    
    yield
    
    # Shutdown
    print("Shutting down Semantix.io Backend...")
    await redis_client.disconnect()
    print("Shutdown complete.")

app = FastAPI(
    title="Semantix.io API",
    description="Backend for Semantix.io real-time multiplayer semantic word game.",
    version="0.1.0",
    lifespan=lifespan
)

app.include_router(ws_router, prefix="/ws", tags=["websocket"])

@app.get("/")
async def root():
    return {"status": "ok", "message": "Semantix.io API is running"}
