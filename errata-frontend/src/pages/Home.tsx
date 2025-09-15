import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Code, Zap, Shield, Search, Github, CreditCard } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import GraphIntro from "@/components/GraphIntro";
import APIDashboard from "@/components/APIDashboard";

const Home = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [showIntro, setShowIntro] = useState(true);
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    if (!showIntro) {
      setIsVisible(true);
    }
  }, [showIntro]);

  const features = [
    {
      icon: Code,
      title: "Graph Query Language",
      description: "Advanced vector-based querying for complex API relationships and error patterns.",
      color: "text-primary"
    },
    {
      icon: Zap,
      title: "Lightning Fast Search",
      description: "Find exactly what you need in milliseconds with our intelligent search engine.",
      color: "text-accent"
    },
    {
      icon: Shield,
      title: "Error Code Database",
      description: "Comprehensive collection of API error codes with detailed explanations and solutions.",
      color: "text-success"
    }
  ];

  const apis = [
    {
      name: "Stripe API",
      icon: CreditCard,
      description: "Payment processing errors and solutions",
      status: "Active",
      count: "169+ errors"
    },
    {
      name: "GitHub API",
      icon: Github,
      description: "Version control and repository management",
      status: "Coming Soon",
      count: "200+ errors"
    }
  ];

  if (showIntro) {
    return <GraphIntro onComplete={() => setShowIntro(false)} />;
  }

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 cyber-grid opacity-20" />
        <div 
          className="absolute inset-0 bg-gradient-to-br from-background via-background/95 to-surface/50"
          style={{ transform: `translateY(${scrollY * 0.5}px)` }}
        />
        
        <div className={cn(
          "relative z-10 text-center max-w-5xl mx-auto px-4 transition-all duration-1000",
          isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
        )}
        style={{ transform: `translateY(${scrollY * -0.3}px)` }}
        >
          <h1 className="text-6xl md:text-8xl font-bold mb-8 font-jakarta leading-tight">
            <span className="bg-gradient-cyber bg-clip-text text-transparent">
              Errata
            </span>
          </h1>
          
          <p className="text-xl md:text-2xl text-muted-foreground mb-10 leading-relaxed max-w-3xl mx-auto">
            Navigate the complexity of API integrations with our 
            <span className="text-primary font-medium"> graph-neural network</span> powered error resolution platform.
            <br />
            <span className="text-accent font-medium">Find solutions instantly. Debug smarter. Ship with confidence.</span>
          </p>
          
          <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
            <Button variant="hero" size="lg" asChild className="group shadow-glow">
              <Link to="/search" className="flex items-center space-x-3 px-8 py-4">
                <Search className="h-5 w-5" />
                <span>Explore Graph Database</span>
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Link>
            </Button>
            
            <Button variant="outline" size="lg" className="bg-surface/30 backdrop-blur-xl border-border/40 hover:fill-white px-8 py-4">
              <Code className="h-5 w-5 mr-3" />
              View Documentation
            </Button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section 
        className="py-24 px-4 relative"
        style={{ 
          transform: `translateY(${scrollY * -0.1}px)`,
          // opacity: Math.max(0, 1 - scrollY / 1000)
        }}
      >
        <div className="container mx-auto relative">

          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-6 text-white font-jakarta">
              Powered by Graph Technology
            </h2>
            <p className="text-xl text-gray-300 max-w-2xl mx-auto leading-relaxed">
              Our vector query language maps relationships between errors, solutions, and API endpoints
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <Card 
                key={feature.title}
                className={cn(
                  "hover-lift hover-glow bg-gradient-surface border-border/50 transition-all duration-500",
                  isVisible ? "animate-fade-in" : "opacity-0"
                )}
                style={{ animationDelay: `${index * 200}ms` }}
              >
                <CardHeader>
                  <div className={cn("w-12 h-12 rounded-lg bg-surface-elevated flex items-center justify-center mb-4", feature.color)}>
                    <feature.icon className="h-6 w-6" />
                  </div>
                  <CardTitle className="text-xl font-jakarta">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-base leading-relaxed">
                    {feature.description}
                  </CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* API Coverage Section */}
      <section 
        className="py-24 px-4 bg-surface/20 relative"
        style={{ 
          transform: `translateY(${scrollY * -0.05}px)` 
        }}
      >
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4 font-jakarta">
              API Coverage
            </h2>
            <p className="text-lg text-muted-foreground">
              Growing library of documented APIs and their error patterns
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {apis.map((api, index) => (
              <Card 
                key={api.name}
                className={cn(
                  "hover-lift bg-gradient-surface border-border/50 relative overflow-hidden",
                  isVisible ? "animate-slide-in" : "opacity-0"
                )}
                style={{ animationDelay: `${index * 300}ms` }}
              >
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 rounded-lg bg-surface-elevated flex items-center justify-center">
                        <api.icon className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <CardTitle className="text-lg font-jakarta">{api.name}</CardTitle>
                        <CardDescription>{api.description}</CardDescription>
                      </div>
                    </div>
                    <div className={cn(
                      "px-2 py-1 rounded-full text-xs font-medium",
                      api.status === "Active" 
                        ? "bg-success/20 text-success" 
                        : "bg-warning/20 text-warning"
                    )}>
                      {api.status}
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-sm text-muted-foreground">
                    {api.count}
                  </div>
                </CardContent>
                {api.status === "Active" && (
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent to-primary/5 pointer-events-none" />
                )}
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Real-time API Stats Dashboard */}
      <section className="py-20 px-4 bg-gradient-to-b from-surface/20 to-transparent">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-6 text-white font-jakarta">
              Live API Updates
            </h2>
            <p className="text-xl text-gray-300 max-w-2xl mx-auto leading-relaxed">
              Real-time statistics from our curated error pattern database with accurate counts and comprehensive coverage
            </p>
          </div>
          
          <APIDashboard />
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto text-center">
          <div className="max-w-2xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold mb-6 font-jakarta">
              Ready to <span className="text-accent">Debug Faster</span>?
            </h2>
            <p className="text-lg text-muted-foreground mb-8">
              Join developers who ship with confidence using our comprehensive API cookbook
            </p>
            <Button variant="hero" size="lg" asChild className="group shadow-cyber">
              <Link to="/search" className="flex items-center space-x-2">
                <Search className="h-5 w-5" />
                <span>Explore Error Codes</span>
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;