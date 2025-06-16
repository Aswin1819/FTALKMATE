import React, { useState } from 'react';
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
import { Globe, Mail, Bell, Shield, Trash2 } from "lucide-react";

const Settings = () => {
  const [email, setEmail] = useState("john.doe@example.com");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [language, setLanguage] = useState("english");

  const [publicProfile, setPublicProfile] = useState(true);
  const [onlineStatus, setOnlineStatus] = useState(true);
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [practiceReminders, setPracticeReminders] = useState(true);
  const [newRoomNotifications, setNewRoomNotifications] = useState(true);
  const [browserNotifications, setBrowserNotifications] = useState(true);

  const handleChangeEmail = (e) => {
    e.preventDefault();
  };

  const handleChangePassword = (e) => {
    e.preventDefault();
  };

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
                      <Mail className="mr-2 h-5 w-5 text-neon-blue" />
                      Change Email
                    </CardTitle>
                    <CardDescription className="text-white/70">
                      Update your email address
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <form onSubmit={handleChangeEmail} className="space-y-4">
                      <div>
                        <label htmlFor="current-email" className="block text-white/80 mb-2 text-sm">
                          Current Email
                        </label>
                        <Input
                          id="current-email"
                          type="email"
                          value={email}
                          disabled
                          className="bg-white/5 border-white/20 text-white"
                        />
                      </div>
                      <div>
                        <label htmlFor="new-email" className="block text-white/80 mb-2 text-sm">
                          New Email
                        </label>
                        <Input
                          id="new-email"
                          type="email"
                          placeholder="Enter new email"
                          className="bg-white/5 border-white/20 text-white"
                        />
                      </div>
                      <div>
                        <label htmlFor="password" className="block text-white/80 mb-2 text-sm">
                          Password (to confirm)
                        </label>
                        <Input
                          id="password"
                          type="password"
                          placeholder="Enter your password"
                          className="bg-white/5 border-white/20 text-white"
                        />
                      </div>
                      <Button type="submit" variant="gradient">
                        Update Email
                      </Button>
                    </form>
                  </CardContent>
                </Card>

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
                        />
                      </div>
                      <Button type="submit" variant="gradient">
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
                    <Button variant="outline" className="bg-transparent border-red-400 text-red-400 hover:bg-red-400/10">
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
                        value={language}
                        onChange={(e) => setLanguage(e.target.value)}
                        className="w-full p-2.5 bg-white/5 border border-white/20 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-neon-purple"
                      >
                        <option value="english">English</option>
                        <option value="spanish">Spanish</option>
                        <option value="french">French</option>
                        <option value="german">German</option>
                        <option value="japanese">Japanese</option>
                        <option value="chinese">Chinese</option>
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
                            checked={emailNotifications} 
                            onCheckedChange={(checked) => setEmailNotifications(!!checked)}
                            className="data-[state=checked]:bg-neon-purple data-[state=checked]:text-white border-white/30"
                          />
                          <label htmlFor="email-notifications" className="text-white/80 text-sm">
                            Receive email notifications
                          </label>
                        </div>

                        <div className="flex items-center space-x-2 pl-6">
                          <Checkbox 
                            id="practice-reminders" 
                            checked={practiceReminders} 
                            onCheckedChange={(checked) => setPracticeReminders(!!checked)}
                            className="data-[state=checked]:bg-neon-purple data-[state=checked]:text-white border-white/30"
                            disabled={!emailNotifications}
                          />
                          <label 
                            htmlFor="practice-reminders" 
                            className={`text-sm ${emailNotifications ? 'text-white/80' : 'text-white/40'}`}
                          >
                            Practice reminders
                          </label>
                        </div>

                        <div className="flex items-center space-x-2 pl-6">
                          <Checkbox 
                            id="new-room-notifications" 
                            checked={newRoomNotifications} 
                            onCheckedChange={(checked) => setNewRoomNotifications(!!checked)}
                            className="data-[state=checked]:bg-neon-purple data-[state=checked]:text-white border-white/30"
                            disabled={!emailNotifications}
                          />
                          <label 
                            htmlFor="new-room-notifications" 
                            className={`text-sm ${emailNotifications ? 'text-white/80' : 'text-white/40'}`}
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
                        checked={browserNotifications} 
                        onCheckedChange={setBrowserNotifications}
                        className="data-[state=checked]:bg-neon-purple"
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
                        checked={publicProfile} 
                        onCheckedChange={setPublicProfile}
                        className="data-[state=checked]:bg-neon-purple"
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-white font-medium">Show Online Status</h3>
                        <p className="text-white/70 text-sm">Show when you're active on the platform</p>
                      </div>
                      <Switch 
                        checked={onlineStatus} 
                        onCheckedChange={setOnlineStatus}
                        className="data-[state=checked]:bg-neon-purple"
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
