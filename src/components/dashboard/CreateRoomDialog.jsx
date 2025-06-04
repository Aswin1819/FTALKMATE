import React from 'react';
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
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { ScrollArea } from '../../components/ui/scroll-area';

const roomTypeOptions = [
  { label: 'Casual Conversation', value: 'casual' },
  { label: 'Debate', value: 'debate' },
  { label: 'IELTS Practice', value: 'ielts' },
  { label: 'Private Session', value: 'private' },
];

const formSchema = z.object({
  title: z.string().min(3, {
    message: 'Room title must be at least 3 characters.',
  }),
  type: z.string(),
  tags: z.string(),
  enableChat: z.boolean().default(true),
  allowGuests: z.boolean().default(false),
  enableVideo: z.boolean().default(false),
  description: z.string().optional(),
});

const CreateRoomDialog = ({ isOpen, onClose }) => {
  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: '',
      type: 'casual',
      tags: '',
      enableChat: true,
      allowGuests: false,
      enableVideo: false,
      description: '',
    },
  });

  const onSubmit = (data) => {
    console.log('Create room data:', data);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-[#13071D]/95 backdrop-blur-lg border border-white/10 text-white max-w-lg max-h-[90vh] p-0">
        <ScrollArea className="max-h-[90vh] overflow-y-auto">
          <div className="p-6">
            <DialogHeader>
              <DialogTitle className="text-2xl font-bold text-gradient-purple">Create a New Room</DialogTitle>
              <DialogDescription className="text-gray-400">
                Set up your conversation room and invite others to join.
              </DialogDescription>
            </DialogHeader>

            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 mt-4">
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-white">Room Title</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="English Conversation Practice"
                          className="bg-white/5 border-white/10 text-white"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="type"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-white">Room Type</FormLabel>
                      <FormControl>
                        <select
                          className="w-full h-10 rounded-md bg-white/5 border border-white/10 text-white px-3 py-2"
                          {...field}
                        >
                          {roomTypeOptions.map((option) => (
                            <option key={option.value} value={option.value} className="bg-[#13071D] text-white">
                              {option.label}
                            </option>
                          ))}
                        </select>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="tags"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-white">Tags / Languages</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="English, Beginner, Casual"
                          className="bg-white/5 border-white/10 text-white"
                          {...field}
                        />
                      </FormControl>
                      <FormDescription className="text-gray-400 text-xs">
                        Separate multiple tags with commas
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="enableChat"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border border-white/10 p-3 shadow-sm">
                        <div className="space-y-0.5">
                          <FormLabel className="text-white">Live Chat</FormLabel>
                          <FormDescription className="text-xs text-gray-400">
                            Enable text chat
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

                  <FormField
                    control={form.control}
                    name="allowGuests"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border border-white/10 p-3 shadow-sm">
                        <div className="space-y-0.5">
                          <FormLabel className="text-white">Allow Guests</FormLabel>
                          <FormDescription className="text-xs text-gray-400">
                            Non-registered users
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
                </div>

                <FormField
                  control={form.control}
                  name="enableVideo"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border border-white/10 p-3 shadow-sm">
                      <div className="space-y-0.5">
                        <FormLabel className="text-white">Enable Video</FormLabel>
                        <FormDescription className="text-xs text-gray-400">
                          Premium feature
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

                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-white">Description (optional)</FormLabel>
                      <FormControl>
                        <textarea
                          placeholder="Tell others what this room is about..."
                          className="w-full min-h-[60px] max-h-[120px] rounded-md bg-white/5 border border-white/10 text-white px-3 py-2"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <DialogFooter className="pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={onClose}
                    className="bg-transparent border-white/10 text-white hover:bg-white/10"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    className="bg-gradient-to-r from-neon-purple to-neon-blue text-white hover:from-neon-purple/90 hover:to-neon-blue/90 glow-purple"
                  >
                    Create Room
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
