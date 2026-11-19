
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from backend.app.db.database import get_db

from backend.app.schemas.auth import (
    RegisterRequest,
    LoginRequest,
    UserResponse,
    TokenResponse,
    RefreshTokenRequest,
)

from backend.app.services.auth_service import (
    EmailAlreadyRegisteredError,
    InvalidCredentialsError,
    InvalidRefreshTokenError,
    register_user,
    login_user,
    refresh_user_tokens,
)


router = APIRouter(
    prefix="/api/v1/auth",
    tags=["Authentication"],
)


# --------------------------------------------------
# 1. STUDENT REGISTRATION
# --------------------------------------------------

@router.post(
    "/register",
    response_model=UserResponse,
    status_code=status.HTTP_201_CREATED,
)
def register(
    registration: RegisterRequest,
    db: Session = Depends(get_db),
):
    try:
        user = register_user(db, registration)
        return user

    except EmailAlreadyRegisteredError:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="An account with this email already exists.",
        )


# --------------------------------------------------
# 2. STUDENT LOGIN
# --------------------------------------------------

@router.post(
    "/login",
    response_model=TokenResponse,
)
def login(
    credentials: LoginRequest,
    db: Session = Depends(get_db),
):
    try:
        user, access_token, refresh_token = login_user(
            db,
            credentials,
        )

        return {
            "access_token": access_token,
            "refresh_token": refresh_token,
            "token_type": "bearer",
            "user": user,
        }

    except InvalidCredentialsError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password.",
            headers={"WWW-Authenticate": "Bearer"},
        )


# --------------------------------------------------
# 3. REFRESH ACCESS AND REFRESH TOKENS
# --------------------------------------------------

@router.post(
    "/refresh",
    response_model=TokenResponse,
)
def refresh_tokens(
    request: RefreshTokenRequest,
    db: Session = Depends(get_db),
):
    try:
        user, access_token, refresh_token = refresh_user_tokens(
            db,
            request.refresh_token,
        )

        return {
            "access_token": access_token,
            "refresh_token": refresh_token,
            "token_type": "bearer",
            "user": user,
        }

    except InvalidRefreshTokenError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired refresh token.",
            headers={"WWW-Authenticate": "Bearer"},
        )
