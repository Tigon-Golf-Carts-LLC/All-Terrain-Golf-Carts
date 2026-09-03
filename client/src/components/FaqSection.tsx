import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import type { Faq } from "@/data/faqs";

/**
 * A rendered FAQ list.
 *
 * The questions are real headings inside the accordion trigger and the answers
 * are real text in the markup, so the same content backs both the visible
 * section and the FAQPage JSON-LD. Nothing here is loaded on demand.
 */
export function FaqSection({
  faqs,
  heading = "Frequently Asked Questions",
  intro,
  id = "faq",
}: {
  faqs: Faq[];
  heading?: string;
  intro?: string;
  id?: string;
}) {
  if (faqs.length === 0) return null;

  return (
    <section className="py-16 lg:py-24" id={id}>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-3xl sm:text-4xl font-bold mb-4">{heading}</h2>
        {intro && <p className="text-lg text-muted-foreground mb-8">{intro}</p>}
        <Accordion type="single" collapsible className="w-full">
          {faqs.map((faq, index) => (
            <AccordionItem key={faq.question} value={`faq-${index}`}>
              <AccordionTrigger className="text-left text-base sm:text-lg font-semibold">
                <h3 className="font-semibold">{faq.question}</h3>
              </AccordionTrigger>
              <AccordionContent className="text-base leading-relaxed text-muted-foreground">
                {faq.answer}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </section>
  );
}
