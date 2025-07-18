import React, { useState } from 'react';
import { Button } from '../../components/ui/button';
import { Avatar, AvatarImage, AvatarFallback } from '../../components/ui/avatar';
import { cn } from '../../lib/utils';
import socialApi from '../../api/socialApi';
import { toast } from '../../hooks/use-toast';
import { Description } from '@radix-ui/react-dialog';

export function SocialUserCard({ profile, onChange }) {
  const [loading, setLoading] = useState(false);
  const { id, unique_id, username, avatar, relationship_state, level, is_online, is_premium } = profile;

  const labelMap = {
    none: 'Follow',
    follower: 'Follow back',
    following: 'Following',
    friend: 'Friends',
  };

  const handleClick = async () => {
    if (loading) return;
    setLoading(true);
    try {
      let resp;
      if (relationship_state === 'following' || relationship_state === 'friend') {
        resp = await socialApi.unfollowUser(profile.user_id || profile.id);
        toast({
            titiel:'success',
            Description:'Unfollowed Successfylly',
            variant:'default'
        }) // <-- Success toast for unfollow
      } else {
        resp = await socialApi.followUser(profile.user_id || profile.id);
        toast({
            title:'success',
            description:'Followed Succcesfully',
            variant:'default'
        })
      }
      onChange?.(resp);
    } catch (err) {
      // You can extract error message from err if your API provides it
      toast({
        title:'error',
        description:"Failed ",
        variant:'destructive'
      })
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
      <Button
        size="sm"
        variant={relationship_state === 'none' || relationship_state === 'follower' ? 'default' : 'secondary'}
        disabled={loading}
        onClick={handleClick}
      >
        {loading ? '...' : labelMap[relationship_state] || 'Follow'}
      </Button>
    </div>
  );
}