import { useEffect, useState } from "react";
import type { ChangeEvent, FormEvent } from "react";

import { API_URL } from "../services/api";
import type { Service } from "../types/Service";
import type { Professional } from "../types/Professional";

type AppointmentForm = {
  clientName: string;
  serviceId: string;
  professionalId: string;
  date: string;
  time: string;
};

export default function Agendamentos() {
  const [services, setServices] = useState<Service[]>([]);
  const [professionals, setProfessionals] = useState<Professional[]>([]);

  const [formData, setFormData] = useState<AppointmentForm>({
    clientName: "",
    serviceId: "",
    professionalId: "",
    date: "",
    time: "",
  });

  const [confirmed, setConfirmed] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function loadData() {
      try {
        const servicesResponse = await fetch(`${API_URL}/services`);
        const professionalsResponse = await fetch(`${API_URL}/professionals`);

        const servicesData = await servicesResponse.json();
        const professionalsData = await professionalsResponse.json();

        setServices(servicesData);
        setProfessionals(professionalsData);
      } catch (error) {
        console.error("Erro ao carregar dados:", error);
      }
    }

    loadData();
  }, []);

  const selectedService = services.find(
    (service) => service.id === Number(formData.serviceId)
  );

  const selectedProfessional = professionals.find(
    (professional) => professional.id === Number(formData.professionalId)
  );

  function handleChange(
    event: ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) {
    const { name, value } = event.target;

    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));

    setConfirmed(false);
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (
      !formData.clientName ||
      !formData.serviceId ||
      !formData.professionalId ||
      !formData.date ||
      !formData.time
    ) {
      alert("Preencha todos os campos antes de confirmar.");
      return;
    }

    try {
      setLoading(true);

      const response = await fetch(`${API_URL}/appointments`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          clientName: formData.clientName,
          serviceId: Number(formData.serviceId),
          professionalId: Number(formData.professionalId),
          date: formData.date,
          time: formData.time,
        }),
      });

      if (!response.ok) {
        alert("Erro ao criar agendamento.");
        return;
      }

      setConfirmed(true);

      setFormData({
        clientName: "",
        serviceId: "",
        professionalId: "",
        date: "",
        time: "",
      });
    } catch (error) {
      console.error("Erro ao enviar agendamento:", error);
      alert("Não foi possível conectar com o servidor.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-black text-white pt-28 px-6">
      <section className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <span className="text-zinc-400 uppercase tracking-widest">
            Agendamento
          </span>

          <h1 className="text-4xl font-bold mt-3">
            Agende seu horário
          </h1>

          <p className="text-zinc-400 mt-4">
            Escolha o serviço, o profissional, a data e o horário desejado.
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          <form
            onSubmit={handleSubmit}
            className="bg-zinc-950 border border-zinc-800 rounded-2xl p-8 grid gap-6"
          >
            <div>
              <label className="block mb-2 text-sm font-medium">
                Nome completo
              </label>

              <input
                type="text"
                name="clientName"
                value={formData.clientName}
                onChange={handleChange}
                placeholder="Digite seu nome completo"
                className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-4 py-3 outline-none focus:border-white"
              />
            </div>

            <div>
              <label className="block mb-2 text-sm font-medium">
                Serviço
              </label>

              <select
                name="serviceId"
                value={formData.serviceId}
                onChange={handleChange}
                className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-4 py-3 outline-none focus:border-white"
              >
                <option value="">Selecione um serviço</option>

                {services.map((service) => (
                  <option key={service.id} value={service.id}>
                    {service.name} - R$ {service.price}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block mb-2 text-sm font-medium">
                Profissional
              </label>

              <select
                name="professionalId"
                value={formData.professionalId}
                onChange={handleChange}
                className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-4 py-3 outline-none focus:border-white"
              >
                <option value="">Selecione um profissional</option>

                {professionals.map((professional) => (
                  <option key={professional.id} value={professional.id}>
                    {professional.name} - {professional.specialty}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block mb-2 text-sm font-medium">
                  Data
                </label>

                <input
                  type="date"
                  name="date"
                  value={formData.date}
                  onChange={handleChange}
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-4 py-3 outline-none focus:border-white"
                />
              </div>

              <div>
                <label className="block mb-2 text-sm font-medium">
                  Horário
                </label>

                <input
                  type="time"
                  name="time"
                  value={formData.time}
                  onChange={handleChange}
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-4 py-3 outline-none focus:border-white"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="bg-white text-black py-4 rounded-lg font-semibold hover:scale-[1.02] transition disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {loading ? "AGENDANDO..." : "CONFIRMAR AGENDAMENTO"}
            </button>
          </form>

          <aside className="bg-zinc-950 border border-zinc-800 rounded-2xl p-8 h-fit">
            <h2 className="text-2xl font-bold mb-6">
              Resumo do agendamento
            </h2>

            <div className="space-y-4 text-zinc-300">
              <p>
                <span className="text-white font-semibold">Cliente:</span>{" "}
                {formData.clientName || "Não informado"}
              </p>

              <p>
                <span className="text-white font-semibold">Serviço:</span>{" "}
                {selectedService ? selectedService.name : "Não selecionado"}
              </p>

              <p>
                <span className="text-white font-semibold">Profissional:</span>{" "}
                {selectedProfessional
                  ? `${selectedProfessional.name} - ${selectedProfessional.specialty}`
                  : "Não selecionado"}
              </p>

              <p>
                <span className="text-white font-semibold">Data:</span>{" "}
                {formData.date || "Não selecionada"}
              </p>

              <p>
                <span className="text-white font-semibold">Horário:</span>{" "}
                {formData.time || "Não selecionado"}
              </p>

              <p className="text-2xl font-bold text-white pt-4 border-t border-zinc-800">
                Total:{" "}
                {selectedService ? `R$ ${selectedService.price}` : "R$ 0"}
              </p>
            </div>

            {confirmed && (
              <div className="mt-6 bg-green-500/10 border border-green-500 text-green-400 rounded-lg p-4">
                Agendamento criado com sucesso no backend.
              </div>
            )}
          </aside>
        </div>
      </section>
    </main>
  );
}