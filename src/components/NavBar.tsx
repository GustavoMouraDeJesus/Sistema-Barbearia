import { Link } from "react-router-dom"

export default function Navbar() {
    return (
        <nav className="fixed top-0 left-0 w-full bg-black/80 backdrop-blur-md border-b border-zinc-800">
            <div className="max-w-77xl mx-auto px-6 py-4 flex items-center justify-between">

                <Link to = "/"
                className="text-2xl font-bold tracking-wider ml-15 text-white">
                    Barbearia
                </Link>

                {/*Navegação*/}
                <ul className="hidden md:flex items-center gap-8 text-sm font-medium text-xl text-white">
                    <li>
                        <Link to ="/inicio">
                            Início
                        </Link>
                    </li>
                    <li>
                        <Link to ="/servicos">
                            Serviços
                        </Link>
                    </li>
                    <li>
                        <Link to ="/galeria">
                            Galeria
                        </Link>
                    </li>
                    
                </ul>

                {/*CTA*/}
                <Link 
                   to="/agendamento"
                   className="bg-white text-black px-5 py-2 rounded-lg font-semibold hover:scale-105 transition mr-15">
                    AGENDAR HORÁRIO
                   </Link>

            </div>
        </nav>
    )
}