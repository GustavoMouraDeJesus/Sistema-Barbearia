from fastapi import FastAPI, HTTPException, Depends
from pydantic import BaseModel
from typing import Literal
from fastapi.middleware.cors import CORSMiddleware
from uuid import uuid4
from sqlalchemy.orm import Session
from datetime import datetime, timedelta
from jose import jwt
from passlib.context import CryptContext

from database import Base, engine, get_db, SessionLocal
import models


app = FastAPI()

SECRET_KEY = "troque-essa-chave-depois"
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 1440

pwd_context = CryptContext(schemes=["pbkdf2_sha256"], deprecated="auto")

Base.metadata.create_all(bind=engine)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# =========================
# SCHEMAS
# =========================

class AdminCreate(BaseModel):
    name: str
    email: str
    password: str
    barbershopSlug: str


class AdminLogin(BaseModel):
    email: str
    password: str

class AppointmentCreate(BaseModel):
    clientName: str
    serviceId: int
    professionalId: int
    date: str
    time: str


class AppointmentStatusUpdate(BaseModel):
    status: Literal["pending", "completed", "canceled"]


# =========================
# FORMATADORES
# =========================

def format_barbershop(barbershop: models.Barbershop):
    return {
        "id": barbershop.id,
        "name": barbershop.name,
        "slug": barbershop.slug,
    }


def format_service(service: models.Service):
    return {
        "id": service.id,
        "barbershopId": service.barbershop_id,
        "name": service.name,
        "price": service.price,
        "description": service.description,
    }


def format_professional(professional: models.Professional):
    return {
        "id": professional.id,
        "barbershopId": professional.barbershop_id,
        "name": professional.name,
        "specialty": professional.specialty,
    }


def format_appointment(appointment: models.Appointment):
    return {
        "id": appointment.id,
        "barbershopId": appointment.barbershop_id,
        "clientName": appointment.client_name,
        "serviceName": appointment.service_name,
        "professionalName": appointment.professional_name,
        "professionalSpecialty": appointment.professional_specialty,
        "date": appointment.date,
        "time": appointment.time,
        "price": appointment.price,
        "status": appointment.status,
    }


# =========================
# FUNÇÕES AUXILIARES
# =========================

def get_barbershop_by_slug(db: Session, slug: str):
    barbershop = (
        db.query(models.Barbershop)
        .filter(models.Barbershop.slug == slug)
        .first()
    )

    if not barbershop:
        raise HTTPException(status_code=404, detail="Barbearia não encontrada")

    return barbershop


def seed_initial_data():
    db = SessionLocal()

    try:
        toid = (
            db.query(models.Barbershop)
            .filter(models.Barbershop.slug == "toid")
            .first()
        )

        if not toid:
            toid = models.Barbershop(
                id="barbearia-001",
                name="TOID Barbearia",
                slug="toid",
            )

            corte_fino = models.Barbershop(
                id="barbearia-002",
                name="Barbearia Corte Fino",
                slug="corte-fino",
            )

            db.add(toid)
            db.add(corte_fino)
            db.commit()

        services_count = (
            db.query(models.Service)
            .filter(models.Service.barbershop_id == "barbearia-001")
            .count()
        )

        if services_count == 0:
            services = [
                models.Service(
                    id=1,
                    barbershop_id="barbearia-001",
                    name="Corte Masculino",
                    price=35,
                    description="Corte moderno com acabamento profissional.",
                ),
                models.Service(
                    id=2,
                    barbershop_id="barbearia-001",
                    name="Barba",
                    price=20,
                    description="Modelagem e acabamento da barba.",
                ),
                models.Service(
                    id=3,
                    barbershop_id="barbearia-001",
                    name="Corte + Barba",
                    price=50,
                    description="Pacote completo para renovar o visual.",
                ),
            ]

            db.add_all(services)
            db.commit()

        professionals_count = (
            db.query(models.Professional)
            .filter(models.Professional.barbershop_id == "barbearia-001")
            .count()
        )

        if professionals_count == 0:
            professionals = [
                models.Professional(
                    id=1,
                    barbershop_id="barbearia-001",
                    name="Carlos Andrade",
                    specialty="Corte Masculino",
                ),
                models.Professional(
                    id=2,
                    barbershop_id="barbearia-001",
                    name="Rafael Souza",
                    specialty="Barba e Acabamento",
                ),
                models.Professional(
                    id=3,
                    barbershop_id="barbearia-001",
                    name="Lucas Martins",
                    specialty="Sobrancelha",
                ),
            ]

            db.add_all(professionals)
            db.commit()

    finally:
        db.close()


seed_initial_data()

def hash_password(password: str):
    return pwd_context.hash(password)


def verify_password(password: str, password_hash: str):
    return pwd_context.verify(password, password_hash)


def create_access_token(data: dict):
    to_encode = data.copy()

    expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)

    to_encode.update({"exp": expire})

    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)


# =========================
# ROTAS GERAIS
# =========================

@app.post("/auth/register")
def register_admin(admin: AdminCreate, db: Session = Depends(get_db)):
    barbershop = get_barbershop_by_slug(db, admin.barbershopSlug)

    existing_admin = (
        db.query(models.Admin)
        .filter(models.Admin.email == admin.email)
        .first()
    )

    if existing_admin:
        raise HTTPException(
            status_code=400,
            detail="Já existe um admin cadastrado com esse email"
        )

    new_admin = models.Admin(
        id=str(uuid4()),
        name=admin.name,
        email=admin.email,
        password_hash=hash_password(admin.password),
        barbershop_id=barbershop.id,
    )

    db.add(new_admin)
    db.commit()
    db.refresh(new_admin)

    return {
        "id": new_admin.id,
        "name": new_admin.name,
        "email": new_admin.email,
        "barbershopId": new_admin.barbershop_id,
    }


@app.post("/auth/login")
def login_admin(admin: AdminLogin, db: Session = Depends(get_db)):
    found_admin = (
        db.query(models.Admin)
        .filter(models.Admin.email == admin.email)
        .first()
    )

    if not found_admin:
        raise HTTPException(
            status_code=401,
            detail="Email ou senha inválidos"
        )

    password_is_valid = verify_password(
        admin.password,
        found_admin.password_hash
    )

    if not password_is_valid:
        raise HTTPException(
            status_code=401,
            detail="Email ou senha inválidos"
        )

    access_token = create_access_token(
        {
            "sub": found_admin.id,
            "barbershopId": found_admin.barbershop_id,
        }
    )

    return {
        "accessToken": access_token,
        "admin": {
            "id": found_admin.id,
            "name": found_admin.name,
            "email": found_admin.email,
            "barbershopId": found_admin.barbershop_id,
        }
    }

@app.get("/")
def home():
    return {"message": "API da Barbearia funcionando com banco de dados"}


@app.get("/services")
def get_services(db: Session = Depends(get_db)):
    services = db.query(models.Service).all()

    return [format_service(service) for service in services]


@app.get("/professionals")
def get_professionals(db: Session = Depends(get_db)):
    professionals = db.query(models.Professional).all()

    return [format_professional(professional) for professional in professionals]


@app.get("/appointments")
def get_appointments(db: Session = Depends(get_db)):
    appointments = db.query(models.Appointment).all()

    return [format_appointment(appointment) for appointment in appointments]


# =========================
# ROTAS DE BARBEARIA
# =========================

@app.get("/barbershops/{slug}")
def get_barbershop(slug: str, db: Session = Depends(get_db)):
    barbershop = get_barbershop_by_slug(db, slug)

    return format_barbershop(barbershop)


@app.get("/barbershops/{slug}/services")
def get_barbershop_services(slug: str, db: Session = Depends(get_db)):
    barbershop = get_barbershop_by_slug(db, slug)

    services = (
        db.query(models.Service)
        .filter(models.Service.barbershop_id == barbershop.id)
        .all()
    )

    return [format_service(service) for service in services]


@app.get("/barbershops/{slug}/professionals")
def get_barbershop_professionals(slug: str, db: Session = Depends(get_db)):
    barbershop = get_barbershop_by_slug(db, slug)

    professionals = (
        db.query(models.Professional)
        .filter(models.Professional.barbershop_id == barbershop.id)
        .all()
    )

    return [format_professional(professional) for professional in professionals]


@app.get("/barbershops/{slug}/appointments")
def get_barbershop_appointments(slug: str, db: Session = Depends(get_db)):
    barbershop = get_barbershop_by_slug(db, slug)

    appointments = (
        db.query(models.Appointment)
        .filter(models.Appointment.barbershop_id == barbershop.id)
        .all()
    )

    return [format_appointment(appointment) for appointment in appointments]


@app.post("/barbershops/{slug}/appointments")
def create_barbershop_appointment(
    slug: str,
    appointment: AppointmentCreate,
    db: Session = Depends(get_db)
):
    barbershop = get_barbershop_by_slug(db, slug)

    selected_service = (
        db.query(models.Service)
        .filter(
            models.Service.id == appointment.serviceId,
            models.Service.barbershop_id == barbershop.id,
        )
        .first()
    )

    selected_professional = (
        db.query(models.Professional)
        .filter(
            models.Professional.id == appointment.professionalId,
            models.Professional.barbershop_id == barbershop.id,
        )
        .first()
    )

    if not selected_service or not selected_professional:
        raise HTTPException(
            status_code=404,
            detail="Serviço ou profissional não encontrado nessa barbearia",
        )

    new_appointment = models.Appointment(
        id=str(uuid4()),
        barbershop_id=barbershop.id,
        client_name=appointment.clientName,
        service_name=selected_service.name,
        professional_name=selected_professional.name,
        professional_specialty=selected_professional.specialty,
        date=appointment.date,
        time=appointment.time,
        price=selected_service.price,
        status="pending",
    )

    db.add(new_appointment)
    db.commit()
    db.refresh(new_appointment)

    return format_appointment(new_appointment)


@app.patch("/barbershops/{slug}/appointments/{appointment_id}/status")
def update_barbershop_appointment_status(
    slug: str,
    appointment_id: str,
    status_update: AppointmentStatusUpdate,
    db: Session = Depends(get_db)
):
    barbershop = get_barbershop_by_slug(db, slug)

    appointment = (
        db.query(models.Appointment)
        .filter(
            models.Appointment.id == appointment_id,
            models.Appointment.barbershop_id == barbershop.id,
        )
        .first()
    )

    if not appointment:
        raise HTTPException(status_code=404, detail="Agendamento não encontrado")

    appointment.status = status_update.status

    db.commit()
    db.refresh(appointment)

    return format_appointment(appointment)