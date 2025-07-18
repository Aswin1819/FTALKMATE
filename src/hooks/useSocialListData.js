import { useState, useCallback, useEffect } from 'react';
import socialApi from '../api/socialApi';

export function useSocialListData(type, userId) {
  const [items, setItems] = useState([]);
  const [next, setNext] = useState(null);
  const [loading, setLoading] = useState(false);

  const load = useCallback(async (url) => {
    setLoading(true);
    try {
      let data;
      if (url) {
        const res = await axios.get(url);
        data = res.data;
      } else {
        if (type === 'followers') data = await socialApi.getFollowers(userId);
        else if (type === 'following') data = await socialApi.getFollowing(userId);
        else data = await socialApi.getFriends(userId);
      }
      setItems(prev => url ? [...prev, ...data.results] : data.results);
      setNext(data.next);
    } finally {
      setLoading(false);
    }
  }, [type, userId]);

  useEffect(() => { load(); }, [load]);

  const updateRow = useCallback((resp) => {
    setItems(list => list.map(it =>
      (it.id === resp.target_profile_id ? { ...it, relationship_state: resp.relationship_state } : it)
    ));
  }, []);

  return { items, next, loading, loadMore: () => load(next), updateRow };
}