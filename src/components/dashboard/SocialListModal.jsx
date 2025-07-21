import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '../../components/ui/dialog';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../../components/ui/tabs';
import { Button } from '../../components/ui/button';
import { SocialUserCard } from './SocialUserCard';
import socialApi from '../../api/socialApi';

function ListPane({ type, userId, onClose }) {
  const [items, setItems] = useState([]);
  const [next, setNext] = useState(null);
  const [loading, setLoading] = useState(true);

  const load = async (url) => {
    setLoading(true);
    try {
      let data;
      if (url) {
        const res = await axios.get(url); // full URL for pagination
        data = res.data;
      } else {
        if (type === 'followers') data = await socialApi.getFollowers(userId);
        if (type === 'following') data = await socialApi.getFollowing(userId);
        if (type === 'friends') data = await socialApi.getFriends(userId);
      }
      setItems(prev => url ? [...prev, ...data.results] : data.results);
      setNext(data.next);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [type, userId]);

  const handleRowChange = (resp) => {
    setItems(list => list.map(it =>
      (it.id === resp.target_profile_id ? { ...it, relationship_state: resp.relationship_state } : it)
    ));
  };

  // Empty state messages
  const emptyMessages = {
    followers: "No followers yet.",
    following: "You are not following anyone.",
    friends: "No friends yet."
  };

  return (
    <div className="space-y-2 max-h-[60vh] overflow-y-auto pr-1">
      {items.length === 0 && !loading && (
        <div className="text-center text-xs text-white/60 py-4">{emptyMessages[type]}</div>
      )}
      {items.map(item => (
        <SocialUserCard key={item.id} profile={item} onChange={handleRowChange} tabType={type} />
      ))}
      {next && (
        <div className="flex justify-center pt-2">
          <Button size="sm" variant="ghost" onClick={() => load(next)}>Load more</Button>
        </div>
      )}
      {loading && <div className="text-center text-xs text-white/60 py-2">Loading...</div>}
    </div>
  );
}

export function SocialListModal({ open, onOpenChange, defaultTab = 'followers', userId = null, onCloseProfileRefresh }) {
  const [tab, setTab] = useState(defaultTab);

  useEffect(() => setTab(defaultTab), [defaultTab]);

  // Call profile refresh on close
  const handleOpenChange = (isOpen) => {
    onOpenChange(isOpen);
    if (!isOpen && typeof onCloseProfileRefresh === 'function') {
      onCloseProfileRefresh();
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-md bg-[#13071D]/90 backdrop-blur-xl border border-white/10 text-white">
        <DialogHeader>
          <DialogTitle>Connections</DialogTitle>
          <DialogDescription className="text-white/60">Manage your social connections.</DialogDescription>
        </DialogHeader>
        <Tabs value={tab} onValueChange={setTab} className="mt-2">
          <TabsList className="grid grid-cols-3 w-full">
            <TabsTrigger value="followers">Followers</TabsTrigger>
            <TabsTrigger value="following">Following</TabsTrigger>
            <TabsTrigger value="friends">Friends</TabsTrigger>
          </TabsList>
          <TabsContent value="followers"><ListPane type="followers" userId={userId} /></TabsContent>
          <TabsContent value="following"><ListPane type="following" userId={userId} /></TabsContent>
          <TabsContent value="friends"><ListPane type="friends" userId={userId} /></TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
