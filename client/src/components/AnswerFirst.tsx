import { cn } from "@/lib/utils";

/**
 * The answer-first block that opens a page.
 *
 * Answer engines quote a direct, self-contained answer far more readily than
 * they quote marketing copy, so every substantial page states its core answer in
 * plain prose above the fold, before anything persuasive. Rendered as real text,
 * not an image or an accordion, so it is extractable.
 */
export function AnswerFirst({
  question,
  answer,
  className,
}: {
  /** Rendered as a visually subdued lead-in; the answer carries the weight. */
  question?: string;
  answer: string;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "rounded-xl border border-border bg-card/60 p-5 sm:p-6 max-w-3xl",
        className,
      )}
    >
      {question && (
        <p className="text-xs font-semibold uppercase tracking-wider text-primary mb-2">{question}</p>
      )}
      <p className="text-base sm:text-lg leading-relaxed text-foreground">{answer}</p>
    </div>
  );
}
