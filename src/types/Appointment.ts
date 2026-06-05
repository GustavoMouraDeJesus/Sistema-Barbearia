export type AppointmentStatus = "pending" | "completed" | "canceled";

export type Appointment = {
  id: string;
  clientName: string;
  serviceName: string;
  professionalName: string;
  professionalSpecialty: string;
  date: string;
  time: string;
  price: number;
  status: AppointmentStatus;
};