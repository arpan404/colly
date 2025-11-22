import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Link } from "react-router-dom";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/lib/auth-context";
import { toast } from "sonner";

const Login = () => {
  const { login } = useAuth();
  const loginMutation = trpc.auth.login.useMutation();
  const signupMutation = trpc.auth.signup.useMutation();

  const [loginForm, setLoginForm] = useState({
    email: "",
    password: "",
  });

  const [signupForm, setSignupForm] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const result = await loginMutation.mutateAsync({ 
        email: loginForm.email, 
        password: loginForm.password 
      });
      login(result.token);
      toast.success("Logged in successfully!");
    } catch (error: any) {
      toast.error(error.message || "Login failed");
    }
  };

  const handleSignupSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (signupForm.password !== signupForm.confirmPassword) {
      toast.error("Passwords don't match!");
      return;
    }
    try {
      const result = await signupMutation.mutateAsync({
        email: signupForm.email,
        password: signupForm.password,
        name: signupForm.name || undefined,
      });
      login(result.token);
      toast.success("Account created successfully!");
    } catch (error: any) {
      toast.error(error.message || "Signup failed");
    }
  };

  return (
    <div className="flex min-h-screen w-full">
      {/* Left side - Illustration */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-blue items-center justify-center p-12">
        <div className="max-w-md">
          {/* Placeholder for illustration - you can add an SVG or image here */}
          <div className="text-white text-center">
            <div className="w-64 h-64 mx-auto bg-white/10 rounded-full flex items-center justify-center mb-4">
              <span className="text-6xl">🔐</span>
            </div>
            <h2 className="text-3xl font-bold mb-2">Welcome to Colly</h2>
            <p className="text-white/80">Your personal productivity companion</p>
          </div>
        </div>
      </div>

      {/* Right side - Auth forms */}
      <div className="flex-1 flex items-center justify-center p-8 bg-background">
        <Card className="w-full max-w-md p-8 shadow-lg">
          <Tabs defaultValue="login" className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-8">
              <TabsTrigger value="login">Login</TabsTrigger>
              <TabsTrigger value="signup">Sign Up</TabsTrigger>
            </TabsList>

            {/* Login Tab */}
            <TabsContent value="login">
              <h1 className="text-2xl font-bold text-center mb-6">Login to Colly</h1>
              
              <form onSubmit={handleLoginSubmit} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="login-email" className="text-muted-foreground">
                    Email
                  </Label>
                  <Input
                    id="login-email"
                    type="email"
                    value={loginForm.email}
                    onChange={(e) => setLoginForm({ ...loginForm, email: e.target.value })}
                    className="bg-muted/50"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="login-password" className="text-muted-foreground">
                      Password
                    </Label>
                    <Link to="/reset-password" className="text-sm text-primary hover:underline">
                      Forget Password?
                    </Link>
                  </div>
                  <Input
                    id="login-password"
                    type="password"
                    value={loginForm.password}
                    onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })}
                    className="bg-muted/50"
                    required
                  />
                </div>

                <Button 
                  type="submit" 
                  className="w-full bg-accent hover:bg-accent/90"
                  disabled={loginMutation.isPending}
                >
                  {loginMutation.isPending ? "Logging in..." : "Login"}
                </Button>
              </form>
            </TabsContent>

            {/* Signup Tab */}
            <TabsContent value="signup">
              <h1 className="text-2xl font-bold text-center mb-6">Create Account</h1>
              
              <form onSubmit={handleSignupSubmit} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="signup-name" className="text-muted-foreground">
                    Name (optional)
                  </Label>
                  <Input
                    id="signup-name"
                    type="text"
                    value={signupForm.name}
                    onChange={(e) => setSignupForm({ ...signupForm, name: e.target.value })}
                    className="bg-muted/50"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="signup-email" className="text-muted-foreground">
                    Email
                  </Label>
                  <Input
                    id="signup-email"
                    type="email"
                    value={signupForm.email}
                    onChange={(e) => setSignupForm({ ...signupForm, email: e.target.value })}
                    className="bg-muted/50"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="signup-password" className="text-muted-foreground">
                    Password
                  </Label>
                  <Input
                    id="signup-password"
                    type="password"
                    value={signupForm.password}
                    onChange={(e) => setSignupForm({ ...signupForm, password: e.target.value })}
                    className="bg-muted/50"
                    required
                    minLength={6}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="signup-confirm-password" className="text-muted-foreground">
                    Confirm Password
                  </Label>
                  <Input
                    id="signup-confirm-password"
                    type="password"
                    value={signupForm.confirmPassword}
                    onChange={(e) => setSignupForm({ ...signupForm, confirmPassword: e.target.value })}
                    className="bg-muted/50"
                    required
                    minLength={6}
                  />
                </div>

                <Button 
                  type="submit" 
                  className="w-full bg-accent hover:bg-accent/90"
                  disabled={signupMutation.isPending}
                >
                  {signupMutation.isPending ? "Creating account..." : "Sign Up"}
                </Button>
              </form>
            </TabsContent>
          </Tabs>
        </Card>
      </div>
    </div>
  );
};

export default Login;
