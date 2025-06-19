import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../../components/ui/card';
import { Button } from "../../../components/ui/button";
import { Input } from "../../../components/ui/input";
import { Switch } from "../../../components/ui/switch";
import { Checkbox } from "../../../components/ui/checkbox";
import { 
  Accordion, 
  AccordionContent, 
  AccordionItem, 
  AccordionTrigger 
} from "../../../components/ui/accordion";
import { Globe, Mail, Bell, Shield, Trash2, Loader } from "lucide-react";
import { 
  fetchUserSettings, 
  updateUserSettings, 
  changePassword, 
  fetchAvailableLanguages,
  deleteAccount 
} from '../../../api/settingsApi'; // Adjust the import path
import { toast } from '../../../hooks/use-toast';


const Settings = () => {
  // Password states
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  
 
  // Settings states from backend
  const [settings, setSettings] = useState({
    email_notifications: true,
    practice_reminders: true,
    room_interest_notifications: true,
    browser_notifications: true,
    public_profile: true,
    show_online_status: true,
    language: null,
    timezone: 'UTC'
  });
  
  // UI states
  const [availableLanguages, setAvailableLanguages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [passwordLoading, setPasswordLoading] = useState(false);

  // Load initial data
  useEffect(() => {
    loadInitialData();
  }, []);

  const loadInitialData = async () => {
    try {
      setLoading(true);
      const [settingsData, languagesData] = await Promise.all([
        fetchUserSettings(),
        fetchAvailableLanguages()
      ]);
      
      setSettings(settingsData);
      setAvailableLanguages(languagesData);
    } catch (err) {
      toast({ title: 'Error', description: 'Failed to load settings. Please try again.', variant: 'destructive' });
      console.error('Error loading settings:', err);
    } finally {
      setLoading(false);
    }
  };

  // Update settings helper
  const updateSetting = async (key, value) => {
    try {
      setUpdating(true);
      const updatedSettings = { ...settings, [key]: value };
      
      // Handle email notification dependencies
      if (key === 'email_notifications' && !value) {
        updatedSettings.practice_reminders = false;
        updatedSettings.room_interest_notifications = false;
      }
      
      const response = await updateUserSettings(updatedSettings);
      setSettings(response);
      toast({ title: 'Success', description: 'Settings updated successfully', variant: 'success' });
    } catch (err) {
      toast({ title: 'Error', description: 'Failed to update settings. Please try again.', variant: 'destructive' });
      console.error('Error updating settings:', err);
    } finally {
      setUpdating(false);
    }
  };

  // Handle password change
  const handleChangePassword = async (e) => {
    e.preventDefault();
    
    if (!currentPassword || !newPassword || !confirmPassword) {
      toast({ title: 'Error', description: 'Please fill in all password fields', variant: 'destructive' });
      return;
    }
    
    if (newPassword !== confirmPassword) {
      toast({ title: 'Error', description: 'New passwords do not match', variant: 'destructive' });
      return;
    }
    
    try {
      setPasswordLoading(true);
      await changePassword({
        current_password: currentPassword,
        new_password: newPassword,
        confirm_password: confirmPassword
      });
      toast({ title: 'Success', description: 'Password changed successfully', variant: 'success' });
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err) {
      const errorMessage = err.response?.data?.current_password?.[0] || 
                          err.response?.data?.new_password?.[0] || 
                          err.response?.data?.non_field_errors?.[0] ||
                          'Failed to change password. Please try again.';
      toast({ title: 'Error', description: errorMessage, variant: 'destructive' });
    } finally {
      setPasswordLoading(false);
    }
  };

  // Handle account deletion
  const handleDeleteAccount = async () => {
    if (window.confirm('Are you sure you want to delete your account? This action cannot be undone.')) {
      try {
        await deleteAccount();
        toast({ title: 'Success', description: 'Account deleted successfully', variant: 'success' });
        // Redirect to login or home page
        window.location.href = '/login';
      } catch (err) {
        toast({ title: 'Error', description: 'Failed to delete account. Please try again.', variant: 'destructive' });
        console.error('Error deleting account:', err);
      }
    }
  };

  if (loading) {
    return (
      <div className="w-full flex items-center justify-center py-8">
        <Loader className="animate-spin h-8 w-8 text-neon-purple" />
        <span className="ml-2 text-white">Loading settings...</span>
      </div>
    );
  }

  return (
    <div className="w-full">
      <h1 className="text-2xl font-bold mb-6 text-white">Settings</h1>
      
      <div className="space-y-6">
        <Accordion type="single" collapsible className="w-full" defaultValue="account">
          <AccordionItem value="account" className="border-white/10">
            <AccordionTrigger className="text-xl font-semibold text-white py-4 hover:no-underline">
              Account Settings
            </AccordionTrigger>
            <AccordionContent className="pt-4">
              <div className="space-y-6">
                <Card className="bg-[#1A0E29]/60 border-white/10 backdrop-blur-md shadow-lg">
                  <CardHeader>
                    <CardTitle className="text-white flex items-center">
                      <Shield className="mr-2 h-5 w-5 text-neon-purple" />
                      Change Password
                    </CardTitle>
                    <CardDescription className="text-white/70">
                      Update your password
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <form onSubmit={handleChangePassword} className="space-y-4">
                      <div>
                        <label htmlFor="current-password" className="block text-white/80 mb-2 text-sm">
                          Current Password
                        </label>
                        <Input
                          id="current-password"
                          type="password"
                          value={currentPassword}
                          onChange={(e) => setCurrentPassword(e.target.value)}
                          placeholder="Enter current password"
                          className="bg-white/5 border-white/20 text-white"
                          disabled={passwordLoading}
                        />
                      </div>
                      <div>
                        <label htmlFor="new-password" className="block text-white/80 mb-2 text-sm">
                          New Password
                        </label>
                        <Input
                          id="new-password"
                          type="password"
                          value={newPassword}
                          onChange={(e) => setNewPassword(e.target.value)}
                          placeholder="Enter new password"
                          className="bg-white/5 border-white/20 text-white"
                          disabled={passwordLoading}
                        />
                      </div>
                      <div>
                        <label htmlFor="confirm-password" className="block text-white/80 mb-2 text-sm">
                          Confirm New Password
                        </label>
                        <Input
                          id="confirm-password"
                          type="password"
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          placeholder="Confirm new password"
                          className="bg-white/5 border-white/20 text-white"
                          disabled={passwordLoading}
                        />
                      </div>
                      <Button 
                        type="submit" 
                        variant="gradient" 
                        disabled={passwordLoading}
                        className="flex items-center"
                      >
                        {passwordLoading && <Loader className="animate-spin mr-2 h-4 w-4" />}
                        Update Password
                      </Button>
                    </form>
                  </CardContent>
                </Card>

                <Card className="bg-[#1A0E29]/60 border-white/10 backdrop-blur-md shadow-lg">
                  <CardHeader>
                    <CardTitle className="text-white flex items-center">
                      <Trash2 className="mr-2 h-5 w-5 text-red-400" />
                      Delete Account
                    </CardTitle>
                    <CardDescription className="text-white/70">
                      Permanently delete your account and all data
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-white/80 mb-4">
                      This action cannot be undone. It will permanently delete your account, profile, and all data associated with it.
                    </p>
                    <Button 
                      variant="outline" 
                      className="bg-transparent border-red-400 text-red-400 hover:bg-red-400/10"
                      onClick={handleDeleteAccount}
                    >
                      Delete My Account
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="preferences" className="border-white/10">
            <AccordionTrigger className="text-xl font-semibold text-white py-4 hover:no-underline">
              Preferences
            </AccordionTrigger>
            <AccordionContent className="pt-4">
              <Card className="bg-[#1A0E29]/60 border-white/10 backdrop-blur-md shadow-lg">
                <CardContent className="pt-6">
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-white font-medium mb-3 flex items-center">
                        <Globe className="mr-2 h-5 w-5 text-neon-blue" />
                        Interface Language
                      </h3>
                      <select 
                        value={settings.language || ''}
                        onChange={(e) => updateSetting('language', e.target.value || null)}
                        className="w-full p-2.5 bg-white/5 border border-white/20 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-neon-purple"
                        disabled={updating}
                      >
                        <option value="">Select Language</option>
                        {availableLanguages.map((lang) => (
                          <option key={lang.id} value={lang.id}>
                            {lang.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <h3 className="text-white font-medium mb-3 flex items-center">
                        <Bell className="mr-2 h-5 w-5 text-neon-purple" />
                        Email Notifications
                      </h3>
                      <div className="space-y-3">
                        <div className="flex items-center space-x-2">
                          <Checkbox 
                            id="email-notifications" 
                            checked={settings.email_notifications} 
                            onCheckedChange={(checked) => updateSetting('email_notifications', !!checked)}
                            className="data-[state=checked]:bg-neon-purple data-[state=checked]:text-white border-white/30"
                            disabled={updating}
                          />
                          <label htmlFor="email-notifications" className="text-white/80 text-sm">
                            Receive email notifications
                          </label>
                        </div>

                        <div className="flex items-center space-x-2 pl-6">
                          <Checkbox 
                            id="practice-reminders" 
                            checked={settings.practice_reminders} 
                            onCheckedChange={(checked) => updateSetting('practice_reminders', !!checked)}
                            className="data-[state=checked]:bg-neon-purple data-[state=checked]:text-white border-white/30"
                            disabled={!settings.email_notifications || updating}
                          />
                          <label 
                            htmlFor="practice-reminders" 
                            className={`text-sm ${settings.email_notifications ? 'text-white/80' : 'text-white/40'}`}
                          >
                            Practice reminders
                          </label>
                        </div>

                        <div className="flex items-center space-x-2 pl-6">
                          <Checkbox 
                            id="room-interest-notifications" 
                            checked={settings.room_interest_notifications} 
                            onCheckedChange={(checked) => updateSetting('room_interest_notifications', !!checked)}
                            className="data-[state=checked]:bg-neon-purple data-[state=checked]:text-white border-white/30"
                            disabled={!settings.email_notifications || updating}
                          />
                          <label 
                            htmlFor="room-interest-notifications" 
                            className={`text-sm ${settings.email_notifications ? 'text-white/80' : 'text-white/40'}`}
                          >
                            New rooms matching your interests
                          </label>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-white font-medium">Browser Notifications</h3>
                        <p className="text-white/70 text-sm">Allow browser notifications for message alerts</p>
                      </div>
                      <Switch 
                        checked={settings.browser_notifications} 
                        onCheckedChange={(checked) => updateSetting('browser_notifications', checked)}
                        className="data-[state=checked]:bg-neon-purple"
                        disabled={updating}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="privacy" className="border-white/10">
            <AccordionTrigger className="text-xl font-semibold text-white py-4 hover:no-underline">
              Privacy
            </AccordionTrigger>
            <AccordionContent className="pt-4">
              <Card className="bg-[#1A0E29]/60 border-white/10 backdrop-blur-md shadow-lg">
                <CardContent className="pt-6">
                  <div className="space-y-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-white font-medium">Public Profile</h3>
                        <p className="text-white/70 text-sm">Allow others to view your profile</p>
                      </div>
                      <Switch 
                        checked={settings.public_profile} 
                        onCheckedChange={(checked) => updateSetting('public_profile', checked)}
                        className="data-[state=checked]:bg-neon-purple"
                        disabled={updating}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-white font-medium">Show Online Status</h3>
                        <p className="text-white/70 text-sm">Show when you're active on the platform</p>
                      </div>
                      <Switch 
                        checked={settings.show_online_status} 
                        onCheckedChange={(checked) => updateSetting('show_online_status', checked)}
                        className="data-[state=checked]:bg-neon-purple"
                        disabled={updating}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </div>
    </div>
  );
};

export default Settings;