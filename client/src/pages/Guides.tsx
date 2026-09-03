import { Link } from "wouter";

import { AnswerFirst } from "@/components/AnswerFirst";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { ResponsiveImage } from "@/components/ResponsiveImage";
import { Card } from "@/components/ui/card";
import { GUIDES } from "@/data/guides";

/** Index of the topic cluster at `/guides/`. */
export default function Guides() {
  return (
    <div className="min-h-screen pt-20 pb-24 lg:pb-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <Breadcrumbs path="/guides" className="pt-6" />

        <header className="py-8">
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-6">All Terrain Golf Cart Buying Guides</h1>
          <AnswerFirst
            question="Where should I start?"
            answer="These guides answer the questions buyers ask before choosing an all terrain golf cart: what one actually is, what it costs, whether it can be driven on the road, which battery chemistry to pick, and how tires and drivetrain decide what ground it can cross."
          />
        </header>

        <ul className="grid md:grid-cols-2 gap-6 list-none p-0 m-0 pb-8">
          {GUIDES.map((guide) => (
            <li key={guide.slug}>
              <Card className="overflow-hidden h-full flex flex-col hover-elevate">
                <Link href={`/guides/${guide.slug}`}>
                  <div className="aspect-[16/9] overflow-hidden cursor-pointer">
                    <ResponsiveImage
                      name={guide.heroImage}
                      alt={guide.heroAlt}
                      sizes="(min-width: 768px) 45vw, 92vw"
                      className="w-full h-full object-cover"
                    />
                  </div>
                </Link>
                <div className="p-6 flex flex-col flex-1">
                  <h2 className="text-xl font-bold mb-2">
                    <Link href={`/guides/${guide.slug}`}>
                      <span className="cursor-pointer hover:text-primary transition-colors">{guide.title}</span>
                    </Link>
                  </h2>
                  <p className="text-sm text-muted-foreground leading-relaxed flex-1">{guide.answer}</p>
                  <p className="mt-4 text-xs text-muted-foreground">
                    Updated{" "}
                    <time dateTime={guide.dateModified}>
                      {new Date(guide.dateModified).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                    </time>
                  </p>
                </div>
              </Card>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
