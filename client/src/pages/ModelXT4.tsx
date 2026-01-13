import { useState } from "react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ColorSwatches } from "@/components/ColorSwatches";
import { SpecTable } from "@/components/SpecTable";
import { VehicleSchema } from "@/components/VehicleSchema";
import {
  ArrowRight,
  CheckCircle2,
  Users,
  Battery,
  Gauge,
  Ruler,
  Weight,
  Cog,
  Zap,
  Navigation,
  Shield,
  Volume2,
  Smartphone,
  Snowflake,
  Wifi,
  Car,
  Download,
} from "lucide-react";
import xt4Red from "@assets/EVOLUTION_D-MAX_XT4_RED_1768250430375.png";
import xt4White from "@assets/EVOLUTION_D-MAX_XT4_WHITE_1768251453734.png";
import xt4Black from "@assets/EVOLUTION_D-MAX_XT4_BLACK_1768251453733.png";
import xt4Blue from "@assets/EVOLUTION_D-MAX_XT4_BLUE_1768251453733.png";
import xt4Gray from "@assets/EVOLUTION_D-MAX_XT4_GRAY_1768251453733.png";
import xt4SkyBlue from "@assets/EVOLUTION_D-MAX_XT4_SKY_BLUE_1768251453732.png";

import featureTouchscreen from "@assets/10.1-INCH_MULTI-FUNCTIONAL_TOUCHSCREEN_XT4_1768315763571.jpg";
import featureSpeakers from "@assets/Immersive_Surround_Sound_Experience_XT4_1768315763571.jpg";
import feature4WD from "@assets/ON-DEMAND_4-WHEEL_DRIVE_XT4_1768315763571.jpg";
import featureSteering from "@assets/Electric_Power_Steering_XT4_1768315763571.jpg";
import featureCharging from "@assets/Dual_Wireless_Charging_Pad_XT4_1768315763571.jpg";
import featureRefrigerator from "@assets/BUILT-IN_DASH_REFRIGERATOR_XT4_1768315763570.jpg";
import featureBasket from "@assets/Foldable_Rear_storage_basket_XT4_1768315763570.jpg";
import featureCooler from "@assets/Slide-out_Tray_&_Portable_Cooler_XT4_1768315763570.jpg";
import featureTray from "@assets/Extended_Tray_with_Bag_Holder_Extension_XT4_1768315763570.jpg";
import featureSeats from "@assets/Evolution_Iconic_Luxury_Seats_XT4_1768315763569.jpg";
import featureComfort from "@assets/All-in-One_Passenger_Comfort_XT4_1768315763569.jpg";
import featureLED from "@assets/LED_LIGHTING_XT4_1768315763569.jpg";
import featureRunningBoard from "@assets/running_board_XT4_1768315763569.jpg";
import featureWheels from "@assets/16X8.5_Aluminum_Wheels_XT4_1768315763568.jpg";

const colorImages: Record<string, string> = {
  white: xt4White,
  black: xt4Black,
  blue: xt4Blue,
  gray: xt4Gray,
  red: xt4Red,
  "sky-blue": xt4SkyBlue,
};

export default function ModelXT4() {
  const [selectedColor, setSelectedColor] = useState("red");

  const powerSpecs = [
    { label: "Battery", value: "48V Lithium with Smart Management", icon: "battery" as const },
    { label: "Motors", value: "Dual 6.3kW AC with EM Brake", icon: "zap" as const },
    { label: "Controller", value: "400A AC with 25A Onboard Charger", icon: "cog" as const },
    { label: "Drive System", value: "On-Demand 4-Wheel Drive (4X4)", icon: "navigation" as const },
    { label: "Top Speed", value: "Up to 25 MPH (LSV Ready)", icon: "gauge" as const },
    { label: "Range", value: "40-50 Miles Per Charge", icon: "battery" as const },
  ];

  const dimensionSpecs = [
    { label: "Overall Length", value: '122.6"', icon: "ruler" as const },
    { label: "Overall Width", value: '56.1"', icon: "ruler" as const },
    { label: "Overall Height", value: '83.8"', icon: "ruler" as const },
    { label: "Wheelbase", value: '81"', icon: "ruler" as const },
    { label: "Curb Weight", value: "1,499 lbs", icon: "weight" as const },
    { label: "Max Payload", value: "2,270 lbs", icon: "weight" as const },
    { label: "Seating Capacity", value: "4 Passengers", icon: "users" as const },
    { label: "Wheels", value: '16" x 8.5" Aluminum', icon: "cog" as const },
  ];

  const standardFeatures = [
    "10.1\" Touchscreen with Apple CarPlay & Android Auto",
    "Premium 24-Speaker Surround Sound System",
    "Dual Wireless Phone Charging Pads",
    "Built-In Dash Refrigerator",
    "74-Qt Portable Cooler",
    "Sliding Rear Utility Tray",
    "Foldable Rear Storage Basket",
    "Golf Bag Rack",
    "Foldable Windshield with Sliding Vents",
    "LED Headlights, Taillights & Running Boards",
    "Automotive-Style Luxury Seats",
    "3-Point Seat Belts for All Seats",
    "USB Ports & Cupholders",
    "Electric Power Steering (EPS)",
  ];

  const streetLegalEquipment = [
    "LED Headlights & Taillights",
    "Turn Signals & Brake Lights",
    "Horn",
    "Side & Rearview Mirrors",
    "DOT-Approved Tires",
    "3-Point Seat Belts",
    "Vehicle Identification Number (VIN)",
  ];

  const optionalUpgrades = [
    "Windshield Wipers & Washer Kit",
    "Rear Bumper Guards",
    "Reflective Trim",
    "License Plate Bracket & Light",
    "Extended Mirrors",
    "LED Light Bars",
  ];

  const premiumFeatures = [
    {
      image: featureTouchscreen,
      title: "10.1-Inch Multi-Functional Touchscreen",
      description: "Elevate your adventures with the 10.1-inch touchscreen, Apple CarPlay and Android Auto compatible, offering seamless access to navigation, music, and calls, keeping you connected and entertained on every drive."
    },
    {
      image: featureSpeakers,
      title: "Immersive Surround Sound Experience",
      description: "Experience immersive audio with a 24-speaker sound system that delivers rich, surrounding sound, elevating every drive with high-quality acoustics."
    },
    {
      image: feature4WD,
      title: "On-Demand 4-Wheel Drive",
      description: "Elevate your driving experience with the Evolution D-MAX on-demand 4-wheel drive system. Featuring dual independent electric motors and controllers, this system seamlessly switches between 2-wheel and 4-wheel drive modes to suit your preferences."
    },
    {
      image: featureSteering,
      title: "Electric Power Steering",
      description: "Enjoy precise, effortless control with advanced electric power steering, designed to deliver smooth, responsive handling for a truly refined driving experience. Whether navigating tight spaces or cruising open paths, this feature ensures comfortable, fatigue-free steering."
    },
    {
      image: featureCharging,
      title: "Dual Wireless Charging Pad",
      description: "Power Up on the Go - Keep your devices powered up effortlessly with the dual wireless charging pad on the dash, designed to charge two cell phones simultaneously, ensuring you stay connected without the clutter of cables."
    },
    {
      image: featureRefrigerator,
      title: "Built-In Dash Refrigerator",
      description: "Refreshments at Your Fingertips - Keep your refreshments cool and within reach with the built-in dash refrigerator, adding a touch of convenience and luxury to every journey."
    },
    {
      image: featureBasket,
      title: "Foldable Rear Storage Basket",
      description: "Maximize convenience with the foldable rear storage basket, featuring a portable inner fabric utility box for easy storage. Simple to fold and unfold, it's designed to keep your essentials organized and accessible on the go."
    },
    {
      image: featureCooler,
      title: "Slide-out Tray & Portable Cooler",
      description: "Enjoy ultimate versatility with the retractable rear tray, equipped with a 74-QT detachable cooler that doubles as a portable unit. Featuring wheels and pull handles, it's easy to take along, keeping refreshments cool and convenient wherever you go."
    },
    {
      image: featureTray,
      title: "Extended Tray with Bag Holder Extension",
      description: "Transform the rear of your golf car with the fully extended retractable tray, equipped with an optional golf bag holder extension to securely carry up to four golf bags. Perfect for group outings."
    },
    {
      image: featureSeats,
      title: "Evolution Iconic Luxury Seats",
      description: "Experience unmatched sporty comfort with luxurious seats, expertly crafted from premium fine leather and detailed with exquisite stitching. Equipped with three-point seatbelts for a perfect blend of elegance and safety."
    },
    {
      image: featureComfort,
      title: "All-in-One Passenger Comfort",
      description: "Enhance rear-seat functionality with the thoughtfully designed seat back cover assembly, featuring an integrated handrail, convenient cupholder, concealed hook, storage pocket, and USB charging ports."
    },
    {
      image: featureLED,
      title: "LED Lighting",
      description: "Illuminate Your Journey with D-MAX advanced LED lighting system! Featuring a luminous logo, powerful LED headlights, and sleek taillights, each element is meticulously designed to enhance your ride with unmatched style."
    },
    {
      image: featureRunningBoard,
      title: "Illuminated Running Board",
      description: "D-MAX XT4 features an illuminous running board, enhancing both functionality and aesthetic appeal. This feature facilitates easier entry and exit while adding a distinctive, glowing touch to the vehicle's profile."
    },
    {
      image: featureWheels,
      title: "16x8.5 Aluminum Wheels with All-Terrain Tires",
      description: "D-Max XT4 is equipped with 16x8.5-inch aluminum wheels and 24x10R16 all-terrain tires, delivering enhanced performance and superior traction on diverse surfaces for a smooth, controlled ride."
    },
  ];

  return (
    <>
      <VehicleSchema model="xt4" />
      <div className="min-h-screen pt-20">
        <section className="py-8 lg:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col lg:grid lg:grid-cols-2 gap-8 lg:gap-16 items-start">
            <div className="sticky top-20 lg:top-24 z-50 bg-background pb-4 lg:pb-0">
              <div className="aspect-[4/3] bg-gradient-to-br from-muted to-muted/50 rounded-2xl p-4 lg:p-8 relative overflow-hidden">
                <img
                  src={colorImages[selectedColor]}
                  alt={`EVolution D-MAX XT4 4X4 Golf Cart in ${selectedColor}`}
                  className="w-full h-full object-contain transition-opacity duration-300"
                  data-testid="img-xt4-main"
                />
              </div>
              <div className="mt-4 lg:mt-6">
                <p className="text-sm text-muted-foreground text-center mb-3">Select Color</p>
                <ColorSwatches
                  model="xt4"
                  selectedColor={selectedColor}
                  onColorChange={setSelectedColor}
                />
              </div>
            </div>

            <div>
              <Badge variant="secondary" className="mb-4">4-Passenger 4X4</Badge>
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-2">
                EVolution D-MAX XT4
              </h1>
              <p className="text-xl text-muted-foreground mb-6">
                The Ultimate All-Terrain Golf Cart
              </p>
              
              <div className="flex items-baseline gap-2 mb-6">
                <span className="text-sm text-muted-foreground">Starting at</span>
                <span className="text-4xl font-bold">$15,595</span>
                <span className="text-sm text-muted-foreground">MSRP</span>
              </div>

              <p className="text-muted-foreground leading-relaxed mb-8">
                The EVolution D-MAX XT4 blends off-road power with street-legal capability, 
                offering a dual-motor 4WD system, premium infotainment, comfort tech, and 
                utility features. With proper street-legal equipment, it serves as both a 
                fun off-road machine and a registered LSV for neighborhood or community use.
              </p>

              <div className="grid grid-cols-3 gap-4 mb-8">
                <Card className="p-4 text-center">
                  <Users className="w-6 h-6 text-primary mx-auto mb-2" />
                  <p className="font-bold">4 Seats</p>
                </Card>
                <Card className="p-4 text-center">
                  <Zap className="w-6 h-6 text-primary mx-auto mb-2" />
                  <p className="font-bold">12.6kW</p>
                </Card>
                <Card className="p-4 text-center">
                  <Battery className="w-6 h-6 text-primary mx-auto mb-2" />
                  <p className="font-bold">50 Miles</p>
                </Card>
              </div>

              <div className="flex flex-col sm:flex-row gap-4 mb-12">
                <Link href="/contact">
                  <Button size="lg" className="w-full sm:w-auto gap-2" data-testid="button-xt4-quote">
                    Get a Quote
                    <ArrowRight className="w-5 h-5" />
                  </Button>
                </Link>
                <a href="/xt4-spec-sheet.pdf" download>
                  <Button size="lg" variant="outline" className="w-full sm:w-auto gap-2" data-testid="button-xt4-download">
                    <Download className="w-5 h-5" />
                    Download Spec Sheet
                  </Button>
                </a>
                <Link href="/evolution-d-max-xt6">
                  <Button size="lg" variant="outline" className="w-full sm:w-auto" data-testid="button-xt4-compare">
                    Compare to XT6
                  </Button>
                </Link>
              </div>

              <div className="space-y-12">
                <div>
                  <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
                    <Zap className="w-6 h-6 text-primary" />
                    4X4 Power & Performance
                  </h2>
                  <p className="text-muted-foreground mb-6">
                    The heart of the D-MAX XT4 is its revolutionary on-demand 4-wheel drive 
                    system. Powered by dual 6.3kW AC motors, the XT4 delivers exceptional 
                    torque and traction across any terrain. Whether you're climbing steep 
                    hills, navigating rough trails, or cruising neighborhood streets, the 
                    4X4 system automatically engages when you need it most.
                  </p>
                  <SpecTable title="Power & Drive Specifications" specs={powerSpecs} />
                </div>

                <div>
                  <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
                    <Ruler className="w-6 h-6 text-primary" />
                    Dimensions & Capacity
                  </h2>
                  <SpecTable title="Size & Weight Specifications" specs={dimensionSpecs} />
                </div>

                <div>
                  <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
                    <Volume2 className="w-6 h-6 text-primary" />
                    Standard Features
                  </h2>
                  <p className="text-muted-foreground mb-6">
                    Every D-MAX XT4 comes fully loaded with premium features designed for 
                    comfort, convenience, and entertainment.
                  </p>
                  <div className="grid sm:grid-cols-2 gap-3">
                    {standardFeatures.map((feature, index) => (
                      <div key={index} className="flex items-start gap-3">
                        <CheckCircle2 className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                        <span className="text-sm text-muted-foreground">{feature}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
                    <Shield className="w-6 h-6 text-primary" />
                    Street-Legal / LSV Compliance
                  </h2>
                  <p className="text-muted-foreground mb-6">
                    The D-MAX XT4 can be configured to meet Low-Speed Vehicle (LSV) requirements, 
                    allowing you to register, title, and drive it on roads with posted limits 
                    up to 35 mph in many areas.
                  </p>
                  
                  <div className="grid md:grid-cols-2 gap-6">
                    <Card className="p-6">
                      <h4 className="font-bold mb-4">Standard LSV Equipment</h4>
                      <div className="space-y-2">
                        {streetLegalEquipment.map((item, index) => (
                          <div key={index} className="flex items-center gap-2">
                            <CheckCircle2 className="w-4 h-4 text-primary" />
                            <span className="text-sm text-muted-foreground">{item}</span>
                          </div>
                        ))}
                      </div>
                    </Card>
                    <Card className="p-6">
                      <h4 className="font-bold mb-4">Optional Upgrades</h4>
                      <div className="space-y-2">
                        {optionalUpgrades.map((item, index) => (
                          <div key={index} className="flex items-center gap-2">
                            <Cog className="w-4 h-4 text-muted-foreground" />
                            <span className="text-sm text-muted-foreground">{item}</span>
                          </div>
                        ))}
                      </div>
                    </Card>
                  </div>
                  
                  <p className="text-sm text-muted-foreground mt-4 p-4 bg-muted rounded-md">
                    Note: LSV compliance may require dealer installation of street-legal kits 
                    and must meet your local DMV/Department of Transportation rules before road use.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 bg-card">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Compare Models</h2>
            <p className="text-muted-foreground">See how the XT4 stacks up against the XT6</p>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full min-w-[600px]">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-4 px-4 font-semibold">Specification</th>
                  <th className="text-center py-4 px-4 font-semibold bg-primary/5">D-MAX XT4</th>
                  <th className="text-center py-4 px-4 font-semibold">D-MAX XT6</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-border">
                  <td className="py-4 px-4 text-muted-foreground">Starting Price</td>
                  <td className="py-4 px-4 text-center font-semibold bg-primary/5">$15,595</td>
                  <td className="py-4 px-4 text-center">$17,595</td>
                </tr>
                <tr className="border-b border-border">
                  <td className="py-4 px-4 text-muted-foreground">Seating</td>
                  <td className="py-4 px-4 text-center font-semibold bg-primary/5">4 Passengers</td>
                  <td className="py-4 px-4 text-center">6 Passengers</td>
                </tr>
                <tr className="border-b border-border">
                  <td className="py-4 px-4 text-muted-foreground">Drive System</td>
                  <td className="py-4 px-4 text-center font-semibold bg-primary/5">4X4</td>
                  <td className="py-4 px-4 text-center">4X4</td>
                </tr>
                <tr className="border-b border-border">
                  <td className="py-4 px-4 text-muted-foreground">Motors</td>
                  <td className="py-4 px-4 text-center font-semibold bg-primary/5">Dual 6.3kW</td>
                  <td className="py-4 px-4 text-center">Dual 6.3kW</td>
                </tr>
                <tr className="border-b border-border">
                  <td className="py-4 px-4 text-muted-foreground">Range</td>
                  <td className="py-4 px-4 text-center font-semibold bg-primary/5">40-50 Miles</td>
                  <td className="py-4 px-4 text-center">30-50 Miles</td>
                </tr>
                <tr className="border-b border-border">
                  <td className="py-4 px-4 text-muted-foreground">Top Speed</td>
                  <td className="py-4 px-4 text-center font-semibold bg-primary/5">25 MPH</td>
                  <td className="py-4 px-4 text-center">25 MPH</td>
                </tr>
              </tbody>
            </table>
          </div>
          
          <div className="text-center mt-8">
            <Link href="/evolution-d-max-xt6">
              <Button variant="outline" className="gap-2" data-testid="button-xt4-goto-xt6">
                View XT6 Details
                <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      <section className="py-16 bg-muted/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Premium Features</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Discover the innovative technology and luxury amenities that make the D-MAX XT4 
              the ultimate 4-passenger golf cart experience.
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 gap-8">
            {premiumFeatures.map((feature, index) => (
              <div 
                key={index} 
                className="bg-card rounded-xl overflow-hidden shadow-sm border border-border"
                data-testid={`feature-card-${index}`}
              >
                <div className="aspect-[16/9] overflow-hidden">
                  <img
                    src={feature.image}
                    alt={feature.title}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="p-6">
                  <h3 className="text-xl font-bold mb-3">{feature.title}</h3>
                  <p className="text-muted-foreground text-sm leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to Ride?</h2>
          <p className="text-muted-foreground mb-8">
            Contact us today to schedule a test drive or get a personalized quote 
            for your EVolution D-MAX XT4.
          </p>
          <Link href="/contact">
            <Button size="lg" className="gap-2" data-testid="button-xt4-final-cta">
              Contact Us Today
              <ArrowRight className="w-5 h-5" />
            </Button>
          </Link>
        </div>
      </section>
    </div>
    </>
  );
}
