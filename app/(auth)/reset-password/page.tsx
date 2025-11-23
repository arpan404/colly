"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";

const ResetPassword = () => {
  const [username, setUsername] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle reset password logic here
  };

  return (
    <div className="flex min-h-screen w-full">
      {/* Left side - Illustration */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-blue items-center justify-center p-12">
        <div className="max-w-md">
          {/* Placeholder for illustration */}
          <div className="text-white text-center">
            <div className="w-64 h-64 mx-auto bg-white/10 rounded-full flex items-center justify-center mb-4">
              <span className="text-6xl">❓</span>
            </div>
            <h2 className="text-3xl font-bold mb-2">Forgot Your Password?</h2>
            <p className="text-white/80">No worries, we'll help you reset it</p>
          </div>
        </div>
      </div>

      {/* Right side - Reset form */}
      <div className="flex-1 flex items-center justify-center p-8 bg-background">
        <Card className="w-full max-w-md p-8 shadow-lg">
          <h1 className="text-2xl font-bold text-center mb-8">Reset Password</h1>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="username" className="text-muted-foreground">Username</Label>
              <Input
                id="username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="bg-muted/50"
              />
            </div>

            <Button type="submit" className="w-full bg-accent hover:bg-accent/90">
              Reset Now
            </Button>
          </form>
        </Card>
      </div>
    </div>
  );
};

export default ResetPassword;