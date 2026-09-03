import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ExternalLink, CreditCard, DollarSign, CheckCircle, Percent, Clock, Shield } from "lucide-react";
import { AnswerFirst } from "@/components/AnswerFirst";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { FaqSection } from "@/components/FaqSection";
import { FINANCING_FAQS } from "@/data/faqs";
import { SITE } from "@/config/site";

const financingOptions = [
  {
    id: "sheffield",
    title: "Sheffield Financial",
    subtitle: "Prequalify Now",
    description: "Get prequalified with no impact to your credit. Quick and easy approval process for all terrain golf cart financing.",
    link: "https://prequalify.sheffieldfinancial.com/Apply/Dealer/56712?source=web",
    highlight: "No Credit Impact",
    icon: Shield,
  },
  {
    id: "bli-rentals",
    title: "BLI Rentals",
    subtitle: "Rent To Own",
    description: "Helping golf cart customers achieve ownership. Flexible rent-to-own options for your all terrain golf cart purchase.",
    link: "https://blirentals.com/app/TIGON_GOLFCARTS_LLC",
    highlight: "Rent To Own",
    icon: Clock,
  },
  {
    id: "dll-financial",
    title: "DLL Financial Solutions",
    subtitle: "Low APR Financing",
    description: "Get the lowest APR without hidden fees. Transparent financing solutions for your 4X4 golf cart.",
    link: "https://applynow-cica-prd.dllgroup.com/?entityId=4&dealerCode=015639",
    highlight: "Lowest APR",
    icon: Percent,
  },
  {
    id: "octane",
    title: "Roadrunner Financial",
    subtitle: "Consumer Financing",
    description: "Get ready to ride with consumer financing. Fast approvals and competitive rates for all terrain golf carts.",
    link: "https://octane.co/flex/034170",
    highlight: "Fast Approval",
    icon: CreditCard,
  },
  {
    id: "univest",
    title: "Univest Capital",
    subtitle: "Business Financing",
    description: "Customized solutions for your specific business needs. Commercial financing options for fleet purchases.",
    link: "https://form.jotform.com/UnivestCapital/credit-application-bakos?utm_source=TIGON+Golf+Carts&utm_medium=Financing&utm_campaign=Business&utm_term=Best+Golf+Cart+Financing",
    highlight: "Business Solutions",
    icon: DollarSign,
  },
  {
    id: "dealer-direct",
    title: "Dealer Direct Financing",
    subtitle: "Buy Now, Pay Later",
    description: "Buy now, pay later with dealer direct financing. Flexible payment plans for your all terrain golf cart.",
    link: "https://dealerdirect.apptraker.com/my/guest?dealer=10735",
    highlight: "Buy Now Pay Later",
    icon: CheckCircle,
  },
];

export default function Financing() {

  return (
    <div className="min-h-screen pb-24 lg:pb-8">
      <section className="pt-24 lg:pt-32 pb-16 lg:pb-24 bg-gradient-to-b from-primary/10 to-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Breadcrumbs path="/financing" className="mb-6" />
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl lg:text-5xl xl:text-6xl font-bold mb-6">
            <span className="block">ALL TERRAIN</span>
            <span className="block text-primary">GOLF CARTS FINANCING</span>
          </h1>
          <AnswerFirst
            question="How do I finance an all terrain golf cart?"
            answer="Financing an all terrain golf cart runs through six lenders offered here, covering prequalification with no credit impact, low-APR loans, rent-to-own, buy-now-pay-later and commercial fleet terms. Apply directly with whichever fits, or call (844) 884-6744 for a payment estimate first."
            className="mx-auto mb-8 text-left"
          />
          <p className="text-lg lg:text-xl text-muted-foreground max-w-3xl mx-auto mb-8">
            Get your dream 4X4 all terrain golf cart with flexible financing options. 
            0% financing available on EVolution D-MAX XT4 and XT6 models. 
            Quick approvals, competitive rates, and multiple payment plans to fit your budget.
          </p>
          <div className="flex flex-wrap justify-center gap-4 text-sm text-muted-foreground">
            <span className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-primary" />
              Quick Approval
            </span>
            <span className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-primary" />
              0% APR Available
            </span>
            <span className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-primary" />
              No Hidden Fees
            </span>
            <span className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-primary" />
              Flexible Terms
            </span>
          </div>
        </div>
      </section>

      <section className="py-16 lg:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl lg:text-4xl font-bold mb-4">
              Choose Your <span className="text-primary">Financing Option</span>
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              We've partnered with top financing providers to offer you the best rates and terms 
              for your all terrain golf cart purchase. Select the option that works best for you.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {financingOptions.map((option) => {
              const IconComponent = option.icon;
              return (
                <Card key={option.id} className="relative overflow-visible hover-elevate transition-all duration-300 flex flex-col">
                  <div className="absolute -top-3 left-4">
                    <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold bg-primary text-primary-foreground">
                      <IconComponent className="w-3 h-3" />
                      {option.highlight}
                    </span>
                  </div>
                  <CardHeader className="pt-8">
                    <CardTitle className="text-xl">{option.title}</CardTitle>
                    <p className="text-primary font-medium">{option.subtitle}</p>
                  </CardHeader>
                  <CardContent className="flex-1 flex flex-col">
                    <p className="text-muted-foreground text-sm mb-6 flex-1">
                      {option.description}
                    </p>
                    <a
                      href={option.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      data-testid={`link-financing-${option.id}`}
                    >
                      <Button className="w-full gap-2">
                        Quick Apply
                        <ExternalLink className="w-4 h-4" />
                      </Button>
                    </a>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      <section className="py-16 lg:py-24 bg-muted/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl lg:text-4xl font-bold mb-4">
              Why Finance With <span className="text-primary">ALL Terrain Golf Carts?</span>
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-primary/10 flex items-center justify-center">
                <Percent className="w-8 h-8 text-primary" />
              </div>
              <h3 className="font-semibold mb-2">0% APR Options</h3>
              <p className="text-sm text-muted-foreground">
                Qualify for 0% financing on select all terrain golf cart purchases.
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-primary/10 flex items-center justify-center">
                <Clock className="w-8 h-8 text-primary" />
              </div>
              <h3 className="font-semibold mb-2">Quick Approval</h3>
              <p className="text-sm text-muted-foreground">
                Get approved in minutes with our streamlined application process.
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-primary/10 flex items-center justify-center">
                <DollarSign className="w-8 h-8 text-primary" />
              </div>
              <h3 className="font-semibold mb-2">Flexible Terms</h3>
              <p className="text-sm text-muted-foreground">
                Choose payment terms that fit your budget and lifestyle.
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-primary/10 flex items-center justify-center">
                <Shield className="w-8 h-8 text-primary" />
              </div>
              <h3 className="font-semibold mb-2">Secure Process</h3>
              <p className="text-sm text-muted-foreground">
                Your information is protected with industry-leading security.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 lg:py-24">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl lg:text-4xl font-bold mb-4">
              Frequently Asked <span className="text-primary">Questions</span>
            </h2>
          </div>

          <div className="space-y-6">
            <div className="bg-card rounded-lg p-6 border border-border">
              <h3 className="font-semibold mb-2">What credit score do I need to finance an all terrain golf cart?</h3>
              <p className="text-muted-foreground text-sm">
                Credit requirements vary by lender. Some of our financing partners offer options for all credit types, 
                including programs with no credit check. We recommend applying with multiple lenders to find the best terms.
              </p>
            </div>
            <div className="bg-card rounded-lg p-6 border border-border">
              <h3 className="font-semibold mb-2">Can I get 0% financing on an all terrain golf cart?</h3>
              <p className="text-muted-foreground text-sm">
                Yes! 0% APR financing is available through select lenders for qualified buyers. 
                Apply through Sheffield Financial or DLL Financial Solutions to check your eligibility for promotional rates.
              </p>
            </div>
            <div className="bg-card rounded-lg p-6 border border-border">
              <h3 className="font-semibold mb-2">What is rent-to-own financing for golf carts?</h3>
              <p className="text-muted-foreground text-sm">
                Rent-to-own allows you to make monthly payments while using your golf cart, with the option to own 
                it at the end of the term. It's a great option if you prefer flexibility or have limited credit history.
              </p>
            </div>
            <div className="bg-card rounded-lg p-6 border border-border">
              <h3 className="font-semibold mb-2">How long does financing approval take?</h3>
              <p className="text-muted-foreground text-sm">
                Most of our financing partners provide instant or same-day approval decisions. 
                The application process typically takes just 5-10 minutes to complete online.
              </p>
            </div>
            <div className="bg-card rounded-lg p-6 border border-border">
              <h3 className="font-semibold mb-2">Do you offer business financing for all terrain golf carts?</h3>
              <p className="text-muted-foreground text-sm">
                Yes! Univest Capital specializes in commercial and business financing for golf cart fleet purchases. 
                They offer customized solutions for resorts, golf courses, and commercial properties.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 lg:py-24 bg-primary text-primary-foreground">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl lg:text-4xl font-bold mb-4">
            Ready to Get Started?
          </h2>
          <p className="text-lg opacity-90 mb-8 max-w-2xl mx-auto">
            Apply for all terrain golf cart financing today and get behind the wheel of your new 
            EVolution D-MAX XT4 or XT6 4X4 electric golf cart. Questions? Call us anytime.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a href={SITE.phoneHref}>
              <Button size="lg" variant="secondary" className="gap-2" data-testid="button-financing-call">
                Call (844) 884-6744
              </Button>
            </a>
            <a href="/contact">
              <Button size="lg" variant="outline" className="gap-2 border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground/10" data-testid="button-financing-contact">
                Contact Us
              </Button>
            </a>
          </div>
        </div>
      </section>

      <FaqSection faqs={FINANCING_FAQS} heading="Financing questions" />
    </div>
  );
}
