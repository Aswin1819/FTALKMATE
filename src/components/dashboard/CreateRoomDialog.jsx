import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from '../../components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from '../../components/ui/form';
import { Input } from '../../components/ui/input';
import { Button } from '../../components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { Badge } from '../../components/ui/badge';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { ScrollArea } from '../../components/ui/scroll-area';
import { X, Users, Globe, Lock, Unlock } from 'lucide-react';
import { roomApi } from '../../api/roomApi';

const formSchema = z.object({
  title: z.string().min(3, {
    message: 'Room title must be at least 3 characters.',
  }).max(100, {
    message: 'Room title must be less than 100 characters.',
  }),
  room_type: z.string().min(1, {
    message: 'Please select a room type.',
  }),
  language: z.string().min(1, {
    message: 'Please select a language.',
  }),
  description: z.string().max(500, {
    message: 'Description must be less than 500 characters.',
  }).optional(),
  max_participants: z.number().min(2, {
    message: 'Room must allow at least 2 participants.',
  }).max(50, {
    message: 'Maximum 50 participants allowed.',
  }),
  is_private: z.boolean().default(false),
  password: z.string().optional(),
  tags: z.array(z.number()).default([]),
});

// Language options (you might want to fetch these from backend too)
// const languageOptions = [
//   { id: 1, name: 'English' },
//   { id: 2, name: 'Spanish' },
//   { id: 3, name: 'French' },
//   { id: 4, name: 'German' },
//   { id: 5, name: 'Italian' },
//   { id: 6, name: 'Portuguese' },
//   { id: 7, name: 'Japanese' },
//   { id: 8, name: 'Korean' },
//   { id: 9, name: 'Mandarin' },
//   { id: 10, name: 'Arabic' },
//   { id: 11, name: 'Russian' },
//   { id: 12, name: 'Hindi' },
// ];

const CreateRoomDialog = ({ isOpen, onClose, onRoomCreated, roomTypes = [], tags = [], languages = [] }) => {
  const [loading, setLoading] = useState(false);
  const [selectedTags, setSelectedTags] = useState([]);
  const [tagSearchTerm, setTagSearchTerm] = useState('');
  const [error, setError] = useState(null);

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: '',
      room_type: '',
      language: '',
      description: '',
      max_participants: 10,
      is_private: false,
      password: '',
      tags: [],
    },
  });

  const watchIsPrivate = form.watch('is_private');

  // Reset form when dialog closes
  useEffect(() => {
    if (!isOpen) {
      form.reset();
      setSelectedTags([]);
      setTagSearchTerm('');
      setError(null);
    }
  }, [isOpen, form]);

  // Update form tags when selectedTags changes
  useEffect(() => {
    form.setValue('tags', selectedTags.map(tag => tag.id));
  }, [selectedTags, form]);

  const handleTagAdd = (tag) => {
    if (!selectedTags.find(t => t.id === tag.id)) {
      setSelectedTags(prev => [...prev, tag]);
    }
    setTagSearchTerm('');
  };

  const handleTagRemove = (tagId) => {
    setSelectedTags(prev => prev.filter(t => t.id !== tagId));
  };

  const filteredTags = tags.filter(tag =>
    tag.name.toLowerCase().includes(tagSearchTerm.toLowerCase()) &&
    !selectedTags.find(t => t.id === tag.id)
  );

  const onSubmit = async (data) => {
    setLoading(true);
    setError(null);
    
    try {
      // Prepare the room data according to your backend API
      const roomData = {
        title: data.title,
        description: data.description || '',
        room_type: parseInt(data.room_type),
        language: parseInt(data.language),
        max_participants: data.max_participants,
        is_private: data.is_private,
        password: data.is_private ? data.password : '',
        tags: data.tags, // Array of tag IDs
      };

      console.log('Creating room with data:', roomData);
      
      const newRoom = await roomApi.createRoom(roomData);
      
      // Call the callback to update the parent component
      if (onRoomCreated) {
        onRoomCreated(newRoom);
      }
      
      // Close the dialog
      onClose();
      
    } catch (err) {
      console.error('Error creating room:', err);
      setError(
        err.response?.data?.message || 
        err.response?.data?.error || 
        'Failed to create room. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-[#13071D]/95 backdrop-blur-lg border border-white/10 text-white max-w-lg max-h-[90vh] p-0">
        <ScrollArea className="max-h-[90vh] overflow-y-auto">
          <div className="p-6">
            <DialogHeader>
              <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-neon-purple to-neon-blue bg-clip-text text-transparent">
                Create a New Room
              </DialogTitle>
              <DialogDescription className="text-gray-400">
                Set up your conversation room and invite others to join.
              </DialogDescription>
            </DialogHeader>

            {error && (
              <div className="mt-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-sm">
                {error}
              </div>
            )}

            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 mt-4">
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-white">Room Title *</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="English Conversation Practice"
                          className="bg-white/5 border-white/10 text-white focus:border-neon-purple"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="room_type"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-white">Room Type *</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger className="bg-white/5 border-white/10 text-white focus:border-neon-purple">
                              <SelectValue placeholder="Select type" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent className="bg-[#13071D] border-white/10">
                            {roomTypes.map((type) => (
                              <SelectItem 
                                key={type.id} 
                                value={type.id.toString()}
                                className="text-white hover:bg-white/10"
                              >
                                {type.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="language"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-white">Language *</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger className="bg-white/5 border-white/10 text-white focus:border-neon-purple">
                              <SelectValue placeholder="Select language" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent className="bg-[#13071D] border-white/10">
                            {languages.map((language) => (
                              <SelectItem 
                                key={language.id} 
                                value={language.id.toString()}
                                className="text-white hover:bg-white/10"
                              >
                                <div className="flex items-center">
                                  <Globe className="h-4 w-4 mr-2" />
                                  {language.name}
                                </div>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-white">Description</FormLabel>
                      <FormControl>
                        <textarea
                          placeholder="Tell others what this room is about..."
                          className="w-full min-h-[80px] max-h-[120px] rounded-md bg-white/5 border border-white/10 text-white px-3 py-2 focus:border-neon-purple resize-none"
                          {...field}
                        />
                      </FormControl>
                      <FormDescription className="text-gray-400 text-xs">
                        Optional - help others understand your room's purpose
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="max_participants"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-white">Maximum Participants</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Users className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                          <Input
                            type="number"
                            min="2"
                            max="50"
                            className="bg-white/5 border-white/10 text-white pl-10 focus:border-neon-purple"
                            {...field}
                            onChange={(e) => field.onChange(parseInt(e.target.value) || 2)}
                          />
                        </div>
                      </FormControl>
                      <FormDescription className="text-gray-400 text-xs">
                        Between 2 and 50 participants
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Tags Selection */}
                <div className="space-y-2">
                  <FormLabel className="text-white">Tags</FormLabel>
                  <div className="relative">
                    <Input
                      placeholder="Search tags..."
                      className="bg-white/5 border-white/10 text-white focus:border-neon-purple"
                      value={tagSearchTerm}
                      onChange={(e) => setTagSearchTerm(e.target.value)}
                    />
                    {tagSearchTerm && filteredTags.length > 0 && (
                      <div className="absolute top-full left-0 right-0 z-10 mt-1 bg-[#13071D] border border-white/10 rounded-md max-h-32 overflow-y-auto">
                        {filteredTags.slice(0, 5).map((tag) => (
                          <button
                            key={tag.id}
                            type="button"
                            className="w-full text-left px-3 py-2 text-sm text-white hover:bg-white/10"
                            onClick={() => handleTagAdd(tag)}
                          >
                            {tag.name}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                  
                  {selectedTags.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-2">
                      {selectedTags.map((tag) => (
                        <Badge
                          key={tag.id}
                          variant="outline"
                          className="bg-neon-purple/10 border-neon-purple/20 text-neon-purple"
                        >
                          {tag.name}
                          <button
                            type="button"
                            onClick={() => handleTagRemove(tag.id)}
                            className="ml-1 hover:text-red-400"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </Badge>
                      ))}
                    </div>
                  )}
                  <FormDescription className="text-gray-400 text-xs">
                    Add relevant tags to help others find your room
                  </FormDescription>
                </div>

                {/* Privacy Settings */}
                <div className="space-y-3 p-4 bg-white/5 border border-white/10 rounded-lg">
                  <FormField
                    control={form.control}
                    name="is_private"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between">
                        <div className="space-y-0.5">
                          <FormLabel className="text-white flex items-center">
                            {field.value ? <Lock className="h-4 w-4 mr-2" /> : <Unlock className="h-4 w-4 mr-2" />}
                            Private Room
                          </FormLabel>
                          <FormDescription className="text-xs text-gray-400">
                            Require password to join
                          </FormDescription>
                        </div>
                        <FormControl>
                          <input
                            type="checkbox"
                            checked={field.value}
                            onChange={field.onChange}
                            className="accent-neon-purple h-4 w-4"
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />

                  {watchIsPrivate && (
                    <FormField
                      control={form.control}
                      name="password"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-white">Room Password *</FormLabel>
                          <FormControl>
                            <Input
                              type="password"
                              placeholder="Enter room password"
                              className="bg-white/5 border-white/10 text-white focus:border-neon-purple"
                              {...field}
                            />
                          </FormControl>
                          <FormDescription className="text-gray-400 text-xs">
                            Users will need this password to join
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  )}
                </div>

                <DialogFooter className="pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={onClose}
                    disabled={loading}
                    className="bg-transparent border-white/10 text-white hover:bg-white/10"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={loading}
                    className="bg-gradient-to-r from-neon-purple to-neon-blue text-white hover:from-neon-purple/90 hover:to-neon-blue/90"
                  >
                    {loading ? 'Creating...' : 'Create Room'}
                  </Button>
                </DialogFooter>
              </form>
            </Form>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};

export default CreateRoomDialog;