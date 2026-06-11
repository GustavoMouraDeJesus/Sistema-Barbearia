import { useEffect, useState } from "react";
import type { ChangeEvent, FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";

import AdminHeader from "../components/AdminHeader";
import { API_URL } from "../services/api";

type BusinessHour = {
  id?: number;
  barbershopId?: string;
  weekday: number;
  isOpen: boolean;
  openTime: string;
  closeTime: string;
};

const weekDays = [
  "Segunda-feira",
  "Terça-feira",
  "Quarta-feira",
  "Quinta-feira",
  "Sexta-feira",
  "Sábado",
  "Domingo",
];

const defaultBusinessHours: BusinessHour[] = [
  { weekday: 0, isOpen: true, openTime: "09:00", closeTime: "18:00" },
  { weekday: 1, isOpen: true, openTime: "09:00", closeTime: "18:00" },
  { weekday: 2, isOpen: true, openTime: "09:00", closeTime: "18:00" },
  { weekday: 3, isOpen: true, openTime: "09:00", closeTime: "18:00" },
  { weekday: 4, isOpen: true, openTime: "09:00", closeTime: "18:00" },
  { weekday: 5, isOpen: true, openTime: "08:00", closeTime: "14:00" },
  { weekday: 6, isOpen: false, openTime: "09:00", closeTime: "18:00" },
];

export default function AdminFuncionamento() {
  const navigate = useNavigate();

  const [businessHours, setBusinessHours] =
    useState<BusinessHour[]>(defaultBusinessHours);

  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  useEffect(() => {
    const accessToken = localStorage.getItem("accessToken");

    if (!accessToken) {
      navigate("/admin/login");
      return;
    }

    loadBusinessHours();
  }, []);

  function getAccessToken() {
    return localStorage.getItem("accessToken");
  }

  async function loadBusinessHours() {
    const accessToken = getAccessToken();

    if (!accessToken) {
      navigate("/admin/login");
      return;
    }

    try {
      setLoading(true);
      setErrorMessage("");

      const response = await fetch(`${API_URL}/admin/business-hours`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      if (response.status === 401) {
        localStorage.removeItem("accessToken");
        navigate("/admin/login");
        return;
      }

      if (!response.ok) {
        throw new Error("Erro ao carregar horários de funcionamento.");
      }

      const data = await response.json();

      if (!Array.isArray(data)) {
        throw new Error("Resposta inválida do servidor.");
      }

      setBusinessHours(data);
    } catch (error) {
      console.error("Erro ao buscar funcionamento:", error);
      setErrorMessage("Não foi possível carregar os horários de funcionamento.");
    } finally {
      setLoading(false);
    }
  }

  function handleOpenChange(weekday: number) {
    setBusinessHours((previousHours) =>
      previousHours.map((businessHour) =>
        businessHour.weekday === weekday
          ? {
              ...businessHour,
              isOpen: !businessHour.isOpen,
            }
          : businessHour
      )
    );

    setErrorMessage("");
    setSuccessMessage("");
  }

  function formatTimeInput(value: string) {
  const onlyNumbers = value.replace(/\D/g, "").slice(0, 4);

  if (onlyNumbers.length <= 2) {
    return onlyNumbers;
  }

  return `${onlyNumbers.slice(0, 2)}:${onlyNumbers.slice(2)}`;
}

function handleTimeChange(
  weekday: number,
  event: ChangeEvent<HTMLInputElement>
) {
  const { name, value } = event.target;

  const formattedValue = formatTimeInput(value);

  setBusinessHours((previousHours) =>
    previousHours.map((businessHour) =>
      businessHour.weekday === weekday
        ? {
            ...businessHour,
            [name]: formattedValue,
          }
        : businessHour
    )
  );

  setErrorMessage("");
  setSuccessMessage("");
}

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const accessToken = getAccessToken();

    if (!accessToken) {
      navigate("/admin/login");
      return;
    }

    setErrorMessage("");
    setSuccessMessage("");

    const invalidBusinessHour = businessHours.find(
      (businessHour) =>
        businessHour.isOpen &&
        businessHour.openTime >= businessHour.closeTime
    );

    if (invalidBusinessHour) {
      setErrorMessage(
        `O horário de abertura precisa ser menor que o horário de fechamento em ${
          weekDays[invalidBusinessHour.weekday]
        }.`
      );

      return;
    }

    try {
      setIsSubmitting(true);

      const response = await fetch(`${API_URL}/admin/business-hours`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({
          businessHours: businessHours.map((businessHour) => ({
            weekday: businessHour.weekday,
            isOpen: businessHour.isOpen,
            openTime: businessHour.openTime,
            closeTime: businessHour.closeTime,
          })),
        }),
      });

      if (response.status === 401) {
        localStorage.removeItem("accessToken");
        navigate("/admin/login");
        return;
      }

      const responseData = await response.json();

      if (!response.ok) {
        setErrorMessage(
          responseData.detail ||
            "Não foi possível salvar os horários de funcionamento."
        );

        return;
      }

      setBusinessHours(responseData);
      setSuccessMessage("Horários de funcionamento salvos com sucesso.");
    } catch (error) {
      console.error("Erro ao salvar funcionamento:", error);
      setErrorMessage("Não foi possível conectar com o servidor.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <>
      <AdminHeader />

      <main className="min-h-screen bg-black text-white px-6 py-10">
        <section className="max-w-5xl mx-auto">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6 mb-10">
            <div>
              <span className="text-zinc-400 uppercase tracking-widest">
                Painel Administrativo
              </span>

              <h1 className="text-4xl font-bold mt-3">
                Horário de funcionamento
              </h1>

              <p className="text-zinc-400 mt-3">
                Configure os dias e horários em que sua barbearia aceita
                agendamentos.
              </p>
            </div>

            <Link
              to="/admin"
              className="bg-white text-black px-5 py-3 rounded-lg font-semibold hover:scale-105 transition w-fit"
            >
              Voltar ao Dashboard
            </Link>
          </div>

          {errorMessage && (
            <div className="mb-6 bg-red-500/10 border border-red-500 text-red-400 rounded-xl p-4">
              {errorMessage}
            </div>
          )}

          {successMessage && (
            <div className="mb-6 bg-green-500/10 border border-green-500 text-green-400 rounded-xl p-4">
              {successMessage}
            </div>
          )}

          <form
            onSubmit={handleSubmit}
            className="bg-zinc-950 border border-zinc-800 rounded-2xl overflow-hidden"
          >
            <div className="p-6 border-b border-zinc-800">
              <h2 className="text-2xl font-bold">
                Configuração semanal
              </h2>

              <p className="text-zinc-400 mt-2">
                Dias fechados não aparecerão como disponíveis para agendamento.
              </p>
            </div>

            {loading ? (
              <p className="p-6 text-zinc-400">
                Carregando horários...
              </p>
            ) : (
              <div className="divide-y divide-zinc-800">
                {businessHours.map((businessHour) => (
                  <div
                    key={businessHour.weekday}
                    className="p-6 grid md:grid-cols-[1fr_140px_1fr] gap-5 md:items-center"
                  >
                    <div>
                      <h3 className="text-xl font-bold">
                        {weekDays[businessHour.weekday]}
                      </h3>

                      <p className="text-zinc-500 mt-1">
                        {businessHour.isOpen
                          ? `Aberto das ${businessHour.openTime} às ${businessHour.closeTime}`
                          : "Fechado"}
                      </p>
                    </div>

                    <label className="flex items-center gap-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={businessHour.isOpen}
                        onChange={() =>
                          handleOpenChange(businessHour.weekday)
                        }
                        className="w-5 h-5 cursor-pointer"
                      />

                      <span className="text-zinc-300">
                        Aberto
                      </span>
                    </label>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-zinc-400 mb-2 text-sm">
                          Abre
                        </label>

                        <input
                          type="text"
inputMode="numeric"
maxLength={5}
placeholder="09:00"
                          name="openTime"
                          value={businessHour.openTime}
                          onChange={(event) =>
                            handleTimeChange(
                              businessHour.weekday,
                              event
                            )
                          }
                          disabled={!businessHour.isOpen}
                          className="w-full bg-black border border-zinc-800 rounded-lg px-4 py-3 text-white outline-none focus:border-white disabled:opacity-40"
                        />
                      </div>

                      <div>
                        <label className="block text-zinc-400 mb-2 text-sm">
                          Fecha
                        </label>

                        <input
                          type="text"
inputMode="numeric"
maxLength={5}
placeholder="09:00"
                          name="closeTime"
                          value={businessHour.closeTime}
                          onChange={(event) =>
                            handleTimeChange(
                              businessHour.weekday,
                              event
                            )
                          }
                          disabled={!businessHour.isOpen}
                          className="w-full bg-black border border-zinc-800 rounded-lg px-4 py-3 text-white outline-none focus:border-white disabled:opacity-40"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            <div className="p-6 border-t border-zinc-800">
              <button
                type="submit"
                disabled={isSubmitting || loading}
                className="w-full bg-white text-black px-5 py-4 rounded-lg font-semibold hover:scale-[1.01] transition cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {isSubmitting
                  ? "Salvando..."
                  : "Salvar horário de funcionamento"}
              </button>
            </div>
          </form>
        </section>
      </main>
    </>
  );
}