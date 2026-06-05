import { gallery } from "../../data/gallery";

export default function Gallery() {
  return (
    <section
      id="galeria"
      className="py-24 bg-black text-white"
    >
      <div className="max-w-7xl mx-auto px-6">

        <div className="text-center mb-16">
          <span className="text-zinc-400 uppercase tracking-widest">
            Galeria
          </span>

          <h2 className="text-4xl font-bold mt-2">
            Nossos Trabalhos
          </h2>

          <p className="text-zinc-400 mt-4">
            Alguns resultados realizados pela equipe TOID.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {gallery.map((image, index) => (
            <div
              key={index}
              className="overflow-hidden rounded-xl"
            >
              <img
                src={image}
                alt={`Corte ${index + 1}`}
                className="
                  w-full
                  h-80
                  object-cover
                  hover:scale-110
                  transition
                  duration-500
                "
              />
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}