
import hashlib
import uuid
from datetime import datetime, timezone
from datetime import timedelta

import jwt

from sqlalchemy import select
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from backend.app.core.security import (
    create_access_token,
    create_refresh_token,
    decode_token,
    hash_password,
    verify_password,
)
from backend.app.models.user import User
from backend.app.models.user_session import UserSession
from backend.app.schemas.auth import RegisterRequest, LoginRequest
from backend.app.core.security import (
    ACCESS_TOKEN_EXPIRE_MINUTES,
)
from backend.app.models.user_session import UserSession


class EmailAlreadyRegisteredError(Exception):
    """Raised when an email address is already registered."""


class InvalidCredentialsError(Exception):
    """Raised when login credentials are invalid."""

class InvalidRefreshTokenError(Exception):
    """Raised when a refresh token is invalid or revoked."""


class InvalidSessionError(Exception):
    """Raised when a login session is invalid."""


def register_user(
    db: Session,
    registration: RegisterRequest,
) -> User:
    email = str(registration.email).strip().lower()

    existing_user = db.scalar(
        select(User).where(User.email == email)
    )

    if existing_user:
        raise EmailAlreadyRegisteredError(
            "An account with this email already exists."
        )

    user = User(
        id=uuid.uuid4(),
        email=email,
        full_name=registration.full_name.strip(),
        password_hash=hash_password(registration.password),
        is_active=True,
        is_verified=False,
    )

    try:
        db.add(user)
        db.commit()
        db.refresh(user)
    except IntegrityError:
        db.rollback()
        raise EmailAlreadyRegisteredError(
            "An account with this email already exists."
        )

    return user


def login_user(
    db: Session,
    login: LoginRequest,
) -> tuple[User, str, str]:
    email = str(login.email).strip().lower()

    user = db.scalar(
        select(User).where(User.email == email)
    )

    if (
        user is None
        or user.password_hash is None
        or not verify_password(login.password, user.password_hash)
        or not user.is_active
    ):
        raise InvalidCredentialsError(
            "Incorrect email or password."
        )

    access_token = create_access_token(str(user.id))
    refresh_token = create_refresh_token(str(user.id))

    token_payload = decode_token(refresh_token)

    token_expiry = datetime.fromtimestamp(
        token_payload["exp"],
        tz=timezone.utc,
    )

    refresh_token_hash = hashlib.sha256(
        refresh_token.encode("utf-8")
    ).hexdigest()

    session = UserSession(
        id=uuid.uuid4(),
        user_id=user.id,
        refresh_token_hash=refresh_token_hash,
        expires_at=token_expiry,
    )

    try:
        db.add(session)
        db.commit()
    except Exception:
        db.rollback()
        raise

    return user, access_token, refresh_token


def refresh_user_tokens(
    db: Session,
    refresh_token: str,
) -> tuple[User, str, str]:
    try:
        payload = decode_token(refresh_token)
    except jwt.InvalidTokenError:
        raise InvalidRefreshTokenError("Invalid or expired refresh token.")

    if payload.get("type") != "refresh":
        raise InvalidRefreshTokenError("Invalid refresh token.")

    try:
        user_id = uuid.UUID(payload["sub"])
    except (ValueError, TypeError, KeyError):
        raise InvalidRefreshTokenError("Invalid refresh token.")

    token_hash = hashlib.sha256(
        refresh_token.encode("utf-8")
    ).hexdigest()

    session = db.scalar(
        select(UserSession)
        .where(UserSession.refresh_token_hash == token_hash)
        .with_for_update()
    )

    now = datetime.now(timezone.utc)

    if (
        session is None
        or session.user_id != user_id
        or session.revoked_at is not None
        or session.expires_at <= now
    ):
        raise InvalidRefreshTokenError(
            "Refresh session is invalid or expired."
        )

    user = db.get(User, user_id)

    if user is None or not user.is_active:
        raise InvalidRefreshTokenError("User account is unavailable.")

    try:
        # Revoke the previous session before issuing new tokens.
        session.revoked_at = now

        new_access_token = create_access_token(str(user.id))
        new_refresh_token = create_refresh_token(str(user.id))

        new_payload = decode_token(new_refresh_token)

        new_expiry = datetime.fromtimestamp(
            new_payload["exp"],
            tz=timezone.utc,
        )

        new_hash = hashlib.sha256(
            new_refresh_token.encode("utf-8")
        ).hexdigest()

        new_session = UserSession(
            id=uuid.uuid4(),
            user_id=user.id,
            refresh_token_hash=new_hash,
            expires_at=new_expiry,
        )

        db.add(new_session)
        db.commit()

    except Exception:
        db.rollback()
        raise

    return user, new_access_token, new_refresh_token

