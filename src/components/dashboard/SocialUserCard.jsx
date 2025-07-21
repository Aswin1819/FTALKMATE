import React, { useState } from 'react';
import { Button } from '../../components/ui/button';
import { Avatar, AvatarImage, AvatarFallback } from '../../components/ui/avatar';
import { cn } from '../../lib/utils';
import socialApi from '../../api/socialApi';
import { toast } from '../../hooks/use-toast';
import { Description } from '@radix-ui/react-dialog';

export function SocialUserCard({ profile, onChange, tabType = 'followers' }) {
  const [loading, setLoading] = useState(false);
  const { id, unique_id, username, avatar, relationship_state, level } = profile;

  // Button label and action logic based on tabType and relationship_state
  let buttonLabel = null;
  let showButton = true;

  if (tabType === 'friends') {
    showButton = false; // No button in friends tab
  } else if (tabType === 'followers') {
    if (relationship_state === 'following' || relationship_state === 'friend') {
      buttonLabel = 'Unfollow';
    } else {
      buttonLabel = 'Follow back';
    }
  } else if (tabType === 'following') {
    if (relationship_state === 'following' || relationship_state === 'friend') {
      buttonLabel = 'Unfollow';
    } else {
      buttonLabel = null; // Should not happen, but fallback
      showButton = false;
    }
  }

  const handleClick = async () => {
    if (loading) return;
    setLoading(true);
    try {
      let resp;
      if (buttonLabel === 'Unfollow') {
        resp = await socialApi.unfollowUser(profile.user_id || profile.id);
        toast({
          title: 'Success',
          description: 'Unfollowed Successfully',
          variant: 'default'
        });
      } else if (buttonLabel === 'Follow back') {
        resp = await socialApi.followUser(profile.user_id || profile.id);
        toast({
          title: 'Success',
          description: 'Followed Successfully',
          variant: 'default'
        });
      }
      onChange?.(resp);
    } catch (err) {
      toast({
        title: 'Error',
        description: "Failed",
        variant: 'destructive'
      });
      console.error('Social action error', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center gap-3 p-2 bg-white/5 hover:bg-white/10 rounded-lg transition-colors">
      <Avatar className="h-10 w-10 border border-white/10">
        <AvatarImage src={avatar} />
        <AvatarFallback>{username?.slice(0,2)?.toUpperCase() || 'U'}</AvatarFallback>
      </Avatar>
      <div className="flex-1 min-w-0">
        <div className="text-sm font-medium text-white truncate">{username}</div>
        <div className="text-xs text-white/60 truncate">{unique_id} • L{level}</div>
      </div>
      {showButton && buttonLabel && (
        <Button
          size="sm"
          variant={buttonLabel === 'Unfollow' ? 'secondary' : 'default'}
          disabled={loading}
          onClick={handleClick}
        >
          {loading ? '...' : buttonLabel}
        </Button>
      )}
    </div>
  );
}