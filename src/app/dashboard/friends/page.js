'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { friendService } from '@/services';
import { 
  Users,
  UserPlus,
  Search,
  Check,
  X,
  Mail,
  Clock,
  UserCheck,
  Shield,
  ShieldOff
} from 'lucide-react';

export default function FriendsPage() {
  const [friends, setFriends] = useState([]);
  const [pendingRequests, setPendingRequests] = useState([]);
  const [sentRequests, setSentRequests] = useState([]);
  const [blockedUsers, setBlockedUsers] = useState([]);
  const [searchResults, setSearchResults] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);
  const [searchLoading, setSearchLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [removeDialogOpen, setRemoveDialogOpen] = useState(false);
  const [friendToRemove, setFriendToRemove] = useState(null);
  const [declineDialogOpen, setDeclineDialogOpen] = useState(false);
  const [requestToDecline, setRequestToDecline] = useState(null);
  const [blockDialogOpen, setBlockDialogOpen] = useState(false);
  const [friendToBlock, setFriendToBlock] = useState(null);
  const [unblockDialogOpen, setUnblockDialogOpen] = useState(false);
  const [userToUnblock, setUserToUnblock] = useState(null);

  useEffect(() => {
    fetchFriendsData();
  }, []);

  const fetchFriendsData = async () => {
    setLoading(true);
    try {
      const [friendsResult, pendingResult, sentResult, blockedResult] = await Promise.all([
        friendService.getFriends({ status: 'accepted' }),
        friendService.getPendingRequests(),
        friendService.getSentRequests(),
        friendService.getFriends({ status: 'blocked' })
      ]);

      if (friendsResult.success) {
        setFriends(friendsResult.friends || []);
      }
      if (pendingResult.success) {
        setPendingRequests(pendingResult.requests || []);
      }
      if (sentResult.success) {
        setSentRequests(sentResult.requests || []);
      }
      if (blockedResult.success) {
        setBlockedUsers(blockedResult.friends || []);
      }
    } catch (error) {
      setError('Failed to load friends data');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async () => {
    if (!searchTerm.trim() || searchTerm.trim().length < 1) return;
    
    setSearchLoading(true);
    try {
      const result = await friendService.searchUsers(searchTerm);
      if (result.success) {
        setSearchResults(result.users || []);
      } else {
        setError(result.error);
      }
    } catch (error) {
      setError('Search failed');
    } finally {
      setSearchLoading(false);
    }
  };

  const handleSendRequest = async (userId) => {
    try {
      const result = await friendService.sendFriendRequest(userId);
      if (result.success) {
        setMessage('Friend request sent successfully!');
        fetchFriendsData(); // Refresh data
        handleSearch(); // Refresh search results
      } else {
        setError(result.error);
      }
    } catch (error) {
      setError('Failed to send friend request');
    }
  };

  const getStatusButton = (user) => {
    const status = user.relationship_status;
    
    switch (status) {
      case 'friends':
        return (
          <Button size="sm" disabled className="glassmorphism-button">
            <UserCheck className="h-4 w-4 mr-1" />
            Friends
          </Button>
        );
      case 'request_sent':
        return (
          <Button size="sm" disabled className="glassmorphism-button">
            <Clock className="h-4 w-4 mr-1" />
            Request Sent
          </Button>
        );
      case 'request_received':
        return (
          <Button size="sm" disabled className="glassmorphism-button">
            <Mail className="h-4 w-4 mr-1" />
            Request Received
          </Button>
        );
      case 'blocked':
        return (
          <Button size="sm" disabled className="glassmorphism-button opacity-50">
            <X className="h-4 w-4 mr-1" />
            Blocked
          </Button>
        );
      case 'declined':
        return (
          <Button size="sm" disabled className="glassmorphism-button opacity-50">
            <X className="h-4 w-4 mr-1" />
            Declined
          </Button>
        );
      default:
        return (
          <Button
            size="sm"
            onClick={() => handleSendRequest(user.id)}
            className="glassmorphism-button"
          >
            <UserPlus className="h-4 w-4 mr-1" />
            Add Friend
          </Button>
        );
    }
  };

  const handleAcceptRequest = async (friendId) => {
    try {
      const result = await friendService.acceptFriendRequest(friendId);
      if (result.success) {
        setMessage('Friend request accepted!');
        fetchFriendsData();
      } else {
        setError(result.error || 'Failed to accept friend request');
      }
    } catch (error) {
      setError('Failed to accept friend request');
    }
  };

  const handleDeclineRequest = async (friendId) => {
    try {
      const result = await friendService.declineFriendRequest(friendId);
      if (result.success) {
        setMessage('Friend request declined');
        fetchFriendsData();
      } else {
        setError(result.error || 'Failed to decline friend request');
      }
    } catch (error) {
      setError('Failed to decline friend request');
    }
  };

  const handleRemoveFriend = async () => {
    if (!friendToRemove) return;
    
    try {
      const result = await friendService.removeFriend(friendToRemove.user_id);
      if (result.success) {
        setMessage('Friend removed successfully');
        fetchFriendsData();
      } else {
        setError(result.error || 'Failed to remove friend');
      }
    } catch (error) {
      setError('Failed to remove friend');
    } finally {
      setRemoveDialogOpen(false);
      setFriendToRemove(null);
    }
  };

  const openRemoveDialog = (friend) => {
    setFriendToRemove(friend);
    setRemoveDialogOpen(true);
  };

  const openDeclineDialog = (request) => {
    setRequestToDecline(request);
    setDeclineDialogOpen(true);
  };

  const openBlockDialog = (friend) => {
    setFriendToBlock(friend);
    setBlockDialogOpen(true);
  };

  const handleBlockUser = async () => {
    if (!friendToBlock) return;
    
    try {
      const result = await friendService.blockUser(friendToBlock.user_id);
      if (result.success) {
        setMessage('User blocked successfully');
        fetchFriendsData();
      } else {
        setError(result.error || 'Failed to block user');
      }
    } catch (error) {
      setError('Failed to block user');
    } finally {
      setBlockDialogOpen(false);
      setFriendToBlock(null);
    }
  };

  const openUnblockDialog = (user) => {
    setUserToUnblock(user);
    setUnblockDialogOpen(true);
  };

  const handleUnblockUser = async () => {
    if (!userToUnblock) return;
    
    try {
      const result = await friendService.unblockUser(userToUnblock.user_id);
      if (result.success) {
        setMessage('User unblocked successfully');
        fetchFriendsData();
      } else {
        setError(result.error || 'Failed to unblock user');
      }
    } catch (error) {
      setError('Failed to unblock user');
    } finally {
      setUnblockDialogOpen(false);
      setUserToUnblock(null);
    }
  };

  const handleDeclineConfirm = async () => {
    if (!requestToDecline) return;
    
    try {
      const result = await friendService.declineFriendRequest(requestToDecline.user_id);
      if (result.success) {
        setMessage('Friend request declined');
        fetchFriendsData();
      } else {
        setError(result.error || 'Failed to decline friend request');
      }
    } catch (error) {
      setError('Failed to decline friend request');
    } finally {
      setDeclineDialogOpen(false);
      setRequestToDecline(null);
    }
  };

  const getUserInitials = (user) => {
    if (!user) return 'U';
    if (user.full_name) {
      const nameParts = user.full_name.split(' ');
      if (nameParts.length >= 2) {
        return (nameParts[0].charAt(0) + nameParts[1].charAt(0)).toUpperCase();
      } else {
        return nameParts[0].charAt(0).toUpperCase();
      }
    }
    return user.username?.charAt(0).toUpperCase() || 'U';
  };

  const clearMessages = () => {
    setMessage('');
    setError('');
  };

  const clearSearch = () => {
    setSearchTerm('');
    setSearchResults([]);
  };

  // Local tab state so we can render a mobile-friendly control
  const [activeTab, setActiveTab] = useState('friends');

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
          Friends & Collaboration
        </h1>
        <p className="text-gray-600 dark:text-gray-300 mt-1 text-sm sm:text-base">
          Connect with friends and collaborate on deadlines
        </p>
      </div>

      {/* Messages */}
      {message && (
        <Alert key="success-alert" className="glassmorphism border-green-500/50">
          <AlertDescription className="text-green-600 dark:text-green-400">
            {message}
          </AlertDescription>
        </Alert>
      )}

      {error && (
        <Alert key="error-alert" variant="destructive" className="glassmorphism border-red-500/50">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="space-y-4">
        {/* Mobile: Select fallback */}
        <div className="sm:hidden">
          <Select value={activeTab} onValueChange={(v) => { setActiveTab(v); clearMessages(); }}>
            <SelectTrigger className="w-full glassmorphism-card">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="friends">Friends ({friends.length})</SelectItem>
              <SelectItem value="pending">Pending ({pendingRequests.length})</SelectItem>
              <SelectItem value="blocked">Blocked ({blockedUsers.length})</SelectItem>
              <SelectItem value="search">Add Friends</SelectItem>
            </SelectContent>
          </Select>
        </div>

  <Tabs value={activeTab} className="space-y-6" onValueChange={(v) => { setActiveTab(v); clearMessages(); }}>
          <TabsList className="glassmorphism-card border-1 hidden sm:flex sm:w-[50%] ">
            <TabsTrigger value="friends"  className="cursor-pointer ">
              <Users className="mr-2 h-4 w-4" />
              Friends ({friends.length})
            </TabsTrigger>
            <TabsTrigger value="pending" className="cursor-pointer ">
              <Clock className="mr-2 h-4 w-4" />
              Pending ({pendingRequests.length})
            </TabsTrigger>
            <TabsTrigger value="blocked" className="cursor-pointer ">
              <Shield className="mr-2 h-4 w-4" />
              Blocked ({blockedUsers.length})
            </TabsTrigger>
            <TabsTrigger value="search" className="cursor-pointer ">
              <UserPlus className="mr-2 h-4 w-4" />
              Add Friends
            </TabsTrigger>
          </TabsList>

          {/* Small-screen icon-only tab strip */}
          <div className="sm:hidden flex items-center justify-between gap-2 overflow-x-auto">
            <button onClick={() => { setActiveTab('friends'); clearMessages(); }} className={`flex-1 text-center py-2 ${activeTab === 'friends' ? 'bg-blue-50 dark:bg-blue-900/30 rounded' : ''}`} aria-label="Friends">
              <Users className="mx-auto h-5 w-5" />
              <div className="text-xs mt-1">{friends.length}</div>
            </button>
            <button onClick={() => { setActiveTab('pending'); clearMessages(); }} className={`flex-1 text-center py-2 ${activeTab === 'pending' ? 'bg-blue-50 dark:bg-blue-900/30 rounded' : ''}`} aria-label="Pending">
              <Clock className="mx-auto h-5 w-5" />
              <div className="text-xs mt-1">{pendingRequests.length}</div>
            </button>
            <button onClick={() => { setActiveTab('blocked'); clearMessages(); }} className={`flex-1 text-center py-2 ${activeTab === 'blocked' ? 'bg-blue-50 dark:bg-blue-900/30 rounded' : ''}`} aria-label="Blocked">
              <Shield className="mx-auto h-5 w-5" />
              <div className="text-xs mt-1">{blockedUsers.length}</div>
            </button>
            <button onClick={() => { setActiveTab('search'); clearMessages(); }} className={`flex-1 text-center py-2 ${activeTab === 'search' ? 'bg-blue-50 dark:bg-blue-900/30 rounded' : ''}`} aria-label="Add Friends">
              <UserPlus className="mx-auto h-5 w-5" />
              <div className="text-xs mt-1">Add</div>
            </button>
          </div>

        {/* Friends List */}
        <TabsContent key="friends-tab" value="friends">
          <Card className="glassmorphism-card border-1">
            <CardHeader>
              <CardTitle>Your Friends</CardTitle>
              <CardDescription>
                People you&apos;re connected with
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="space-y-4">
                  {[...Array(3)].map((_, i) => (
                    <div key={i} className="animate-pulse">
                      <div className="h-16 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
                    </div>
                  ))}
                </div>
              ) : friends.length > 0 ? (
                <div className="space-y-4">
                  {friends.map((friend, index) => {
                    const uniqueKey = `friend-${friend.id || 'no-id'}-${friend.user_id || 'no-uid'}-${friend.username || 'no-username'}-${index}`;
                    return (
              <div key={uniqueKey} className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 glassmorphism rounded-lg">
                <div className="flex items-start sm:items-center space-x-4">
                        <Avatar className="h-12 w-12">
                          <AvatarImage src={friend.avatar} alt={friend.full_name} />
                          <AvatarFallback className="glassmorphism">
                            {getUserInitials(friend)}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <h4 className="font-medium">{friend.full_name || `${friend.first_name} ${friend.last_name}`}</h4>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            @{friend.username} • {friend.email}
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-500">
                            Friends since {new Date(friend.friendship_created).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <div className="flex flex-wrap items-center gap-2 mt-3 sm:mt-0">
                        <Badge variant="outline" className="glassmorphism">
                          <UserCheck className="h-3 w-3 mr-1" />
                          Friend
                        </Badge>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => openBlockDialog(friend)}
                          className="glassmorphism-button text-orange-600 hover:text-orange-700 w-full sm:w-auto"
                        >
                          <Shield className="h-4 w-4 mr-1" />
                          Block
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => openRemoveDialog(friend)}
                          className="glassmorphism-button text-red-600 hover:text-red-700 w-full sm:w-auto"
                        >
                          Remove
                        </Button>
                      </div>
                    </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No friends yet</h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    Start by searching for people to connect with
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Pending Requests */}
        <TabsContent key="pending-tab" value="pending">
          <Card className="glassmorphism-card border-1">
            <CardHeader>
              <CardTitle>Pending Friend Requests</CardTitle>
              <CardDescription>
                Requests waiting for your response
              </CardDescription>
            </CardHeader>
            <CardContent>
              {pendingRequests.length > 0 ? (
                <div className="space-y-4">
                  {pendingRequests.map((request, index) => {
                    const uniqueKey = `pending-${request.request_id || 'no-rid'}-${request.id || 'no-id'}-${request.user_id || 'no-uid'}-${request.username || 'no-username'}-${index}`;
                    return (
                      <div key={uniqueKey} className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 glassmorphism rounded-lg">
                        <div className="flex items-start sm:items-center space-x-4">
                        <Avatar className="h-12 w-12">
                          <AvatarImage src={request.avatar} alt={request.full_name} />
                          <AvatarFallback className="glassmorphism">
                            {getUserInitials(request)}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <h4 className="font-medium">
                            {request.full_name}
                          </h4>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            @{request.username} • {request.email}
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-500">
                            Sent {new Date(request.requested_at).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <div className="flex flex-wrap items-center gap-2 mt-3 sm:mt-0">
                        <Button
                          size="sm"
                          onClick={() => handleAcceptRequest(request.user_id)}
                          className="glassmorphism-button w-full sm:w-auto"
                        >
                          <Check className="h-4 w-4 mr-1" />
                          Accept
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => openDeclineDialog(request)}
                          className="glassmorphism-button text-red-600 w-full sm:w-auto"
                        >
                          <X className="h-4 w-4 mr-1" />
                          Decline
                        </Button>
                      </div>
                    </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Clock className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No pending requests</h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    You&apos;re all caught up!
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Blocked Users */}
        <TabsContent key="blocked-tab" value="blocked">
          <Card className="glassmorphism-card border-1">
            <CardHeader>
              <CardTitle>Blocked Users</CardTitle>
              <CardDescription>
                Users you have blocked. You can unblock them to restore communication.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="space-y-4">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="flex items-center space-x-4 p-4 glassmorphism rounded-lg animate-pulse">
                      <div className="h-12 w-12 bg-gray-200 dark:bg-gray-700 rounded-full"></div>
                      <div className="flex-1 space-y-2">
                        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/3"></div>
                        <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
                      </div>
                      <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-20"></div>
                    </div>
                  ))}
                </div>
              ) : blockedUsers.length > 0 ? (
                <div className="space-y-4">
                  {blockedUsers.map((user, index) => {
                    const uniqueKey = `blocked-${user.id || 'no-id'}-${user.user_id || 'no-uid'}-${user.username || 'no-username'}-${index}`;
                    return (
                      <div key={uniqueKey} className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 glassmorphism rounded-lg">
                        <div className="flex items-start sm:items-center space-x-4">
                        <Avatar className="h-12 w-12">
                          <AvatarImage src={user.avatar} alt={user.full_name} />
                          <AvatarFallback className="glassmorphism">
                            {getUserInitials(user)}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <h4 className="font-medium">{user.full_name || `${user.first_name} ${user.last_name}`}</h4>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            @{user.username} • {user.email}
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-500">
                            Blocked on {new Date(user.friendship_created).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <div className="flex flex-wrap items-center gap-2 mt-3 sm:mt-0">
                        <Badge variant="outline" className="glassmorphism bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400">
                          <Shield className="h-3 w-3 mr-1" />
                          Blocked
                        </Badge>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => openUnblockDialog(user)}
                          className="glassmorphism-button text-green-600 hover:text-green-700 w-full sm:w-auto"
                        >
                          <ShieldOff className="h-4 w-4 mr-1" />
                          Unblock
                        </Button>
                      </div>
                    </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Shield className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No blocked users</h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    You haven&apos;t blocked anyone yet
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Search Users */}
        <TabsContent key="search-tab" value="search">
          <Card className="glassmorphism-card border-1">
            <CardHeader>
              <CardTitle>Find Friends</CardTitle>
              <CardDescription>
                Search for people to connect with
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:space-x-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400 z-10" />
                    <Input
                      placeholder="Search by username or email..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                      className="glassmorphism-input pl-10 pr-10"
                    />
                    {searchTerm && (
                      <button
                        onClick={clearSearch}
                        className="absolute right-3 top-3 h-4 w-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                        title="Clear search"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                </div>
                <Button
                  onClick={handleSearch}
                  disabled={!searchTerm.trim() || searchLoading}
                  className="glassmorphism-button w-full sm:w-auto mt-3 sm:mt-0"
                >
                  {searchLoading ? 'Searching...' : 'Search'}
                </Button>
              </div>

              {searchResults.length > 0 && (
                <div className="space-y-4">
                  <h4 className="font-medium">Search Results</h4>
                  {searchResults.map((user, index) => {
                    // Create absolutely unique key by combining multiple identifiers
                    const uniqueKey = `search-result-${user.id || 'no-id'}-${user.user_id || 'no-uid'}-${user.username || 'no-username'}-${user.email || 'no-email'}-${index}`;
                    return (
                      <div key={uniqueKey} className="flex items-center justify-between p-4 glassmorphism rounded-lg">
                        <div className="flex items-center space-x-4">
                          <Avatar className="h-12 w-12">
                            <AvatarImage src={user.avatar} alt={user.full_name} />
                            <AvatarFallback className="glassmorphism">
                              {getUserInitials(user)}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <h4 className="font-medium">
                              {user.full_name || `${user.first_name} ${user.last_name}`}
                            </h4>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                              @{user.username} • {user.email}
                            </p>
                          </div>
                        </div>
                        {getStatusButton(user)}
                      </div>
                    );
                  })}
                </div>
              )}

              {searchTerm && searchResults.length === 0 && !searchLoading && (
                <div className="text-center py-8">
                  <div className="text-gray-500 dark:text-gray-400">
                    <Search className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p className="text-lg font-medium mb-2">No users found</p>
                    <p className="text-sm">
                      No users match &quot;{searchTerm}&quot;. Try searching with a different username, name, or email.
                    </p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Unblock User Confirmation Dialog */}
      <AlertDialog open={unblockDialogOpen} onOpenChange={setUnblockDialogOpen}>
    <AlertDialogContent className="glassmorphism-modal border-0 w-full max-w-[calc(100%-2rem)] sm:max-w-md p-4 sm:p-6 text-sm sm:text-base">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-green-600">
              Unblock User
            </AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to unblock {userToUnblock?.full_name || userToUnblock?.username}? 
              This will allow them to send you friend requests and messages again.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="glassmorphism-button">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleUnblockUser}
              className="glassmorphism-button bg-green-600 hover:bg-green-700 text-white"
            >
              Unblock User
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Block User Confirmation Dialog */}
      <AlertDialog open={blockDialogOpen} onOpenChange={setBlockDialogOpen}>
    <AlertDialogContent className="glassmorphism-modal border-0 w-full max-w-[calc(100%-2rem)] sm:max-w-md p-4 sm:p-6 text-sm sm:text-base">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-orange-600">
              Block User
            </AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to block {friendToBlock?.full_name || friendToBlock?.username}? 
              This will remove them from your friends list and prevent them from sending you messages or friend requests.
              You can unblock them later if needed.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="glassmorphism-button">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleBlockUser}
              className="glassmorphism-button bg-orange-600 hover:bg-orange-700 text-white"
            >
              Block User
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Remove Friend Confirmation Dialog */}
      <AlertDialog open={removeDialogOpen} onOpenChange={setRemoveDialogOpen}>
    <AlertDialogContent className="glassmorphism-modal border-0 w-full max-w-[calc(100%-2rem)] sm:max-w-md p-4 sm:p-6 text-sm sm:text-base">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-red-600">
              Remove Friend
            </AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to remove {friendToRemove?.full_name || friendToRemove?.username} from your friends list? 
              This action cannot be undone and you&apos;ll need to send a new friend request to reconnect.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="glassmorphism-button">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleRemoveFriend}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              Remove Friend
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Decline Request Confirmation Dialog */}
      <AlertDialog open={declineDialogOpen} onOpenChange={setDeclineDialogOpen}>
    <AlertDialogContent className="glassmorphism-modal border-0 w-full max-w-[calc(100%-2rem)] sm:max-w-md p-4 sm:p-6 text-sm sm:text-base">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-red-600">
              Decline Friend Request
            </AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to decline the friend request from {requestToDecline?.full_name || requestToDecline?.username}? 
              They will not be notified, but they can send another request in the future.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="glassmorphism-button">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeclineConfirm}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              Decline Request
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  </div>
  );
}