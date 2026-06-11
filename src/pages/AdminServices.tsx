import { useEffect, useState } from "react";
import type { ChangeEvent, FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";

import AdminHeader from "../components/AdminHeader";
import { API_URL } from "../services/api";

type AdminService = {
  id: number;
  barbershopId: string;
  name: string;
  price: number;
  description: string;
  durationMinutes: number;
};

type ServiceForm = {
  name: string;
  price: string;
  description: string;
  durationMinutes: string;
};

export default function AdminServices() {
  const navigate = useNavigate();

  const [services, setServices] = useState<AdminService[]>([]);

  const [formData, setFormData] = useState<ServiceForm>({
    name: "",
    price: "",
    description: "",
    durationMinutes: "30",
  });

  const [editingServiceId, setEditingServiceId] = useState<number | null>(
    null
  );

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

    loadServices();
  }, []);

  function getAccessToken() {
    return localStorage.getItem("accessToken");
  }

  function formatCurrency(value: number) {
    return value.toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL",
    });
  }

  async function loadServices() {
    const accessToken = getAccessToken();

    if (!accessToken) {
      navigate("/admin/login");
      return;
    }

    try {
      setLoading(true);
      setErrorMessage("");

      const response = await fetch(`${API_URL}/admin/services`, {
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
        throw new Error("Erro ao carregar serviços.");
      }

      const data = await response.json();

      if (!Array.isArray(data)) {
        throw new Error("Resposta inválida do servidor.");
      }

      setServices(data);
    } catch (error) {
      console.error("Erro ao buscar serviços:", error);
      setErrorMessage("Não foi possível carregar os serviços.");
    } finally {
      setLoading(false);
    }
  }

  function handleChange(
    event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) {
    const { name, value } = event.target;

    setFormData((previousData) => ({
      ...previousData,
      [name]: value,
    }));
  }

  function clearForm() {
    setFormData({
      name: "",
      price: "",
      description: "",
      durationMinutes: "30",
    });

    setEditingServiceId(null);
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

    if (
      !formData.name ||
      !formData.price ||
      !formData.description ||
      !formData.durationMinutes
    ) {
      setErrorMessage("Preencha todos os campos.");
      return;
    }

    const price = Number(formData.price);
    const durationMinutes = Number(formData.durationMinutes);

    if (Number.isNaN(price) || price <= 0) {
      setErrorMessage("Informe um preço válido.");
      return;
    }

    if (Number.isNaN(durationMinutes) || durationMinutes < 5) {
      setErrorMessage("Informe uma duração válida.");
      return;
    }

    try {
      setIsSubmitting(true);

      const url = editingServiceId
        ? `${API_URL}/admin/services/${editingServiceId}`
        : `${API_URL}/admin/services`;

      const method = editingServiceId ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({
          name: formData.name,
          price,
          description: formData.description,
          durationMinutes,
        }),
      });

      if (response.status === 401) {
        localStorage.removeItem("accessToken");
        navigate("/admin/login");
        return;
      }

      if (!response.ok) {
        throw new Error("Erro ao salvar serviço.");
      }

      await loadServices();

      const wasEditing = Boolean(editingServiceId);

      clearForm();

      setSuccessMessage(
        wasEditing
          ? "Serviço atualizado com sucesso."
          : "Serviço cadastrado com sucesso."
      );
    } catch (error) {
      console.error("Erro ao salvar serviço:", error);
      setErrorMessage("Não foi possível salvar o serviço.");
    } finally {
      setIsSubmitting(false);
    }
  }

  function handleEdit(service: AdminService) {
    setEditingServiceId(service.id);

    setFormData({
      name: service.name,
      price: String(service.price),
      description: service.description,
      durationMinutes: String(service.durationMinutes || 30),
    });

    setSuccessMessage("");
    setErrorMessage("");
  }

  async function handleDelete(serviceId: number) {
    const confirmed = window.confirm(
      "Tem certeza que deseja excluir este serviço?"
    );

    if (!confirmed) {
      return;
    }

    const accessToken = getAccessToken();

    if (!accessToken) {
      navigate("/admin/login");
      return;
    }

    try {
      setErrorMessage("");
      setSuccessMessage("");

      const response = await fetch(`${API_URL}/admin/services/${serviceId}`, {
        method: "DELETE",
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
        throw new Error("Erro ao excluir serviço.");
      }

      await loadServices();

      setSuccessMessage("Serviço excluído com sucesso.");

      if (editingServiceId === serviceId) {
        clearForm();
      }
    } catch (error) {
      console.error("Erro ao excluir serviço:", error);
      setErrorMessage("Não foi possível excluir o serviço.");
    }
  }

  return (
    <>
      <AdminHeader />

      <main className="min-h-screen bg-black text-white px-6 py-10">
        <section className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6 mb-10">
            <div>
              <span className="text-zinc-400 uppercase tracking-widest">
                Painel Administrativo
              </span>

              <h1 className="text-4xl font-bold mt-3">
                Serviços da Barbearia
              </h1>

              <p className="text-zinc-400 mt-3">
                Cadastre os serviços, preços e o tempo médio de duração.
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

          <div className="grid lg:grid-cols-[420px_1fr] gap-8">
            <form
              onSubmit={handleSubmit}
              className="bg-zinc-950 border border-zinc-800 rounded-2xl p-6 h-fit"
            >
              <h2 className="text-2xl font-bold mb-6">
                {editingServiceId ? "Editar serviço" : "Cadastrar serviço"}
              </h2>

              <div className="space-y-5">
                <div>
                  <label className="block text-zinc-400 mb-2">
                    Nome do serviço
                  </label>

                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="Ex: Corte degradê"
                    className="w-full bg-black border border-zinc-800 rounded-lg px-4 py-3 text-white outline-none focus:border-white"
                  />
                </div>

                <div>
                  <label className="block text-zinc-400 mb-2">
                    Preço
                  </label>

                  <input
                    type="number"
                    name="price"
                    value={formData.price}
                    onChange={handleChange}
                    placeholder="Ex: 40"
                    min="1"
                    step="0.01"
                    className="w-full bg-black border border-zinc-800 rounded-lg px-4 py-3 text-white outline-none focus:border-white"
                  />
                </div>

                <div>
                  <label className="block text-zinc-400 mb-2">
                    Tempo médio do serviço
                  </label>

                  <select
                    name="durationMinutes"
                    value={formData.durationMinutes}
                    onChange={handleChange}
                    className="w-full bg-black border border-zinc-800 rounded-lg px-4 py-3 text-white outline-none focus:border-white"
                  >
                    <option value="10">10 minutos</option>
                    <option value="15">15 minutos</option>
                    <option value="20">20 minutos</option>
                    <option value="30">30 minutos</option>
                    <option value="40">40 minutos</option>
                    <option value="45">45 minutos</option>
                    <option value="60">1 hora</option>
                    <option value="90">1 hora e 30 minutos</option>
                    <option value="120">2 horas</option>
                  </select>

                  <p className="text-sm text-zinc-500 mt-2">
                    Esse tempo será usado para bloquear a agenda do profissional.
                  </p>
                </div>

                <div>
                  <label className="block text-zinc-400 mb-2">
                    Descrição
                  </label>

                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    placeholder="Ex: Corte degradê com acabamento profissional."
                    rows={4}
                    className="w-full bg-black border border-zinc-800 rounded-lg px-4 py-3 text-white outline-none focus:border-white resize-none"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="mt-6 w-full bg-white text-black px-5 py-3 rounded-lg font-semibold hover:scale-[1.02] transition cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {isSubmitting
                  ? "Salvando..."
                  : editingServiceId
                    ? "Salvar alterações"
                    : "Cadastrar serviço"}
              </button>

              {editingServiceId && (
                <button
                  type="button"
                  onClick={clearForm}
                  className="mt-3 w-full bg-zinc-900 text-white border border-zinc-800 px-5 py-3 rounded-lg font-semibold hover:bg-zinc-800 transition cursor-pointer"
                >
                  Cancelar edição
                </button>
              )}
            </form>

            <div className="bg-zinc-950 border border-zinc-800 rounded-2xl overflow-hidden">
              <div className="p-6 border-b border-zinc-800">
                <h2 className="text-2xl font-bold">
                  Serviços cadastrados
                </h2>

                <p className="text-zinc-400 mt-2">
                  Esses serviços aparecerão para o cliente na página de
                  agendamento.
                </p>
              </div>

              {loading ? (
                <p className="text-zinc-400 p-6">
                  Carregando serviços...
                </p>
              ) : services.length === 0 ? (
                <p className="text-zinc-400 p-6">
                  Nenhum serviço cadastrado ainda.
                </p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead className="bg-zinc-900 text-zinc-400">
                      <tr>
                        <th className="p-4">Serviço</th>
                        <th className="p-4">Preço</th>
                        <th className="p-4">Duração</th>
                        <th className="p-4">Descrição</th>
                        <th className="p-4">Ações</th>
                      </tr>
                    </thead>

                    <tbody>
                      {services.map((service) => (
                        <tr
                          key={service.id}
                          className="border-t border-zinc-800 text-zinc-300"
                        >
                          <td className="p-4 font-semibold text-white">
                            {service.name}
                          </td>

                          <td className="p-4">
                            {formatCurrency(service.price)}
                          </td>

                          <td className="p-4">
                            {service.durationMinutes || 30} min
                          </td>

                          <td className="p-4">
                            {service.description}
                          </td>

                          <td className="p-4">
                            <div className="flex flex-wrap gap-3">
                              <button
                                type="button"
                                onClick={() => handleEdit(service)}
                                className="bg-zinc-800 text-white px-4 py-2 rounded-lg font-semibold hover:bg-zinc-700 transition cursor-pointer"
                              >
                                Editar
                              </button>

                              <button
                                type="button"
                                onClick={() => handleDelete(service.id)}
                                className="bg-red-500/10 text-red-400 border border-red-500 px-4 py-2 rounded-lg font-semibold hover:bg-red-500 hover:text-white transition cursor-pointer"
                              >
                                Excluir
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </section>
      </main>
    </>
  );
}
