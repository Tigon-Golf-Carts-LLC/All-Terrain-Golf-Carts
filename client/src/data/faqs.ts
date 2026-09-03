/**
 * FAQ content, shared between the rendered accordion and the FAQPage schema.
 *
 * One source means the markup can never claim a question the page does not show,
 * which is the most common way FAQPage markup gets flagged.
 */

export interface Faq {
  question: string;
  answer: string;
}

/** Pillar page FAQ. Answers lead with the fact, then the detail. */
export const HOME_FAQS: Faq[] = [
  {
    question: "What is an all terrain golf cart?",
    answer:
      "An all terrain golf cart is a lifted electric cart with four-wheel drive, oversized all-terrain tires and suspension built for unpaved ground. Unlike a standard cart, which drives two wheels on manicured turf, it powers all four wheels so it keeps traction on sand, mud, wet grass and gravel.",
  },
  {
    question: "How much does an all terrain golf cart cost?",
    answer:
      "New 4X4 all terrain golf carts cost $15,595 to $17,595. The 4-passenger EVolution D-MAX XT4 starts at $15,595 and the 6-passenger XT6 at $17,595, both including the 48V lithium pack, all-terrain wheels and tires, and the street-legal LSV equipment package.",
  },
  {
    question: "Are all terrain golf carts street legal?",
    answer:
      "Yes, when equipped as a Low Speed Vehicle and registered with your state. The D-MAX XT4 and XT6 ship with headlights, taillights, turn signals, a horn, mirrors, DOT-approved tires, 3-point seat belts and a VIN, which is what state DMVs require for road use up to 25 MPH.",
  },
  {
    question: "How far can an all terrain golf cart go on one charge?",
    answer:
      "The D-MAX XT4 covers 40-50 miles per charge and the XT6 covers 30-50 miles, both on a 48V lithium pack. Sustained 4X4 use, hills and a full passenger load pull the real figure toward the lower end of each range.",
  },
  {
    question: "How fast do all terrain golf carts go?",
    answer:
      "Up to 25 MPH, which is the federal ceiling for a Low Speed Vehicle. Both the D-MAX XT4 and XT6 are geared to it. Carts limited to 19 MPH or less are not LSVs and generally cannot be registered for road use.",
  },
  {
    question: "What makes the EVolution D-MAX different from other golf carts?",
    answer:
      "Two independent 6.3kW electric motors, one per axle, engaged on demand for 12.6kW combined. There is no transfer case or driveshaft: the axles are linked electronically, so all four wheels can be driven instantly with nothing to shift.",
  },
  {
    question: "Do you deliver nationwide?",
    answer:
      "Yes. Delivery is available to all 50 states and U.S. territories, including Alaska, Hawaii, Puerto Rico and Guam. Delivery is quoted separately and depends on the destination.",
  },
  {
    question: "How many people can an all terrain golf cart carry?",
    answer:
      "Four in the D-MAX XT4 and six in the XT6, with a 3-point seat belt for every seat. The XT4 also carries a 2,270 lb payload, so it can be loaded well beyond passenger weight.",
  },
];

export const CONTACT_FAQS: Faq[] = [
  {
    question: "What is the fastest way to get pricing?",
    answer:
      "Call (844) 884-6744. Pricing depends on model, color, options and delivery destination, and a phone call settles all four in one conversation. Email sales@tigongolfcarts.com if you would rather have it in writing.",
  },
  {
    question: "What are your hours?",
    answer:
      "Monday through Saturday, 9:00 AM to 5:00 PM. Calls outside those hours are returned the next business day.",
  },
  {
    question: "Can I see a cart before buying?",
    answer:
      "Yes. Call (844) 884-6744 to arrange a viewing or test drive. Because delivery is nationwide, what is available near you depends on your location.",
  },
  {
    question: "How long does delivery take?",
    answer:
      "It depends on the destination and on whether the configuration you want is in stock. Call (844) 884-6744 with your model, color and ZIP code for a delivery timeline.",
  },
];

export const FINANCING_FAQS: Faq[] = [
  {
    question: "Can I finance an all terrain golf cart?",
    answer:
      "Yes. Financing is available with flexible monthly terms on both the D-MAX XT4 and XT6. The monthly payment depends on the model, the term length and the down payment.",
  },
  {
    question: "What credit score do I need?",
    answer:
      "Approval depends on the lender's full review, not on a score alone. Call (844) 884-6744 to discuss options; there are programs across a range of credit profiles.",
  },
  {
    question: "How much is the down payment?",
    answer:
      "It varies by program and by the amount financed. A larger down payment lowers the monthly payment and often improves the rate offered.",
  },
  {
    question: "What do I need to apply?",
    answer:
      "Typically photo identification, proof of income and proof of address, plus the model and configuration you want so the amount financed is known. Call (844) 884-6744 to start.",
  },
];
