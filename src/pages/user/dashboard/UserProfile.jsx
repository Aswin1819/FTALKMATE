// The following JSX file is the exact conversion from the original TSX file
// All TypeScript-specific features like type annotations and interfaces have been removed
// No changes were made to functionality, logic, or design

import React, { useState, useEffect, useRef } from 'react';
import { 
  Card, 
  CardContent,
} from "../../../components/ui/card";
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../../../components/ui/dialog";
import { Avatar, AvatarFallback, AvatarImage } from '../../../components/ui/avatar';
import { Badge } from '../../../components/ui/badge';
import { Button } from '../../../components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../../components/ui/select";
import { Pencil, Plus, X } from 'lucide-react';
import { toast } from '../../../hooks/use-toast';
import axiosInstance from '../../../features/auth/axiosInstance';
import { useSelector, useDispatch} from 'react-redux';
import { getCurrentUser } from '../../../features/auth/authThunks';

const UserProfile = () => {
  const user = useSelector((state) => state.auth.user); // For username, etc.
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const dispatch = useDispatch();

  //For language and proficiency
  const [availableLanguages, setAvailableLanguages] = useState([]);
  const [proficiencyLevels, setProficiencyLevels] = useState([]);

  // Local edit states
  const [isEditingBio, setIsEditingBio] = useState(false);
  const [tempBio, setTempBio] = useState('');
  const [isAddLanguageSpokenOpen, setIsAddLanguageSpokenOpen] = useState(false);
  const [isAddLanguageLearningOpen, setIsAddLanguageLearningOpen] = useState(false);
  const [newLanguage, setNewLanguage] = useState('');
  const [newLanguageLevel, setNewLanguageLevel] = useState('');
  const fileInputRef = useRef(null);
  const [avatarHover, setAvatarHover] = useState(false);

// Fetch profile, languages, and proficiency on mount
  useEffect(() => {
    setLoading(true);
    Promise.all([
      axiosInstance.get('/profile/'),
      axiosInstance.get('/languages/'),
      axiosInstance.get('/proficiency-choices/')
    ])
      .then(([profileRes, langRes, profRes]) => {
        setProfile(profileRes.data.profile);
        setTempBio(profileRes.data.profile.bio || '');
        setAvailableLanguages(langRes.data);
        setProficiencyLevels(profRes.data);
      })
      .catch(() => toast({ title: "Error", description: "Failed to load profile or languages", variant: "destructive" }))
      .finally(() => setLoading(false));
  }, []);

  // Update bio
  const handleSaveBio = () => {
  console.log("Updating bio with:", tempBio);
  axiosInstance.patch('/profile/update/', { bio: tempBio })
    .then(res => {
      console.log("Update bio response:", res);
      // Try both possible response structures
      const updatedProfile = res.data.profile || res.data;
      setProfile(updatedProfile);
      setTempBio(updatedProfile.bio || '');
      setIsEditingBio(false);
      toast({ title: "Profile updated", description: "Your bio was updated successfully" });
    })
    .catch(err => {
      console.error("Error updating bio:", err);
      if (err.response) {
        console.error("Backend error response:", err.response.data);
        toast({ title: "Error", description: err.response.data?.error || "Failed to update bio", variant: "destructive" });
      } else {
        toast({ title: "Error", description: "Failed to update bio", variant: "destructive" });
      }
    });
};

  // Update avatar (using PUT)
  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const formData = new FormData();
    formData.append('avatar', file);
    axiosInstance.put('/profile/update/', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    })
      .then(res => {
        setProfile(res.data.profile || res.data);
        dispatch(getCurrentUser());
        toast({ title: "Profile updated", description: "Your avatar was updated successfully" });
      })
      .catch(() => toast({ title: "Error", description: "Failed to update avatar", variant: "destructive" }));
  };

  // Add language (native or learning)
  const addLanguage = (isLearning) => {
    if (!newLanguage || !newLanguageLevel) {
      toast({ title: "Language and level required", variant: "destructive" });
      return;
    }
    const langField = isLearning ? 'learning_languages' : 'native_languages';
    const updated = [
      ...(profile?.[langField]?.map(l => ({
        language: l.language.id,
        proficiency: l.proficiency
      })) || []),
      { language: newLanguage, proficiency: newLanguageLevel }
    ];
    axiosInstance.patch('/profile/update/', { [langField]: updated })
      .then(res => {
        setProfile(res.data.profile || res.data);
        setIsAddLanguageLearningOpen(false);
        setIsAddLanguageSpokenOpen(false);
        setNewLanguage('');
        setNewLanguageLevel('');
        toast({ title: "Language added", description: "Language added to your profile" });
      })
      .catch(() => toast({ title: "Error", description: "Failed to update languages", variant: "destructive" }));
  };


  // Remove language
  const removeLanguage = (id, isLearning) => {
    const langField = isLearning ? 'learning_languages' : 'native_languages';
    const updated = (profile?.[langField] || [])
      .filter((_, idx) => idx !== id)
      .map(l => ({
        language: l.language.id,
        proficiency: l.proficiency
      }));
    axiosInstance.patch('/profile/update/', { [langField]: updated })
      .then(res => {
        setProfile(res.data.profile || res.data);
        toast({ title: "Language removed", description: "The language has been removed from your profile" });
      })
      .catch(() => toast({ title: "Error", description: "Failed to update languages", variant: "destructive" }));
  };



  if (loading) return <div className="text-white">Loading...</div>;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-white">My Profile</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2">
          <Card className="bg-black/30 backdrop-blur-sm border-white/10 text-white overflow-hidden">
            <CardContent className="p-6 space-y-8">
              {/* Profile Header with Avatar */}
              <div className="flex items-start space-x-6">
                <div
                  className="relative group"
                  onMouseEnter={() => setAvatarHover(true)}
                  onMouseLeave={() => setAvatarHover(false)}
                >
                  <Avatar className="h-24 w-24 border-2 border-neon-purple">
                    <AvatarImage src={profile?.avatar || "https://github.com/shadcn.png"} />
                    <AvatarFallback className="text-xl">
                      {profile?.user?.username?.[0]?.toUpperCase() || "U"}
                    </AvatarFallback>
                  </Avatar>
                  {/* Pencil overlay on hover */}
                  {avatarHover && (
                    <div
                      className="absolute inset-0 flex items-center justify-center bg-black/40 rounded-full cursor-pointer"
                      onClick={() => fileInputRef.current.click()}
                    >
                      <Pencil className="h-8 w-8 text-white" />
                    </div>
                  )}
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleAvatarChange}
                  />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h2 className="text-2xl font-bold">{profile?.user?.username || user?.username || "Guest"}</h2>
                  </div>
                  <h2 className="text-sm font-medium">{profile?.unique_id || "Unknown ID"}</h2>
                </div>
              </div>
              {/* About Me Section */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-lg font-medium">About Me</h3>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 w-7 p-0"
                    onClick={() => setIsEditingBio(true)}
                  >
                    <Pencil className="h-3.5 w-3.5" />
                  </Button>
                </div>
                {isEditingBio ? (
                  <div className="space-y-2">
                    <textarea
                      className="w-full p-2 rounded-md h-24 bg-white/5 border border-white/10 text-white resize-none"
                      value={tempBio}
                      onChange={(e) => setTempBio(e.target.value)}
                    ></textarea>
                    <div className="flex justify-end space-x-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setIsEditingBio(false)}
                        className="bg-white/5 hover:bg-white/10 text-white"
                      >
                        Cancel
                      </Button>
                      <Button
                        size="sm"
                        onClick={handleSaveBio}
                        className="bg-neon-purple hover:bg-neon-purple/90"
                      >
                        Save
                      </Button>
                    </div>
                  </div>
                ) : (
                  <p className="text-gray-300">{profile?.bio || "No bio yet."}</p>
                )}
              </div>
              {/* Languages I Speak */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-lg font-medium">Languages I Speak</h3>
                  <Dialog open={isAddLanguageSpokenOpen} onOpenChange={setIsAddLanguageSpokenOpen}>
                    <DialogTrigger asChild>
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-sm bg-transparent border-white/20 hover:bg-white/5"
                      >
                        + Add Language
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="bg-[#1A0E29]/90 border-white/10 backdrop-blur-xl text-white">
                      <DialogHeader>
                        <DialogTitle>Add Language</DialogTitle>
                        <DialogDescription className="text-gray-400">
                          Add a language that you speak fluently
                        </DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4 py-4">
                        <div className="space-y-2">
                          <label className="text-sm font-medium text-gray-300">Language</label>
                          <Select value={newLanguage} onValueChange={setNewLanguage}>
                            <SelectTrigger className="bg-black/20 border-white/10 text-white">
                              <SelectValue placeholder="Select Language" />
                            </SelectTrigger>
                            <SelectContent className="bg-black/90 border-white/10 text-white">
                              {availableLanguages.map(language => (
                                <SelectItem
                                  key={language.id}
                                  value={language.id}
                                  className="hover:bg-white/10"
                                >
                                  {language.code} {language.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <label className="text-sm font-medium text-gray-300">Proficiency Level</label>
                          <Select value={newLanguageLevel} onValueChange={setNewLanguageLevel}>
                            <SelectTrigger className="bg-black/20 border-white/10 text-white">
                              <SelectValue placeholder="Select Level" />
                            </SelectTrigger>
                            <SelectContent className="bg-black/90 border-white/10 text-white">
                              {proficiencyLevels.map(level => (
                                <SelectItem
                                  key={level.value}
                                  value={level.value}
                                  className="hover:bg-white/10"
                                >
                                  {level.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                      <DialogFooter>
                        <Button
                          variant="ghost"
                          onClick={() => setIsAddLanguageSpokenOpen(false)}
                          className="bg-white/5 hover:bg-white/10 text-white"
                        >
                          Cancel
                        </Button>
                        <Button
                          onClick={() => addLanguage(false)}
                          className="bg-neon-purple hover:bg-neon-purple/90 hover:glow-purple"
                        >
                          Add Language
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </div>
                <div className="flex flex-wrap gap-2">
                  {(profile?.native_languages || []).map((lang, idx) => (
                    <div
                      key={idx}
                      className="bg-[#2D1E46] rounded-full px-4 py-1 flex items-center space-x-1 border border-white/10"
                    >
                      <span className="mr-1">{lang.language?.code || "🏳️"}</span>
                      <span className="font-medium">{lang.language?.name}</span>
                      <span className="text-xs text-gray-400">({lang.proficiency})</span>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => removeLanguage(idx, false)}
                        className="h-5 w-5 ml-1 rounded-full hover:bg-white/10"
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
              {/* Languages I'm Learning */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-lg font-medium">Languages I'm Learning</h3>
                  <Dialog open={isAddLanguageLearningOpen} onOpenChange={setIsAddLanguageLearningOpen}>
                    <DialogTrigger asChild>
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-sm bg-transparent border-white/20 hover:bg-white/5"
                      >
                        + Add Language
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="bg-[#1A0E29]/90 border-white/10 backdrop-blur-xl text-white">
                      <DialogHeader>
                        <DialogTitle>Add Language</DialogTitle>
                        <DialogDescription className="text-gray-400">
                          Add a language that you're currently learning
                        </DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4 py-4">
                        <div className="space-y-2">
                          <label className="text-sm font-medium text-gray-300">Language</label>
                          <Select value={newLanguage} onValueChange={setNewLanguage}>
                            <SelectTrigger className="bg-black/20 border-white/10 text-white">
                              <SelectValue placeholder="Select Language" />
                            </SelectTrigger>
                            <SelectContent className="bg-black/90 border-white/10 text-white">
                              {availableLanguages.map(language => (
                                <SelectItem
                                  key={language.id}
                                  value={language.id}
                                  className="hover:bg-white/10"
                                >
                                  {language.code} {language.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <label className="text-sm font-medium text-gray-300">Proficiency Level</label>
                          <Select value={newLanguageLevel} onValueChange={setNewLanguageLevel}>
                            <SelectTrigger className="bg-black/20 border-white/10 text-white">
                              <SelectValue placeholder="Select Level" />
                            </SelectTrigger>
                            <SelectContent className="bg-black/90 border-white/10 text-white">
                              {proficiencyLevels.map(level => (
                                <SelectItem
                                  key={level.value}
                                  value={level.value}
                                  className="hover:bg-white/10"
                                >
                                  {level.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                      <DialogFooter>
                        <Button
                          variant="ghost"
                          onClick={() => setIsAddLanguageLearningOpen(false)}
                          className="bg-white/5 hover:bg-white/10 text-white"
                        >
                          Cancel
                        </Button>
                        <Button
                          onClick={() => addLanguage(true)}
                          className="bg-neon-purple hover:bg-neon-purple/90 hover:glow-purple"
                        >
                          Add Language
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </div>
                <div className="flex flex-wrap gap-2">
                  {(profile?.learning_languages || []).map((lang, idx) => (
                    <div
                      key={idx}
                      className="bg-[#2D1E46] rounded-full px-4 py-1 flex items-center space-x-1 border border-white/10"
                    >
                      <span className="mr-1">{lang.language?.code || "🏳️"}</span>
                      <span className="font-medium">{lang.language?.name}</span>
                      <span className="text-xs text-gray-400">({lang.proficiency})</span>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => removeLanguage(idx, true)}
                        className="h-5 w-5 ml-1 rounded-full hover:bg-white/10"
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
              {/* Edit Full Profile Button */}
              {/* <div className="flex justify-center pt-2">
                <Button
                  className="bg-[#5B42AA] hover:bg-[#6D50BF] text-white px-6"
                >
                  Edit Full Profile
                </Button>
              </div> */}
            </CardContent>
          </Card>
        </div>
        
        {/* Progress and Stats (1/3 width on medium+ screens) */}
        <div>
          <Card className="bg-black/30 backdrop-blur-sm border-white/10 text-white overflow-hidden">
            <CardContent className="p-6 space-y-6">
              <h3 className="text-lg font-bold">Your Progress</h3>
              
              {/* Level Info */}
              <div className="bg-[#242047] p-4 rounded-lg space-y-2">
                <div className="flex justify-between items-center">
                  <div>
                    <h4 className="text-md font-bold">Level {profile.level}</h4>
                    <p className="text-xs text-gray-400">Conversational Explorer</p>
                  </div>
                  <Badge className="bg-gradient-to-r from-neon-purple to-neon-blue text-white">
                    {profile.streak} Day Streak
                  </Badge>
                </div>
                
                {/* XP Progress Bar */}
                <div>
                  <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-neon-purple to-neon-blue" style={{ width: "45%" }}></div>
                  </div>
                  <div className="flex justify-end mt-1">
                    <span className="text-xs text-gray-400">3240/7200 XP to Level 6</span>
                  </div>
                </div>
              </div>
              
              {/* Rooms Stats */}
              <div className="bg-[#242047] p-4 rounded-lg flex items-center">
                <div className="rounded-full bg-[#384276] p-2 mr-3">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-blue-300"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M22 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>
                </div>
                <div>
                  <h4 className="font-bold text-lg">{profile.total_rooms_joined}</h4>
                  <p className="text-xs text-gray-400">Rooms Joined</p>
                </div>
              </div>
              
              {/* Practice Time */}
              <div className="bg-[#242047] p-4 rounded-lg flex items-center">
                <div className="rounded-full bg-[#384276] p-2 mr-3">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-blue-300"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
                </div>
                <div>
                  <h4 className="font-bold text-lg">{profile.total_speak_time}</h4>
                  <p className="text-xs text-gray-400">Total Practice Time</p>
                </div>
              </div>
              
              {/* Join Date */}
              <div className="bg-[#242047] p-4 rounded-lg flex items-center">
                <div className="rounded-full bg-[#384276] p-2 mr-3">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-blue-300"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
                </div>
                <div>
                  <h4 className="font-bold text-lg">
                    {profile.date_joined
                      ? new Date(profile.date_joined).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric'
                        })
                      : 'Unknown'}
                  </h4> {/* Mar 23 2023 */}
                  <p className="text-xs text-gray-400">Joined Date</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default UserProfile;
