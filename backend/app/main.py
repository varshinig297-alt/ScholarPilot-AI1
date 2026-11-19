
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from backend.app.api.documents import router as documents_router
from backend.app.api.tutor import router as tutor_router
from backend.app.api.quiz import router as quiz_router
from backend.app.api.auth import router as auth_router

app = FastAPI(
    title="ScholarPilot AI API",
    description="AI-powered academic intelligence platform",
    version="1.0.0",
)

# Frontend communication settings
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "http://localhost:5174",
    "http://127.0.0.1:5174",
],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register API routers
app.include_router(documents_router)
app.include_router(tutor_router)
app.include_router(quiz_router)
app.include_router(auth_router)

@app.get("/", tags=["System"])
async def root():
    return {
        "success": True,
        "application": "ScholarPilot AI",
        "message": "Welcome to ScholarPilot AI API",
        "version": "1.0.0",
    }


@app.get("/api/v1/health", tags=["System"])
async def health_check():
    return {
        "success": True,
        "status": "healthy",
        "service": "ScholarPilot AI Backend",
    }
