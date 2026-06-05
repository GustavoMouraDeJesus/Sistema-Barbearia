import { services } from "../../data/services";

export default function Services() {
    return (
        <section
            id="servicos"
            className="py-24 bg-zinc-950 text-white"
        >
            <div className="max-w-xl mx-auto px-6">

                <div className="text-center mb-16">
                    <span className="textzinc-400 uppercase trancking-widest">
                        Serviços
                    </span>

                    <h2 className="text-4xl font-bold mt-2">
                        Nossos Serviços
                    </h2>

                    <p className="text-zinc-400 mt-4 max-w-2xl mx-auto">
                        Escola o serviço ideal para manter seu estilo sempre em dia.
                    </p>
                </div>

                <div className="grid md-grid-cols-2 lg-grid-cols-4 gap-6">

                    {services.map((service) => (
                        <div
                            key={service.id}
                            className="bg-zinc-900 border border-zinc-800 rounder-xl p-6 hover-border-white transition"
                        >
                            <h3 className="text-xl font-semibold">
                                {service.name}
                            </h3>

                            <p className="text-zinc-400 mt-3">
                                {service.description}
                            </p>

                            <span className="block mt-6 text2xl font-bold">
                                R$ {service.price}
                            </span>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    )
}