import { Link } from "wouter";
import { getBlogPostBySlug, blogPosts } from "@/data/blogPosts";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Calendar, ArrowLeft, ArrowRight, Share2 } from "lucide-react";
import { ResponsiveImage } from "@/components/ResponsiveImage";
import { Breadcrumbs } from "@/components/Breadcrumbs";

export default function BlogPost({ slug }: { slug: string }) {
  const post = getBlogPostBySlug(slug);


  if (!post) {
    return (
      <div className="min-h-screen pt-20 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Blog Post Not Found</h1>
          <Link href="/blog">
            <Button>Return to Blog</Button>
          </Link>
        </div>
      </div>
    );
  }

  const currentIndex = blogPosts.findIndex(p => p.id === post.id);
  const prevPost = currentIndex > 0 ? blogPosts[currentIndex - 1] : null;
  const nextPost = currentIndex < blogPosts.length - 1 ? blogPosts[currentIndex + 1] : null;

  const renderContent = () => {
    return post.content.map((block, index) => {
      const key = `content-${index}`;
      
      switch (block.type) {
        case "h2":
          return (
            <h2 key={key} className="text-2xl font-bold mt-8 mb-4">
              {block.text}
            </h2>
          );
        case "h3":
          return (
            <h3 key={key} className="text-xl font-bold mt-6 mb-3">
              {block.text}
            </h3>
          );
        case "h4":
          return (
            <h4 key={key} className="text-lg font-bold mt-5 mb-2">
              {block.text}
            </h4>
          );
        case "h5":
          return (
            <h5 key={key} className="text-base font-bold mt-4 mb-2">
              {block.text}
            </h5>
          );
        case "h6":
          return (
            <h6 key={key} className="text-sm font-bold mt-4 mb-2">
              {block.text}
            </h6>
          );
        case "p":
          return (
            <p key={key} className="text-muted-foreground leading-relaxed mb-4">
              {block.text}
            </p>
          );
        case "ul":
          return (
            <ul key={key} className="list-disc list-inside space-y-2 mb-4 text-muted-foreground">
              {block.items?.map((item, i) => (
                <li key={i} className="leading-relaxed">{item}</li>
              ))}
            </ul>
          );
        case "ol":
          return (
            <ol key={key} className="list-decimal list-inside space-y-2 mb-4 text-muted-foreground">
              {block.items?.map((item, i) => (
                <li key={i} className="leading-relaxed">{item}</li>
              ))}
            </ol>
          );
        default:
          return null;
      }
    });
  };

  return (
    <>
      <article className="min-h-screen pt-20 pb-24 lg:pb-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Breadcrumbs path={`/blog/${post.slug}`} className="pt-6 pb-4" />
        </div>
        <div className="relative h-[40vh] min-h-[300px] lg:h-[50vh] overflow-hidden">
          <ResponsiveImage
            name={post.heroImage}
            alt={post.heroAlt}
            sizes="100vw"
            priority
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />
          <div className="absolute bottom-0 left-0 right-0 p-6 lg:p-12">
            <div className="max-w-4xl mx-auto">
              <Link href="/blog">
                <Button variant="outline" size="sm" className="mb-4 bg-white/10 border-white/20 text-white hover:bg-white/20" data-testid="button-back-blog">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to Blog
                </Button>
              </Link>
              <div className="flex items-center gap-2 text-white/80 mb-3">
                <Calendar className="w-4 h-4" />
                <time dateTime={post.publishDate}>
                  {new Date(post.publishDate).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "long",
                    day: "numeric"
                  })}
                </time>
              </div>
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white leading-tight">
                {post.title}
              </h1>
            </div>
          </div>
        </div>

        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="prose prose-lg max-w-none">
            {renderContent().slice(0, Math.ceil(post.content.length / 2))}
            
            <div className="my-8 p-5 bg-muted/50 border-l-4 border-primary rounded-r-lg not-prose">
              <p className="text-sm font-medium mb-2">Explore Our Models</p>
              <p className="text-sm text-muted-foreground mb-3">
                The <Link href="/evolution-d-max-xt4" className="text-primary underline hover:text-primary/80">EVolution D-MAX XT4</Link> (4-passenger) 
                and <Link href="/evolution-d-max-xt6" className="text-primary underline hover:text-primary/80">EVolution D-MAX XT6</Link> (6-passenger) 
                feature the technologies discussed in this article.
              </p>
            </div>
            
            {renderContent().slice(Math.ceil(post.content.length / 2))}
          </div>

          <div className="mt-12 p-6 bg-primary/5 border border-primary/20 rounded-lg">
            <h3 className="text-xl font-bold mb-3">Explore Our All Terrain Golf Carts</h3>
            <p className="text-muted-foreground mb-4">
              Ready to experience the power of 4WD electric golf carts? Check out our flagship models featuring dual 6.3kW motors, on-demand 4-wheel-drive, and premium amenities.
            </p>
            <div className="flex flex-col sm:flex-row gap-3">
              <Link href="/evolution-d-max-xt4">
                <Button className="w-full sm:w-auto" data-testid="button-post-xt4">
                  EVolution D-MAX XT4 (4-Seat)
                </Button>
              </Link>
              <Link href="/evolution-d-max-xt6">
                <Button variant="outline" className="w-full sm:w-auto" data-testid="button-post-xt6">
                  EVolution D-MAX XT6 (6-Seat)
                </Button>
              </Link>
            </div>
          </div>

          <div className="mt-12 pt-8 border-t border-border">
            <div className="flex flex-col sm:flex-row justify-between gap-4">
              {prevPost ? (
                <Link href={`/blog/${prevPost.slug}`} className="flex-1">
                  <Card className="p-4 hover-elevate cursor-pointer h-full" data-testid="link-prev-post">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                      <ArrowLeft className="w-4 h-4" />
                      Previous Article
                    </div>
                    <p className="font-medium line-clamp-2">{prevPost.title}</p>
                  </Card>
                </Link>
              ) : (
                <div className="flex-1" />
              )}
              {nextPost ? (
                <Link href={`/blog/${nextPost.slug}`} className="flex-1">
                  <Card className="p-4 hover-elevate cursor-pointer h-full text-right" data-testid="link-next-post">
                    <div className="flex items-center justify-end gap-2 text-sm text-muted-foreground mb-2">
                      Next Article
                      <ArrowRight className="w-4 h-4" />
                    </div>
                    <p className="font-medium line-clamp-2">{nextPost.title}</p>
                  </Card>
                </Link>
              ) : (
                <div className="flex-1" />
              )}
            </div>
          </div>
        </div>

        <section className="py-12 bg-card border-t border-border">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-2xl font-bold mb-8 text-center">More Articles</h2>
            <div className="grid gap-6 md:grid-cols-3">
              {blogPosts
                .filter(p => p.id !== post.id)
                .slice(0, 3)
                .map((relatedPost) => (
                  <Link key={relatedPost.id} href={`/blog/${relatedPost.slug}`}>
                    <Card className="overflow-hidden hover-elevate cursor-pointer h-full" data-testid={`related-post-${relatedPost.id}`}>
                      <div className="aspect-[16/10] overflow-hidden">
                        <ResponsiveImage
                          name={relatedPost.heroImage}
                          alt={relatedPost.heroAlt}
                          sizes="(min-width: 1024px) 33vw, 100vw"
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="p-4">
                        <h3 className="font-bold line-clamp-2">{relatedPost.title}</h3>
                      </div>
                    </Card>
                  </Link>
                ))}
            </div>
          </div>
        </section>
      </article>
    </>
  );
}
