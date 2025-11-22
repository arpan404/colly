import { PageLayout } from "@/components/PageLayout";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Palette, DollarSign, Mail, Type, Activity, User, Trash2, ChevronDown } from "lucide-react";
import { useState } from "react";

const Settings = () => {
  const [emailNotifications, setEmailNotifications] = useState(false);

  const settingsSections = [
    {
      icon: Palette,
      title: "Theme",
      description: "Change the app appearance",
      type: "select",
      options: ["System", "Light", "Dark"],
      defaultValue: "System",
    },
    {
      icon: DollarSign,
      title: "Currency",
      description: "Your preferred currency for budgeting",
      type: "select",
      options: ["USD", "EUR", "GBP", "JPY"],
      defaultValue: "USD",
    },
    {
      icon: Mail,
      title: "Email Notification",
      description: "Should you be notified through email",
      type: "switch",
    },
    {
      icon: Type,
      title: "Font Size",
      description: "Adjust the font size",
      type: "select",
      options: ["0.5x", "1x", "1.5x", "2x"],
      defaultValue: "1x",
    },
    {
      icon: Activity,
      title: "Usage Activity",
      description: "View your app usage statistics",
      type: "expandable",
    },
    {
      icon: User,
      title: "Manage your profile",
      description: "Edit your personal information",
      type: "expandable",
    },
  ];

  return (
    <PageLayout>
      <div className="p-8">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center gap-2 mb-6">
            <div className="w-10 h-10 bg-primary/20 rounded-full flex items-center justify-center">
              <Palette className="w-5 h-5 text-primary" />
            </div>
            <h1 className="text-2xl font-bold">Settings</h1>
          </div>

          <div className="space-y-4">
            {settingsSections.map((section, index) => (
              <Card key={index} className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                      <section.icon className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold">{section.title}</h3>
                      <p className="text-sm text-muted-foreground">{section.description}</p>
                    </div>
                  </div>

                  {section.type === "select" && section.options && (
                    <Select defaultValue={section.defaultValue}>
                      <SelectTrigger className="w-32">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {section.options.map((option) => (
                          <SelectItem key={option} value={option}>
                            {option}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}

                  {section.type === "switch" && (
                    <Switch
                      checked={emailNotifications}
                      onCheckedChange={setEmailNotifications}
                    />
                  )}

                  {section.type === "expandable" && (
                    <ChevronDown className="w-5 h-5 text-muted-foreground" />
                  )}
                </div>
              </Card>
            ))}

            <Card className="p-6 border-destructive/50">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-destructive/10 rounded-full flex items-center justify-center">
                    <Trash2 className="w-5 h-5 text-destructive" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-destructive">Reset All Data</h3>
                    <p className="text-sm text-muted-foreground">Delete all your data permanently</p>
                  </div>
                </div>
                <ChevronDown className="w-5 h-5 text-muted-foreground" />
              </div>
            </Card>
          </div>
        </div>
      </div>
    </PageLayout>
  );
};

export default Settings;
