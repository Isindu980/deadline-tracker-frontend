'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { Loader2, Users, UserPlus, Copy, Settings } from 'lucide-react';
import { friendService, deadlineService } from '@/services';

export default function CollaboratorModal({ 
  isOpen, 
  onClose, 
  deadline,
  onSuccess,
  onError 
}) {
  const [friends, setFriends] = useState([]);
  const [selectedCollaborators, setSelectedCollaborators] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingFriends, setLoadingFriends] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [copyOptions, setCopyOptions] = useState({
    create_copies: true,
    title_suffix: ' (My Copy)',
    create_individual_copies: true,
    notify_collaborators: true
  });

  useEffect(() => {
    if (isOpen) {
      fetchFriends();
    }
  }, [isOpen]);

  const fetchFriends = async () => {
    try {
      setLoadingFriends(true);
      console.log('Fetching friends for collaborator modal...');
      const result = await friendService.getFriends();
      console.log('Friends API result:', result);
      
      if (result.success) {
        console.log('Raw friends data:', result.friends);
        
        // Filter out friends who are already collaborators
        const existingCollaboratorIds = deadline?.collaborators?.map(c => c.user_id) || [];
        console.log('Existing collaborator IDs:', existingCollaboratorIds);
        
        const availableFriends = (result.friends || []).filter(
          friend => !existingCollaboratorIds.includes(friend.user_id)
        );
        console.log('Available friends after filtering:', availableFriends);
        setFriends(availableFriends);
      } else {
        console.error('Failed to fetch friends:', result.error);
      }
    } catch (error) {
      console.error('Error fetching friends:', error);
    } finally {
      setLoadingFriends(false);
    }
  };

  const filteredFriends = friends.filter(friend => 
    (friend.username?.toLowerCase().includes(searchTerm.toLowerCase()) ||
     friend.full_name?.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  // Debug: Log filtered friends
  console.log('Filtered friends for display:', filteredFriends);

  const handleCollaboratorToggle = (userId) => {
    setSelectedCollaborators(prev => 
      prev.includes(userId) 
        ? prev.filter(id => id !== userId)
        : [...prev, userId]
    );
  };

  const handleAddCollaborators = async () => {
    if (selectedCollaborators.length === 0) {
      return;
    }

    try {
      setLoading(true);
      
      const result = await deadlineService.addCollaboratorsToDeadline(
        deadline.id,
        selectedCollaborators,
        {
          create_copies: copyOptions.create_copies,
          copy_options: {
            title_suffix: copyOptions.title_suffix,
            create_individual_copies: copyOptions.create_individual_copies,
            notify_collaborators: copyOptions.notify_collaborators
          }
        }
      );

      if (result.success) {
        onSuccess?.(result);
        onClose();
        setSelectedCollaborators([]);
      } else {
        console.error('Error adding collaborators:', result.error);
        onError?.(result.error || 'Failed to add collaborators');
      }
    } catch (error) {
      console.error('Error adding collaborators:', error);
      onError?.(error.message || 'Failed to add collaborators');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setSelectedCollaborators([]);
    setSearchTerm('');
    onError?.(null); // Clear any existing errors
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
    <DialogContent className="w-full max-w-[calc(100%-2rem)] sm:max-w-md md:max-w-xl p-4 sm:p-6 text-sm sm:text-base">
        <DialogHeader>
          <DialogTitle className="flex items-center">
            <UserPlus className="mr-2 h-5 w-5" />
            Add Collaborators
          </DialogTitle>
          <DialogDescription>
            Add friends as collaborators to "{deadline?.title}". 
            {copyOptions.create_copies && " Each collaborator will receive their own copy to track independently."}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Copy Options */}
          <div className="space-y-3">
            <div className="flex items-center space-x-2">
              <Settings className="h-4 w-4 text-gray-500" />
              <Label className="text-sm font-medium">Collaboration Options</Label>
            </div>
            
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label className="text-sm">Create Individual Copies</Label>
                <p className="text-xs text-gray-500">
                  Each collaborator gets their own copy to track independently
                </p>
              </div>
              <Switch
                checked={copyOptions.create_copies}
                onCheckedChange={(checked) => 
                  setCopyOptions(prev => ({ ...prev, create_copies: checked }))
                }
              />
            </div>

            {copyOptions.create_copies && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="title-suffix" className="text-sm">
                    Copy Title Suffix
                  </Label>
                  <Input
                    id="title-suffix"
                    value={copyOptions.title_suffix}
                    onChange={(e) => 
                      setCopyOptions(prev => ({ ...prev, title_suffix: e.target.value }))
                    }
                    placeholder="e.g., (My Copy)"
                    className="text-sm"
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="text-sm">Notify Collaborators</Label>
                    <p className="text-xs text-gray-500">
                      Send notifications about the new deadline copy
                    </p>
                  </div>
                  <Switch
                    checked={copyOptions.notify_collaborators}
                    onCheckedChange={(checked) => 
                      setCopyOptions(prev => ({ ...prev, notify_collaborators: checked }))
                    }
                  />
                </div>
              </>
            )}
            
            <Separator />
          </div>

          {/* Friend Search */}
          <div className="space-y-3">
            <Label className="text-sm font-medium">Select Friends to Add</Label>
            <Input
              placeholder="Search friends..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="text-sm"
            />
          </div>

          {/* Friends List */}
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {loadingFriends ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin" />
                <span className="ml-2 text-sm text-gray-500">Loading friends...</span>
              </div>
            ) : filteredFriends.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <Users className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">
                  {friends.length === 0 
                    ? "No friends available to add as collaborators"
                    : "No friends match your search"
                  }
                </p>
              </div>
            ) : (
              filteredFriends.map((friend) => (
                <div 
                  key={friend.user_id} 
                  className="flex items-center space-x-3 p-3 rounded-lg glassmorphism hover:bg-opacity-80 transition-colors"
                >
                  <Checkbox
                    id={`friend-${friend.user_id}`}
                    checked={selectedCollaborators.includes(friend.user_id)}
                    onCheckedChange={() => handleCollaboratorToggle(friend.user_id)}
                  />
                  <div className="flex-1">
                    <p className="text-sm font-medium">
                      {friend.full_name || friend.username}
                    </p>
                    {friend.full_name && (
                      <p className="text-xs text-gray-500">@{friend.username}</p>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Selected Count */}
          {selectedCollaborators.length > 0 && (
            <div className="flex items-center justify-between p-3 bg-blue-50 dark:bg-black rounded-lg">
              <span className="text-sm text-blue-700 dark:text-blue-300">
                {selectedCollaborators.length} collaborator{selectedCollaborators.length !== 1 ? 's' : ''} selected
              </span>
              {copyOptions.create_copies && (
                <Badge variant="secondary" className="text-xs">
                  <Copy className="h-3 w-3 mr-1" />
                  Individual Copies
                </Badge>
              )}
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose} disabled={loading}>
            Cancel
          </Button>
          <Button 
            onClick={handleAddCollaborators} 
            disabled={selectedCollaborators.length === 0 || loading}
            className="glassmorphism-button"
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Adding...
              </>
            ) : (
              <>
                <UserPlus className="mr-2 h-4 w-4" />
                Add {selectedCollaborators.length} Collaborator{selectedCollaborators.length !== 1 ? 's' : ''}
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}