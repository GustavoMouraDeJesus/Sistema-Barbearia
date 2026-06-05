import { Link, NavLink } from "react-router-dom";

export default function AdminHeader() {
  return (
    <header className="border-b border-zinc-800 bg-zinc-950">
      <div className="max-w-7xl mx-auto px-6 py-5 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        
        <div>
          <h1 className="text-xl font-bold text-white">
            Painel Admin
          </h1>

          <p className="text-sm text-zinc-400">
            Controle interno da barbearia
          </p>
        </div>

        <nav className="flex flex-wrap gap-3">
          <NavLink
            to="/admin"
            end
            className={({ isActive }) =>
              `px-4 py-2 rounded-lg font-semibold transition ${
                isActive
                  ? "bg-white text-black"
                  : "bg-zinc-900 text-white border border-zinc-800 hover:bg-zinc-800"
              }`
            }
          >
            Dashboard
          </NavLink>

          <NavLink
            to="/admin/dia"
            className={({ isActive }) =>
              `px-4 py-2 rounded-lg font-semibold transition ${
                isActive
                  ? "bg-white text-black"
                  : "bg-zinc-900 text-white border border-zinc-800 hover:bg-zinc-800"
              }`
            }
          >
            Painel do Dia
          </NavLink>

          <Link
            to="/"
            className="px-4 py-2 rounded-lg font-semibold bg-zinc-900 text-white border border-zinc-800 hover:bg-zinc-800 transition"
          >
            Voltar ao site
          </Link>
        </nav>
      </div>
    </header>
  );
}