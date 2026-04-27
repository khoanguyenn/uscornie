import secrets
from typing import Annotated

from fastapi import Depends, FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from sqlalchemy.orm import Session

import auth_utils
from database import engine, get_db
from models import Base, Invitation, Space, SpaceMember, User


# Pydantic schemas for request bodies
class AuthGoogleRequest(BaseModel):
    credential: str


class JoinSpaceRequest(BaseModel):
    invite_token: str


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


@app.get("/")
async def root():
    return {"message": "Welcome to Uscornie API"}


# 1. AUTH: Google login
@app.post("/auth/google")
async def auth_google(
    request: AuthGoogleRequest, db: Annotated[Session, Depends(get_db)]
):
    id_info = auth_utils.verify_google_token(
        request.credential, clock_skew_in_seconds=10
    )
    if not id_info:
        raise HTTPException(status_code=400, detail="Invalid Google credential")

    user = db.query(User).filter(User.email == id_info["email"]).first()
    if not user:
        user = User(
            email=id_info["email"],
            full_name=id_info.get("name"),
            picture=id_info.get("picture"),
        )
        db.add(user)
        db.commit()
        db.refresh(user)

    # Every user has a default space (owned space - personal)
    personal_space = (
        db.query(SpaceMember)
        .join(Space)
        .filter(SpaceMember.user_id == user.id, Space.type == "personal")
        .first()
    )

    if not personal_space:
        new_space = Space(name=f"Không gian của {user.full_name}", type="personal")
        db.add(new_space)
        db.commit()
        db.refresh(new_space)

        member = SpaceMember(space_id=new_space.id, user_id=user.id, role="admin")
        db.add(member)
        db.commit()

    access_token = auth_utils.create_token(str(user.id))
    return {"access_token": access_token, "token_type": "bearer"}


# 2. SPACE: Create space
@app.post("/spaces")
async def create_space(
    current_user: Annotated[User, Depends(auth_utils.get_current_user)],
    db: Annotated[Session, Depends(get_db)],
):
    # Limit: User can only own ONE SHARED space
    existing_shared = (
        db.query(SpaceMember)
        .join(Space)
        .filter(
            SpaceMember.user_id == current_user.id,
            SpaceMember.role == "admin",
            Space.type == "shared",
        )
        .first()
    )

    if existing_shared:
        raise HTTPException(
            status_code=400, detail="Bạn đã tạo một không gian chung rồi"
        )

    space = Space(name=f"Không gian chung của {current_user.full_name}", type="shared")
    db.add(space)
    db.commit()
    db.refresh(space)

    member = SpaceMember(space_id=space.id, user_id=current_user.id, role="admin")
    db.add(member)
    db.commit()

    return {"id": space.id, "name": space.name, "type": space.type}


@app.get("/spaces/me")
async def get_my_spaces(
    current_user: Annotated[User, Depends(auth_utils.get_current_user)],
    db: Annotated[Session, Depends(get_db)],
):
    memberships = (
        db.query(SpaceMember).filter(SpaceMember.user_id == current_user.id).all()
    )
    space_ids = [m.space_id for m in memberships]
    spaces = db.query(Space).filter(Space.id.in_(space_ids)).all()
    return spaces


# 3. INVITE: Create invitation link
@app.post("/invites/{space_id}")
async def create_invite(
    space_id: str,
    current_user: Annotated[User, Depends(auth_utils.get_current_user)],
    db: Annotated[Session, Depends(get_db)],
):
    # Check if user is admin/member of this space
    member = (
        db.query(SpaceMember)
        .filter(
            SpaceMember.space_id == space_id, SpaceMember.user_id == current_user.id
        )
        .first()
    )

    if not member:
        raise HTTPException(status_code=403, detail="Not a member of this space")

    # ONLY allow inviting to SHARED spaces
    space = db.query(Space).filter(Space.id == space_id).first()
    if space and space.type != "shared":
        raise HTTPException(
            status_code=400, detail="You cannot invite others to your personal space"
        )

    token = secrets.token_urlsafe(16)
    invitation = Invitation(token=token, space_id=space_id, inviter_id=current_user.id)
    db.add(invitation)
    db.commit()

    return {"invite_token": token, "url": f"/join?invite_token={token}"}


# 4. JOIN: Join a space
@app.post("/spaces/join")
async def join_space(
    request: JoinSpaceRequest,
    current_user: Annotated[User, Depends(auth_utils.get_current_user)],
    db: Annotated[Session, Depends(get_db)],
):
    inv = (
        db.query(Invitation)
        .filter(Invitation.token == request.invite_token, Invitation.is_used.is_(False))
        .first()
    )

    if not inv:
        raise HTTPException(
            status_code=400, detail="Invalid or expired invitation link"
        )

    # Check 1: Already a member of THIS space?
    existing_member = (
        db.query(SpaceMember)
        .filter(
            SpaceMember.space_id == inv.space_id, SpaceMember.user_id == current_user.id
        )
        .first()
    )

    if existing_member:
        return {"space_id": inv.space_id, "message": "Already a member"}

    # Check 2: Limit - user can only join ONE other space as a member
    already_joined_another = (
        db.query(SpaceMember)
        .filter(SpaceMember.user_id == current_user.id, SpaceMember.role == "member")
        .first()
    )

    if already_joined_another:
        raise HTTPException(
            status_code=400, detail="You are already participating in another space"
        )

    # Check 3: Limit to 2 members total in a space
    member_count = (
        db.query(SpaceMember).filter(SpaceMember.space_id == inv.space_id).count()
    )
    if member_count >= 2:
        raise HTTPException(status_code=400, detail="This space is already full")

    new_member = SpaceMember(
        space_id=inv.space_id, user_id=current_user.id, role="member"
    )
    db.add(new_member)
    db.commit()

    return {"space_id": inv.space_id}
