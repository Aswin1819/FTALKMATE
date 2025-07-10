import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter
} from '../../components/ui/dialog';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';

const SubscriptionDetailsModal = ({ isOpen, onClose, subscription }) => {
  if (!subscription) return null;

  const getStatusBadge = (status) => {
    switch (status) {
      case 'active':
        return <Badge className="bg-neon-green/20 text-neon-green border border-neon-green/30">Active</Badge>;
      case 'expired':
        return <Badge className="bg-red-500/20 text-red-400 border border-red-500/30">Expired</Badge>;
      case 'canceled':
        return <Badge className="bg-amber-500/20 text-amber-400 border border-amber-500/30">Canceled</Badge>;
      default:
        return <Badge className="bg-gray-500/20 text-gray-400 border border-gray-500/30">Unknown</Badge>;
    }
  };
  
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-black/90 backdrop-blur-xl border border-white/10 text-white max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-white">Subscription Details</DialogTitle>
          <DialogDescription className="text-gray-300">
            {subscription.username}'s subscription information
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* User Info */}
          <div className="bg-black/20 p-4 rounded-lg border border-white/10">
            <h4 className="text-sm font-medium text-gray-300 mb-3">User Information</h4>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-400">Name</span>
                <span className="text-white">{subscription.username}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Email</span>
                <span className="text-white">{subscription.email}</span>
              </div>
            </div>
          </div>

          {/* Subscription Info */}
          <div className="bg-black/20 p-4 rounded-lg border border-white/10">
            <div className="flex justify-between items-center mb-4">
              <h4 className="text-sm font-medium text-gray-300">Subscription Details</h4>
              {getStatusBadge(subscription.status)}
            </div>
            
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-400">Plan Name</span>
                <span className="text-white font-medium">{subscription.plan}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Plan ID</span>
                <span className="text-white font-mono text-sm">{subscription.planId}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Start Date</span>
                <span className="text-white">{new Date(subscription.startDate).toLocaleDateString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Expiry Date</span>
                <span className="text-white">{new Date(subscription.endDate).toLocaleDateString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Amount</span>
                <span className="text-white font-medium">{subscription.amount}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Payment Method</span>
                <span className="text-white">{subscription.paymentMethod}</span>
              </div>
            </div>
          </div>
          
          {/* Features */}
          {subscription.features && subscription.features.length > 0 && (
            <div className="bg-black/20 p-4 rounded-lg border border-white/10">
              <h4 className="text-sm font-medium text-gray-300 mb-3">Plan Features</h4>
              <ul className="space-y-2">
                {subscription.features.map((feature, index) => (
                  <li key={index} className="flex items-center text-sm">
                    <span className="h-1.5 w-1.5 bg-neon-purple rounded-full mr-3 flex-shrink-0"></span>
                    <span className="text-white">{feature}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
        
        <DialogFooter className="mt-6">
          <Button 
            onClick={onClose}
            className="bg-white/5 hover:bg-white/10 text-white border border-white/10"
          >
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default SubscriptionDetailsModal;