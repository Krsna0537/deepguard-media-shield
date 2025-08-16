import { useState, useEffect } from "react";
import { 
  User, 
  Settings, 
  Palette, 
  Bell, 
  Shield, 
  Download,
  Eye,
  EyeOff,
  Save,
  Camera,
  Trash2
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Database } from "@/integrations/supabase/types";

type UserPreferences = Database['public']['Tables']['user_preferences']['Row'];
type Profile = Database['public']['Tables']['profiles']['Row'];

const Profile = () => {
  const { user, signOut } = useAuth();
  const { toast } = useToast();
  
  const [profile, setProfile] = useState<Profile | null>(null);
  const [preferences, setPreferences] = useState<UserPreferences | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  const [displayName, setDisplayName] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");
  const [theme, setTheme] = useState("system");
  const [highContrast, setHighContrast] = useState(false);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [autoExportResults, setAutoExportResults] = useState(false);

  useEffect(() => {
    if (user) {
      loadProfileData();
    }
  }, [user]);

  const loadProfileData = async () => {
    try {
      setLoading(true);
      
      // Load profile
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', user?.id)
        .single();

      if (profileError && profileError.code !== 'PGRST116') throw profileError;
      if (profileData) {
        setProfile(profileData);
        setDisplayName(profileData.display_name || "");
        setAvatarUrl(profileData.avatar_url || "");
      }

      // Load preferences
      const { data: prefsData, error: prefsError } = await supabase
        .from('user_preferences')
        .select('*')
        .eq('user_id', user?.id)
        .single();

      if (prefsError && prefsError.code !== 'PGRST116') throw prefsError;
      if (prefsData) {
        setPreferences(prefsData);
        setTheme(prefsData.theme);
        setHighContrast(prefsData.high_contrast);
        setNotificationsEnabled(prefsData.notifications_enabled);
        setAutoExportResults(prefsData.auto_export_results);
      }

    } catch (error: any) {
      toast({
        title: "Error loading profile",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const saveProfile = async () => {
    try {
      setSaving(true);
      
      // Update profile
      const { error: profileError } = await supabase
        .from('profiles')
        .upsert({
          user_id: user?.id!,
          display_name: displayName,
          avatar_url: avatarUrl
        });

      if (profileError) throw profileError;

      // Update preferences
      const { error: prefsError } = await supabase
        .from('user_preferences')
        .upsert({
          user_id: user?.id!,
          theme,
          high_contrast: highContrast,
          notifications_enabled: notificationsEnabled,
          auto_export_results: autoExportResults
        });

      if (prefsError) throw prefsError;

      toast({
        title: "Profile updated",
        description: "Your profile and preferences have been saved successfully",
      });

      // Reload data
      await loadProfileData();

    } catch (error: any) {
      toast({
        title: "Update failed",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleAvatarUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      // Upload avatar to storage
      const fileExt = file.name.split('.').pop();
      const fileName = `avatar-${user?.id}.${fileExt}`;
      const filePath = `avatars/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: true
        });

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath);

      setAvatarUrl(publicUrl);

      toast({
        title: "Avatar updated",
        description: "Your profile picture has been updated",
      });

    } catch (error: any) {
      toast({
        title: "Avatar upload failed",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const deleteAccount = async () => {
    if (!confirm("Are you sure you want to delete your account? This action cannot be undone.")) {
      return;
    }

    try {
      // Delete user account
      const { error } = await supabase.auth.admin.deleteUser(user?.id!);
      
      if (error) throw error;

      toast({
        title: "Account deleted",
        description: "Your account has been permanently deleted",
      });

      await signOut();

    } catch (error: any) {
      toast({
        title: "Account deletion failed",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const applyTheme = (newTheme: string) => {
    setTheme(newTheme);
    
    // Apply theme to document
    const root = document.documentElement;
    root.classList.remove('light', 'dark');
    
    if (newTheme === 'system') {
      const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
      root.classList.add(systemTheme);
    } else {
      root.classList.add(newTheme);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600 dark:text-gray-400">Loading profile...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Profile & Settings
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Manage your account preferences and settings
        </p>
      </div>

      <div className="space-y-8">
        {/* Profile Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Profile Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Avatar */}
            <div className="flex items-center gap-6">
              <div className="relative">
                <div className="w-24 h-24 rounded-full overflow-hidden bg-gray-200 dark:bg-gray-700">
                  {avatarUrl ? (
                    <img
                      src={avatarUrl}
                      alt="Profile"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <User className="h-12 w-12 text-gray-400" />
                    </div>
                  )}
                </div>
                <label className="absolute bottom-0 right-0 bg-blue-600 text-white p-2 rounded-full cursor-pointer hover:bg-blue-700 transition-colors">
                  <Camera className="h-4 w-4" />
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleAvatarUpload}
                    className="hidden"
                  />
                </label>
              </div>
              
              <div className="flex-1">
                <Label htmlFor="displayName">Display Name</Label>
                <Input
                  id="displayName"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  placeholder="Enter your display name"
                  className="mt-2"
                />
              </div>
            </div>

            {/* Email */}
            <div>
              <Label htmlFor="email">Email Address</Label>
              <Input
                id="email"
                value={user?.email || ""}
                disabled
                className="mt-2 bg-gray-50 dark:bg-gray-800"
              />
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                Email address cannot be changed
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Appearance Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Palette className="h-5 w-5" />
              Appearance
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Theme */}
            <div>
              <Label htmlFor="theme">Theme</Label>
              <select
                id="theme"
                value={theme}
                onChange={(e) => applyTheme(e.target.value)}
                className="mt-2 w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
              >
                <option value="light">Light</option>
                <option value="dark">Dark</option>
                <option value="system">System</option>
              </select>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                Choose your preferred color scheme
              </p>
            </div>

            {/* High Contrast */}
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="highContrast">High Contrast Mode</Label>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Increase contrast for better visibility
                </p>
              </div>
              <Switch
                id="highContrast"
                checked={highContrast}
                onCheckedChange={setHighContrast}
              />
            </div>
          </CardContent>
        </Card>

        {/* Notification Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="h-5 w-5" />
              Notifications
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="notifications">Enable Notifications</Label>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Receive notifications about analysis results
                </p>
              </div>
              <Switch
                id="notifications"
                checked={notificationsEnabled}
                onCheckedChange={setNotificationsEnabled}
              />
            </div>
          </CardContent>
        </Card>

        {/* Export Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Download className="h-5 w-5" />
              Export Settings
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="autoExport">Auto-export Results</Label>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Automatically export analysis results to PDF
                </p>
              </div>
              <Switch
                id="autoExport"
                checked={autoExportResults}
                onCheckedChange={setAutoExportResults}
              />
            </div>
          </CardContent>
        </Card>

        {/* Security */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Security
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <Label>Account Actions</Label>
              <div className="mt-4 space-y-3">
                <Button
                  variant="outline"
                  onClick={() => signOut()}
                  className="w-full justify-start"
                >
                  Sign Out
                </Button>
                <Button
                  variant="destructive"
                  onClick={deleteAccount}
                  className="w-full justify-start"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete Account
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Save Button */}
        <div className="flex justify-end">
          <Button
            onClick={saveProfile}
            disabled={saving}
            className="flex items-center gap-2"
          >
            <Save className="h-4 w-4" />
            {saving ? 'Saving...' : 'Save Changes'}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Profile;
