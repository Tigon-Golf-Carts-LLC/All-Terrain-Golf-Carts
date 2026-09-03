import { Link } from "wouter";
import { ArrowLeft, Battery, CheckCircle2, Download, Gauge, Mail, Phone, Users, Zap } from "lucide-react";

import snapshot from "@/data/inventory.json";
import { AnswerFirst } from "@/components/AnswerFirst";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { ResponsiveImage } from "@/components/ResponsiveImage";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableRow } from "@/components/ui/table";
import { InventoryCard } from "@/components/inventory/InventoryCard";
import { SITE, withBase } from "@/config/site";
import { getModel } from "@/data/models";
import { formatPrice, type InventoryItem, type InventorySnapshot } from "@/lib/inventory";

const inventory = snapshot as unknown as InventorySnapshot;

function mailtoFor(item: InventoryItem): string {
  const subject = `Inquiry: ${item.title} (${item.sku})`;
  const body = [
    `I'm interested in the ${item.title}.`,
    "",
    `Stock number: ${item.sku}`,
    `Listed price: ${formatPrice(item.price, item.priceCurrency)}`,
    "",
    "Name:",
    "Phone:",
    "Delivery ZIP code:",
    "",
    "Questions:",
  ].join("\n");
  return `mailto:${SITE.emailSales}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
}

/** One inventory item, prerendered at `/inventory/<slug>/`. */
export default function InventoryDetail({ item }: { item: InventoryItem }) {
  const model = getModel(item.model);
  const related = inventory.items
    .filter((candidate) => candidate.slug !== item.slug && candidate.model === item.model)
    .slice(0, 3);
  const otherModel = inventory.items.filter((candidate) => candidate.model !== item.model).slice(0, 3);

  const specs: [string, string][] = [
    ["Condition", item.condition === "new" ? "New" : "Used"],
    ["Year", String(item.year)],
    ["Make", item.makeName],
    ["Model", item.modelName],
    ["Configuration", `${item.trim} ${item.drive.toUpperCase()}`],
    ["Exterior color", item.colorName],
    ["Seating capacity", `${item.seats} passengers`],
    ["Drive system", item.drive === "4x4" ? "On-demand 4X4 all-wheel drive" : "4X2 rear drive"],
    ["Motors", `Dual electric, ${item.motorKw}kW combined`],
    ["Battery", item.batteryType],
    ["Range per charge", `${item.rangeMilesMin}-${item.rangeMilesMax} miles`],
    ["Top speed", `${item.topSpeedMph} MPH`],
    ["Street legal", item.features.includes("street-legal") ? "Yes, LSV equipped" : "Off-road only"],
    ["Stock number", item.sku],
  ];

  return (
    <div className="min-h-screen pt-20 pb-24 lg:pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <Breadcrumbs path={`/inventory/${item.slug}`} className="pt-6" />

        <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 py-8">
          <div>
            <div className="aspect-[4/3] bg-gradient-to-br from-muted to-muted/50 rounded-2xl p-4 lg:p-8">
              <ResponsiveImage
                name={item.image}
                alt={item.imageAlt}
                sizes="(min-width: 1024px) 50vw, 92vw"
                priority
                className="w-full h-full object-contain"
                testId="img-inventory-detail"
              />
            </div>
            <div
              className="mt-4 h-2 w-full rounded-full border border-border"
              style={{ backgroundColor: item.colorHex }}
              aria-hidden="true"
            />
            <p className="mt-2 text-center text-sm text-muted-foreground">{item.colorName}</p>
          </div>

          <div>
            <div className="flex items-center gap-2 mb-3">
              <Badge variant={item.condition === "new" ? "default" : "secondary"} className="capitalize">
                {item.condition}
              </Badge>
              <Badge variant="outline">{item.drive.toUpperCase()}</Badge>
              <Badge variant="outline">{item.seats} seats</Badge>
            </div>

            <h1 className="text-3xl sm:text-4xl font-bold mb-4">{item.title}</h1>

            <AnswerFirst answer={item.description} className="mb-6" />

            <p className="text-3xl font-bold tabular-nums mb-1">
              {formatPrice(item.price, item.priceCurrency)}
            </p>
            <p className="text-sm text-muted-foreground mb-6">
              Stock #{item.sku} &middot; Updated{" "}
              <time dateTime={item.updatedAt}>
                {new Date(item.updatedAt).toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </time>
            </p>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
              {[
                { icon: Users, label: `${item.seats} seats` },
                { icon: Zap, label: item.drive.toUpperCase() },
                { icon: Battery, label: `${item.rangeMilesMin}-${item.rangeMilesMax} mi` },
                { icon: Gauge, label: `${item.topSpeedMph} MPH` },
              ].map((stat) => (
                <Card key={stat.label} className="p-3 flex items-center gap-2">
                  <stat.icon className="w-4 h-4 text-primary shrink-0" aria-hidden="true" />
                  <span className="text-sm font-medium">{stat.label}</span>
                </Card>
              ))}
            </div>

            {/* The phone number is the primary CTA on every detail page. */}
            <div className="flex flex-col sm:flex-row gap-3 mb-6">
              <a href={SITE.phoneHref} className="flex-1">
                <Button size="lg" className="w-full gap-2" data-testid="button-call-detail">
                  <Phone className="w-5 h-5" aria-hidden="true" />
                  Call {SITE.phoneDisplay}
                </Button>
              </a>
              <a href={mailtoFor(item)} className="flex-1">
                <Button size="lg" variant="outline" className="w-full gap-2" data-testid="button-email-detail">
                  <Mail className="w-5 h-5" aria-hidden="true" />
                  Email about this cart
                </Button>
              </a>
            </div>

            <ul className="space-y-2">
              {item.highlights.map((highlight) => (
                <li key={highlight} className="flex gap-2 text-sm">
                  <CheckCircle2 className="w-4 h-4 text-primary shrink-0 mt-0.5" aria-hidden="true" />
                  <span>{highlight}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <section className="py-8" aria-labelledby="specifications">
          <h2 id="specifications" className="text-2xl font-bold mb-6">
            Specifications
          </h2>
          <div className="overflow-x-auto rounded-xl border border-border">
            <Table>
              <TableBody>
                {specs.map(([label, value]) => (
                  <TableRow key={label}>
                    <TableCell className="font-medium w-1/2 sm:w-1/3">{label}</TableCell>
                    <TableCell>{value}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {model && (
            <div className="mt-6 flex flex-wrap gap-3">
              <Link href={model.path}>
                <Button variant="outline" className="gap-2">
                  Full {model.shortName} details
                </Button>
              </Link>
              <a href={withBase(model.specSheet)} download>
                <Button variant="outline" className="gap-2">
                  <Download className="w-4 h-4" aria-hidden="true" />
                  {model.shortName} spec sheet (PDF)
                </Button>
              </a>
            </div>
          )}
        </section>

        {related.length > 0 && (
          <section className="py-8" aria-labelledby="other-colors">
            <h2 id="other-colors" className="text-2xl font-bold mb-6">
              Other {item.modelName} colors in stock
            </h2>
            <ul className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 list-none p-0 m-0">
              {related.map((candidate) => (
                <li key={candidate.slug}>
                  <InventoryCard item={candidate} />
                </li>
              ))}
            </ul>
          </section>
        )}

        {otherModel.length > 0 && (
          <section className="py-8" aria-labelledby="other-model">
            <h2 id="other-model" className="text-2xl font-bold mb-6">
              Also consider the {otherModel[0].modelName}
            </h2>
            <ul className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 list-none p-0 m-0">
              {otherModel.map((candidate) => (
                <li key={candidate.slug}>
                  <InventoryCard item={candidate} />
                </li>
              ))}
            </ul>
          </section>
        )}

        <div className="py-8">
          <Link href="/inventory">
            <Button variant="ghost" className="gap-2">
              <ArrowLeft className="w-4 h-4" aria-hidden="true" />
              Back to all inventory
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
