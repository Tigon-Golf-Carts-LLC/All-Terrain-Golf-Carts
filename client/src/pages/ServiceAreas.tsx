import { Link } from "wouter";
import { MapPin } from "lucide-react";

import { AnswerFirst } from "@/components/AnswerFirst";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { locations } from "@/data/locations";

/**
 * Index of the service-area pages at `/service-areas/`.
 *
 * The 64 state and territory pages previously had no parent page, which made
 * them orphans: reachable only from the sitemap. This is their hub.
 */
export default function ServiceAreas() {
  const states = locations.filter((location) => location.type === "state");
  const territories = locations.filter((location) => location.type === "territory");

  return (
    <div className="min-h-screen pt-20 pb-24 lg:pb-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <Breadcrumbs path="/service-areas" className="pt-6" />

        <header className="py-8">
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-6">
            All Terrain Golf Cart Delivery by State
          </h1>
          <AnswerFirst
            question="Where do you deliver?"
            answer={`We deliver 4X4 all terrain golf carts to all ${states.length} U.S. states and ${territories.length} territories. Each page below covers that state's street-legal rules for Low Speed Vehicles, the local terrain and uses that matter there, and delivery details for its major metro areas.`}
          />
        </header>

        <section className="pb-10" aria-labelledby="states">
          <h2 id="states" className="text-2xl font-bold mb-4">
            U.S. States
          </h2>
          <ul className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-x-6 gap-y-2 list-none p-0 m-0">
            {states.map((location) => (
              <li key={location.slug}>
                <Link href={`/${location.slug}`}>
                  <span className="flex items-center gap-1.5 py-1 text-sm cursor-pointer hover:text-primary transition-colors">
                    <MapPin className="w-3.5 h-3.5 text-primary shrink-0" aria-hidden="true" />
                    {location.name} all terrain golf carts
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </section>

        <section className="pb-10" aria-labelledby="territories">
          <h2 id="territories" className="text-2xl font-bold mb-4">
            Districts and Territories
          </h2>
          <ul className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-x-6 gap-y-2 list-none p-0 m-0">
            {territories.map((location) => (
              <li key={location.slug}>
                <Link href={`/${location.slug}`}>
                  <span className="flex items-center gap-1.5 py-1 text-sm cursor-pointer hover:text-primary transition-colors">
                    <MapPin className="w-3.5 h-3.5 text-primary shrink-0" aria-hidden="true" />
                    {location.name}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </div>
  );
}
