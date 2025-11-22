import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { TRPCProvider } from "@/lib/trpc-client";
import { AuthProvider } from "@/lib/auth-context";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login";
import ResetPassword from "./pages/ResetPassword";
import Dashboard from "./pages/Dashboard";
import WeeklyRoutine from "./pages/WeeklyRoutine";
import Budget from "./pages/Budget";
import SocialHub from "./pages/SocialHub";
import Wellness from "./pages/Wellness";
import StudyTools from "./pages/StudyTools";
import Settings from "./pages/Settings";
import NotFound from "./pages/NotFound";

const App = () => (
  <TRPCProvider>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Navigate to="/login" replace />} />
            <Route path="/login" element={<Login />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            <Route 
              path="/dashboard" 
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/weekly-routine" 
              element={
                <ProtectedRoute>
                  <WeeklyRoutine />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/budget" 
              element={
                <ProtectedRoute>
                  <Budget />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/social-hub" 
              element={
                <ProtectedRoute>
                  <SocialHub />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/wellness" 
              element={
                <ProtectedRoute>
                  <Wellness />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/study-tools" 
              element={
                <ProtectedRoute>
                  <StudyTools />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/settings" 
              element={
                <ProtectedRoute>
                  <Settings />
                </ProtectedRoute>
              } 
            />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </TRPCProvider>
);

export default App;
