import snapshot from "@/data/inventory.json";
import { InventoryListing } from "@/components/inventory/InventoryListing";
import { useInventoryQuery } from "@/components/inventory/useInventoryQuery";
import { models } from "@/data/models";
import { formatPrice, type InventorySnapshot } from "@/lib/inventory";

const inventory = snapshot as unknown as InventorySnapshot;

/** The unfiltered listing at `/inventory/`. */
export default function Inventory() {
  const query = useInventoryQuery(inventory.items);

  const prices = inventory.items.map((item) => item.price);
  const low = Math.min(...prices);
  const high = Math.max(...prices);

  return (
    <InventoryListing
      path="/inventory"
      heading="All Terrain Golf Cart Inventory"
      question="What all terrain golf carts are in stock?"
      answer={`There are ${inventory.count} all terrain golf cart configurations in stock right now, priced from ${formatPrice(low)} to ${formatPrice(high)}. Every one is a new 4X4 EVolution D-MAX with a 48V lithium pack and a street-legal LSV package, available across ${models.length} models and six exterior colors.`}
      query={query}
      updatedAt={inventory.updatedAt}
      totalInStock={inventory.count}
    />
  );
}
