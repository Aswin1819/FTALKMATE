import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import roomApi from '../../../api/roomApi';
import { toast } from '../../../hooks/use-toast';

export function useRoomActions() {
  const navigate = useNavigate();
  const [editingRoom, setEditingRoom] = useState(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);

  // Private room password modal state
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [passwordInput, setPasswordInput] = useState('');
  const [joiningRoom, setJoiningRoom] = useState(null);

  const handleJoinRoom = async (room) => {
    if (room.is_private) {
      setJoiningRoom(room);
      setShowPasswordModal(true);
      return;
    }
    try {
      await roomApi.joinRoom(room.id);
      navigate(`/room/${room.id}`);
    } catch (err) {
      toast({
        title: "Failed to join room",
        description: err.response?.data?.error || "Room may have ended.",
        variant: "destructive"
      });
    }
  };

  const handlePasswordSubmit = async () => {
    if (!joiningRoom) return;
    try {
      await roomApi.joinRoom(joiningRoom.id, passwordInput);
      setShowPasswordModal(false);
      setPasswordInput('');
      setJoiningRoom(null);
      navigate(`/room/${joiningRoom.id}`);
    } catch (err) {
      toast({
        title: "Invalid Password",
        description: err.response?.data?.error || "Room may have ended.",
        variant: "destructive"
      });
    }
  };

  const handleEditRoom = (room) => {
    setEditingRoom(room);
    setEditDialogOpen(true);
  };

  const closeEditDialog = () => {
    setEditDialogOpen(false);
    setEditingRoom(null);
  };

  const formatTimeAgo = (dateString) => {
    if (!dateString) return '';
    const now = new Date();
    const date = new Date(dateString);
    const diffInMinutes = Math.floor((now - date) / (1000 * 60));
    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
    return `${Math.floor(diffInMinutes / 1440)}d ago`;
  };

  return {
    handleJoinRoom,
    handleEditRoom,
    closeEditDialog,
    editingRoom,
    editDialogOpen,
    setEditDialogOpen,
    formatTimeAgo,
    // Private room modal state/handlers
    showPasswordModal,
    setShowPasswordModal,
    passwordInput,
    setPasswordInput,
    joiningRoom,
    setJoiningRoom,
    handlePasswordSubmit,
  };
}