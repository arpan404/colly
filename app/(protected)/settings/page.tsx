"use client";

import { PageLayout } from "@/components/PageLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Palette, DollarSign, Mail, Type, Activity, User, Trash2, Settings as SettingsIcon, Shield, Bell, Monitor, Sun, Moon, Lock, Download, Upload, Eye, EyeOff, Calendar, Heart, BookOpen, Clock } from "lucide-react";
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { trpc } from '@/lib/trpc-client';
import { formatCurrency } from '@/lib/utils';
import { useRouter } from 'next/navigation';
import { toast } from "sonner";

const Settings = () => {
  const router = useRouter();
  const { data: preferences, isLoading } = trpc.user.preferences.get.useQuery();
  const updatePreferencesMutation = trpc.user.preferences.update.useMutation();
  const updateProfileMutation = trpc.user.profile.update.useMutation();
  const changePasswordMutation = trpc.user.password.change.useMutation();
  const exportDataQuery = trpc.user.data.export.useQuery();
  const resetDataMutation = trpc.user.data.reset.useMutation();
  const userStatisticsQuery = trpc.user.statistics.useQuery();
  const { data: userProfile } = trpc.user.profile.get.useQuery();

  const [emailNotifications, setEmailNotifications] = useState(false);
  const [emailWeeklySummary, setEmailWeeklySummary] = useState(true);
  const [emailReminders, setEmailReminders] = useState(true);
  const [emailAchievements, setEmailAchievements] = useState(true);
  const [theme, setThemeSelection] = useState("System");
  const [currency, setCurrency] = useState("USD");
  const [fontSize, setFontSize] = useState("1x");
  const [isResetOpen, setIsResetOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isPasswordOpen, setIsPasswordOpen] = useState(false);
  const [isExportOpen, setIsExportOpen] = useState(false);
  const [profileForm, setProfileForm] = useState({ name: '', avatar: '' });
  const [passwordForm, setPasswordForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [resetConfirmText, setResetConfirmText] = useState('');
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isStatisticsOpen, setIsStatisticsOpen] = useState(false);

  // Auto-save state
  const [autoSavedSettings, setAutoSavedSettings] = useState<{
    emailNotifications: boolean;
    emailWeeklySummary: boolean;
    emailReminders: boolean;
    emailAchievements: boolean;
    theme: string;
    currency: string;
    fontSize: string;
  } | null>(null);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [isAutoSaving, setIsAutoSaving] = useState(false);

  // Auto-save function with debounce
  const autoSaveSettings = useCallback(async (settings: {
    emailNotifications: boolean;
    emailWeeklySummary: boolean;
    emailReminders: boolean;
    emailAchievements: boolean;
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
        emailWeeklySummary: settings.emailWeeklySummary,
        emailReminders: settings.emailReminders,
        emailAchievements: settings.emailAchievements,
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
    const currentSettings = { emailNotifications, emailWeeklySummary, emailReminders, emailAchievements, theme, currency, fontSize };
    const hasChanges = autoSavedSettings && (
      autoSavedSettings.emailNotifications !== emailNotifications ||
      autoSavedSettings.emailWeeklySummary !== emailWeeklySummary ||
      autoSavedSettings.emailReminders !== emailReminders ||
      autoSavedSettings.emailAchievements !== emailAchievements ||
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
  }, [emailNotifications, emailWeeklySummary, emailReminders, emailAchievements, theme, currency, fontSize, autoSavedSettings, autoSaveSettings]);
  const { setTheme } = useTheme();

  // Load preferences when data is available
  useEffect(() => {
    if (preferences) {
      setEmailNotifications(preferences.notifications);
      setEmailWeeklySummary(preferences.emailWeeklySummary);
      setEmailReminders(preferences.emailReminders);
      setEmailAchievements(preferences.emailAchievements);
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
        emailWeeklySummary: preferences.emailWeeklySummary,
        emailReminders: preferences.emailReminders,
        emailAchievements: preferences.emailAchievements,
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
    if (resetConfirmText !== 'RESET ALL DATA') {
      toast.error('Please type "RESET ALL DATA" to confirm');
      return;
    }

    try {
      await resetDataMutation.mutateAsync({ confirmText: resetConfirmText });
      toast.success('All data has been reset successfully');
      setIsResetOpen(false);
      setResetConfirmText('');
      // Optionally redirect to dashboard or refresh
      router.push('/dashboard');
    } catch (error) {
      console.error('Failed to reset data:', error);
      toast.error('Failed to reset data. Please try again.');
    }
  };

  const handleExportData = async () => {
    try {
      // Trigger the query if not already loaded
      if (!exportDataQuery.data) {
        await exportDataQuery.refetch();
      }

      if (exportDataQuery.data) {
        const blob = new Blob([JSON.stringify(exportDataQuery.data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `colly-data-export-${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        toast.success('Data exported successfully');
        setIsExportOpen(false);
      }
    } catch (error) {
      console.error('Failed to export data:', error);
      toast.error('Failed to export data. Please try again.');
    }
  };

  const handleUpdateProfile = async () => {
    try {
      await updateProfileMutation.mutateAsync({
        name: profileForm.name,
        avatar: profileForm.avatar || undefined,
      });
      toast.success('Profile updated successfully');
      setIsProfileOpen(false);
      setProfileForm({ name: '', avatar: '' });
    } catch (error) {
      console.error('Failed to update profile:', error);
      toast.error('Failed to update profile. Please try again.');
    }
  };

  const handleChangePassword = async () => {
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toast.error('New passwords do not match');
      return;
    }

    try {
      await changePasswordMutation.mutateAsync({
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword,
      });
      toast.success('Password changed successfully');
      setIsPasswordOpen(false);
      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (error) {
      console.error('Failed to change password:', error);
      toast.error('Failed to change password. Please check your current password and try again.');
    }
  };

  // Load current profile data when dialog opens
  useEffect(() => {
    if (isProfileOpen && userProfile) {
      setProfileForm({
        name: userProfile.name || '',
        avatar: userProfile.avatar || '',
      });
    }
  }, [isProfileOpen, userProfile]);

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
                    <div className="space-y-4">
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

                      {emailNotifications && (
                        <div className="space-y-3 pl-4 border-l-2 border-primary/20">
                          <Card className="p-4 bg-card/50 border-primary/20">
                            <div className="flex items-center justify-between">
                              <div className="space-y-1">
                                <span className="font-medium">Weekly Summary</span>
                                <p className="text-sm text-muted-foreground">Get a weekly overview of your progress</p>
                              </div>
                              <Switch
                                checked={emailWeeklySummary}
                                onCheckedChange={setEmailWeeklySummary}
                                className="data-[state=checked]:bg-primary"
                              />
                            </div>
                          </Card>

                          <Card className="p-4 bg-card/50 border-primary/20">
                            <div className="flex items-center justify-between">
                              <div className="space-y-1">
                                <span className="font-medium">Reminders</span>
                                <p className="text-sm text-muted-foreground">Receive reminders for upcoming events and tasks</p>
                              </div>
                              <Switch
                                checked={emailReminders}
                                onCheckedChange={setEmailReminders}
                                className="data-[state=checked]:bg-primary"
                              />
                            </div>
                          </Card>

                          <Card className="p-4 bg-card/50 border-primary/20">
                            <div className="flex items-center justify-between">
                              <div className="space-y-1">
                                <span className="font-medium">Achievements</span>
                                <p className="text-sm text-muted-foreground">Celebrate your milestones and accomplishments</p>
                              </div>
                              <Switch
                                checked={emailAchievements}
                                onCheckedChange={setEmailAchievements}
                                className="data-[state=checked]:bg-primary"
                              />
                            </div>
                          </Card>
                        </div>
                      )}
                    </div>
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
                  <Dialog open={isProfileOpen} onOpenChange={setIsProfileOpen}>
                    <DialogTrigger asChild>
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
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[425px]">
                      <DialogHeader>
                        <DialogTitle>Edit Profile</DialogTitle>
                        <DialogDescription>
                          Update your personal information and profile picture.
                        </DialogDescription>
                      </DialogHeader>
                      <div className="grid gap-4 py-4">
                        <div className="grid grid-cols-4 items-center gap-4">
                          <Label htmlFor="name" className="text-right">
                            Name
                          </Label>
                          <Input
                            id="name"
                            value={profileForm.name}
                            onChange={(e) => setProfileForm(prev => ({ ...prev, name: e.target.value }))}
                            className="col-span-3"
                            placeholder="Your name"
                          />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                          <Label htmlFor="avatar" className="text-right">
                            Avatar URL
                          </Label>
                          <Input
                            id="avatar"
                            value={profileForm.avatar}
                            onChange={(e) => setProfileForm(prev => ({ ...prev, avatar: e.target.value }))}
                            className="col-span-3"
                            placeholder="https://example.com/avatar.jpg"
                          />
                        </div>
                      </div>
                      <DialogFooter>
                        <Button type="submit" onClick={handleUpdateProfile} disabled={updateProfileMutation.isPending}>
                          {updateProfileMutation.isPending ? 'Saving...' : 'Save changes'}
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>

                  <Dialog open={isPasswordOpen} onOpenChange={setIsPasswordOpen}>
                    <DialogTrigger asChild>
                      <Card className="p-6 hover:shadow-lg transition-all duration-200 cursor-pointer group/item border-2 hover:border-primary/30">
                        <div className="flex items-center gap-4 mb-4">
                          <div className="w-12 h-12 bg-linear-to-br from-primary/20 to-primary/10 rounded-xl flex items-center justify-center group-hover/item:scale-110 transition-transform duration-200">
                            <Lock className="w-6 h-6 text-primary" />
                          </div>
                          <div>
                            <h4 className="font-semibold text-lg">Change Password</h4>
                            <p className="text-muted-foreground">Update your account password</p>
                          </div>
                        </div>
                        <Button variant="outline" className="w-full group-hover/item:bg-primary group-hover/item:text-primary-foreground transition-colors duration-200">
                          Change Password
                        </Button>
                      </Card>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[425px]">
                      <DialogHeader>
                        <DialogTitle>Change Password</DialogTitle>
                        <DialogDescription>
                          Enter your current password and choose a new one.
                        </DialogDescription>
                      </DialogHeader>
                      <div className="grid gap-4 py-4">
                        <div className="grid grid-cols-4 items-center gap-4">
                          <Label htmlFor="current" className="text-right">
                            Current
                          </Label>
                          <div className="col-span-3 relative">
                            <Input
                              id="current"
                              type={showCurrentPassword ? "text" : "password"}
                              value={passwordForm.currentPassword}
                              onChange={(e) => setPasswordForm(prev => ({ ...prev, currentPassword: e.target.value }))}
                              className="pr-10"
                              placeholder="Current password"
                            />
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                              onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                            >
                              {showCurrentPassword ? (
                                <EyeOff className="h-4 w-4 text-muted-foreground" />
                              ) : (
                                <Eye className="h-4 w-4 text-muted-foreground" />
                              )}
                            </Button>
                          </div>
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                          <Label htmlFor="new" className="text-right">
                            New
                          </Label>
                          <div className="col-span-3 relative">
                            <Input
                              id="new"
                              type={showNewPassword ? "text" : "password"}
                              value={passwordForm.newPassword}
                              onChange={(e) => setPasswordForm(prev => ({ ...prev, newPassword: e.target.value }))}
                              className="pr-10"
                              placeholder="New password"
                            />
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                              onClick={() => setShowNewPassword(!showNewPassword)}
                            >
                              {showNewPassword ? (
                                <EyeOff className="h-4 w-4 text-muted-foreground" />
                              ) : (
                                <Eye className="h-4 w-4 text-muted-foreground" />
                              )}
                            </Button>
                          </div>
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                          <Label htmlFor="confirm" className="text-right">
                            Confirm
                          </Label>
                          <div className="col-span-3 relative">
                            <Input
                              id="confirm"
                              type={showConfirmPassword ? "text" : "password"}
                              value={passwordForm.confirmPassword}
                              onChange={(e) => setPasswordForm(prev => ({ ...prev, confirmPassword: e.target.value }))}
                              className="pr-10"
                              placeholder="Confirm new password"
                            />
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                            >
                              {showConfirmPassword ? (
                                <EyeOff className="h-4 w-4 text-muted-foreground" />
                              ) : (
                                <Eye className="h-4 w-4 text-muted-foreground" />
                              )}
                            </Button>
                          </div>
                        </div>
                      </div>
                      <DialogFooter>
                        <Button type="submit" onClick={handleChangePassword} disabled={changePasswordMutation.isPending}>
                          {changePasswordMutation.isPending ? 'Changing...' : 'Change Password'}
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>

                  <Dialog open={isExportOpen} onOpenChange={setIsExportOpen}>
                    <DialogTrigger asChild>
                      <Card className="p-6 hover:shadow-lg transition-all duration-200 cursor-pointer group/item border-2 hover:border-primary/30">
                        <div className="flex items-center gap-4 mb-4">
                          <div className="w-12 h-12 bg-linear-to-br from-primary/20 to-primary/10 rounded-xl flex items-center justify-center group-hover/item:scale-110 transition-transform duration-200">
                            <Download className="w-6 h-6 text-primary" />
                          </div>
                          <div>
                            <h4 className="font-semibold text-lg">Export Data</h4>
                            <p className="text-muted-foreground">Download all your data</p>
                          </div>
                        </div>
                        <Button variant="outline" className="w-full group-hover/item:bg-primary group-hover/item:text-primary-foreground transition-colors duration-200">
                          Export Data
                        </Button>
                      </Card>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[425px]">
                      <DialogHeader>
                        <DialogTitle>Export Your Data</DialogTitle>
                        <DialogDescription>
                          Download a JSON file containing all your Colly data including profile, preferences, events, budgets, and more.
                        </DialogDescription>
                      </DialogHeader>
                      <div className="py-4">
                        <div className="bg-secondary/20 p-4 rounded-lg">
                          <h4 className="font-medium mb-2">What will be included:</h4>
                          <ul className="text-sm text-muted-foreground space-y-1">
                            <li>• Profile information</li>
                            <li>• User preferences and settings</li>
                            <li>• Events and calendar data</li>
                            <li>• Budgets and transactions</li>
                            <li>• Routines and wellness logs</li>
                            <li>• Flashcards and study data</li>
                          </ul>
                        </div>
                      </div>
                      <DialogFooter>
                        <Button type="submit" onClick={handleExportData} disabled={exportDataQuery.isLoading || exportDataQuery.isFetching}>
                          {exportDataQuery.isLoading || exportDataQuery.isFetching ? 'Exporting...' : 'Download Data'}
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>

                  <Dialog open={isStatisticsOpen} onOpenChange={setIsStatisticsOpen}>
                    <DialogTrigger asChild>
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
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
                      <DialogHeader>
                        <DialogTitle>Usage Statistics</DialogTitle>
                        <DialogDescription>
                          Overview of your activity and progress in Colly
                        </DialogDescription>
                      </DialogHeader>
                      <div className="py-4 space-y-6">
                        {userStatisticsQuery.isLoading ? (
                          <div className="flex items-center justify-center py-8">
                            <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
                          </div>
                        ) : userStatisticsQuery.data ? (
                          <>
                            {/* Account Statistics */}
                            <div className="space-y-3">
                              <h4 className="font-semibold text-lg flex items-center gap-2">
                                <User className="w-5 h-5 text-primary" />
                                Account
                              </h4>
                              <div className="grid grid-cols-2 gap-4">
                                <Card className="p-4">
                                  <div className="text-2xl font-bold text-primary">{userStatisticsQuery.data.account.accountAge}</div>
                                  <div className="text-sm text-muted-foreground">Days using Colly</div>
                                </Card>
                                <Card className="p-4">
                                  <div className="text-2xl font-bold text-primary">{new Date(userStatisticsQuery.data.account.accountCreated).toLocaleDateString()}</div>
                                  <div className="text-sm text-muted-foreground">Member since</div>
                                </Card>
                              </div>
                            </div>

                            {/* Events Statistics */}
                            <div className="space-y-3">
                              <h4 className="font-semibold text-lg flex items-center gap-2">
                                <Calendar className="w-5 h-5 text-primary" />
                                Events
                              </h4>
                              <div className="grid grid-cols-3 gap-4">
                                <Card className="p-4">
                                  <div className="text-2xl font-bold text-primary">{userStatisticsQuery.data.events.total}</div>
                                  <div className="text-sm text-muted-foreground">Total events</div>
                                </Card>
                                <Card className="p-4">
                                  <div className="text-2xl font-bold text-primary">{userStatisticsQuery.data.events.upcoming}</div>
                                  <div className="text-sm text-muted-foreground">Upcoming</div>
                                </Card>
                                <Card className="p-4">
                                  <div className="text-2xl font-bold text-primary">{userStatisticsQuery.data.events.thisMonth}</div>
                                  <div className="text-sm text-muted-foreground">This month</div>
                                </Card>
                              </div>
                            </div>

                            {/* Finance Statistics */}
                            <div className="space-y-3">
                              <h4 className="font-semibold text-lg flex items-center gap-2">
                                <DollarSign className="w-5 h-5 text-primary" />
                                Finance
                              </h4>
                              <div className="grid grid-cols-2 gap-4">
                                <Card className="p-4">
                                  <div className="text-2xl font-bold text-primary">{userStatisticsQuery.data.finance.categories}</div>
                                  <div className="text-sm text-muted-foreground">Budget categories</div>
                                </Card>
                                <Card className="p-4">
                                  <div className="text-2xl font-bold text-primary">{userStatisticsQuery.data.finance.totalTransactions}</div>
                                  <div className="text-sm text-muted-foreground">Total transactions</div>
                                </Card>
                              </div>
                              <div className="grid grid-cols-2 gap-4">
                                <Card className="p-4">
                                  <div className="text-2xl font-bold text-primary">{userStatisticsQuery.data.finance.thisMonthTransactions}</div>
                                  <div className="text-sm text-muted-foreground">This month</div>
                                </Card>
                                <Card className="p-4">
                                  <div className="text-2xl font-bold text-primary">{formatCurrency(Number(userStatisticsQuery.data.finance.thisMonthSpent || 0), preferences?.currency)}</div>
                                  <div className="text-sm text-muted-foreground">Spent this month</div>
                                </Card>
                              </div>
                            </div>

                            {/* Wellness Statistics */}
                            <div className="space-y-3">
                              <h4 className="font-semibold text-lg flex items-center gap-2">
                                <Heart className="w-5 h-5 text-primary" />
                                Wellness
                              </h4>
                              <div className="grid grid-cols-2 gap-4">
                                <Card className="p-4">
                                  <div className="text-2xl font-bold text-primary">{userStatisticsQuery.data.wellness.totalLogs}</div>
                                  <div className="text-sm text-muted-foreground">Wellness logs</div>
                                </Card>
                                <Card className="p-4">
                                  <div className="text-2xl font-bold text-primary">{Number(userStatisticsQuery.data.wellness.averageMood || 0).toFixed(1)}/5</div>
                                  <div className="text-sm text-muted-foreground">Avg mood</div>
                                </Card>
                              </div>
                              <div className="grid grid-cols-2 gap-4">
                                <Card className="p-4">
                                  <div className="text-2xl font-bold text-primary">{Number(userStatisticsQuery.data.wellness.averageSleep || 0).toFixed(1)}h</div>
                                  <div className="text-sm text-muted-foreground">Avg sleep</div>
                                </Card>
                                <Card className="p-4">
                                  <div className="text-2xl font-bold text-primary">{Number(userStatisticsQuery.data.wellness.averageWater || 0).toFixed(1)}</div>
                                  <div className="text-sm text-muted-foreground">Avg water glasses</div>
                                </Card>
                              </div>
                            </div>

                            {/* Study Statistics */}
                            <div className="space-y-3">
                              <h4 className="font-semibold text-lg flex items-center gap-2">
                                <BookOpen className="w-5 h-5 text-primary" />
                                Study
                              </h4>
                              <div className="grid grid-cols-2 gap-4">
                                <Card className="p-4">
                                  <div className="text-2xl font-bold text-primary">{userStatisticsQuery.data.study.decks}</div>
                                  <div className="text-sm text-muted-foreground">Flashcard decks</div>
                                </Card>
                                <Card className="p-4">
                                  <div className="text-2xl font-bold text-primary">{userStatisticsQuery.data.study.flashcards}</div>
                                  <div className="text-sm text-muted-foreground">Total flashcards</div>
                                </Card>
                              </div>
                              <div className="grid grid-cols-2 gap-4">
                                <Card className="p-4">
                                  <div className="text-2xl font-bold text-primary">{userStatisticsQuery.data.study.studySessions}</div>
                                  <div className="text-sm text-muted-foreground">Study sessions</div>
                                </Card>
                                <Card className="p-4">
                                  <div className="text-2xl font-bold text-primary">{Math.floor(Number(userStatisticsQuery.data.study.totalStudyTime || 0) / 60)}h {Number(userStatisticsQuery.data.study.totalStudyTime || 0) % 60}m</div>
                                  <div className="text-sm text-muted-foreground">Total study time</div>
                                </Card>
                              </div>
                              <div className="grid grid-cols-2 gap-4">
                                <Card className="p-4">
                                  <div className="text-2xl font-bold text-primary">{userStatisticsQuery.data.study.totalQuizzes}</div>
                                  <div className="text-sm text-muted-foreground">Quizzes taken</div>
                                </Card>
                                <Card className="p-4">
                                  <div className="text-2xl font-bold text-primary">{Number(userStatisticsQuery.data.study.averageQuizScore || 0).toFixed(1)}%</div>
                                  <div className="text-sm text-muted-foreground">Avg quiz score</div>
                                </Card>
                              </div>
                            </div>

                            {/* Routines Statistics */}
                            <div className="space-y-3">
                              <h4 className="font-semibold text-lg flex items-center gap-2">
                                <Clock className="w-5 h-5 text-primary" />
                                Routines
                              </h4>
                              <div className="grid grid-cols-2 gap-4">
                                <Card className="p-4">
                                  <div className="text-2xl font-bold text-primary">{userStatisticsQuery.data.routines.total}</div>
                                  <div className="text-sm text-muted-foreground">Total routines</div>
                                </Card>
                                <Card className="p-4">
                                  <div className="text-2xl font-bold text-primary">{userStatisticsQuery.data.routines.active}</div>
                                  <div className="text-sm text-muted-foreground">Active routines</div>
                                </Card>
                              </div>
                            </div>
                          </>
                        ) : (
                          <div className="text-center py-8 text-muted-foreground">
                            Failed to load statistics. Please try again.
                          </div>
                        )}
                      </div>
                    </DialogContent>
                  </Dialog>
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
                            <br /><br />
                            To confirm, please type <strong>"RESET ALL DATA"</strong> below:
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <div className="py-4">
                          <Input
                            value={resetConfirmText}
                            onChange={(e) => setResetConfirmText(e.target.value)}
                            placeholder='Type "RESET ALL DATA" to confirm'
                            className="border-destructive/50 focus:border-destructive"
                          />
                        </div>
                        <AlertDialogFooter>
                          <AlertDialogCancel onClick={() => setResetConfirmText('')}>Cancel</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={handleResetData}
                            disabled={resetConfirmText !== 'RESET ALL DATA' || resetDataMutation.isPending}
                            className="bg-destructive hover:bg-destructive/90 ml-2"
                          >
                            {resetDataMutation.isPending ? 'Resetting...' : 'Reset Everything'}
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