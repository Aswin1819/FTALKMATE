import React, { useState } from 'react';
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
import { toast } from '../../hooks/use-toast';

const EditRoomModal = ({ isOpen, onClose, room }) => {
  if (!room) return null;

  const [title, setTitle] = useState(room.title);
  const [language, setLanguage] = useState(room.language);
  const [type, setType] = useState(room.type);
  const [visibility, setVisibility] = useState('public');
  const [tags, setTags] = useState('beginners, conversation, friendly');
  const [isLoading, setIsLoading] = useState(false);

  const handleSave = () => {
    setIsLoading(true);

    // Simulate API call
    setTimeout(() => {
      setIsLoading(false);
      toast({
        title: "Room Updated",
        description: `${title} has been updated successfully`,
      });
      onClose();
    }, 1000);
  };

  const languages = ["English", "Spanish", "French", "Japanese", "German", "Mandarin", "Italian", "Portuguese"];
  const roomTypes = ["casual", "study", "debate", "learning", "practice", "workshop"];

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
                <SelectValue placeholder="Select language" />
              </SelectTrigger>
              <SelectContent className="bg-black/90 border-white/10 text-white">
                {languages.map(lang => (
                  <SelectItem
                    key={lang}
                    value={lang}
                    className="hover:bg-white/10 focus:bg-white/10"
                  >
                    {lang}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <label htmlFor="type" className="text-sm font-medium text-gray-300">Room Type</label>
            <Select value={type} onValueChange={setType}>
              <SelectTrigger className="bg-black/20 border-white/10 text-white">
                <SelectValue placeholder="Select type" />
              </SelectTrigger>
              <SelectContent className="bg-black/90 border-white/10 text-white">
                {roomTypes.map(roomType => (
                  <SelectItem
                    key={roomType}
                    value={roomType}
                    className="hover:bg-white/10 focus:bg-white/10"
                  >
                    {roomType.charAt(0).toUpperCase() + roomType.slice(1)}
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
            <label htmlFor="tags" className="text-sm font-medium text-gray-300">Tags (comma separated)</label>
            <Input
              id="tags"
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              className="bg-black/20 border-white/10 text-white"
            />
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
            disabled={isLoading}
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
