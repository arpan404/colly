"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Home, Search, ArrowLeft, Sparkles } from "lucide-react";

const NotFound = () => {
  const pathname = usePathname();

  return (
    <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-background via-background/95 to-primary/5 relative overflow-hidden">
      {/* Background decorations */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_80%,rgba(120,119,198,0.1),transparent_50%)] pointer-events-none"></div>
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_20%,rgba(255,107,107,0.05),transparent_50%)] pointer-events-none"></div>
      <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-primary/5 rounded-full blur-3xl"></div>
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-secondary/10 rounded-full blur-3xl"></div>

      <div className="w-full max-w-2xl p-6 relative z-10 animate-fade-in">
        <Card className="border-0 shadow-2xl bg-card/80 backdrop-blur-sm">
          <CardContent className="p-8 sm:p-12 text-center">
            {/* Icon */}
            <div className="w-20 h-20 sm:w-24 sm:h-24 bg-linear-to-br from-primary to-primary/80 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg">
              <Search className="w-10 h-10 sm:w-12 sm:h-12 text-primary-foreground" />
            </div>

            {/* 404 Number */}
            <h1 className="text-7xl sm:text-8xl md:text-9xl font-bold bg-linear-to-r from-primary via-primary/80 to-primary bg-clip-text text-transparent mb-4">
              404
            </h1>

            {/* Message */}
            <h2 className="text-2xl sm:text-3xl font-bold text-foreground mb-3">
              Page Not Found
            </h2>
            <p className="text-base sm:text-lg text-muted-foreground mb-2 max-w-md mx-auto">
              Oops! The page you're looking for doesn't exist.
            </p>
            <p className="text-sm text-muted-foreground/70 mb-8 max-w-md mx-auto">
              It might have been moved or deleted, or you may have mistyped the URL.
            </p>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center items-center">
              <Link href="/dashboard">
                <Button 
                  size="lg"
                  className="w-full sm:w-auto bg-linear-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary text-primary-foreground font-semibold shadow-lg hover:shadow-xl transition-all duration-200"
                >
                  <Home className="w-4 h-4 mr-2" />
                  Go to Dashboard
                </Button>
              </Link>
              <Button 
                size="lg"
                variant="outline"
                onClick={() => window.history.back()}
                className="w-full sm:w-auto border-border/50 hover:bg-secondary/50 transition-all duration-200"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Go Back
              </Button>
            </div>

            {/* Attempted Path */}
            {pathname && (
              <div className="mt-8 pt-6 border-t border-border/50">
                <p className="text-xs text-muted-foreground/60 mb-1">Attempted to access:</p>
                <code className="text-xs sm:text-sm bg-secondary/30 px-3 py-1.5 rounded-md text-foreground/80 font-mono">
                  {pathname}
                </code>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Footer hint */}
        <div className="text-center mt-6">
          <p className="text-sm text-muted-foreground/60 flex items-center justify-center gap-2">
            <Sparkles className="w-4 h-4" />
            Lost? Try searching from the dashboard
          </p>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
