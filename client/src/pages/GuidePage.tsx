import { Link } from "wouter";
import { Phone } from "lucide-react";

import { AnswerFirst } from "@/components/AnswerFirst";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { FaqSection } from "@/components/FaqSection";
import { ResponsiveImage } from "@/components/ResponsiveImage";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { SITE } from "@/config/site";
import { getGuide, type Guide, type GuideBlock } from "@/data/guides";

function Block({ block }: { block: GuideBlock }) {
  switch (block.type) {
    case "h2":
      return <h2 className="text-2xl sm:text-3xl font-bold mt-12 mb-4">{block.text}</h2>;
    case "h3":
      return <h3 className="text-xl font-bold mt-8 mb-3">{block.text}</h3>;
    case "p":
      return <p className="text-base leading-relaxed text-muted-foreground mb-4">{block.text}</p>;
    case "ul":
      return (
        <ul className="list-disc pl-6 space-y-2 mb-6 text-muted-foreground">
          {block.items.map((item) => (
            <li key={item} className="leading-relaxed">
              {item}
            </li>
          ))}
        </ul>
      );
    case "ol":
      return (
        <ol className="list-decimal pl-6 space-y-2 mb-6 text-muted-foreground">
          {block.items.map((item) => (
            <li key={item} className="leading-relaxed">
              {item}
            </li>
          ))}
        </ol>
      );
    case "table":
      return (
        <figure className="mb-8">
          <div className="overflow-x-auto rounded-xl border border-border">
            <Table>
              <caption className="sr-only">{block.caption}</caption>
              <TableHeader>
                <TableRow>
                  {block.head.map((cell) => (
                    <TableHead key={cell}>{cell}</TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {block.rows.map((row) => (
                  <TableRow key={row.join("|")}>
                    {row.map((cell, index) => (
                      <TableCell key={index} className={index === 0 ? "font-medium" : undefined}>
                        {cell}
                      </TableCell>
                    ))}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          <figcaption className="mt-2 text-sm text-muted-foreground">{block.caption}</figcaption>
        </figure>
      );
  }
}

/** One guide in the topic cluster, prerendered at `/guides/<slug>/`. */
export default function GuidePage({ guide }: { guide: Guide }) {
  const related = guide.related.map(getGuide).filter((entry): entry is Guide => Boolean(entry));

  return (
    <article className="min-h-screen pt-20 pb-24 lg:pb-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <Breadcrumbs path={`/guides/${guide.slug}`} className="pt-6" />

        <header className="py-8">
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-6">{guide.title}</h1>
          <AnswerFirst question={guide.question} answer={guide.answer} />
          <p className="mt-4 text-sm text-muted-foreground">
            Published{" "}
            <time dateTime={guide.datePublished}>
              {new Date(guide.datePublished).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}
            </time>
            {guide.dateModified !== guide.datePublished && (
              <>
                {" "}&middot; Updated{" "}
                <time dateTime={guide.dateModified}>
                  {new Date(guide.dateModified).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </time>
              </>
            )}
          </p>
        </header>

        <div className="aspect-[16/9] overflow-hidden rounded-2xl mb-8">
          <ResponsiveImage
            name={guide.heroImage}
            alt={guide.heroAlt}
            sizes="(min-width: 1024px) 900px, 100vw"
            className="w-full h-full object-cover"
          />
        </div>

        <div>
          {guide.blocks.map((block, index) => (
            <Block key={index} block={block} />
          ))}
        </div>

        <div className="mt-12 rounded-xl border border-border bg-card p-6">
          <h2 className="text-xl font-bold mb-2">Ready to talk specifics?</h2>
          <p className="text-muted-foreground mb-4">
            Browse{" "}
            <Link href="/inventory">
              <span className="text-primary underline cursor-pointer">every all terrain golf cart in stock</span>
            </Link>{" "}
            or call and we will tell you which configuration suits your property.
          </p>
          <a href={SITE.phoneHref}>
            <Button className="gap-2">
              <Phone className="w-4 h-4" aria-hidden="true" />
              Call {SITE.phoneDisplay}
            </Button>
          </a>
        </div>

        {related.length > 0 && (
          <nav className="mt-12" aria-label="Related guides">
            <h2 className="text-xl font-bold mb-4">Keep reading</h2>
            <ul className="space-y-3">
              {related.map((entry) => (
                <li key={entry.slug}>
                  <Link href={`/guides/${entry.slug}`}>
                    <span className="text-primary underline cursor-pointer">{entry.title}</span>
                  </Link>
                  <p className="text-sm text-muted-foreground mt-1">{entry.metaDescription}</p>
                </li>
              ))}
            </ul>
          </nav>
        )}
      </div>

      <FaqSection faqs={guide.faqs} heading={`${guide.shortTitle}: common questions`} />
    </article>
  );
}
