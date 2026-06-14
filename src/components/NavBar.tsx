import { Link, useLocation } from "react-router-dom";

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

export default function NavBar() {
  const location = useLocation();

  const slugFromUrl = getBarbershopSlugFromPath(location.pathname);
  const slugFromStorage = getStoredBarbershopSlug();

  const barbershopSlug = slugFromUrl || slugFromStorage;

  const homeLink = barbershopSlug ? `/${barbershopSlug}` : "/";

  const inicioLink = barbershopSlug
    ? `/${barbershopSlug}#inicio`
    : "/#inicio";

  const servicosLink = barbershopSlug
    ? `/${barbershopSlug}#servicos`
    : "/#servicos";

  const galeriaLink = barbershopSlug
    ? `/${barbershopSlug}#galeria`
    : "/#galeria";

  const appointmentLink = barbershopSlug
    ? `/${barbershopSlug}/agendamento`
    : "/agendamento";

  return (
    <nav className="fixed top-0 left-0 z-50 w-full bg-black/80 backdrop-blur-md border-b border-zinc-800">
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
        <Link
          to={homeLink}
          className="text-2xl font-bold tracking-wider text-white"
        >
          Barbearia
        </Link>

        <ul className="hidden md:flex items-center gap-8 text-xl font-medium text-white">
          <li>
            <a href={inicioLink} className="hover:text-zinc-300 transition">
              Início
            </a>
          </li>

          <li>
            <a href={servicosLink} className="hover:text-zinc-300 transition">
              Serviços
            </a>
          </li>

          <li>
            <a href={galeriaLink} className="hover:text-zinc-300 transition">
              Galeria
            </a>
          </li>
        </ul>

        <Link
          to={appointmentLink}
          className="bg-white text-black px-5 py-2 rounded-lg font-semibold hover:scale-105 transition"
        >
          AGENDAR HORÁRIO
        </Link>
      </div>
    </nav>
  );
}
