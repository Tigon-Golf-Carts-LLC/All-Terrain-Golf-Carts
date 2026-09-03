import { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";

import { SITE } from "@/config/site";
import { Button } from "@/components/ui/button";
import { Menu, X, Sun, Moon, Phone } from "lucide-react";

export function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isDark, setIsDark] = useState(false);
  const [location] = useLocation();

  useEffect(() => {
    const savedTheme = localStorage.getItem("theme");
    const shouldBeDark = savedTheme === "dark";
    setIsDark(shouldBeDark);
    if (shouldBeDark) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const toggleTheme = () => {
    const newIsDark = !isDark;
    setIsDark(newIsDark);
    if (newIsDark) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
  };

  const navLinks = [
    { href: "/", label: "Home" },
    { href: "/inventory", label: "Inventory" },
    { href: "/evolution-d-max-xt4", label: "D-MAX XT4" },
    { href: "/evolution-d-max-xt6", label: "D-MAX XT6" },
    { href: "/guides", label: "Guides" },
    { href: "/financing", label: "Financing" },
    { href: "/contact", label: "Contact" },
  ];

  const isActive = (href: string) => {
    if (href === "/" && location === "/") return true;
    if (href !== "/" && location.startsWith(href)) return true;
    return false;
  };

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled
          ? "bg-background/95 backdrop-blur-md border-b border-border shadow-md"
          : "bg-transparent"
      }`}
    >
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 lg:h-20">
          <Link href="/" data-testid="link-home-logo">
            <span className="font-bold text-lg lg:text-xl tracking-tight cursor-pointer hover:text-primary transition-colors">
              {SITE.name}
            </span>
          </Link>

          <div className="hidden lg:flex items-center gap-5 xl:gap-7">
            {navLinks.map((link) => (
              <Link key={link.href} href={link.href}>
                <span
                  className={`text-sm font-medium transition-colors cursor-pointer ${
                    isActive(link.href)
                      ? "text-primary"
                      : "text-foreground/80 hover:text-foreground"
                  }`}
                  data-testid={`link-nav-${link.label.toLowerCase().replace(/\s+/g, "-")}`}
                >
                  {link.label}
                </span>
              </Link>
            ))}
          </div>

          <div className="flex items-center gap-2">
            <Button
              size="icon"
              variant="ghost"
              onClick={toggleTheme}
              aria-label={isDark ? "Switch to light theme" : "Switch to dark theme"}
              data-testid="button-theme-toggle"
            >
              {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </Button>
            
            <a href={SITE.phoneHref} className="hidden lg:block">
              <Button className="gap-2" data-testid="button-call-now-header">
                <Phone className="w-4 h-4" />
                {SITE.phoneDisplay}
              </Button>
            </a>

            <Button
              size="icon"
              variant="ghost"
              className="lg:hidden"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              aria-label={isMenuOpen ? "Close menu" : "Open menu"}
              aria-expanded={isMenuOpen}
              data-testid="button-mobile-menu"
            >
              {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </Button>
          </div>
        </div>
      </nav>

      {isMenuOpen && (
        <div className="lg:hidden bg-background/98 backdrop-blur-lg border-b border-border">
          <div className="px-4 py-6 space-y-4">
            {navLinks.map((link) => (
              <Link key={link.href} href={link.href}>
                <div
                  className={`block py-3 px-4 rounded-md font-medium transition-colors cursor-pointer ${
                    isActive(link.href)
                      ? "bg-primary/10 text-primary"
                      : "hover:bg-muted"
                  }`}
                  onClick={() => setIsMenuOpen(false)}
                  data-testid={`link-mobile-${link.label.toLowerCase().replace(/\s+/g, "-")}`}
                >
                  {link.label}
                </div>
              </Link>
            ))}
            <a href={SITE.phoneHref}>
              <Button className="w-full mt-4 gap-2" onClick={() => setIsMenuOpen(false)} data-testid="button-mobile-call-now">
                <Phone className="w-4 h-4" />
                {SITE.phoneDisplay}
              </Button>
            </a>
          </div>
        </div>
      )}
    </header>
  );
}
