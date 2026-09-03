import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Phone } from "lucide-react";
import { SITE } from "@/config/site";

interface ColorOption {
  name: string;
  value: string;
  hex: string;
}

interface ColorSwatchesProps {
  model: "xt4" | "xt6";
  selectedColor: string;
  onColorChange: (color: string) => void;
}

const colorOptions: ColorOption[] = [
  { name: "White", value: "white", hex: "#FFFFFF" },
  { name: "Black", value: "black", hex: "#1a1a1a" },
  { name: "Blue", value: "blue", hex: "#1e40af" },
  { name: "Gray", value: "gray", hex: "#6b7280" },
  { name: "Red", value: "red", hex: "#dc2626" },
  { name: "Sky Blue", value: "sky-blue", hex: "#0ea5e9" },
];

export function ColorSwatches({ model, selectedColor, onColorChange }: ColorSwatchesProps) {
  const [hoveredColor, setHoveredColor] = useState<string | null>(null);

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="flex flex-wrap justify-center gap-3 sm:gap-4">
        {colorOptions.map((color) => (
          <button
            key={color.value}
            onClick={() => onColorChange(color.value)}
            onMouseEnter={() => setHoveredColor(color.value)}
            onMouseLeave={() => setHoveredColor(null)}
            className={`group relative w-12 h-12 sm:w-14 sm:h-14 lg:w-16 lg:h-16 rounded-full transition-all duration-200 ${
              selectedColor === color.value
                ? "ring-4 ring-primary ring-offset-2 ring-offset-background scale-110"
                : "hover:scale-105"
            }`}
            style={{ backgroundColor: color.hex }}
            data-testid={`swatch-${model}-${color.value}`}
            aria-label={`Select ${color.name} color`}
          >
            {color.value === "white" && (
              <span className="absolute inset-0 rounded-full border border-border" />
            )}
            {selectedColor === color.value && (
              <span className="absolute inset-0 flex items-center justify-center">
                <svg
                  className={`w-5 h-5 sm:w-6 sm:h-6 ${
                    color.value === "white" || color.value === "sky-blue"
                      ? "text-gray-800"
                      : "text-white"
                  }`}
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={3}
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              </span>
            )}
          </button>
        ))}
      </div>
      <p className="text-sm font-medium text-muted-foreground h-5">
        {hoveredColor
          ? colorOptions.find((c) => c.value === hoveredColor)?.name
          : colorOptions.find((c) => c.value === selectedColor)?.name}
      </p>
      <a href={SITE.phoneHref} className="w-full mt-2">
        <Button variant="outline" className="w-full gap-2" data-testid="button-talk-real-person">
          <Phone className="w-4 h-4" />
          Talk To A Real Person
        </Button>
      </a>
    </div>
  );
}
