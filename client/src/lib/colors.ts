import { models } from "@/data/models";

/**
 * Display name for a normalized color value ("sky-blue" -> "Sky Blue").
 * Alt text and headings read the label; URLs and filters use the value.
 */
export function colorLabel(value: string): string {
  for (const model of models) {
    const match = model.colors.find((color) => color.value === value);
    if (match) return match.name;
  }
  return value
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}
