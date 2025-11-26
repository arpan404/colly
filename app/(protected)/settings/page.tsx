"use client";

import { PageLayout } from "@/components/PageLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Palette, DollarSign, Mail, Type, Activity, User, Trash2, Settings as SettingsIcon, Shield, Bell, Monitor, Sun, Moon } from "lucide-react";
import { useState, useEffect, useCallback } from "react";
import { useTheme } from 'next-themes';
import {
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogFooter,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogAction,
  AlertDialogCancel,
} from '@/components/ui/alert-dialog';
import { trpc } from '@/lib/trpc-client';
import { useRouter } from 'next/navigation';
import { toast } from "sonner";

const Settings = () => {
  const router = useRouter();
  const { data: preferences, isLoading } = trpc.user.preferences.get.useQuery();
  const updatePreferencesMutation = trpc.user.preferences.update.useMutation();

  const [emailNotifications, setEmailNotifications] = useState(false);
  const [theme, setThemeSelection] = useState("System");
  const [currency, setCurrency] = useState("USD");
  const [fontSize, setFontSize] = useState("1x");
  const [isResetOpen, setIsResetOpen] = useState(false);

  // Auto-save state
  const [autoSavedSettings, setAutoSavedSettings] = useState<{
    emailNotifications: boolean;
    theme: string;
    currency: string;
    fontSize: string;
  } | null>(null);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [isAutoSaving, setIsAutoSaving] = useState(false);

  // Auto-save function with debounce
  const autoSaveSettings = useCallback(async (settings: {
    emailNotifications: boolean;
    theme: string;
    currency: string;
    fontSize: string;
  }) => {
    setIsAutoSaving(true);
    try {
      const backendTheme = settings.theme === 'Light' ? 'light' : settings.theme === 'Dark' ? 'dark' : 'system';
      const backendFontSize = applyFontSize(settings.fontSize);

      await updatePreferencesMutation.mutateAsync({
        theme: backendTheme,
        currency: settings.currency,
        notifications: settings.emailNotifications,
        fontSize: backendFontSize,
      });

      // Update auto-saved state
      setAutoSavedSettings(settings);
      setHasUnsavedChanges(false);

      // Apply theme and font-size immediately
      try { setTheme(backendTheme as any); } catch (e) { /* noop */ }
    } catch (error) {
      console.error('Failed to auto-save settings:', error);
      // Don't show toast for auto-save failures to avoid spam
    } finally {
      setIsAutoSaving(false);
    }
  }, [updatePreferencesMutation]);

  // Debounced auto-save effect
  useEffect(() => {
    const currentSettings = { emailNotifications, theme, currency, fontSize };
    const hasChanges = autoSavedSettings && (
      autoSavedSettings.emailNotifications !== emailNotifications ||
      autoSavedSettings.theme !== theme ||
      autoSavedSettings.currency !== currency ||
      autoSavedSettings.fontSize !== fontSize
    );

    setHasUnsavedChanges(!!hasChanges);

    if (hasChanges) {
      const timeoutId = setTimeout(() => {
        autoSaveSettings(currentSettings);
      }, 50);

      return () => clearTimeout(timeoutId);
    }
  }, [emailNotifications, theme, currency, fontSize, autoSavedSettings, autoSaveSettings]);
  const { setTheme } = useTheme();

  // Load preferences when data is available
  useEffect(() => {
    if (preferences) {
      setEmailNotifications(preferences.notifications);
      // Map backend theme -> UI values and apply app theme immediately
      setThemeSelection(preferences.theme === 'light' ? 'Light' : preferences.theme === 'dark' ? 'Dark' : 'System');
      try { setTheme(preferences.theme as any); } catch (e) { /* noop */ }
      setCurrency(preferences.currency);
      // Map backend font-size -> UI values (small -> 0.5x, medium -> 1x, large -> 1.5x)
      setFontSize(
        preferences.fontSize === 'small' ? '0.5x' :
        preferences.fontSize === 'large' ? '1.5x' : '1x'
      );

      // Apply font-size to document immediately
      if (typeof document !== 'undefined') {
        const root = document.documentElement;
        root.setAttribute('data-font-size', preferences.fontSize);
      }

      // Set initial auto-saved state
      const initialSettings = {
        emailNotifications: preferences.notifications,
        theme: preferences.theme === 'light' ? 'Light' : preferences.theme === 'dark' ? 'Dark' : 'System',
        currency: preferences.currency,
        fontSize: preferences.fontSize === 'small' ? '0.5x' :
                 preferences.fontSize === 'large' ? '1.5x' : '1x'
      };
      setAutoSavedSettings(initialSettings);
    }
  }, [preferences]);

  const applyFontSize = (uiValue: string) => {
    // map UI font size choice to backend names
    const backendFontSize = uiValue === '0.5x' ? 'small' : uiValue === '1.5x' || uiValue === '2x' ? 'large' : 'medium';
    if (typeof document !== 'undefined') {
      document.documentElement.setAttribute('data-font-size', backendFontSize);
    }
    return backendFontSize;
  };

  const handleResetData = async () => {
    // close dialog
    setIsResetOpen(false);
  };

  if (isLoading) {
    return (
      <PageLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading settings...</p>
          </div>
        </div>
      </PageLayout>
    );
  }

  return (
      <div className="min-h-screen bg-linear-to-br from-background via-background/95 to-background/90">
        <div className="p-4 sm:p-6 lg:p-8 max-w-6xl mx-auto">
          {/* Modern Header */}
          <div className="mb-8">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
              <div className="space-y-1">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-linear-to-br from-primary/20 to-primary/10 rounded-2xl flex items-center justify-center shadow-lg border border-primary/20">
                    <SettingsIcon className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <h1 className="text-3xl sm:text-4xl font-bold bg-linear-to-r from-foreground to-foreground/80 bg-clip-text text-transparent">
                      Settings
                    </h1>
                    <p className="text-lg text-muted-foreground">Customize your Colly experience</p>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Badge variant={hasUnsavedChanges || isAutoSaving ? "default" : "secondary"} className="px-3 py-1">
                  {isAutoSaving ? (
                    <>
                      <div className="w-3 h-3 border-2 border-current border-t-transparent rounded-full animate-spin mr-1" />
                      Saving...
                    </>
                  ) : hasUnsavedChanges ? (
                    <>
                      <Activity className="w-3 h-3 mr-1" />
                      Unsaved changes
                    </>
                  ) : (
                    <>
                      <Activity className="w-3 h-3 mr-1" />
                      All changes saved
                    </>
                  )}
                </Badge>
              </div>
            </div>
          </div>

          <div className="grid gap-8">
            {/* Appearance Settings - Modern Card */}
            <Card className="group relative overflow-hidden border-0 shadow-xl bg-linear-to-br from-card/50 to-card/30 backdrop-blur-sm hover:shadow-2xl transition-all duration-300">
              <div className="absolute inset-0 bg-linear-to-br from-primary/5 via-transparent to-primary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <CardHeader className="relative z-10 pb-6">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 bg-linear-to-br from-primary/20 to-primary/10 rounded-xl flex items-center justify-center">
                    <Palette className="w-5 h-5 text-primary" />
                  </div>
                  <CardTitle className="text-2xl">Appearance</CardTitle>
                </div>
                <CardDescription className="text-base">
                  Customize how Colly looks and feels on your device
                </CardDescription>
              </CardHeader>
              <CardContent className="relative z-10 space-y-8">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  {/* Theme Selection */}
                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-linear-to-br from-primary/20 to-primary/10 rounded-lg flex items-center justify-center">
                        <Palette className="w-4 h-4 text-primary" />
                      </div>
                      <Label className="text-lg font-semibold">Theme</Label>
                    </div>
                    <div className="grid grid-cols-3 gap-3">
                      {[
                        { value: 'System', label: 'System', icon: Monitor },
                        { value: 'Light', label: 'Light', icon: Sun },
                        { value: 'Dark', label: 'Dark', icon: Moon }
                      ].map((option) => (
                        <button
                          key={option.value}
                          onClick={() => {
                            setThemeSelection(option.value);
                            // Apply theme immediately
                            const backendTheme = option.value === 'Light' ? 'light' : option.value === 'Dark' ? 'dark' : 'system';
                            try { setTheme(backendTheme as any); } catch (e) { /* noop */ }
                          }}
                          className={`p-4 rounded-xl border-2 transition-all duration-200 hover:scale-105 ${
                            theme === option.value
                              ? 'border-primary bg-primary/10 shadow-lg'
                              : 'border-border hover:border-primary/50 bg-card/50'
                          }`}
                        >
                          <div className="text-2xl mb-2 flex items-center justify-center">
                            <option.icon className="w-6 h-6 text-primary" />
                          </div>
                          <div className="text-sm font-medium">{option.label}</div>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Font Size Selection */}
                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-linear-to-br from-primary/20 to-primary/10 rounded-lg flex items-center justify-center">
                        <Type className="w-4 h-4 text-primary" />
                      </div>
                      <Label className="text-lg font-semibold">Font Size</Label>
                    </div>
                    <div className="space-y-3">
                      {[
                        { value: '0.5x', label: 'Small', desc: 'Compact text' },
                        { value: '1x', label: 'Medium', desc: 'Standard size' },
                        { value: '1.5x', label: 'Large', desc: 'Easy reading' },
                        { value: '2x', label: 'Extra Large', desc: 'High accessibility' }
                      ].map((option) => (
                        <button
                          key={option.value}
                          onClick={() => {
                            setFontSize(option.value);
                            // Apply font size immediately
                            applyFontSize(option.value);
                          }}
                          className={`w-full p-4 rounded-xl border-2 transition-all duration-200 hover:scale-[1.02] ${
                            fontSize === option.value
                              ? 'border-primary bg-primary/10 shadow-lg'
                              : 'border-border hover:border-primary/50 bg-card/50'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <div className="text-left">
                              <div className="font-medium">{option.label}</div>
                              <div className="text-sm text-muted-foreground">{option.desc}</div>
                            </div>
                            <div className={`text-lg font-bold ${
                              option.value === '0.5x' ? 'text-sm' :
                              option.value === '1x' ? 'text-base' :
                              option.value === '1.5x' ? 'text-lg' : 'text-xl'
                            }`}>
                              Aa
                            </div>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Preferences Settings - Modern Card */}
            <Card className="group relative overflow-hidden border-0 shadow-xl bg-linear-to-br from-card/50 to-card/30 backdrop-blur-sm hover:shadow-2xl transition-all duration-300">
              <div className="absolute inset-0 bg-linear-to-br from-primary/5 via-transparent to-primary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <CardHeader className="relative z-10 pb-6">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 bg-linear-to-br from-primary/20 to-primary/10 rounded-xl flex items-center justify-center">
                    <DollarSign className="w-5 h-5 text-primary" />
                  </div>
                  <CardTitle className="text-2xl">Preferences</CardTitle>
                </div>
                <CardDescription className="text-base">
                  Set your default preferences and regional settings
                </CardDescription>
              </CardHeader>
              <CardContent className="relative z-10 space-y-8">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  {/* Currency Selection */}
                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-linear-to-br from-primary/20 to-primary/10 rounded-lg flex items-center justify-center">
                        <DollarSign className="w-4 h-4 text-primary" />
                      </div>
                      <Label className="text-lg font-semibold">Currency</Label>
                    </div>
                    <Select value={currency} onValueChange={setCurrency}>
                      <SelectTrigger className="h-12 text-base">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="USD">🇺🇸 USD ($)</SelectItem>
                        <SelectItem value="EUR">🇪🇺 EUR (€)</SelectItem>
                        <SelectItem value="GBP">🇬🇧 GBP (£)</SelectItem>
                        <SelectItem value="JPY">🇯🇵 JPY (¥)</SelectItem>
                      </SelectContent>
                    </Select>
                    <p className="text-sm text-muted-foreground">Used for budget and expense tracking</p>
                  </div>

                  {/* Notifications */}
                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-linear-to-br from-primary/20 to-primary/10 rounded-lg flex items-center justify-center">
                        <Bell className="w-4 h-4 text-primary" />
                      </div>
                      <Label className="text-lg font-semibold">Notifications</Label>
                    </div>
                    <Card className="p-6 bg-linear-to-r from-secondary/20 to-secondary/10 border-secondary/30">
                      <div className="flex items-center justify-between">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <Mail className="w-4 h-4 text-primary" />
                            <span className="font-medium">Email Notifications</span>
                          </div>
                          <p className="text-sm text-muted-foreground">Receive updates and reminders via email</p>
                        </div>
                        <Switch
                          checked={emailNotifications}
                          onCheckedChange={setEmailNotifications}
                          className="data-[state=checked]:bg-primary"
                        />
                      </div>
                    </Card>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Account Settings - Modern Card */}
            <Card className="group relative overflow-hidden border-0 shadow-xl bg-linear-to-br from-card/50 to-card/30 backdrop-blur-sm hover:shadow-2xl transition-all duration-300">
              <div className="absolute inset-0 bg-linear-to-br from-primary/5 via-transparent to-primary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <CardHeader className="relative z-10 pb-6">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 bg-linear-to-br from-primary/20 to-primary/10 rounded-xl flex items-center justify-center">
                    <User className="w-5 h-5 text-primary" />
                  </div>
                  <CardTitle className="text-2xl">Account</CardTitle>
                </div>
                <CardDescription className="text-base">
                  Manage your account settings and data
                </CardDescription>
              </CardHeader>
              <CardContent className="relative z-10">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <Card className="p-6 hover:shadow-lg transition-all duration-200 cursor-pointer group/item border-2 hover:border-primary/30">
                    <div className="flex items-center gap-4 mb-4">
                      <div className="w-12 h-12 bg-linear-to-br from-primary/20 to-primary/10 rounded-xl flex items-center justify-center group-hover/item:scale-110 transition-transform duration-200">
                        <User className="w-6 h-6 text-primary" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-lg">Profile Information</h4>
                        <p className="text-muted-foreground">Edit your personal details</p>
                      </div>
                    </div>
                    <Button variant="outline" className="w-full group-hover/item:bg-primary group-hover/item:text-primary-foreground transition-colors duration-200">
                      Edit Profile
                    </Button>
                  </Card>

                  <Card className="p-6 hover:shadow-lg transition-all duration-200 cursor-pointer group/item border-2 hover:border-primary/30">
                    <div className="flex items-center gap-4 mb-4">
                      <div className="w-12 h-12 bg-linear-to-br from-primary/20 to-primary/10 rounded-xl flex items-center justify-center group-hover/item:scale-110 transition-transform duration-200">
                        <Activity className="w-6 h-6 text-primary" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-lg">Usage Statistics</h4>
                        <p className="text-muted-foreground">View your app activity</p>
                      </div>
                    </div>
                    <Button variant="outline" className="w-full group-hover/item:bg-primary group-hover/item:text-primary-foreground transition-colors duration-200">
                      View Statistics
                    </Button>
                  </Card>
                </div>
              </CardContent>
            </Card>

            {/* Danger Zone - Modern Card */}
            <Card className="group relative overflow-hidden border-2 border-destructive/30 shadow-xl bg-linear-to-br from-destructive/5 to-destructive/10 backdrop-blur-sm hover:shadow-2xl transition-all duration-300">
              <div className="absolute inset-0 bg-linear-to-br from-destructive/10 via-transparent to-destructive/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <CardHeader className="relative z-10 pb-6">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 bg-linear-to-br from-destructive/20 to-destructive/10 rounded-xl flex items-center justify-center">
                    <Shield className="w-5 h-5 text-destructive" />
                  </div>
                  <CardTitle className="text-2xl text-destructive">Danger Zone</CardTitle>
                </div>
                <CardDescription className="text-base">
                  Irreversible actions that affect your account and data
                </CardDescription>
              </CardHeader>
              <CardContent className="relative z-10">
                <Card className="p-6 border-2 border-destructive/40 bg-linear-to-r from-destructive/10 to-destructive/5 hover:border-destructive/60 transition-colors duration-200">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-linear-to-br from-destructive/20 to-destructive/10 rounded-xl flex items-center justify-center">
                        <Trash2 className="w-6 h-6 text-destructive" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-lg text-destructive">Reset All Data</h4>
                        <p className="text-muted-foreground">Permanently delete all your data</p>
                      </div>
                    </div>
                    <AlertDialog open={isResetOpen} onOpenChange={setIsResetOpen}>
                      <AlertDialogTrigger asChild>
                        <Button variant="destructive" className="gap-2 shadow-lg hover:shadow-xl transition-all duration-200">
                          <Trash2 className="w-4 h-4" />
                          Reset Data
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent className="border-destructive/50">
                        <AlertDialogHeader>
                          <AlertDialogTitle className="text-destructive">Reset all data?</AlertDialogTitle>
                          <AlertDialogDescription>
                            This action will permanently delete your data and cannot be undone. All your budgets, events, flashcards, and wellness data will be lost forever.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={handleResetData}
                            className="bg-destructive hover:bg-destructive/90 ml-2"
                          >
                            Reset Everything
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </Card>
                <div className="mt-4 p-4 bg-destructive/10 border border-destructive/20 rounded-lg">
                  <div className="flex items-start gap-3">
                    <Shield className="w-5 h-5 text-destructive mt-0.5 shrink-0" />
                    <div className="text-sm text-muted-foreground">
                      <strong className="text-destructive">Warning:</strong> This action cannot be undone. All your budgets, events, flashcards, and wellness data will be permanently deleted.
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
  );
};

export default Settings;