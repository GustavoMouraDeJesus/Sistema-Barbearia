import { Link } from "react-router-dom";

export default function NavBar() {
  return (
    <nav className="fixed top-0 left-0 z-50 w-full bg-black/80 backdrop-blur-md border-b border-zinc-800">
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">

        <Link
          to="/"
          className="text-2xl font-bold tracking-wider text-white"
        >
          Barbearia
        </Link>

        <ul className="hidden md:flex items-center gap-8 text-xl font-medium text-white">
          <li>
            <a href="/#inicio" className="hover:text-zinc-300 transition">
              Início
            </a>
          </li>

          <li>
            <a href="/#servicos" className="hover:text-zinc-300 transition">
              Serviços
            </a>
          </li>

          <li>
            <a href="/#galeria" className="hover:text-zinc-300 transition">
              Galeria
            </a>
          </li>
        </ul>

        <Link
          to="/agendamento"
          className="bg-white text-black px-5 py-2 rounded-lg font-semibold hover:scale-105 transition"
        >
          AGENDAR HORÁRIO
        </Link>

      </div>
    </nav>
  );
}