import { Link } from "wouter";
import { CheckCircle2, Clock, Mail, MapPin, Phone } from "lucide-react";

import { AnswerFirst } from "@/components/AnswerFirst";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { FaqSection } from "@/components/FaqSection";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { SITE } from "@/config/site";
import { CONTACT_FAQS } from "@/data/faqs";
import { models } from "@/data/models";

/**
 * Contact page.
 *
 * The old form POSTed to `/api/contact`, which sent mail through Gmail SMTP.
 * GitHub Pages runs no server, so there is nothing to POST to. Rather than ship
 * a form that silently fails, every path here is a real link the browser can
 * act on with no backend: `tel:` to dial and `mailto:` with a prefilled subject
 * and body so the visitor does not have to compose an inquiry from scratch.
 */

function mailto(subject: string, lines: string[]): string {
  return `mailto:${SITE.emailSales}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(lines.join("\n"))}`;
}

const GENERAL_INQUIRY = mailto("All Terrain Golf Cart Inquiry", [
  "I'd like more information about an all terrain golf cart.",
  "",
  "Name:",
  "Phone:",
  "Delivery ZIP code:",
  "Model I'm interested in (XT4 / XT6 / not sure):",
  "",
  "Questions:",
]);

const TEST_DRIVE = mailto("Test Drive Request", [
  "I'd like to arrange a test drive.",
  "",
  "Name:",
  "Phone:",
  "City and state:",
  "Model I'd like to drive (XT4 / XT6 / both):",
  "Preferred days and times:",
]);

export default function Contact() {
  return (
    <div className="min-h-screen pt-20 pb-24 lg:pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <Breadcrumbs path="/contact" className="pt-6" />

        <section className="py-8 lg:py-12">
          <Badge variant="outline" className="mb-4">
            Get In Touch
          </Badge>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-6">Let's Talk About Your Next Ride</h1>
          <AnswerFirst
            question="How do I reach you?"
            answer={`Call ${SITE.phoneDisplay} to reach a real person Monday through Saturday, 9:00 AM to 5:00 PM. For pricing, availability or delivery questions in writing, email ${SITE.emailSales}. We deliver 4X4 all terrain golf carts nationwide.`}
          />
        </section>

        <div className="grid lg:grid-cols-3 gap-8 lg:gap-12 pb-12">
          <div className="lg:col-span-2 space-y-6">
            <Card className="p-6 lg:p-8">
              <h2 className="text-2xl font-bold mb-2">Call us — it is the fastest way</h2>
              <p className="text-muted-foreground mb-6">
                Pricing depends on model, color, options and delivery destination. A phone call settles all four in
                one conversation, and you speak to someone who knows the carts rather than filling in a form.
              </p>
              <a href={SITE.phoneHref} className="block">
                <Button size="lg" className="w-full gap-2 text-base" data-testid="button-contact-call">
                  <Phone className="w-5 h-5" aria-hidden="true" />
                  Call {SITE.phoneDisplay}
                </Button>
              </a>
            </Card>

            <Card className="p-6 lg:p-8">
              <h2 className="text-2xl font-bold mb-2">Prefer to write?</h2>
              <p className="text-muted-foreground mb-6">
                These open your own email app with the subject and a short checklist already filled in, so nothing
                important gets left out. Replies go to {SITE.emailSales} and are answered within one business day.
              </p>
              <div className="grid sm:grid-cols-2 gap-3">
                <a href={GENERAL_INQUIRY}>
                  <Button variant="outline" size="lg" className="w-full gap-2" data-testid="button-email-inquiry">
                    <Mail className="w-5 h-5" aria-hidden="true" />
                    Email an inquiry
                  </Button>
                </a>
                <a href={TEST_DRIVE}>
                  <Button variant="outline" size="lg" className="w-full gap-2" data-testid="button-email-test-drive">
                    <Mail className="w-5 h-5" aria-hidden="true" />
                    Request a test drive
                  </Button>
                </a>
              </div>
            </Card>

            <Card className="p-6 lg:p-8">
              <h2 className="text-2xl font-bold mb-4">Ask about a specific model</h2>
              <p className="text-muted-foreground mb-6">
                Already know which cart you want? These emails name the model for you.
              </p>
              <div className="grid sm:grid-cols-2 gap-3">
                {models.map((model) => (
                  <a
                    key={model.id}
                    href={mailto(`${model.name} Inquiry`, [
                      `I'm interested in the ${model.name} (${model.seats}-passenger, from $${model.price.toLocaleString("en-US")}).`,
                      "",
                      "Name:",
                      "Phone:",
                      "Delivery ZIP code:",
                      "Preferred color:",
                      "",
                      "Questions:",
                    ])}
                  >
                    <Button variant="outline" className="w-full justify-start gap-2" data-testid={`button-email-${model.id}`}>
                      <Mail className="w-4 h-4 shrink-0" aria-hidden="true" />
                      {model.shortName} &mdash; ${model.price.toLocaleString("en-US")}
                    </Button>
                  </a>
                ))}
              </div>
              <p className="mt-6 text-sm text-muted-foreground">
                Or browse{" "}
                <Link href="/inventory">
                  <span className="text-primary underline cursor-pointer">every configuration in stock</span>
                </Link>{" "}
                and email about a specific cart from its own page.
              </p>
            </Card>
          </div>

          <div className="space-y-6">
            <Card className="p-6">
              <h2 className="font-bold text-lg mb-4">Contact Information</h2>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-md bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <Phone className="w-5 h-5 text-primary" aria-hidden="true" />
                  </div>
                  <div>
                    <p className="font-medium">Phone</p>
                    <a
                      href={SITE.phoneHref}
                      className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                      data-testid="link-contact-phone"
                    >
                      {SITE.phoneDisplay}
                    </a>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-md bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <Mail className="w-5 h-5 text-primary" aria-hidden="true" />
                  </div>
                  <div>
                    <p className="font-medium">Email</p>
                    <a
                      href={`mailto:${SITE.emailSales}`}
                      className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                      data-testid="link-contact-email"
                    >
                      {SITE.emailSales}
                    </a>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-md bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <MapPin className="w-5 h-5 text-primary" aria-hidden="true" />
                  </div>
                  <div>
                    <p className="font-medium">Service area</p>
                    <p className="text-sm text-muted-foreground">
                      {SITE.areaServedNote} to all 50 states and U.S. territories.{" "}
                      <Link href="/service-areas">
                        <span className="text-primary underline cursor-pointer">Find your state</span>
                      </Link>
                    </p>
                  </div>
                </div>
              </div>
            </Card>

            <Card className="p-6">
              <h2 className="font-bold text-lg mb-4">Business Hours</h2>
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-md bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <Clock className="w-5 h-5 text-primary" aria-hidden="true" />
                </div>
                <div className="text-sm text-muted-foreground space-y-1">
                  <p>
                    <span className="font-medium text-foreground">Mon - Fri:</span> 9:00 AM - 5:00 PM
                  </p>
                  <p>
                    <span className="font-medium text-foreground">Saturday:</span> 9:00 AM - 5:00 PM
                  </p>
                  <p>
                    <span className="font-medium text-foreground">Sunday:</span> Closed
                  </p>
                </div>
              </div>
            </Card>

            <Card className="p-6 bg-primary text-primary-foreground">
              <h2 className="font-bold text-lg mb-2">Schedule a Test Drive</h2>
              <p className="text-sm text-primary-foreground/90 mb-4">
                Experience the power of 4X4 firsthand. Schedule your test drive today.
              </p>
              <Button variant="secondary" className="w-full" asChild>
                <a href={SITE.phoneHref} data-testid="button-call-now">
                  Call {SITE.phoneDisplay}
                </a>
              </Button>
            </Card>
          </div>
        </div>
      </div>

      <section className="py-12 bg-card">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold mb-4 text-center">Why Choose ALL Terrain Golf Carts?</h2>
          <div className="grid sm:grid-cols-3 gap-6 mt-8">
            {[
              {
                title: "Authorized Dealer",
                body: "Official EVolution dealer with factory-trained technicians",
              },
              {
                title: "Full Service Support",
                body: "Complete service, maintenance, and parts department",
              },
              {
                title: "Financing Available",
                body: "Flexible financing options to fit your budget",
              },
            ].map((item) => (
              <div key={item.title} className="text-center">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                  <CheckCircle2 className="w-6 h-6 text-primary" aria-hidden="true" />
                </div>
                <h3 className="font-semibold mb-2">{item.title}</h3>
                <p className="text-sm text-muted-foreground">{item.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <FaqSection faqs={CONTACT_FAQS} heading="Contact questions" />
    </div>
  );
}
