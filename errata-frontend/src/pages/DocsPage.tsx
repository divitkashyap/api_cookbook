import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Code, BookOpen, Zap, ArrowRight, ExternalLink } from "lucide-react";

const DocsPage = () => {
  const sections = [
    {
      title: "Quick Start",
      description: "Get up and running with Errata in minutes",
      items: [
        { title: "Installation", description: "Set up your environment" },
        { title: "First Query", description: "Run your first graph query" },
        { title: "Error Resolution", description: "Find and fix API errors" }
      ]
    },
    {
      title: "Graph Query Language",
      description: "Master our vector-based query system",
      items: [
        { title: "Syntax Reference", description: "Complete query syntax guide" },
        { title: "Advanced Patterns", description: "Complex relationship queries" },
        { title: "Performance Optimization", description: "Optimize your queries" }
      ]
    },
    {
      title: "API Reference",
      description: "Complete API documentation",
      items: [
        { title: "Stripe Integration", description: "Stripe API error codes" },
        { title: "GitHub Integration", description: "GitHub API error patterns" },
        { title: "Custom APIs", description: "Add your own API patterns" }
      ]
    }
  ];

  return (
    <div className="min-h-screen py-8">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="flex items-center justify-center space-x-3 mb-4">
            <BookOpen className="h-10 w-10 text-primary" />
            <h1 className="text-4xl md:text-5xl font-bold font-jakarta bg-gradient-primary bg-clip-text text-transparent">
              Documentation
            </h1>
          </div>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Everything you need to master API error resolution with graph-powered intelligence
          </p>
        </div>

        {/* Quick Actions */}
        <div className="grid md:grid-cols-3 gap-6 mb-16">
          <Card className="hover-lift bg-gradient-surface border-border/50">
            <CardHeader>
              <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                <Zap className="h-6 w-6 text-primary" />
              </div>
              <CardTitle className="font-jakarta">Quick Start Guide</CardTitle>
              <CardDescription>Get started in under 5 minutes</CardDescription>
            </CardHeader>
            <CardContent>
              <Button variant="outline" className="w-full group">
                Start Tutorial
                <ArrowRight className="h-4 w-4 ml-2 transition-transform group-hover:translate-x-1" />
              </Button>
            </CardContent>
          </Card>

          <Card className="hover-lift bg-gradient-surface border-border/50">
            <CardHeader>
              <div className="w-12 h-12 rounded-lg bg-accent/10 flex items-center justify-center mb-4">
                <Code className="h-6 w-6 text-accent" />
              </div>
              <CardTitle className="font-jakarta">API Reference</CardTitle>
              <CardDescription>Complete API documentation</CardDescription>
            </CardHeader>
            <CardContent>
              <Button variant="outline" className="w-full group">
                Browse APIs
                <ExternalLink className="h-4 w-4 ml-2" />
              </Button>
            </CardContent>
          </Card>

          <Card className="hover-lift bg-gradient-surface border-border/50">
            <CardHeader>
              <div className="w-12 h-12 rounded-lg bg-success/10 flex items-center justify-center mb-4">
                <BookOpen className="h-6 w-6 text-success" />
              </div>
              <CardTitle className="font-jakarta">Examples</CardTitle>
              <CardDescription>Real-world implementation examples</CardDescription>
            </CardHeader>
            <CardContent>
              <Button variant="outline" className="w-full group">
                View Examples
                <ArrowRight className="h-4 w-4 ml-2 transition-transform group-hover:translate-x-1" />
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Documentation Sections */}
        <div className="space-y-12">
          {sections.map((section, index) => (
            <div key={section.title}>
              <div className="mb-8">
                <h2 className="text-2xl md:text-3xl font-bold mb-2 font-jakarta">
                  {section.title}
                </h2>
                <p className="text-muted-foreground text-lg">
                  {section.description}
                </p>
              </div>

              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {section.items.map((item, itemIndex) => (
                  <Card 
                    key={item.title}
                    className="hover-lift hover-glow bg-gradient-surface border-border/50 cursor-pointer transition-all duration-300"
                  >
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div>
                          <CardTitle className="text-lg font-jakarta mb-2">
                            {item.title}
                          </CardTitle>
                          <CardDescription>
                            {item.description}
                          </CardDescription>
                        </div>
                        <Badge variant="secondary" className="ml-2">
                          {index + 1}.{itemIndex + 1}
                        </Badge>
                      </div>
                    </CardHeader>
                  </Card>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Footer CTA */}
        <div className="text-center mt-16 py-12 bg-surface/20 rounded-2xl">
          <h3 className="text-2xl font-bold mb-4 font-jakarta">
            Need Help?
          </h3>
          <p className="text-muted-foreground mb-6">
            Join our community or reach out for personalized support
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button variant="hero" className="group">
              Join Discord
              <ExternalLink className="h-4 w-4 ml-2" />
            </Button>
            <Button variant="outline">
              Contact Support
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DocsPage;