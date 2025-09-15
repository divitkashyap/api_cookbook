import { useState, useEffect } from "react";
import { Bell, Code, Palette, Shield, User, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";

const SettingsPage = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [notifications, setNotifications] = useState(true);
  const [autoSearch, setAutoSearch] = useState(false);
  const [darkMode, setDarkMode] = useState(true);
  const [searchLanguage, setSearchLanguage] = useState("javascript");

  useEffect(() => {
    setIsVisible(true);
  }, []);

  return (
    <div className="min-h-screen pt-24 p-6">
      <div className="container mx-auto max-w-4xl">
        {/* Header */}
        <div className={cn(
          "mb-8 transition-all duration-700",
          isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
        )}>
          <h1 className="text-4xl font-bold mb-4 font-jakarta">
            <span className="text-primary">Errata</span> Settings
          </h1>
          <p className="text-lg text-muted-foreground">
            Customize your Errata experience
          </p>
        </div>

        {/* Settings Grid */}
        <div className="grid gap-6">
          {/* Profile Settings */}
          <Card className={cn(
            "hover-lift bg-gradient-surface border-border/50 transition-all duration-700",
            isVisible ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-4"
          )}>
            <CardHeader>
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center">
                  <User className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <CardTitle className="font-jakarta">Profile Settings</CardTitle>
                  <CardDescription>Manage your account information</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="username" className="text-foreground">Username</Label>
                  <Input id="username" placeholder="developer_user" className="bg-surface/50" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-foreground">Email</Label>
                  <Input id="email" type="email" placeholder="dev@example.com" className="bg-surface/50" />
                </div>
              </div>
              <Button variant="cyber" size="sm">
                Update Profile
              </Button>
            </CardContent>
          </Card>

          {/* Search Preferences */}
          <Card className={cn(
            "hover-lift bg-gradient-surface border-border/50 transition-all duration-700 delay-100",
            isVisible ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-4"
          )}>
            <CardHeader>
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-lg bg-accent/20 flex items-center justify-center">
                  <Zap className="h-5 w-5 text-accent" />
                </div>
                <div>
                  <CardTitle className="font-jakarta">Search Preferences</CardTitle>
                  <CardDescription>Customize your search experience</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label className="text-foreground">Auto-complete suggestions</Label>
                  <p className="text-sm text-muted-foreground">Show search suggestions as you type</p>
                </div>
                <Switch checked={autoSearch} onCheckedChange={setAutoSearch} />
              </div>
              
              <Separator className="bg-border/50" />
              
              <div className="space-y-2">
                <Label className="text-foreground">Default code examples language</Label>
                <Select value={searchLanguage} onValueChange={setSearchLanguage}>
                  <SelectTrigger className="bg-surface/50">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="javascript">JavaScript</SelectItem>
                    <SelectItem value="python">Python</SelectItem>
                    <SelectItem value="curl">cURL</SelectItem>
                    <SelectItem value="php">PHP</SelectItem>
                    <SelectItem value="ruby">Ruby</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Notifications */}
          <Card className={cn(
            "hover-lift bg-gradient-surface border-border/50 transition-all duration-700 delay-200",
            isVisible ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-4"
          )}>
            <CardHeader>
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-lg bg-success/20 flex items-center justify-center">
                  <Bell className="h-5 w-5 text-success" />
                </div>
                <div>
                  <CardTitle className="font-jakarta">Notifications</CardTitle>
                  <CardDescription>Control what updates you receive</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label className="text-foreground">New error codes</Label>
                  <p className="text-sm text-muted-foreground">Get notified when new error codes are added</p>
                </div>
                <Switch checked={notifications} onCheckedChange={setNotifications} />
              </div>
              
              <Separator className="bg-border/50" />
              
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label className="text-foreground">API updates</Label>
                  <p className="text-sm text-muted-foreground">Updates to existing API documentation</p>
                </div>
                <Switch checked={true} onCheckedChange={() => {}} />
              </div>
              
              <Separator className="bg-border/50" />
              
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label className="text-foreground">Weekly digest</Label>
                  <p className="text-sm text-muted-foreground">Summary of new content and updates</p>
                </div>
                <Switch checked={false} onCheckedChange={() => {}} />
              </div>
            </CardContent>
          </Card>

          {/* Appearance */}
          <Card className={cn(
            "hover-lift bg-gradient-surface border-border/50 transition-all duration-700 delay-300",
            isVisible ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-4"
          )}>
            <CardHeader>
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-lg bg-warning/20 flex items-center justify-center">
                  <Palette className="h-5 w-5 text-warning" />
                </div>
                <div>
                  <CardTitle className="font-jakarta">Appearance</CardTitle>
                  <CardDescription>Customize the interface</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label className="text-foreground">Dark mode</Label>
                  <p className="text-sm text-muted-foreground">Use dark theme interface</p>
                </div>
                <Switch checked={darkMode} onCheckedChange={setDarkMode} />
              </div>
              
              <Separator className="bg-border/50" />
              
              <div className="space-y-2">
                <Label className="text-foreground">Interface density</Label>
                <Select defaultValue="comfortable">
                  <SelectTrigger className="bg-surface/50">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="comfortable">Comfortable</SelectItem>
                    <SelectItem value="compact">Compact</SelectItem>
                    <SelectItem value="spacious">Spacious</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Developer Tools */}
          <Card className={cn(
            "hover-lift bg-gradient-surface border-border/50 transition-all duration-700 delay-400",
            isVisible ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-4"
          )}>
            <CardHeader>
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-lg bg-secondary/20 flex items-center justify-center">
                  <Code className="h-5 w-5 text-secondary-foreground" />
                </div>
                <div>
                  <CardTitle className="font-jakarta">Developer Tools</CardTitle>
                  <CardDescription>Advanced settings and API access</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label className="text-foreground">API Key</Label>
                <div className="flex space-x-2">
                  <Input 
                    value="sk_live_••••••••••••••••••••••••••••"
                    readOnly
                    className="bg-surface/50 font-mono text-sm"
                  />
                  <Button variant="outline" size="sm">
                    Regenerate
                  </Button>
                </div>
              </div>
              
              <Separator className="bg-border/50" />
              
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label className="text-foreground">Debug mode</Label>
                  <p className="text-sm text-muted-foreground">Show additional debugging information</p>
                </div>
                <Switch checked={false} onCheckedChange={() => {}} />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Save Button */}
        <div className={cn(
          "mt-8 flex justify-end transition-all duration-700 delay-500",
          isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
        )}>
          <Button variant="hero" size="lg" className="shadow-cyber">
            <Zap className="h-4 w-4 mr-2" />
            Save All Changes
          </Button>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;