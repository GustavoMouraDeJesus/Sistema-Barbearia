import { useEffect, useMemo, useState } from "react";
import { Link, useLocation } from "react-router-dom";

import { API_URL } from "../services/api";
import type { Barbershop } from "../types/Barbershop";

type StoredBarbershop = {
  id?: string;
  name?: string;
  slug?: string;
};

function getStoredBarbershopSlug() {
  const directSlug = localStorage.getItem("barbershopSlug");

  if (directSlug) {
    return directSlug;
  }

  const storedBarbershop = localStorage.getItem("barbershop");

  if (storedBarbershop) {
    try {
      const barbershop = JSON.parse(storedBarbershop) as StoredBarbershop;

      if (barbershop.slug) {
        return barbershop.slug;
      }
    } catch {
      console.error("Não foi possível ler os dados da barbearia.");
    }
  }

  const storedAdmin = localStorage.getItem("admin");

  if (storedAdmin) {
    try {
      const admin = JSON.parse(storedAdmin) as {
        barbershopSlug?: string;
      };

      if (admin.barbershopSlug) {
        return admin.barbershopSlug;
      }
    } catch {
      console.error("Não foi possível ler os dados do administrador.");
    }
  }

  return null;
}

function getBarbershopSlugFromPath(pathname: string) {
  const parts = pathname.split("/").filter(Boolean);
  const firstPart = parts[0];

  if (!firstPart) {
    return null;
  }

  const blockedRoutes = ["admin", "agendamento"];

  if (blockedRoutes.includes(firstPart)) {
    return null;
  }

  return firstPart;
}

function formatWhatsAppLabel(value?: string | null) {
  if (!value) {
    return "";
  }

  const onlyNumbers = value.replace(/\D/g, "");

  if (onlyNumbers.length === 11) {
    return `(${onlyNumbers.slice(0, 2)}) ${onlyNumbers.slice(
      2,
      7
    )}-${onlyNumbers.slice(7)}`;
  }

  if (onlyNumbers.length === 10) {
    return `(${onlyNumbers.slice(0, 2)}) ${onlyNumbers.slice(
      2,
      6
    )}-${onlyNumbers.slice(6)}`;
  }

  return value;
}

function getWhatsAppUrl(value?: string | null) {
  if (!value) {
    return "";
  }

  const onlyNumbers = value.replace(/\D/g, "");

  if (!onlyNumbers) {
    return "";
  }

  const phoneWithCountry = onlyNumbers.startsWith("55")
    ? onlyNumbers
    : `55${onlyNumbers}`;

  const message = encodeURIComponent(
    "Olá! Vim pelo site e gostaria de mais informações."
  );

  return `https://api.whatsapp.com/send?phone=${phoneWithCountry}&text=${message}`;
}

function getInstagramUrl(value?: string | null) {
  if (!value) {
    return "";
  }

  const cleanInstagram = value.replace("@", "").trim();

  if (!cleanInstagram) {
    return "";
  }

  return `https://instagram.com/${cleanInstagram}`;
}

export default function Footer() {
  const location = useLocation();

  const slugFromUrl = useMemo(() => {
    return getBarbershopSlugFromPath(location.pathname);
  }, [location.pathname]);

  const slugFromStorage = useMemo(() => {
    return getStoredBarbershopSlug();
  }, [location.pathname]);

  const barbershopSlug = slugFromUrl || slugFromStorage;

  const [barbershop, setBarbershop] = useState<Barbershop | null>(null);

  useEffect(() => {
    async function loadBarbershop() {
      if (!barbershopSlug) {
        setBarbershop(null);
        return;
      }

      try {
        const response = await fetch(
          `${API_URL}/barbershops/${barbershopSlug}`
        );

        if (!response.ok) {
          setBarbershop(null);
          return;
        }

        const data = await response.json();

        setBarbershop(data);
      } catch (error) {
        console.error("Erro ao carregar dados da barbearia no footer:", error);
        setBarbershop(null);
      }
    }

    loadBarbershop();
  }, [barbershopSlug]);

  const currentYear = new Date().getFullYear();

  const primaryColor = barbershop?.primaryColor || "#ffffff";

  const homeLink = barbershopSlug ? `/${barbershopSlug}` : "/";
  const appointmentLink = barbershopSlug
    ? `/${barbershopSlug}/agendamento`
    : "/agendamento";

  const whatsappUrl = getWhatsAppUrl(barbershop?.whatsapp);
  const instagramUrl = getInstagramUrl(barbershop?.instagram);

  return (
    <footer className="bg-black text-white border-t border-zinc-800">
      <div className="max-w-7xl mx-auto px-6 py-14">
        <div className="grid lg:grid-cols-[1.4fr_1fr_1fr_1.2fr] gap-10">
          <div>
            <h2 className="text-3xl font-bold">
              {barbershop?.name || "Barbearia"}
            </h2>

            <p className="text-zinc-400 mt-4 leading-relaxed max-w-md">
              {barbershop?.description ||
                "Sistema de agendamento online criado para facilitar a rotina da barbearia e oferecer mais praticidade para os clientes."}
            </p>

            <div className="mt-6 flex flex-wrap gap-3">
              <Link
                to={appointmentLink}
                style={{
                  backgroundColor: primaryColor,
                }}
                className="text-black px-5 py-3 rounded-lg font-semibold hover:scale-105 transition"
              >
                Agendar horário
              </Link>

              {whatsappUrl && (
                <a
                  href={whatsappUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="bg-green-500 text-black px-5 py-3 rounded-lg font-semibold hover:scale-105 transition"
                >
                  Chamar no WhatsApp
                </a>
              )}
            </div>
          </div>

          <div>
            <h3 className="text-lg font-bold mb-4">
              Navegação
            </h3>

            <ul className="space-y-3 text-zinc-400">
              <li>
                <a
                  href={`${homeLink}#inicio`}
                  className="hover:text-white transition"
                >
                  Início
                </a>
              </li>

              <li>
                <a
                  href={`${homeLink}#servicos`}
                  className="hover:text-white transition"
                >
                  Serviços
                </a>
              </li>

              <li>
                <a
                  href={`${homeLink}#galeria`}
                  className="hover:text-white transition"
                >
                  Galeria
                </a>
              </li>

              <li>
                <Link
                  to={appointmentLink}
                  className="hover:text-white transition"
                >
                  Agendamento
                </Link>
              </li>

              <li>
                <Link
                  to="/admin/login"
                  className="hover:text-white transition"
                >
                  Área administrativa
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-lg font-bold mb-4">
              Contato
            </h3>

            <ul className="space-y-3 text-zinc-400">
              {barbershop?.address && (
                <li>
                  <span className="block text-zinc-500 text-sm">
                    Endereço
                  </span>
                  <span>{barbershop.address}</span>
                </li>
              )}

              {barbershop?.whatsapp && (
                <li>
                  <span className="block text-zinc-500 text-sm">
                    Telefone / WhatsApp
                  </span>

                  {whatsappUrl ? (
                    <a
                      href={whatsappUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="hover:text-white transition"
                    >
                      {formatWhatsAppLabel(barbershop.whatsapp)}
                    </a>
                  ) : (
                    <span>{barbershop.whatsapp}</span>
                  )}
                </li>
              )}

              {barbershop?.instagram && instagramUrl && (
                <li>
                  <span className="block text-zinc-500 text-sm">
                    Instagram
                  </span>

                  <a
                    href={instagramUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="hover:text-white transition"
                  >
                    {barbershop.instagram.startsWith("@")
                      ? barbershop.instagram
                      : `@${barbershop.instagram}`}
                  </a>
                </li>
              )}

              {!barbershop?.address &&
                !barbershop?.whatsapp &&
                !barbershop?.instagram && (
                  <li className="text-zinc-500">
                    Informações de contato ainda não cadastradas.
                  </li>
                )}
            </ul>
          </div>

          <div className="bg-zinc-950 border border-zinc-800 rounded-2xl p-6">
            <span className="text-zinc-500 uppercase tracking-widest text-sm">
              Desenvolvedor
            </span>

            <h3 className="text-2xl font-bold mt-3">
              Gustavo Moura
            </h3>

            <div className="flex flex-wrap gap-3 mt-6">
              <a
                href="https://github.com/GustavoMouraDeJesus"
                target="_blank"
                rel="noreferrer"
                className="border border-zinc-700 px-4 py-2 rounded-lg text-zinc-300 hover:bg-white hover:text-black transition"
              >
                GitHub
              </a>

              <a
                href="https://www.linkedin.com/in/gustavo-moura-861938222/"
                target="_blank"
                rel="noreferrer"
                className="border border-zinc-700 px-4 py-2 rounded-lg text-zinc-300 hover:bg-white hover:text-black transition"
              >
                LinkedIn
              </a>

              <a
                href="https://meu-portifolio-three-alpha.vercel.app"
                target="_blank"
                rel="noreferrer"
                className="border border-zinc-700 px-4 py-2 rounded-lg text-zinc-300 hover:bg-white hover:text-black transition"
              >
                Portfólio
              </a>
            </div>
          </div>
        </div>

        <div className="border-t border-zinc-800 mt-12 pt-6 flex flex-col md:flex-row justify-between gap-4 text-zinc-500 text-sm">
          <p>
            © {currentYear} {barbershop?.name || "Barbearia"}. Todos os direitos reservados.
          </p>

          <p>
            Desenvolvido por{" "}
            <a
              href="https://github.com/GustavoMouraDeJesus"
              target="_blank"
              rel="noreferrer"
              className="text-zinc-300 hover:text-white transition"
            >
              Gustavo Moura
            </a>
            .
          </p>
        </div>
      </div>
    </footer>
  );
}
