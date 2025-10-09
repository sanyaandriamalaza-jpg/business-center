import FilterComponent from "./FilterComponent";
import SpaceCard from "./SpaceCard";


const espaces = [
  {
    id: 1,
    src: "/office1.png",
    alt: "bureau executif A",
    badge: "Bureau",
    espace: "Bureau Exécutif A",
    capacitie: 5,
    creneaux: "08:00 - 20:00",
    equipements: ["Wi-Fi", "Imprimante", "Tableau blanc"],
    prix: 45,
  },
  {
    id: 2,
    src: "/office2.jpeg",
    alt: "salle de réunion B",
    badge: "Salle de Réunion",
    espace: "Salle de Réunion B",
    capacitie: 5,
    creneaux: "08:00 - 20:00",
    equipements: ["Wi-Fi", "Projecteur", "Tableau blanc"],
    prix: 35,
  },
  {
    id: 3,
    src: "/office3.png",
    alt: "bureau collaboratif C",
    badge: "Bureau collaboratif",
    espace: "Bureau collaboratif C",
    capacitie: 8,
    creneaux: "08:00 - 20:00",
    equipements: ["Wi-Fi", "Imprimante", "Machine à café"],
    prix: 15,
  },
  {
    id: 4,
    src: "/office3.png",
    alt: "salle du conseil",
    badge: "Salle de réunion",
    espace: "Salle du Conseil",
    capacitie: 12,
    creneaux: "08:00 - 20:00",
    equipements: ["Wi-Fi", "Video projecteur", "Tableau blanc"],
    prix: 50,
  },
  {
    id: 5,
    src: "/office2.jpeg",
    alt: "studio créatif",
    badge: "Bureau",
    espace: "STudio Créatif",
    capacitie: 6,
    creneaux: "08:00 - 20:00",
    equipements: ["Wi-Fi", "Equipement de design", "Tableau blanc"],
    prix: 40,
  },
  {
    id: 6,
    src: "/office1.png",
    alt: "espace flex",
    badge: "Espace Coworking",
    espace: "Espace flex",
    capacitie: 30,
    creneaux: "08:00 - 20:00",
    equipements: ["Wi-Fi", "Machine à café", "Service d'impression"],
    prix: 10,
  },
];

export default function EspacesDisponibles() {
  return (
    <div className="w-full mx-auto">
      <div className="container mx-auto px-4">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Espaces Disponibles
        </h1>
        <p className="text-lg text-grey-600 mb-8">
          Trouvez et réservez votre espace de travail idéal parmi notre
          sélection de bureaux et salles de réunion.
        </p>
        {/* Filtres */}
        <FilterComponent/>
        {/* Cartes d'espaces */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {espaces.map((espace) => (
            <SpaceCard
              key={espace.id}
              id={espace.id}
              src={espace.src}
              alt={espace.alt}
              badge={espace.badge}
              espace={espace.espace}
              capacitie={espace.capacitie}
              creneaux={espace.creneaux}
              equipements={espace.equipements}
              prix={espace.prix}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
