import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import Home from "@/pages/Home";
import ModelXT4 from "@/pages/ModelXT4";
import ModelXT6 from "@/pages/ModelXT6";
import Financing from "@/pages/Financing";
import Contact from "@/pages/Contact";
import LocationPage from "@/pages/LocationPage";
import Blog from "@/pages/Blog";
import BlogPost from "@/pages/BlogPost";
import NotFound from "@/pages/not-found";
import { locations } from "@/data/locations";
import { blogPosts } from "@/data/blogPosts";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/evolution-d-max-xt4" component={ModelXT4} />
      <Route path="/evolution-d-max-xt6" component={ModelXT6} />
      <Route path="/financing" component={Financing} />
      <Route path="/contact" component={Contact} />
      <Route path="/blog" component={Blog} />
      {blogPosts.map((post) => (
        <Route key={post.slug} path={`/blog/${post.slug}`} component={BlogPost} />
      ))}
      {locations.map((loc) => (
        <Route key={loc.slug} path={`/${loc.slug}`} component={LocationPage} />
      ))}
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <div className="min-h-screen flex flex-col">
          <Header />
          <main className="flex-1">
            <Router />
          </main>
          <Footer />
        </div>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
