import { Phone } from "lucide-react";

import { SITE } from "@/config/site";

/**
 * Sticky mobile call button.
 *
 * The phone number is the site's primary conversion path, and on a phone the
 * cheapest possible action is a tap that dials. Hidden on large screens, where
 * the header CTA is always visible.
 */
export function StickyCallButton() {
  return (
    <div className="lg:hidden fixed bottom-0 left-0 right-0 z-40 p-3 bg-background/95 backdrop-blur-md border-t border-border">
      <a
        href={SITE.phoneHref}
        className="flex items-center justify-center gap-2 w-full rounded-md bg-primary px-4 py-3 font-semibold text-primary-foreground shadow-lg active:scale-[0.99] transition-transform"
        data-testid="button-sticky-call"
      >
        <Phone className="w-5 h-5" aria-hidden="true" />
        Call {SITE.phoneDisplay}
      </a>
    </div>
  );
}
