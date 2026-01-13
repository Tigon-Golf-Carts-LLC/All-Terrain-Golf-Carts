import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { FeatureCard } from "@/components/FeatureCard";
import { locations } from "@/data/locations";
import { 
  ArrowRight, 
  Mountain, 
  Shield, 
  Zap, 
  Volume2, 
  Smartphone, 
  Snowflake,
  Users,
  Battery,
  Gauge,
  CheckCircle2,
  ChevronRight,
  MapPin
} from "lucide-react";
import xt4Image from "@assets/EVOLUTION_D-MAX_XT4_RED_1768250430375.png";
import xt6Image from "@assets/EVOLUTION_D-MAX_XT6_RED_1768250430374.png";
import mountainBg from "@assets/stock_images/mountain_landscape_s_e3842dcf.jpg";

export default function Home() {
  return (
    <div className="min-h-screen">
      <section className="relative min-h-screen flex items-center pt-20 overflow-hidden">
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: `url(${mountainBg})` }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-background/90 via-background/80 to-background" />
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-20">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-8 items-center">
            <div className="text-center lg:text-left order-2 lg:order-1">
              <Badge variant="secondary" className="mb-4">
                4X4 All-Terrain Electric Golf Carts
              </Badge>
              <h1 className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-bold tracking-tight leading-tight mb-6">
                All Terrain
                <br />
                <span className="text-gradient">Golf Carts</span>
              </h1>
              <p className="text-lg sm:text-xl text-muted-foreground max-w-xl mx-auto lg:mx-0 mb-8">
                Experience the power of dual-motor 4X4 all-terrain capability combined with luxury comfort. 
                The EVolution D-MAX XT series redefines what a golf cart can do.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                <Link href="/evolution-d-max-xt4">
                  <Button size="lg" className="w-full sm:w-auto gap-2" data-testid="button-explore-models">
                    Explore Models
                    <ArrowRight className="w-5 h-5" />
                  </Button>
                </Link>
                <Link href="/contact">
                  <Button size="lg" variant="outline" className="w-full sm:w-auto" data-testid="button-hero-contact">
                    Contact Us
                  </Button>
                </Link>
              </div>
              
              <div className="grid grid-cols-3 gap-6 mt-12 pt-8 border-t border-border">
                <div className="text-center lg:text-left">
                  <p className="text-2xl sm:text-3xl font-bold text-primary">4X4</p>
                  <p className="text-sm text-muted-foreground">Drive System</p>
                </div>
                <div className="text-center lg:text-left">
                  <p className="text-2xl sm:text-3xl font-bold text-primary">50</p>
                  <p className="text-sm text-muted-foreground">Mile Range</p>
                </div>
                <div className="text-center lg:text-left">
                  <p className="text-2xl sm:text-3xl font-bold text-primary">25</p>
                  <p className="text-sm text-muted-foreground">MPH Top Speed</p>
                </div>
              </div>
            </div>
            
            <div className="relative order-1 lg:order-2">
              <div className="relative aspect-[4/3] max-w-lg mx-auto lg:max-w-none">
                <img
                  src={xt6Image}
                  alt="EVolution D-MAX XT6 4X4 Golf Cart in Red"
                  className="w-full h-full object-contain drop-shadow-2xl"
                  data-testid="img-hero"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 lg:py-24 bg-card" id="models">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12 lg:mb-16">
            <Badge variant="outline" className="mb-4">Our Lineup</Badge>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4">
              All Terrain Golf Cart Models
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Two powerful golf cart models designed for different needs. Both equipped with 
              4X4 All-Terrain capability.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 lg:gap-12">
            <Card className="overflow-hidden group hover-elevate">
              <div className="aspect-[4/3] bg-gradient-to-br from-muted to-muted/50 p-6 relative overflow-hidden">
                <img
                  src={xt4Image}
                  alt="EVolution D-MAX XT4 4-Seat Golf Cart"
                  className="w-full h-full object-contain transition-transform duration-500 group-hover:scale-105"
                  data-testid="img-xt4-card"
                />
              </div>
              <div className="p-6 lg:p-8">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-2xl font-bold">EVolution D-MAX XT4</h3>
                    <p className="text-muted-foreground">4-Passenger 4X4</p>
                  </div>
                  <Badge variant="secondary">
                    <Users className="w-4 h-4 mr-1" />
                    4 Seats
                  </Badge>
                </div>
                <p className="text-muted-foreground mb-6">
                  Compact powerhouse with dual 6.3kW motors, on-demand 4WD, and premium features 
                  including 24-speaker sound system and built-in refrigerator.
                </p>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Starting at</p>
                    <p className="text-2xl font-bold">$15,595</p>
                  </div>
                  <Link href="/evolution-d-max-xt4">
                    <Button className="gap-2" data-testid="button-view-xt4">
                      View Details
                      <ChevronRight className="w-4 h-4" />
                    </Button>
                  </Link>
                </div>
              </div>
            </Card>

            <Card className="overflow-hidden group hover-elevate">
              <div className="aspect-[4/3] bg-gradient-to-br from-muted to-muted/50 p-6 relative overflow-hidden">
                <img
                  src={xt6Image}
                  alt="EVolution D-MAX XT6 6-Seat Golf Cart"
                  className="w-full h-full object-contain transition-transform duration-500 group-hover:scale-105"
                  data-testid="img-xt6-card"
                />
              </div>
              <div className="p-6 lg:p-8">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-2xl font-bold">EVolution D-MAX XT6</h3>
                    <p className="text-muted-foreground">6-Passenger 4X4</p>
                  </div>
                  <Badge variant="secondary">
                    <Users className="w-4 h-4 mr-1" />
                    6 Seats
                  </Badge>
                </div>
                <p className="text-muted-foreground mb-6">
                  Extended capacity with the same powerful dual-motor 4WD system. Perfect for 
                  families or groups who need room without compromising capability.
                </p>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Starting at</p>
                    <p className="text-2xl font-bold">$17,595</p>
                  </div>
                  <Link href="/evolution-d-max-xt6">
                    <Button className="gap-2" data-testid="button-view-xt6">
                      View Details
                      <ChevronRight className="w-4 h-4" />
                    </Button>
                  </Link>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </section>

      <section className="py-16 lg:py-24" id="capabilities">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            <div>
              <Badge variant="outline" className="mb-4">4X4 Capability</Badge>
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-6">
                Built for{" "}
                <span className="text-gradient">Off-Road Excellence</span>
              </h2>
              <p className="text-lg text-muted-foreground mb-8">
                All Terrain Golf Carts feature an on-demand 4-wheel drive system 
                with dual 6.3kW AC motors, delivering unmatched power and traction 
                across any terrain.
              </p>
              
              <div className="space-y-4">
                {[
                  "Dual 6.3kW AC motors with electromagnetic brake",
                  "On-demand 4X4 drive system for maximum traction",
                  "24×10R16 quiet all-terrain tires",
                  "Electric power steering for precise control",
                  "Suspension tuned for street and off-road comfort",
                  "400A AC controller for instant power delivery"
                ].map((feature, index) => (
                  <div key={index} className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                    <span className="text-muted-foreground">{feature}</span>
                  </div>
                ))}
              </div>

              <div className="mt-8">
                <Link href="/evolution-d-max-xt4">
                  <Button size="lg" className="gap-2" data-testid="button-learn-4x4">
                    Learn More About 4X4 All-Terrain Capability
                    <ArrowRight className="w-5 h-5" />
                  </Button>
                </Link>
              </div>
            </div>

            <div className="relative">
              <div className="grid grid-cols-2 gap-4">
                <Card className="p-6 text-center hover-elevate">
                  <Mountain className="w-10 h-10 text-primary mx-auto mb-4" />
                  <h4 className="font-bold mb-1">Hill Climbing</h4>
                  <p className="text-sm text-muted-foreground">Tackle steep inclines with ease</p>
                </Card>
                <Card className="p-6 text-center hover-elevate">
                  <Zap className="w-10 h-10 text-primary mx-auto mb-4" />
                  <h4 className="font-bold mb-1">Dual Motors</h4>
                  <p className="text-sm text-muted-foreground">12.6kW combined power</p>
                </Card>
                <Card className="p-6 text-center hover-elevate">
                  <Battery className="w-10 h-10 text-primary mx-auto mb-4" />
                  <h4 className="font-bold mb-1">48V Lithium</h4>
                  <p className="text-sm text-muted-foreground">Smart battery management</p>
                </Card>
                <Card className="p-6 text-center hover-elevate">
                  <Gauge className="w-10 h-10 text-primary mx-auto mb-4" />
                  <h4 className="font-bold mb-1">25 MPH</h4>
                  <p className="text-sm text-muted-foreground">Street-legal speed</p>
                </Card>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 lg:py-24 bg-card" id="features">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12 lg:mb-16">
            <Badge variant="outline" className="mb-4">Premium Features</Badge>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4">
              Luxury Meets Capability
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              All-Terrain Golf Carts come loaded with premium features that elevate your driving experience no matter the terrain.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            <FeatureCard
              icon={Smartphone}
              title={'10.1" Touchscreen'}
              description="Full infotainment system with Apple CarPlay and Android Auto integration for seamless connectivity."
            />
            <FeatureCard
              icon={Volume2}
              title="24-Speaker System"
              description="Premium surround sound audio system delivers concert-quality sound wherever you go."
            />
            <FeatureCard
              icon={Snowflake}
              title="Built-In Refrigerator"
              description="Keep beverages and snacks cold with the integrated dash refrigerator. Plus a 74-qt portable cooler."
            />
            <FeatureCard
              icon={Shield}
              title="Street Legal Ready"
              description="LSV compliant with DOT tires, lights, mirrors, and safety equipment for road use up to 35 mph zones."
            />
            <FeatureCard
              icon={Zap}
              title="Wireless Charging"
              description="Dual wireless phone charging pads keep your devices powered without cables."
            />
            <FeatureCard
              icon={Mountain}
              title="All-Terrain Tires"
              description={'16" aluminum wheels with quiet all-terrain tires handle any surface with confidence.'}
            />
          </div>
        </div>
      </section>

      <section className="py-16 lg:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-gradient-to-br from-primary to-primary/80 rounded-2xl p-8 lg:p-16 text-center relative overflow-hidden">
            <div className="absolute inset-0 opacity-10">
              <div className="absolute inset-0" style={{
                backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
              }} />
            </div>
            <div className="relative">
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-primary-foreground mb-4">
                Ready to Experience The 4X4 All Terrain Difference?
              </h2>
              <p className="text-lg text-primary-foreground/90 max-w-2xl mx-auto mb-8">
                Contact us today to schedule a test drive or get a personalized quote 
                for your 4x4 all terrain golf cart.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link href="/contact">
                  <Button size="lg" variant="secondary" className="w-full sm:w-auto gap-2" data-testid="button-cta-quote">
                    Get Your Quote
                    <ArrowRight className="w-5 h-5" />
                  </Button>
                </Link>
                <Link href="/evolution-d-max-xt4">
                  <Button size="lg" variant="outline" className="w-full sm:w-auto bg-transparent border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground/10" data-testid="button-cta-compare">
                    Compare Models
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 lg:py-24 bg-card">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <Badge variant="outline" className="mb-4">
              <MapPin className="w-4 h-4 mr-1" />
              Nationwide Service
            </Badge>
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">
              4X4 all terrain Golf Carts Available Across the USA
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              We deliver 4X4 all terrain golf carts to all 50 states and U.S. territories. 
              Click your location to learn more.
            </p>
          </div>

          <div className="mb-8">
            <h3 className="text-xl font-semibold mb-4">States</h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-2">
              {locations.filter(loc => loc.type === "state").map((loc) => (
                <Link key={loc.slug} href={`/${loc.slug}`}>
                  <Button 
                    variant="outline" 
                    className="w-full justify-start text-sm h-auto py-2"
                    data-testid={`link-location-${loc.slug}`}
                  >
                    {loc.name}
                  </Button>
                </Link>
              ))}
            </div>
          </div>

          <div>
            <h3 className="text-xl font-semibold mb-4">U.S. Territories</h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-2">
              {locations.filter(loc => loc.type === "territory").map((loc) => (
                <Link key={loc.slug} href={`/${loc.slug}`}>
                  <Button 
                    variant="outline" 
                    className="w-full justify-start text-sm h-auto py-2"
                    data-testid={`link-location-${loc.slug}`}
                  >
                    {loc.name}
                  </Button>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
