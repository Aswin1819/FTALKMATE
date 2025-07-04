import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter
} from '../../components/ui/dialog';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../components/ui/select';
import { Checkbox } from '../../components/ui/checkbox';
import { toast } from '../../hooks/use-toast';
import adminInstance from '../../features/auth/adminInstance';

const EditRoomModal = ({ isOpen, onClose, room, onRoomUpdated }) => {
  const [title, setTitle] = useState('');
  const [language, setLanguage] = useState('');
  const [type, setType] = useState('');
  const [visibility, setVisibility] = useState('public');
  const [tags, setTags] = useState([]);
  const [allLanguages, setAllLanguages] = useState([]);
  const [allTypes, setAllTypes] = useState([]);
  const [allTags, setAllTags] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [optionsLoaded, setOptionsLoaded] = useState(false);

  // Fetch options first when modal opens
  useEffect(() => {
    if (!isOpen) {
      setOptionsLoaded(false);
      return;
    }
    
    const fetchOptions = async () => { 
      try {
        const [langRes, typeRes, tagRes] = await Promise.all([
          adminInstance.get('/languages/'),
          adminInstance.get('/room-types/'),
          adminInstance.get('/tags/')
        ]);
        setAllLanguages(langRes.data);
        setAllTypes(typeRes.data);
        setAllTags(tagRes.data);
        setOptionsLoaded(true);
      } catch (err) {
        toast({ title: "Error", description: "Failed to fetch options", variant: "destructive" });
      }
    };
    fetchOptions();
  }, [isOpen]);

  // Pre-fill form after options are loaded and room data is available
  useEffect(() => {
    if (room && optionsLoaded) {
      console.log('Room data:', room); // Debug log
      
      setTitle(room.title || '');
      
      // Set language - handle multiple possible property names
      let languageValue = '';
      if (room.language_id) {
        languageValue = String(room.language_id);
      } else if (room.language && typeof room.language === 'object' && room.language.id) {
        languageValue = String(room.language.id);
      } else if (room.language && typeof room.language === 'number') {
        languageValue = String(room.language);
      } else if (room.language && typeof room.language === 'string') {
        // If language is a string name, find the ID
        const langObj = allLanguages.find(lang => lang.name === room.language);
        languageValue = langObj ? String(langObj.id) : '';
      }
      console.log('Setting language to:', languageValue); // Debug log
      setLanguage(languageValue);
      
      // Set room type - handle multiple possible property names
      let typeValue = '';
      if (room.room_type_id) {
        typeValue = String(room.room_type_id);
      } else if (room.room_type && typeof room.room_type === 'object' && room.room_type.id) {
        typeValue = String(room.room_type.id);
      } else if (room.room_type && typeof room.room_type === 'number') {
        typeValue = String(room.room_type);
      } else if (room.type && typeof room.type === 'object' && room.type.id) {
        typeValue = String(room.type.id);
      } else if (room.type && typeof room.type === 'number') {
        typeValue = String(room.type);
      } else if (room.type && typeof room.type === 'string') {
        // If type is a string name, find the ID
        const typeObj = allTypes.find(t => t.name === room.type);
        typeValue = typeObj ? String(typeObj.id) : '';
      }
      console.log('Setting type to:', typeValue); // Debug log
      setType(typeValue);
      
      // Set visibility
      setVisibility(room.is_private ? 'private' : 'public');
      
      // Set tags - handle multiple possible structures
      let tagValues = [];
      if (room.tags && Array.isArray(room.tags)) {
        tagValues = room.tags.map(tag => {
          if (typeof tag === 'object' && tag.id) {
            return String(tag.id);
          } else if (typeof tag === 'number') {
            return String(tag);
          } else if (typeof tag === 'string') {
            // If tag is a string name, find the ID
            const tagObj = allTags.find(t => t.name === tag);
            return tagObj ? String(tagObj.id) : null;
          }
          return null;
        }).filter(Boolean);
      }
      console.log('Setting tags to:', tagValues); // Debug log
      setTags(tagValues);
    }
  }, [room, optionsLoaded, allLanguages, allTypes, allTags]);

  // Reset form when modal closes
  useEffect(() => {
    if (!isOpen) {
      setTitle('');
      setLanguage('');
      setType('');
      setVisibility('public');
      setTags([]);
    }
  }, [isOpen]);

  const handleTagToggle = (tagId) => {
    setTags(prev => {
      if (prev.includes(tagId)) {
        return prev.filter(id => id !== tagId);
      } else {
        return [...prev, tagId];
      }
    });
  };

  const handleSave = async () => {
    setIsLoading(true);
    try {
      await adminInstance.patch(`/rooms/${room.id}/`, {
        title,
        language: parseInt(language),
        room_type: parseInt(type),
        is_private: visibility === 'private',
        tag_ids: tags.map(id => parseInt(id)),
      });
      toast({
        title: "Room Updated",
        description: `${title} has been updated successfully`,
      });
      
      // Call the callback function to update the parent component
      if (onRoomUpdated) {
        onRoomUpdated(room.id);
      }
      
      onClose();
    } catch (err) {
      toast({
        title: "Error",
        description: "Failed to update room",
        variant: "destructive"
      });
    }
    setIsLoading(false);
  };

  // Get display value for language select
  const getLanguageDisplayValue = () => {
    if (!language || !allLanguages.length) return "Select language";
    const lang = allLanguages.find(l => String(l.id) === String(language));
    return lang ? lang.name : "Select language";
  };

  // Get display value for type select
  const getTypeDisplayValue = () => {
    if (!type || !allTypes.length) return "Select type";
    const roomType = allTypes.find(t => String(t.id) === String(type));
    return roomType ? roomType.name : "Select type";
  };

  // Get display value for tags
  const getTagsDisplayValue = () => {
    if (tags.length === 0 || !allTags.length) return "Select tags";
    if (tags.length === 1) {
      const tag = allTags.find(t => String(t.id) === String(tags[0]));
      return tag ? tag.name : "Select tags";
    }
    return `${tags.length} tags selected`;
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-[#1A0E29]/90 border-white/10 backdrop-blur-xl text-white max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-white">Edit Room</DialogTitle>
          <DialogDescription className="text-gray-300">
            Make changes to the room settings
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="title" className="text-sm font-medium text-gray-300">Title</label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="bg-black/20 border-white/10 text-white"
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="language" className="text-sm font-medium text-gray-300">Language</label>
            <Select value={language} onValueChange={setLanguage}>
              <SelectTrigger className="bg-black/20 border-white/10 text-white">
                <SelectValue>
                  {getLanguageDisplayValue()}
                </SelectValue>
              </SelectTrigger>
              <SelectContent className="bg-black/90 border-white/10 text-white">
                {allLanguages.map(lang => (
                  <SelectItem
                    key={lang.id}
                    value={String(lang.id)}
                    className="hover:bg-white/10 focus:bg-white/10"
                  >
                    {lang.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <label htmlFor="type" className="text-sm font-medium text-gray-300">Room Type</label>
            <Select value={type} onValueChange={setType}>
              <SelectTrigger className="bg-black/20 border-white/10 text-white">
                <SelectValue>
                  {getTypeDisplayValue()}
                </SelectValue>
              </SelectTrigger>
              <SelectContent className="bg-black/90 border-white/10 text-white">
                {allTypes.map(roomType => (
                  <SelectItem
                    key={roomType.id}
                    value={String(roomType.id)}
                    className="hover:bg-white/10 focus:bg-white/10"
                  >
                    {roomType.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <label htmlFor="visibility" className="text-sm font-medium text-gray-300">Visibility</label>
            <Select value={visibility} onValueChange={setVisibility}>
              <SelectTrigger className="bg-black/20 border-white/10 text-white">
                <SelectValue placeholder="Select visibility" />
              </SelectTrigger>
              <SelectContent className="bg-black/90 border-white/10 text-white">
                <SelectItem value="public" className="hover:bg-white/10 focus:bg-white/10">Public</SelectItem>
                <SelectItem value="private" className="hover:bg-white/10 focus:bg-white/10">Private</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <label htmlFor="tags" className="text-sm font-medium text-gray-300">Tags</label>
            <Select>
              <SelectTrigger className="bg-black/20 border-white/10 text-white">
                <SelectValue>
                  {getTagsDisplayValue()}
                </SelectValue>
              </SelectTrigger>
              <SelectContent className="bg-black/90 border-white/10 text-white">
                <div className="p-2 space-y-2">
                  {allTags.map(tag => (
                    <div key={tag.id} className="flex items-center space-x-2">
                      <Checkbox
                        id={`tag-${tag.id}`}
                        checked={tags.includes(String(tag.id))}
                        onCheckedChange={() => handleTagToggle(String(tag.id))}
                        className="border-white/30 data-[state=checked]:bg-neon-purple data-[state=checked]:border-neon-purple"
                      />
                      <label
                        htmlFor={`tag-${tag.id}`}
                        className="text-sm text-white cursor-pointer flex-1"
                      >
                        {tag.name}
                      </label>
                    </div>
                  ))}
                </div>
              </SelectContent>
            </Select>
          </div>
        </div>

        <DialogFooter className="mt-6 flex gap-2">
          <Button
            onClick={onClose}
            variant="ghost"
            className="bg-white/5 hover:bg-white/10 text-white"
          >
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            disabled={isLoading || !optionsLoaded}
            className="bg-neon-purple hover:bg-neon-purple/90 hover:glow-purple"
          >
            {isLoading ? 'Saving...' : 'Save Changes'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default EditRoomModal;