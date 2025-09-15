import { Link, useLocation } from "react-router-dom";
import { Home, Search, Settings, Code2, Zap, BookOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useState } from "react";
import { is } from "@react-three/fiber/dist/declarations/src/core/utils";

const Navigation = () => {
  const location = useLocation();
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);

  const navItems = [
    { to: "/", icon: Home, label: "Home" },
    { to: "/search", icon: Search, label: "Search" },
    { to: "/docs", icon: BookOpen, label: "Docs" },
    { to: "/settings", icon: Settings, label: "Settings" },
  ];

  return (
    <nav className="fixed top-6 left-1/2 transform -translate-x-1/2 z-50">
      <div className="bg-surface/15 backdrop-blur-2xl border border-border/20 rounded-full shadow-glow px-6 py-4 transition-all duration-500 hover:bg-surface/25 hover:border-border/40">
        <div className="flex items-center justify-between gap-8">
          <Link to="/" className="flex items-center space-x-2 hover-glow transition-all duration-300">
            <div className="relative">
              <Code2 className="h-7 w-7 text-primary" />
              <Zap className="h-3 w-3 text-accent absolute -top-0.5 -right-0.5" />
            </div>
            <span className="font-bold text-lg font-jakarta bg-gradient-primary bg-clip-text text-transparent">
              Errata
            </span>
          </Link>

          <div className="flex items-center space-x-2">
            {navItems.map((item) => {
              const isActive = location.pathname === item.to;
              const isHovered = hoveredItem === item.to;
              
              return (
                <div
                  key={item.to}
                  className="relative"
                  onMouseEnter={() => setHoveredItem(item.to)}
                  onMouseLeave={() => setHoveredItem(null)}
                >
                  <Button
                    variant={isActive ? "cyber" : "ghost"}
                    size="sm"
                    asChild
                    className={cn(
                      "relative overflow-hidden rounded-full transition-all duration-500 ease-out",
                      isHovered || isActive ? "px-4" : "px-3 w-10",
                      isActive && "bg-primary/10 border border-primary/20"
                    )}
                    style={{
                      transitionDelay: isHovered ? "150ms" : "0ms"
                    }}
                  >
                    <Link to={item.to} className="flex items-center space-x-2">
                      <item.icon className={cn(
                        "transition-all duration-300",
                        isActive ? "h-4 w-4 text-primary" : "h-4 w-4"
                      )} />
                      <span className={cn(
                        "font-medium font-jakarta transition-all duration-500 ease-out whitespace-nowrap",
                        isHovered || isActive ? "opacity-100 w-auto" : "opacity-0 w-0 overflow-hidden",
                        isActive ? "text-white" : "text-current",
                        isHovered && !isActive ? "text-white" : "" 
                      )}>
                        {item.label}
                      </span>
                      {isActive && (
                        <div className="absolute inset-0 bg-gradient-primary rounded-full opacity-5" />
                      )}
                    </Link>
                  </Button>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;