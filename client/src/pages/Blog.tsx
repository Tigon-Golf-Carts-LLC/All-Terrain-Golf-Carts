import { Link } from "wouter";
import { useEffect } from "react";
import { blogPosts } from "@/data/blogPosts";
import { Card } from "@/components/ui/card";
import { Calendar, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function Blog() {
  useEffect(() => {
    document.title = "All Terrain Golf Cart Blog | 4WD Electric Vehicle News & Guides";
    
    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
      metaDescription.setAttribute("content", "Explore expert guides, tips, and news about all terrain golf carts. Learn about 4WD electric vehicles, off-road capabilities, and LSV street-legal features.");
    }
    
    const ogTitle = document.querySelector('meta[property="og:title"]');
    if (ogTitle) ogTitle.setAttribute("content", "All Terrain Golf Cart Blog | 4WD Electric Vehicle News & Guides");
    
    const ogDescription = document.querySelector('meta[property="og:description"]');
    if (ogDescription) ogDescription.setAttribute("content", "Explore expert guides, tips, and news about all terrain golf carts. Learn about 4WD electric vehicles, off-road capabilities, and LSV street-legal features.");
  }, []);

  return (
    <>
      <div className="min-h-screen pt-20">
        <section className="py-12 lg:py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12 lg:mb-16">
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4">
                All Terrain Golf Cart <span className="text-primary">Blog</span>
              </h1>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Expert guides, adventure stories, and everything you need to know about 4WD electric golf carts for off-road exploration.
              </p>
            </div>

            <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
              {blogPosts.map((post) => (
                <Link key={post.id} href={`/blog/${post.slug}`}>
                  <Card 
                    className="overflow-hidden hover-elevate cursor-pointer h-full flex flex-col"
                    data-testid={`blog-card-${post.id}`}
                  >
                    <div className="aspect-[16/10] overflow-hidden">
                      <img
                        src={post.heroImage}
                        alt={post.heroAlt}
                        className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
                      />
                    </div>
                    <div className="p-6 flex flex-col flex-1">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground mb-3">
                        <Calendar className="w-4 h-4" />
                        <time dateTime={post.publishDate}>
                          {new Date(post.publishDate).toLocaleDateString("en-US", {
                            year: "numeric",
                            month: "long",
                            day: "numeric"
                          })}
                        </time>
                      </div>
                      <h2 className="text-xl font-bold mb-3 line-clamp-2">
                        {post.title}
                      </h2>
                      <p className="text-muted-foreground text-sm leading-relaxed mb-4 flex-1 line-clamp-3">
                        {post.excerpt}
                      </p>
                      <div className="flex items-center text-primary font-medium text-sm gap-1">
                        Read More <ArrowRight className="w-4 h-4" />
                      </div>
                    </div>
                  </Card>
                </Link>
              ))}
            </div>
          </div>
        </section>

        <section className="py-12 bg-card border-t border-border">
          <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-2xl font-bold mb-4">Ready to Experience All Terrain Capability?</h2>
            <p className="text-muted-foreground mb-6">
              Explore our EVolution D-MAX 4X4 golf carts and discover the perfect vehicle for your adventures.
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <Link href="/evolution-d-max-xt4">
                <Button size="lg" data-testid="button-blog-xt4">
                  View XT4 (4-Seat)
                </Button>
              </Link>
              <Link href="/evolution-d-max-xt6">
                <Button size="lg" variant="outline" data-testid="button-blog-xt6">
                  View XT6 (6-Seat)
                </Button>
              </Link>
            </div>
          </div>
        </section>
      </div>
    </>
  );
}
