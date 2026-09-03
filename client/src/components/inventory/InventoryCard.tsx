import { Link } from "wouter";
import { ChevronRight, Users, Zap } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ResponsiveImage } from "@/components/ResponsiveImage";
import { formatPrice, type InventoryItem } from "@/lib/inventory";

/** One inventory item in a listing grid. */
export function InventoryCard({ item, priority = false }: { item: InventoryItem; priority?: boolean }) {
  const href = `/inventory/${item.slug}`;

  return (
    <Card className="overflow-hidden flex flex-col hover-elevate" data-testid={`inventory-card-${item.slug}`}>
      <Link href={href}>
        <div className="aspect-[4/3] bg-gradient-to-br from-muted to-muted/50 p-4 cursor-pointer">
          <ResponsiveImage
            name={item.image}
            alt={item.imageAlt}
            sizes="(min-width: 1024px) 30vw, (min-width: 640px) 45vw, 92vw"
            priority={priority}
            className="w-full h-full object-contain"
          />
        </div>
      </Link>

      <div className="p-5 flex flex-col flex-1">
        <div className="flex items-start justify-between gap-2 mb-2">
          <h3 className="font-bold leading-tight">
            <Link href={href}>
              <span className="cursor-pointer hover:text-primary transition-colors">{item.title}</span>
            </Link>
          </h3>
          <Badge variant={item.condition === "new" ? "default" : "secondary"} className="shrink-0 capitalize">
            {item.condition}
          </Badge>
        </div>

        <dl className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-muted-foreground mb-4">
          <div className="flex items-center gap-1">
            <Users className="w-4 h-4" aria-hidden="true" />
            <dt className="sr-only">Seats</dt>
            <dd>{item.seats} seats</dd>
          </div>
          <div className="flex items-center gap-1">
            <Zap className="w-4 h-4" aria-hidden="true" />
            <dt className="sr-only">Drive</dt>
            <dd>{item.drive.toUpperCase()}</dd>
          </div>
          <div>
            <dt className="sr-only">Range</dt>
            <dd>
              {item.rangeMilesMin}-{item.rangeMilesMax} mi
            </dd>
          </div>
        </dl>

        <div className="mt-auto flex items-center justify-between gap-3">
          <div>
            <p className="text-xs text-muted-foreground">Price</p>
            <p className="text-xl font-bold tabular-nums">{formatPrice(item.price, item.priceCurrency)}</p>
          </div>
          <Link href={href}>
            <Button size="sm" className="gap-1" data-testid={`button-view-${item.slug}`}>
              View
              <ChevronRight className="w-4 h-4" aria-hidden="true" />
            </Button>
          </Link>
        </div>
      </div>
    </Card>
  );
}
