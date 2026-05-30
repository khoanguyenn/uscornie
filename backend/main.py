from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

# This imports and registers all models on the metadata
import models  # noqa: F401
from auth.endpoints import router as auth_router
from invites.endpoints import router as invites_router
from kit.database import Base, engine
from kit.exceptions import register_exception_handlers
from spaces.endpoints import router as spaces_router

# Create tables
Base.metadata.create_all(bind=engine)

app = FastAPI(title="Uscornie API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "https://uscornie.com",
        "https://www.uscornie.com",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register centralized exception handlers
register_exception_handlers(app)

# Include routers
app.include_router(auth_router, tags=["Auth"])
app.include_router(spaces_router, tags=["Spaces"])
app.include_router(invites_router, tags=["Invites"])


@app.get("/")
async def root():
    return {"message": "Welcome to Uscornie API"}
