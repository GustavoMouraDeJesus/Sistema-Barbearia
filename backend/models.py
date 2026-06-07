from sqlalchemy import Column, Integer, String, Float, ForeignKey
from database import Base


class Barbershop(Base):
    __tablename__ = "barbershops"

    id = Column(String, primary_key=True, index=True)
    name = Column(String, nullable=False)
    slug = Column(String, unique=True, nullable=False, index=True)


class Service(Base):
    __tablename__ = "services"

    id = Column(Integer, primary_key=True, index=True)
    barbershop_id = Column(String, ForeignKey("barbershops.id"), nullable=False)
    name = Column(String, nullable=False)
    price = Column(Float, nullable=False)
    description = Column(String, nullable=False)


class Professional(Base):
    __tablename__ = "professionals"

    id = Column(Integer, primary_key=True, index=True)
    barbershop_id = Column(String, ForeignKey("barbershops.id"), nullable=False)
    name = Column(String, nullable=False)
    specialty = Column(String, nullable=False)


class Appointment(Base):
    __tablename__ = "appointments"

    id = Column(String, primary_key=True, index=True)
    barbershop_id = Column(String, ForeignKey("barbershops.id"), nullable=False)
    client_name = Column(String, nullable=False)
    service_name = Column(String, nullable=False)
    professional_name = Column(String, nullable=False)
    professional_specialty = Column(String, nullable=False)
    date = Column(String, nullable=False)
    time = Column(String, nullable=False)
    price = Column(Float, nullable=False)
    status = Column(String, nullable=False, default="pending")