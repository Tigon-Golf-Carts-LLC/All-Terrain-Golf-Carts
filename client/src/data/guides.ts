/**
 * The topic cluster supporting the "All Terrain Golf Carts" pillar page.
 *
 * Each guide is written answer-first: a 40-60 word plain-language summary that
 * directly answers the page's core question, then question-shaped headings with
 * a concise answer under each, then the supporting detail. Facts come from the
 * D-MAX XT4/XT6 spec sheets and the live catalog, not from generalities, because
 * generic pages do not get cited.
 */

export type GuideBlock =
  | { type: "p"; text: string }
  | { type: "h2"; text: string }
  | { type: "h3"; text: string }
  | { type: "ul"; items: string[] }
  | { type: "ol"; items: string[] }
  | { type: "table"; caption: string; head: string[]; rows: string[][] };

export interface GuideFaq {
  question: string;
  answer: string;
}

export interface Guide {
  slug: string;
  /** <h1> */
  title: string;
  /** Breadcrumb label. */
  shortTitle: string;
  /** <= 60 chars. */
  seoTitle: string;
  /** <= 155 chars. */
  metaDescription: string;
  /** The core question this page answers. */
  question: string;
  /** 40-60 word answer, rendered above the fold before any marketing copy. */
  answer: string;
  datePublished: string;
  dateModified: string;
  heroImage: string;
  heroAlt: string;
  /** Related guide slugs, rendered with descriptive anchor text. */
  related: string[];
  blocks: GuideBlock[];
  faqs: GuideFaq[];
}

export const GUIDES: Guide[] = [
  {
    slug: "what-is-an-all-terrain-golf-cart",
    title: "What Is an All Terrain Golf Cart?",
    shortTitle: "What Is an All Terrain Cart",
    seoTitle: "What Is an All Terrain Golf Cart?",
    metaDescription:
      "An all terrain golf cart is a lifted, four-wheel-drive electric cart built for sand, mud and gravel. What separates one from a standard cart.",
    question: "What is an all terrain golf cart?",
    answer:
      "An all terrain golf cart is a lifted electric cart with four-wheel drive, oversized all-terrain tires and suspension built for unpaved ground. Unlike a standard cart, which drives two wheels on manicured turf, an all terrain cart powers all four wheels so it keeps traction on sand, mud, wet grass and gravel.",
    datePublished: "2026-02-02",
    dateModified: "2026-09-03",
    heroImage: "ALL_TERRAIN_GOLF_CARTS_(6)_1768408640431.jpg",
    heroAlt: "All terrain golf cart on a mountain trail showing its lifted suspension and all-terrain tires",
    related: ["4x4-vs-2wd-golf-carts", "all-terrain-golf-cart-cost", "street-legal-all-terrain-golf-carts"],
    blocks: [
      {
        type: "h2",
        text: "What makes a golf cart an all terrain golf cart?",
      },
      {
        type: "p",
        text: "Three things, and all three have to be present. A drivetrain that powers all four wheels, tires and ground clearance sized for unpaved ground, and a chassis and braking system rated for the extra load that comes with both. A standard cart with knobby tires bolted on is still a two-wheel-drive cart that will spin on a wet slope.",
      },
      {
        type: "ul",
        items: [
          "Drivetrain: two independent electric motors, one per axle, rather than a single rear motor. On the EVolution D-MAX that is two 6.3kW AC motors for 12.6kW combined.",
          'Tires and clearance: 16" x 8.5" aluminum wheels with 24x10R16 all-terrain tires, rather than the 8" turf tires on a standard cart.',
          "Brakes and steering: hydraulic disc brakes and electric power steering, both sized for the higher unsprung mass of larger wheels.",
          "Battery: a 48V lithium pack with battery management, which holds voltage under the sustained load that climbing puts on a motor.",
        ],
      },
      {
        type: "h2",
        text: "How is it different from a standard golf cart?",
      },
      {
        type: "p",
        text: "A standard golf cart is optimized for a maintained fairway: light, cheap to build, and geared for flat ground. An all terrain cart trades some of that efficiency for traction and durability. The table below compares the two on the specifications that actually change how the cart behaves.",
      },
      {
        type: "table",
        caption: "Standard golf cart vs. all terrain golf cart",
        head: ["Specification", "Standard golf cart", "All terrain golf cart (D-MAX)"],
        rows: [
          ["Driven wheels", "2 (rear)", "4 (on-demand 4X4)"],
          ["Motor output", "3-5kW single motor", "12.6kW (dual 6.3kW)"],
          ["Wheels", '8"-10" turf', '16" x 8.5" aluminum'],
          ["Tires", "Turf / street", "24x10R16 all-terrain"],
          ["Brakes", "Mechanical drum", "Hydraulic disc"],
          ["Steering", "Manual rack", "Electric power steering"],
          ["Typical range", "20-30 miles (lead-acid)", "40-50 miles (48V lithium)"],
          ["Top speed", "12-19 MPH", "25 MPH (LSV)"],
        ],
      },
      {
        type: "h2",
        text: "What is an all terrain golf cart actually used for?",
      },
      {
        type: "p",
        text: "Very little of the use is golf. The pattern across deliveries is property transport on ground a standard cart cannot cross reliably.",
      },
      {
        type: "ul",
        items: [
          "Hunting and rural property: moving people and gear on unimproved tracks, often loaded near the 2,270 lb payload limit.",
          "Lake and beach houses: soft sand and boat-ramp inclines, where a two-wheel-drive cart digs in.",
          "Gated and golf communities: street-legal LSV registration allows road use up to 25 MPH between homes and amenities.",
          "Resorts and campgrounds: 6-passenger shuttling on gravel service roads.",
          "Snow-belt properties: winter driveway and outbuilding access, where the lithium pack matters more than the tires.",
        ],
      },
      {
        type: "h2",
        text: "Is an all terrain golf cart worth the extra cost?",
      },
      {
        type: "p",
        text: "It depends entirely on the ground. On maintained turf and pavement, the 4X4 system is dead weight and a standard cart is the better buy. The moment the route includes sand, a wet slope, loose gravel or a ditch crossing, a two-wheel-drive cart becomes a recovery problem and the difference in purchase price stops being the deciding factor.",
      },
    ],
    faqs: [
      {
        question: "What is an all terrain golf cart?",
        answer:
          "A lifted electric golf cart with four-wheel drive, oversized all-terrain tires and suspension built for unpaved ground. It powers all four wheels, so it keeps traction on sand, mud, wet grass and gravel where a standard two-wheel-drive cart spins.",
      },
      {
        question: "Can an all terrain golf cart go on the road?",
        answer:
          "Yes, when it is equipped as a Low Speed Vehicle and registered. The D-MAX XT4 and XT6 ship with headlights, taillights, turn signals, a horn, mirrors, DOT-approved tires, 3-point belts and a VIN, which is what state DMVs require for road use up to 25 MPH.",
      },
      {
        question: "How fast does an all terrain golf cart go?",
        answer:
          "Up to 25 MPH. That is the federal ceiling for a Low Speed Vehicle, and both the D-MAX XT4 and XT6 are geared to it. Carts limited to 19 MPH or less are not LSVs and generally cannot be registered for road use.",
      },
      {
        question: "How far can an all terrain golf cart travel on one charge?",
        answer:
          "The D-MAX XT4 covers 40-50 miles per charge and the XT6 covers 30-50 miles, both on a 48V lithium pack. Sustained 4X4 use, hills and full passenger loads pull the real figure toward the lower end of each range.",
      },
    ],
  },

  {
    slug: "all-terrain-golf-cart-cost",
    title: "How Much Does an All Terrain Golf Cart Cost?",
    shortTitle: "Cost",
    seoTitle: "How Much Does an All Terrain Golf Cart Cost?",
    metaDescription:
      "All terrain golf carts run $15,595 to $17,595 new. Here is exactly what the price covers, what the options add, and the ongoing cost of ownership.",
    question: "How much does an all terrain golf cart cost?",
    answer:
      "A new 4X4 all terrain golf cart costs $15,595 to $17,595. The 4-passenger EVolution D-MAX XT4 starts at $15,595 and the 6-passenger XT6 at $17,595. Both prices include the 48V lithium pack, dual motors, all-terrain wheels and tires, and the street-legal LSV equipment package.",
    datePublished: "2026-02-04",
    dateModified: "2026-09-03",
    heroImage: "ALL_TERRAIN_GOLF_CARTS_(7)_1768408640431.jpg",
    heroAlt: "All terrain golf cart parked outside a resort clubhouse, shown from the front three-quarter angle",
    related: ["what-is-an-all-terrain-golf-cart", "lithium-vs-lead-acid-golf-cart-batteries", "4x4-vs-2wd-golf-carts"],
    blocks: [
      { type: "h2", text: "What do all terrain golf carts cost new?" },
      {
        type: "p",
        text: "Two models, two prices, and no trim ladder between them. The difference is seating and body length, not capability: both carts use the same dual-motor 4X4 drivetrain and the same 48V lithium architecture.",
      },
      {
        type: "table",
        caption: "New all terrain golf cart pricing",
        head: ["Model", "Passengers", "Drive", "Range", "Price"],
        rows: [
          ["EVolution D-MAX XT4", "4", "On-demand 4X4", "40-50 miles", "$15,595"],
          ["EVolution D-MAX XT6", "6", "Selectable 4X2 / 4X4", "30-50 miles", "$17,595"],
        ],
      },
      { type: "h2", text: "What is included in the price?" },
      {
        type: "p",
        text: "Everything below is standard equipment, not an upcharge. This matters when comparing quotes, because several of these items are commonly sold as add-ons elsewhere.",
      },
      {
        type: "ul",
        items: [
          "48V lithium battery with smart battery management and a 25A onboard charger",
          "Dual 6.3kW AC motors with a 400A AC controller",
          '16" x 8.5" aluminum wheels with all-terrain tires',
          "Hydraulic disc brakes and electric power steering",
          '10.1" touchscreen with Apple CarPlay and Android Auto',
          "LSV street-legal package: lights, turn signals, horn, mirrors, DOT tires, 3-point belts, VIN",
          "Built-in dash refrigerator and foldable rear storage basket",
        ],
      },
      { type: "h2", text: "What options add to the price?" },
      {
        type: "p",
        text: "Option pricing depends on configuration and is quoted per order. The items most often added are:",
      },
      {
        type: "ul",
        items: [
          "160Ah battery upgrade (XT6), which moves range toward the top of the 30-50 mile band",
          "Windshield wipers and washer kit",
          "Rear bumper guards and reflective trim",
          "LED light bars",
          "Extended mirrors and a license plate bracket with light",
        ],
      },
      { type: "h2", text: "What does it cost to run?" },
      {
        type: "p",
        text: "Running cost is dominated by electricity, and electricity is cheap. A 48V pack holds roughly 5-8 kWh depending on amp-hour rating, so a full charge costs well under two dollars at the U.S. average residential rate. The lithium pack removes the recurring maintenance a lead-acid cart needs.",
      },
      {
        type: "ul",
        items: [
          "Charging: under $2 for a full charge, covering 30-50 miles",
          "Battery maintenance: none. No watering, no terminal cleaning, no equalizing charges",
          "Tires: replacement interval depends on how much pavement the cart sees; all-terrain tires wear faster on asphalt than on grass",
          "Registration: LSV registration and insurance are set by your state, not by the dealer",
        ],
      },
      { type: "h2", text: "Is a used all terrain golf cart cheaper?" },
      {
        type: "p",
        text: "Usually, but the discount is smaller than buyers expect and the risk sits in the battery. A lithium pack is the single most expensive component, its remaining capacity is not visible from the outside, and it is not covered by the factory warranty once the cart changes hands. On a cart already several years old, the gap between a used price and a new price with a full warranty is often narrow enough that new wins.",
      },
    ],
    faqs: [
      {
        question: "How much does an all terrain golf cart cost?",
        answer:
          "New 4X4 all terrain golf carts cost $15,595 to $17,595. The 4-passenger EVolution D-MAX XT4 is $15,595 and the 6-passenger XT6 is $17,595, both including the lithium pack, all-terrain wheels and the street-legal LSV package.",
      },
      {
        question: "Why do all terrain golf carts cost more than regular golf carts?",
        answer:
          "The cost is in the hardware a standard cart does not have: a second motor and controller, a heavier chassis and suspension, hydraulic disc brakes, electric power steering, 16-inch wheels with all-terrain tires, and a lithium pack instead of flooded lead-acid.",
      },
      {
        question: "Can you finance an all terrain golf cart?",
        answer:
          "Yes. Financing is available with monthly terms, and the payment depends on the model, term length and down payment. Call (844) 884-6744 for a payment estimate on a specific configuration.",
      },
      {
        question: "Is delivery included in the price?",
        answer:
          "Delivery is quoted separately and depends on the destination. Delivery is available to all 50 states and U.S. territories, including Alaska and Hawaii.",
      },
    ],
  },

  {
    slug: "street-legal-all-terrain-golf-carts",
    title: "Are All Terrain Golf Carts Street Legal?",
    shortTitle: "Street Legal Rules",
    seoTitle: "Are All Terrain Golf Carts Street Legal?",
    metaDescription:
      "All terrain golf carts are street legal when equipped as a Low Speed Vehicle and registered. Here is the required equipment and how state rules differ.",
    question: "Are all terrain golf carts street legal?",
    answer:
      "Yes, when the cart is equipped as a Low Speed Vehicle and registered with your state. An LSV must reach 20-25 MPH and carry headlights, taillights, turn signals, a horn, mirrors, a windshield, DOT-approved tires, 3-point seat belts and a VIN. Which roads it may then use is decided by state and local law.",
    datePublished: "2026-02-06",
    dateModified: "2026-09-03",
    heroImage: "ALL_TERRAIN_GOLF_CARTS_1768408640432.jpg",
    heroAlt: "Street-legal all terrain golf cart on a lakeside road with headlights and mirrors visible",
    related: ["what-is-an-all-terrain-golf-cart", "all-terrain-golf-cart-cost", "4x4-vs-2wd-golf-carts"],
    blocks: [
      { type: "h2", text: "What makes a golf cart street legal?" },
      {
        type: "p",
        text: "Federal law defines a Low Speed Vehicle as a four-wheeled vehicle with a top speed above 20 MPH but not more than 25 MPH. An LSV must carry a specific equipment list and a VIN, and it is then registered like a vehicle rather than titled as equipment. A cart limited to 19 MPH is not an LSV and in most states cannot be registered for road use at all.",
      },
      {
        type: "table",
        caption: "LSV equipment required for street-legal registration",
        head: ["Equipment", "On the D-MAX XT4 / XT6"],
        rows: [
          ["Headlights and taillights", "Standard (LED)"],
          ["Turn signals and brake lights", "Standard"],
          ["Horn", "Standard"],
          ["Side and rearview mirrors", "Standard"],
          ["Windshield", "Standard (foldable, wipers optional)"],
          ["DOT-approved tires", "Standard"],
          ["3-point seat belts, all seats", "Standard"],
          ["VIN", "Standard"],
          ["Top speed 20-25 MPH", "25 MPH"],
        ],
      },
      { type: "h2", text: "Which roads can a street-legal cart use?" },
      {
        type: "p",
        text: "Registration makes the cart legal; local law decides where it can go. The common pattern is that an LSV may use roads posted at 35 MPH or below, may cross higher-speed roads at a controlled intersection, and may not travel along a highway. The threshold varies: some states cap it at 25 MPH roads, others at 35 or 45.",
      },
      {
        type: "p",
        text: "Because the rules are set locally, check your own state before buying for road use. Every state and territory has its own page on this site with the current rules and the local uses that matter there.",
      },
      { type: "h2", text: "What do I need to register one?" },
      {
        type: "ol",
        items: [
          "A cart that meets the LSV equipment list and has a VIN.",
          "The manufacturer's certificate of origin or title, provided at delivery.",
          "Proof of insurance, if your state requires it for an LSV.",
          "A DMV application for a low speed vehicle registration and plate.",
          "A driver's license. Most states require one to operate an LSV on a public road.",
        ],
      },
      { type: "h2", text: "Does off-road use need any of this?" },
      {
        type: "p",
        text: "No. On private property the LSV requirements do not apply, and none of the registration steps are needed. The equipment still earns its keep: lights and mirrors matter as much on a wooded track at dusk as they do on a street.",
      },
    ],
    faqs: [
      {
        question: "Are all terrain golf carts street legal?",
        answer:
          "Yes, when equipped as a Low Speed Vehicle and registered with your state. That means headlights, taillights, turn signals, a horn, mirrors, a windshield, DOT tires, 3-point belts, a VIN and a top speed between 20 and 25 MPH.",
      },
      {
        question: "Do I need a driver's license to drive a street-legal golf cart?",
        answer:
          "In most states, yes. An LSV on a public road is operated under the same licensing rules as a car. Requirements for private-property use are different and generally have no licensing requirement.",
      },
      {
        question: "Do street-legal golf carts need insurance?",
        answer:
          "In most states that allow LSV registration, yes. The requirement and the minimum coverage are set by your state, so confirm with your insurer before registering.",
      },
      {
        question: "Can I make a standard golf cart street legal?",
        answer:
          "Only if it can exceed 20 MPH and can be fitted with the full LSV equipment list including a VIN. Many standard carts are geared below 20 MPH, which disqualifies them regardless of what equipment is added.",
      },
    ],
  },

  {
    slug: "lithium-vs-lead-acid-golf-cart-batteries",
    title: "Lithium vs Lead-Acid Golf Cart Batteries",
    shortTitle: "Lithium vs Lead-Acid",
    seoTitle: "Lithium vs Lead Acid Golf Cart Batteries",
    metaDescription:
      "Lithium golf cart batteries last longer, charge faster and need no upkeep. How they compare with lead-acid on range, weight, lifespan and cost.",
    question: "Should a golf cart use lithium or lead-acid batteries?",
    answer:
      "Lithium, for almost any all terrain use. A 48V lithium pack weighs roughly half what an equivalent lead-acid bank weighs, holds voltage under load instead of fading, charges faster, tolerates partial charging, and needs no watering. Lead-acid costs less up front and that is its only remaining advantage.",
    datePublished: "2026-02-08",
    dateModified: "2026-09-03",
    heroImage: "ALL_TERRAIN_GOLF_CARTS_(5)_1768408640430.jpg",
    heroAlt: "All terrain golf cart on a forest trail, powered by a 48-volt lithium battery pack",
    related: ["all-terrain-golf-cart-cost", "what-is-an-all-terrain-golf-cart", "all-terrain-golf-cart-tires-and-suspension"],
    blocks: [
      { type: "h2", text: "How do lithium and lead-acid compare?" },
      {
        type: "table",
        caption: "48V lithium vs. flooded lead-acid in a golf cart",
        head: ["Factor", "Lithium (48V)", "Flooded lead-acid"],
        rows: [
          ["Usable capacity", "~90-100% of rated", "~50% before damage"],
          ["Weight", "~half of lead-acid", "Baseline (heaviest component)"],
          ["Voltage under load", "Holds near-flat", "Sags as it discharges"],
          ["Charge time", "Faster; partial charging is fine", "Slower; needs full cycles"],
          ["Maintenance", "None", "Watering, terminal cleaning, equalizing"],
          ["Typical service life", "8-10+ years", "3-5 years"],
          ["Cold-weather behavior", "Good; charging below freezing is limited", "Capacity drops sharply"],
          ["Up-front cost", "Higher", "Lower"],
        ],
      },
      { type: "h2", text: "Why does the difference matter more on a 4X4 cart?" },
      {
        type: "p",
        text: "Because a 4X4 cart spends its time doing the thing lead-acid handles worst: drawing high current for a sustained period. Climbing a wet slope with two motors engaged is a heavy, continuous load. A lead-acid bank sags under it, which shows up as the cart losing pace partway up. A lithium pack holds voltage, so the last mile drives like the first.",
      },
      { type: "h2", text: "What about the usable-capacity difference?" },
      {
        type: "p",
        text: "This is the number most comparisons miss. A lead-acid bank should not be discharged past about half its rated capacity without shortening its life sharply, so a nominally larger lead-acid bank often delivers less real range than a smaller lithium pack. Rated amp-hours are not comparable across the two chemistries.",
      },
      { type: "h2", text: "Are there reasons to still choose lead-acid?" },
      {
        type: "ul",
        items: [
          "The up-front price is lower, which matters if the cart will be used lightly on flat ground.",
          "Replacement batteries are available at almost any local supplier.",
          "There is no charging restriction in freezing temperatures, though capacity drops badly in the cold.",
        ],
      },
      {
        type: "p",
        text: "For an all terrain cart that is expected to run 4X4 under load and last a decade, none of those outweigh the capacity, weight and maintenance differences. Every cart in the current inventory ships with a 48V lithium pack and smart battery management.",
      },
    ],
    faqs: [
      {
        question: "How long do lithium golf cart batteries last?",
        answer:
          "Typically 8-10 years or more, against 3-5 years for flooded lead-acid. Lithium tolerates partial charging and deep discharge, which is what wears a lead-acid bank out early.",
      },
      {
        question: "Can you charge a lithium golf cart battery in cold weather?",
        answer:
          "Discharging in the cold is fine, but most lithium packs limit or block charging below freezing to protect the cells. The battery management system handles this automatically; charge indoors or in a garage in winter.",
      },
      {
        question: "Is a lithium golf cart battery worth the extra cost?",
        answer:
          "For all terrain use, yes. It delivers nearly all its rated capacity instead of about half, weighs roughly half as much, lasts two to three times longer and needs no maintenance, which usually makes it cheaper per year of service.",
      },
      {
        question: "How long does it take to charge a 48V lithium golf cart?",
        answer:
          "With the 25A onboard charger on the D-MAX, a full charge from a low state of charge is an overnight job. Because partial charging does not harm lithium, most owners simply plug in after each use.",
      },
    ],
  },

  {
    slug: "all-terrain-golf-cart-tires-and-suspension",
    title: "All Terrain Golf Cart Tires and Suspension",
    shortTitle: "Tires & Suspension",
    seoTitle: "All Terrain Golf Cart Tires & Suspension",
    metaDescription:
      "How tire size, tread and suspension decide what an all terrain golf cart can cross. Covers 24x10R16 all-terrain tires, lift, clearance and brake sizing.",
    question: "What tires and suspension does an all terrain golf cart need?",
    answer:
      'An all terrain golf cart needs a taller tire with an open tread and suspension travel to match. The D-MAX runs 24x10R16 all-terrain tires on 16" x 8.5" aluminum wheels, which raises ground clearance and puts a wider contact patch on loose ground than the 8-inch turf tires on a standard cart.',
    datePublished: "2026-02-10",
    dateModified: "2026-09-03",
    heroImage: "16X8.5_Aluminum_Wheels_XT4_1768315763568.jpg",
    heroAlt: '16 by 8.5 inch aluminum wheel with 24x10R16 all-terrain tire on an EVolution D-MAX XT4',
    related: ["what-is-an-all-terrain-golf-cart", "4x4-vs-2wd-golf-carts", "lithium-vs-lead-acid-golf-cart-batteries"],
    blocks: [
      { type: "h2", text: "Why does tire size matter so much?" },
      {
        type: "p",
        text: "Tire diameter sets ground clearance, and ground clearance decides what the cart can cross without hanging up. Tire width and tread pattern set how the load is spread over soft ground. A 24-inch all-terrain tire on a 16-inch wheel clears ruts and roots that stop a cart on 8-inch turf tires, and its open tread clears mud instead of packing with it.",
      },
      {
        type: "table",
        caption: "Turf tires vs. all-terrain tires",
        head: ["Property", "Turf tire", "24x10R16 all-terrain"],
        rows: [
          ["Diameter", '18"-20"', '24"'],
          ["Tread", "Closed, shallow", "Open, deep lugs"],
          ["Best surface", "Manicured grass, pavement", "Sand, mud, gravel, wet grass"],
          ["Turf damage", "Minimal", "Higher on soft, maintained turf"],
          ["Pavement wear", "Low", "Higher"],
          ["Road noise", "Quiet", "Noticeable above 15 MPH"],
        ],
      },
      { type: "h2", text: "What does the suspension have to do?" },
      {
        type: "p",
        text: "Two jobs. Keep all four tires loaded so the 4X4 system has something to push against, and absorb the impacts a larger tire transmits. A lift that only raises the body without matching spring and damper rates gives clearance and then unloads a wheel over the first serious rut, at which point the driven wheel spins and the cart stops.",
      },
      {
        type: "ul",
        items: [
          "Suspension travel sized for the taller tire, so a wheel stays loaded across uneven ground",
          "Hydraulic disc brakes, because a 24-inch tire has more rotational inertia than mechanical drums can manage well",
          "Electric power steering, which offsets the higher steering effort a wide tire creates",
          "A chassis rated for the resulting loads: 1,499 lb curb weight and 2,270 lb payload on the XT4",
        ],
      },
      { type: "h2", text: "What is the trade-off on pavement?" },
      {
        type: "p",
        text: "All-terrain tires wear faster on asphalt, are louder above about 15 MPH, and are harder on maintained turf than turf tires. That is a real cost for a cart that mostly drives paved paths. It is the right trade only when the route regularly includes ground a turf tire cannot handle. The D-MAX XT6 can be ordered with street-ready wheels instead for exactly this reason.",
      },
      { type: "h2", text: "How should tire pressure be set?" },
      {
        type: "p",
        text: "Follow the pressure on the tire sidewall and the vehicle placard, not a general rule. Lower pressure enlarges the contact patch on sand and improves flotation, but running well below the specified pressure risks unseating the bead under cornering load and accelerates shoulder wear. Reset to the placard pressure before any extended road use.",
      },
    ],
    faqs: [
      {
        question: "What size tires do all terrain golf carts use?",
        answer:
          'The EVolution D-MAX uses 24x10R16 all-terrain tires on 16" x 8.5" aluminum wheels. That is roughly a 24-inch overall diameter, against 18-20 inches for the turf tires on a standard golf cart.',
      },
      {
        question: "Do all-terrain tires damage grass?",
        answer:
          "More than turf tires do. The deeper, open tread that grips loose ground also digs into soft maintained turf, particularly when turning. This is the main reason golf courses specify turf tires.",
      },
      {
        question: "Can I put all-terrain tires on a standard golf cart?",
        answer:
          "You can fit them with a lift kit, but it does not make the cart all terrain. The cart still drives two wheels, and the standard brakes and steering are not sized for the larger tire, so stopping distance and steering effort both get worse.",
      },
      {
        question: "How much ground clearance does an all terrain golf cart have?",
        answer:
          "Meaningfully more than a standard cart, because the 24-inch tire raises the whole chassis. The exact figure depends on configuration; the spec sheet for each model lists the measured clearance.",
      },
    ],
  },

  {
    slug: "4x4-vs-2wd-golf-carts",
    title: "4X4 vs 2WD Golf Carts: Which Do You Need?",
    shortTitle: "4X4 vs 2WD",
    seoTitle: "4X4 vs 2WD Golf Carts: Which To Buy",
    metaDescription:
      "A 4X4 golf cart drives all four wheels through two motors; a 2WD cart drives two. Here is when the extra traction is essential and when it is wasted money.",
    question: "Is a 4X4 golf cart better than a 2WD golf cart?",
    answer:
      "Only if the ground demands it. A 4X4 golf cart drives all four wheels through two independent motors, which keeps it moving on sand, mud and wet slopes where a 2WD cart spins. On pavement and maintained turf the second motor adds cost and weight without adding capability.",
    datePublished: "2026-02-12",
    dateModified: "2026-09-03",
    heroImage: "ON-DEMAND_4-WHEEL_DRIVE_XT4_1768315763571.jpg",
    heroAlt: "On-demand four-wheel-drive system on an EVolution D-MAX XT4 all terrain golf cart",
    related: ["what-is-an-all-terrain-golf-cart", "all-terrain-golf-cart-tires-and-suspension", "all-terrain-golf-cart-cost"],
    blocks: [
      { type: "h2", text: "How does 4X4 work on an electric golf cart?" },
      {
        type: "p",
        text: "There is no transfer case and no driveshaft. Each axle has its own electric motor and its own controller, and the system engages the second motor on demand. On the D-MAX that is two 6.3kW AC motors, 12.6kW combined, with 400A AC control. Because the axles are linked electronically rather than mechanically, engagement is instant and there is nothing to shift.",
      },
      { type: "h2", text: "When does 4X4 actually change the outcome?" },
      {
        type: "ul",
        items: [
          "Soft sand, including boat ramps and beach access tracks, where a single driven axle digs in",
          "Wet grass on a slope, the most common place a 2WD cart loses traction",
          "Loose gravel and washed-out tracks, where one wheel regularly unloads",
          "Snow and mud, where forward progress depends on more than one axle finding grip",
          "Heavy loads on an incline, where weight transfer unloads the driven axle",
        ],
      },
      { type: "h2", text: "When is 2WD the better buy?" },
      {
        type: "p",
        text: "If the route is paved paths, a maintained fairway or a flat gravel drive, 2WD does the job for meaningfully less money. The second motor and controller, the heavier chassis and the larger brakes all cost something, and none of it is doing any work on flat, firm ground. Buying 4X4 for terrain you do not have is the most common overspend in this category.",
      },
      {
        type: "table",
        caption: "4X4 vs 2WD on the specifications that matter",
        head: ["Factor", "4X4 (D-MAX)", "Typical 2WD cart"],
        rows: [
          ["Driven wheels", "4, on demand", "2 (rear)"],
          ["Motors", "2 x 6.3kW AC", "1 x 3-5kW"],
          ["Traction on sand / wet slope", "Reliable", "Loses grip"],
          ["Efficiency on flat ground", "Slightly lower", "Higher"],
          ["Purchase price", "Higher", "Lower"],
          ["Best fit", "Unpaved, loaded, sloped", "Paved paths, flat turf"],
        ],
      },
      { type: "h2", text: "Does 4X4 hurt range?" },
      {
        type: "p",
        text: "Running both motors draws more current, so sustained 4X4 use pulls range toward the lower end of the quoted band: 40 miles rather than 50 on the XT4. Because the system is on-demand, that penalty only applies while it is engaged. On firm ground the cart runs on one axle and returns the higher figure.",
      },
    ],
    faqs: [
      {
        question: "Is a 4X4 golf cart worth it?",
        answer:
          "It is worth it if your regular route includes sand, mud, wet slopes or loose gravel, or if you carry heavy loads uphill. On pavement and maintained turf a 2WD cart does the same job for less money.",
      },
      {
        question: "How does a 4X4 electric golf cart work without a transfer case?",
        answer:
          "Each axle has its own motor and controller, and they are coordinated electronically. The D-MAX uses two 6.3kW AC motors, so the second axle can be engaged instantly with nothing to shift and no driveshaft to maintain.",
      },
      {
        question: "Does 4X4 reduce golf cart range?",
        answer:
          "While engaged, yes, because both motors are drawing current. Sustained 4X4 use puts the XT4 nearer 40 miles than 50. The system is on-demand, so the penalty disappears when the cart is running on one axle.",
      },
      {
        question: "Can a 2WD golf cart be converted to 4X4?",
        answer:
          "Not practically. It requires a second motor, a second controller, a front drive axle and a chassis able to carry them. Buying a cart built as 4X4 costs less than attempting the conversion.",
      },
    ],
  },
];

const bySlug = new Map(GUIDES.map((guide) => [guide.slug, guide]));

export function getGuide(slug: string): Guide | undefined {
  return bySlug.get(slug);
}
