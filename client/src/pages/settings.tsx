import { useState } from "react";
import { motion } from "framer-motion";
import { Save, Building, User, Lock, Bell, Palette } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PageHeader } from "@/components/PageHeader";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { useTheme } from "@/components/ThemeProvider";

export default function SettingsPage() {
  const { user } = useAuth();
  const { theme, setTheme } = useTheme();
  const { toast } = useToast();

  const [dairySettings, setDairySettings] = useState({
    dairy_name: "AWADH DAIRY",
    address: "Barabanki, U.P. India",
    phone: "9451574464",
    email: "contact@awadhdairy.com",
    invoice_prefix: "AWD",
    upi_handle: "awadhdairy@upi",
  });

  const [profileSettings, setProfileSettings] = useState({
    full_name: user?.full_name || "",
    phone: user?.phone || "",
    current_pin: "",
    new_pin: "",
    confirm_pin: "",
  });

  const [notifications, setNotifications] = useState({
    low_stock: true,
    vaccination_due: true,
    payment_due: true,
    delivery_updates: false,
  });

  const handleSaveDairy = () => {
    toast({ title: "Settings Saved", description: "Dairy settings have been updated" });
  };

  const handleSaveProfile = () => {
    toast({ title: "Profile Updated", description: "Your profile has been updated" });
  };

  const handleChangePin = () => {
    if (profileSettings.new_pin !== profileSettings.confirm_pin) {
      toast({ title: "PIN Mismatch", description: "New PIN and confirm PIN do not match", variant: "destructive" });
      return;
    }
    if (profileSettings.new_pin.length !== 6) {
      toast({ title: "Invalid PIN", description: "PIN must be 6 digits", variant: "destructive" });
      return;
    }
    toast({ title: "PIN Changed", description: "Your PIN has been updated successfully" });
    setProfileSettings({ ...profileSettings, current_pin: "", new_pin: "", confirm_pin: "" });
  };

  return (
    <div className="p-6 space-y-6">
      <PageHeader title="Settings" description="Manage your dairy and account settings" />

      <Tabs defaultValue="dairy" className="space-y-6">
        <TabsList>
          <TabsTrigger value="dairy" className="gap-2" data-testid="tab-dairy">
            <Building className="h-4 w-4" />
            Dairy Info
          </TabsTrigger>
          <TabsTrigger value="profile" className="gap-2" data-testid="tab-profile">
            <User className="h-4 w-4" />
            Profile
          </TabsTrigger>
          <TabsTrigger value="security" className="gap-2" data-testid="tab-security">
            <Lock className="h-4 w-4" />
            Security
          </TabsTrigger>
          <TabsTrigger value="notifications" className="gap-2" data-testid="tab-notifications">
            <Bell className="h-4 w-4" />
            Notifications
          </TabsTrigger>
          <TabsTrigger value="appearance" className="gap-2" data-testid="tab-appearance">
            <Palette className="h-4 w-4" />
            Appearance
          </TabsTrigger>
        </TabsList>

        <TabsContent value="dairy">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <Card>
              <CardHeader>
                <CardTitle>Dairy Information</CardTitle>
                <CardDescription>Update your dairy's business information</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="dairy_name">Dairy Name</Label>
                    <Input id="dairy_name" value={dairySettings.dairy_name} onChange={(e) => setDairySettings({ ...dairySettings, dairy_name: e.target.value })} data-testid="input-dairy-name" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone Number</Label>
                    <Input id="phone" value={dairySettings.phone} onChange={(e) => setDairySettings({ ...dairySettings, phone: e.target.value })} data-testid="input-dairy-phone" />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" type="email" value={dairySettings.email} onChange={(e) => setDairySettings({ ...dairySettings, email: e.target.value })} data-testid="input-dairy-email" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="address">Address</Label>
                  <Textarea id="address" value={dairySettings.address} onChange={(e) => setDairySettings({ ...dairySettings, address: e.target.value })} data-testid="input-dairy-address" />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="invoice_prefix">Invoice Prefix</Label>
                    <Input id="invoice_prefix" value={dairySettings.invoice_prefix} onChange={(e) => setDairySettings({ ...dairySettings, invoice_prefix: e.target.value })} data-testid="input-invoice-prefix" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="upi">UPI Handle</Label>
                    <Input id="upi" value={dairySettings.upi_handle} onChange={(e) => setDairySettings({ ...dairySettings, upi_handle: e.target.value })} data-testid="input-upi-handle" />
                  </div>
                </div>
                <Button onClick={handleSaveDairy} data-testid="button-save-dairy">
                  <Save className="h-4 w-4 mr-2" />
                  Save Changes
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        </TabsContent>

        <TabsContent value="profile">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <Card>
              <CardHeader>
                <CardTitle>Profile Settings</CardTitle>
                <CardDescription>Update your personal information</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="full_name">Full Name</Label>
                    <Input id="full_name" value={profileSettings.full_name} onChange={(e) => setProfileSettings({ ...profileSettings, full_name: e.target.value })} data-testid="input-profile-name" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="profile_phone">Phone Number</Label>
                    <Input id="profile_phone" value={profileSettings.phone} disabled className="bg-muted" data-testid="input-profile-phone" />
                    <p className="text-xs text-muted-foreground">Contact admin to change phone number</p>
                  </div>
                </div>
                <Button onClick={handleSaveProfile} data-testid="button-save-profile">
                  <Save className="h-4 w-4 mr-2" />
                  Update Profile
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        </TabsContent>

        <TabsContent value="security">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <Card>
              <CardHeader>
                <CardTitle>Change PIN</CardTitle>
                <CardDescription>Update your 6-digit login PIN</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="current_pin">Current PIN</Label>
                  <Input id="current_pin" type="password" maxLength={6} placeholder="Enter current PIN" value={profileSettings.current_pin} onChange={(e) => setProfileSettings({ ...profileSettings, current_pin: e.target.value.replace(/\D/g, "") })} data-testid="input-current-pin" />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="new_pin">New PIN</Label>
                    <Input id="new_pin" type="password" maxLength={6} placeholder="Enter new 6-digit PIN" value={profileSettings.new_pin} onChange={(e) => setProfileSettings({ ...profileSettings, new_pin: e.target.value.replace(/\D/g, "") })} data-testid="input-new-pin" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="confirm_pin">Confirm New PIN</Label>
                    <Input id="confirm_pin" type="password" maxLength={6} placeholder="Confirm new PIN" value={profileSettings.confirm_pin} onChange={(e) => setProfileSettings({ ...profileSettings, confirm_pin: e.target.value.replace(/\D/g, "") })} data-testid="input-confirm-pin" />
                  </div>
                </div>
                <Button onClick={handleChangePin} data-testid="button-change-pin">
                  <Lock className="h-4 w-4 mr-2" />
                  Change PIN
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        </TabsContent>

        <TabsContent value="notifications">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <Card>
              <CardHeader>
                <CardTitle>Notification Preferences</CardTitle>
                <CardDescription>Manage your notification settings</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between p-4 rounded-lg border">
                  <div>
                    <p className="font-medium">Low Stock Alerts</p>
                    <p className="text-sm text-muted-foreground">Get notified when inventory is low</p>
                  </div>
                  <Switch checked={notifications.low_stock} onCheckedChange={(checked) => setNotifications({ ...notifications, low_stock: checked })} />
                </div>
                <div className="flex items-center justify-between p-4 rounded-lg border">
                  <div>
                    <p className="font-medium">Vaccination Due</p>
                    <p className="text-sm text-muted-foreground">Reminders for upcoming vaccinations</p>
                  </div>
                  <Switch checked={notifications.vaccination_due} onCheckedChange={(checked) => setNotifications({ ...notifications, vaccination_due: checked })} />
                </div>
                <div className="flex items-center justify-between p-4 rounded-lg border">
                  <div>
                    <p className="font-medium">Payment Reminders</p>
                    <p className="text-sm text-muted-foreground">Alerts for overdue payments</p>
                  </div>
                  <Switch checked={notifications.payment_due} onCheckedChange={(checked) => setNotifications({ ...notifications, payment_due: checked })} />
                </div>
                <div className="flex items-center justify-between p-4 rounded-lg border">
                  <div>
                    <p className="font-medium">Delivery Updates</p>
                    <p className="text-sm text-muted-foreground">Real-time delivery status updates</p>
                  </div>
                  <Switch checked={notifications.delivery_updates} onCheckedChange={(checked) => setNotifications({ ...notifications, delivery_updates: checked })} />
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </TabsContent>

        <TabsContent value="appearance">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <Card>
              <CardHeader>
                <CardTitle>Appearance</CardTitle>
                <CardDescription>Customize the look and feel</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-4">
                  <Label>Theme</Label>
                  <div className="grid grid-cols-3 gap-4">
                    <Button variant={theme === "light" ? "default" : "outline"} onClick={() => setTheme("light")} className="h-20 flex-col gap-2" data-testid="button-theme-light">
                      <div className="w-8 h-8 rounded-full bg-white border" />
                      Light
                    </Button>
                    <Button variant={theme === "dark" ? "default" : "outline"} onClick={() => setTheme("dark")} className="h-20 flex-col gap-2" data-testid="button-theme-dark">
                      <div className="w-8 h-8 rounded-full bg-slate-900 border" />
                      Dark
                    </Button>
                    <Button variant={theme === "system" ? "default" : "outline"} onClick={() => setTheme("system")} className="h-20 flex-col gap-2" data-testid="button-theme-system">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-white to-slate-900 border" />
                      System
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
