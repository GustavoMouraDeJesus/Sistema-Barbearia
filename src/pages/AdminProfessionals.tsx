import { useEffect, useState } from "react";
import type { ChangeEvent, FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";

import AdminHeader from "../components/AdminHeader";
import { API_URL } from "../services/api";

type AdminProfessional = {
  id: number;
  barbershopId: string;
  name: string;
  specialty: string;
};

type ProfessionalForm = {
  name: string;
  specialty: string;
};

export default function AdminProfessionals() {
  const navigate = useNavigate();

  const [professionals, setProfessionals] = useState<AdminProfessional[]>([]);

  const [formData, setFormData] = useState<ProfessionalForm>({
    name: "",
    specialty: "",
  });

  const [editingProfessionalId, setEditingProfessionalId] = useState<
    number | null
  >(null);

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

    loadProfessionals();
  }, []);

  function getAccessToken() {
    return localStorage.getItem("accessToken");
  }

  async function loadProfessionals() {
    const accessToken = getAccessToken();

    if (!accessToken) {
      navigate("/admin/login");
      return;
    }

    try {
      setLoading(true);
      setErrorMessage("");

      const response = await fetch(`${API_URL}/admin/professionals`, {
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
        throw new Error("Erro ao carregar funcionários.");
      }

      const data = await response.json();

      if (!Array.isArray(data)) {
        throw new Error("Resposta inválida do servidor.");
      }

      setProfessionals(data);
    } catch (error) {
      console.error("Erro ao buscar funcionários:", error);
      setErrorMessage("Não foi possível carregar os funcionários.");
    } finally {
      setLoading(false);
    }
  }

  function handleChange(event: ChangeEvent<HTMLInputElement>) {
    const { name, value } = event.target;

    setFormData((previousData) => ({
      ...previousData,
      [name]: value,
    }));
  }

  function clearForm() {
    setFormData({
      name: "",
      specialty: "",
    });

    setEditingProfessionalId(null);
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

    if (!formData.name || !formData.specialty) {
      setErrorMessage("Preencha todos os campos.");
      return;
    }

    try {
      setIsSubmitting(true);

      const url = editingProfessionalId
        ? `${API_URL}/admin/professionals/${editingProfessionalId}`
        : `${API_URL}/admin/professionals`;

      const method = editingProfessionalId ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({
          name: formData.name,
          specialty: formData.specialty,
        }),
      });

      if (response.status === 401) {
        localStorage.removeItem("accessToken");
        navigate("/admin/login");
        return;
      }

      if (!response.ok) {
        throw new Error("Erro ao salvar funcionário.");
      }

      await loadProfessionals();

      clearForm();

      setSuccessMessage(
        editingProfessionalId
          ? "Funcionário atualizado com sucesso."
          : "Funcionário cadastrado com sucesso."
      );
    } catch (error) {
      console.error("Erro ao salvar funcionário:", error);
      setErrorMessage("Não foi possível salvar o funcionário.");
    } finally {
      setIsSubmitting(false);
    }
  }

  function handleEdit(professional: AdminProfessional) {
    setEditingProfessionalId(professional.id);

    setFormData({
      name: professional.name,
      specialty: professional.specialty,
    });

    setSuccessMessage("");
    setErrorMessage("");
  }

  async function handleDelete(professionalId: number) {
    const confirmed = window.confirm(
      "Tem certeza que deseja excluir este funcionário?"
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

      const response = await fetch(
        `${API_URL}/admin/professionals/${professionalId}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );

      if (response.status === 401) {
        localStorage.removeItem("accessToken");
        navigate("/admin/login");
        return;
      }

      if (!response.ok) {
        throw new Error("Erro ao excluir funcionário.");
      }

      await loadProfessionals();

      setSuccessMessage("Funcionário excluído com sucesso.");

      if (editingProfessionalId === professionalId) {
        clearForm();
      }
    } catch (error) {
      console.error("Erro ao excluir funcionário:", error);
      setErrorMessage("Não foi possível excluir o funcionário.");
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
                Funcionários da Barbearia
              </h1>

              <p className="text-zinc-400 mt-3">
                Cadastre, edite e exclua os profissionais que atenderão os
                clientes.
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
                {editingProfessionalId
                  ? "Editar funcionário"
                  : "Cadastrar funcionário"}
              </h2>

              <div className="space-y-5">
                <div>
                  <label className="block text-zinc-400 mb-2">
                    Nome do funcionário
                  </label>

                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="Ex: João Silva"
                    className="w-full bg-black border border-zinc-800 rounded-lg px-4 py-3 text-white outline-none focus:border-white"
                  />
                </div>

                <div>
                  <label className="block text-zinc-400 mb-2">
                    Especialidade
                  </label>

                  <input
                    type="text"
                    name="specialty"
                    value={formData.specialty}
                    onChange={handleChange}
                    placeholder="Ex: Corte degradê e barba"
                    className="w-full bg-black border border-zinc-800 rounded-lg px-4 py-3 text-white outline-none focus:border-white"
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
                  : editingProfessionalId
                  ? "Salvar alterações"
                  : "Cadastrar funcionário"}
              </button>

              {editingProfessionalId && (
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
                  Funcionários cadastrados
                </h2>

                <p className="text-zinc-400 mt-2">
                  Esses funcionários aparecerão para o cliente na página de
                  agendamento.
                </p>
              </div>

              {loading ? (
                <p className="text-zinc-400 p-6">
                  Carregando funcionários...
                </p>
              ) : professionals.length === 0 ? (
                <p className="text-zinc-400 p-6">
                  Nenhum funcionário cadastrado ainda.
                </p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead className="bg-zinc-900 text-zinc-400">
                      <tr>
                        <th className="p-4">Funcionário</th>
                        <th className="p-4">Especialidade</th>
                        <th className="p-4">Ações</th>
                      </tr>
                    </thead>

                    <tbody>
                      {professionals.map((professional) => (
                        <tr
                          key={professional.id}
                          className="border-t border-zinc-800 text-zinc-300"
                        >
                          <td className="p-4 font-semibold text-white">
                            {professional.name}
                          </td>

                          <td className="p-4">
                            {professional.specialty}
                          </td>

                          <td className="p-4">
                            <div className="flex flex-wrap gap-3">
                              <button
                                type="button"
                                onClick={() => handleEdit(professional)}
                                className="bg-zinc-800 text-white px-4 py-2 rounded-lg font-semibold hover:bg-zinc-700 transition cursor-pointer"
                              >
                                Editar
                              </button>

                              <button
                                type="button"
                                onClick={() =>
                                  handleDelete(professional.id)
                                }
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