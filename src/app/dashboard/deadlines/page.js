'use client';

import { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
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
} from "@/components/ui/alert-dialog";
import { Textarea } from '@/components/ui/textarea';
import { 
  Calendar,
  Plus,
  Search,
  Filter,
  Clock,
  CheckCircle,
  AlertTriangle,
  Users,
  Eye,
  Edit,
  Trash2,
  X,
  UserPlus
} from 'lucide-react';
import { deadlineService } from '@/services';
import CollaboratorModal from '@/components/collaborator-modal';
import DeadlineModal from '@/components/deadline-modal';

export default function DeadlinesPage() {
  const [deadlines, setDeadlines] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const PER_PAGE = 8;
  
  // Modal states
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [collaboratorModalOpen, setCollaboratorModalOpen] = useState(false);
  const [deadlineModalOpen, setDeadlineModalOpen] = useState(false);
  const [selectedDeadline, setSelectedDeadline] = useState(null);
  const [modalLoading, setModalLoading] = useState(false);
  const [viewModalError, setViewModalError] = useState('');
  const [fetchError, setFetchError] = useState('');
  const [collaboratorError, setCollaboratorError] = useState('');

  const fetchDeadlines = useCallback(async () => {
    try {
      setLoading(true);
      setFetchError(''); // Clear previous errors
      
      // Use the new deadline service
      const result = await deadlineService.getDeadlines({
        search: searchTerm,
        status: statusFilter !== 'all' ? statusFilter : undefined,
        priority: priorityFilter !== 'all' ? priorityFilter : undefined,
        limit: 100
      });

      if (result.success) {
        // Sort deadlines by most recent first. Prefer created_at, fallback to due_date.
        const sortByRecent = (a, b) => {
          const aDate = new Date(a.created_at || a.due_date || 0).getTime();
          const bDate = new Date(b.created_at || b.due_date || 0).getTime();
          return bDate - aDate;
        };

        const sorted = (result.deadlines || []).slice().sort(sortByRecent);
        setDeadlines(sorted);
        console.log('Fetched deadlines (sorted recent-first):', sorted);
      } else {
        // console.error('Error fetching deadlines:', result.error);
        setFetchError(result.error || 'Failed to load deadlines');
      }
    } catch (error) {
      // console.error('Error fetching deadlines:', error);
      setFetchError('Network error: Unable to connect to server. Please check your connection.');
    } finally {
      setLoading(false);
    }
  }, [searchTerm, statusFilter, priorityFilter]);

  useEffect(() => {
    fetchDeadlines();
  }, [fetchDeadlines]);



  // Modal handlers
  const handleViewDeadline = (deadline) => {
    try {
      // Clear any previous errors
      setViewModalError('');
      
      // Validate deadline data
      if (!deadline) {
        setViewModalError('Deadline data is not available');
        return;
      }
      
      if (!deadline.id) {
        setViewModalError('Invalid deadline: Missing deadline ID');
        return;
      }
      
      if (!deadline.title) {
        setViewModalError('Invalid deadline: Missing title');
        return;
      }
      
      console.log('Viewing deadline:', deadline);
      console.log('Deadline collaborators:', deadline.collaborators);
      
      setSelectedDeadline(deadline);
      setViewModalOpen(true);
    } catch (error) {
      // console.error('Error opening view modal:', error);
      setViewModalError('Failed to open deadline details. Please try again.');
    }
  };

  const handleEditDeadline = (deadline) => {
    setSelectedDeadline(deadline);
    setDeadlineModalOpen(true);
  };

  const handleDeadlineModalSuccess = () => {
    // Refresh the deadlines list
    fetchDeadlines();
    setDeadlineModalOpen(false);
  };

  const handleDeleteDeadline = (deadline) => {
    setSelectedDeadline(deadline);
    setDeleteModalOpen(true);
  };

  const handleAddCollaborators = (deadline) => {
    setSelectedDeadline(deadline);
    setCollaboratorError(''); // Clear any previous errors
    setCollaboratorModalOpen(true);
  };

  const handleCollaboratorSuccess = (result) => {
    // Check if this is actually a success or error result
    if (result && result.success === false) {
      // console.error('Error adding collaborators:', result);
      
      // Parse specific error messages from skipped collaborators
      let errorMessage = result.message || 'Failed to add collaborators';
      
      if (result.data && result.data.skipped_collaborators && result.data.skipped_collaborators.length > 0) {
        const reasons = result.data.skipped_collaborators.map(skipped => skipped.reason).filter(Boolean);
        if (reasons.length > 0) {
          errorMessage = reasons.join('. ');
        }
      }
      
      setCollaboratorError(errorMessage);
      return;
    }
    
    // Handle partial success (some collaborators added, some skipped)
    if (result && result.success === true && result.data && result.data.skipped_collaborators && result.data.skipped_collaborators.length > 0) {
      const reasons = result.data.skipped_collaborators.map(skipped => skipped.reason).filter(Boolean);
      if (reasons.length > 0) {
        setCollaboratorError(`Some collaborators could not be added: ${reasons.join('. ')}`);
      }
    }
    
    // Refresh the deadlines list to show updated data
    fetchDeadlines();
    
    // If complete success, clear any errors
    if (result && result.success === true && (!result.data.skipped_collaborators || result.data.skipped_collaborators.length === 0)) {
      setCollaboratorError('');
    }
    
    // Show success message
    console.log('Collaborators operation completed:', result);
  };

  const handleCollaboratorError = (error) => {
    // console.error('Error adding collaborators:', error);
    let errorMessage = error;
    if (typeof error === 'string' && error.includes('No collaborators were successfully added')) {
      errorMessage = 'No collaborators could be added. This may happen if you tried to add the deadline owner or users who are already collaborators.';
    }
    setCollaboratorError(errorMessage || 'Failed to add collaborators. Please try again.');
  };



  const confirmDelete = async () => {
    setModalLoading(true);
    
    try {
      const result = await deadlineService.deleteDeadline(selectedDeadline.id);
      
      if (result.success) {
        setDeleteModalOpen(false);
        fetchDeadlines(); // Refresh the list
      } else {
        // console.error('Error deleting deadline:', result.error);
      }
    } catch (error) {
      // console.error('Error deleting deadline:', error);
    } finally {
      setModalLoading(false);
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'urgent': return 'bg-red-500';
      case 'high': return 'bg-orange-500';
      case 'medium': return 'bg-yellow-500';
      case 'low': return 'bg-green-500';
      default: return 'bg-gray-500';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'completed': return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'overdue': return <AlertTriangle className="h-4 w-4 text-red-600" />;
      default: return <Clock className="h-4 w-4 text-yellow-600" />;
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Filter (preserves the order of `deadlines` which are already sorted recent-first)
  const filteredDeadlines = deadlines.filter((deadline) => {
    const matchesSearch = (deadline.title || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (deadline.description || '').toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || deadline.status === statusFilter;
    const matchesPriority = priorityFilter === 'all' || deadline.priority === priorityFilter;
    return matchesSearch && matchesStatus && matchesPriority;
  });

  // Pagination calculations
  const totalDeadlines = filteredDeadlines.length;
  const totalPages = Math.max(1, Math.ceil(totalDeadlines / PER_PAGE));
  // Ensure currentPage stays within bounds when totalPages changes
  useEffect(() => {
    setCurrentPage((p) => Math.min(p, totalPages));
  }, [totalPages]);

  const startIndex = (currentPage - 1) * PER_PAGE;
  const endIndex = startIndex + PER_PAGE;
  const paginatedDeadlines = filteredDeadlines.slice(startIndex, endIndex);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Deadlines
          </h1>
          <p className="text-gray-600 dark:text-gray-300 mt-1">
            Manage and track all your deadlines
          </p>
        </div>
        
        <Button 
          onClick={() => {
            setSelectedDeadline(null);
            setDeadlineModalOpen(true);
          }}
          className="glassmorphism-button mt-4 sm:mt-0"
        >
          <Plus className="mr-2 h-4 w-4" />
          Add Deadline
        </Button>
      </div>

      {/* Filters */}
      <Card className="glassmorphism-card border-1">
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400 z-10" />
                <Input
                  placeholder="Search deadlines..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="glassmorphism-input pl-10"
                />
              </div>
            </div>
            
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-[180px] glassmorphism-input">
                <SelectValue placeholder="All Status" />
              </SelectTrigger>
              <SelectContent className="glassmorphism-modal border-1">
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="in_progress">In Progress</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="overdue">Overdue</SelectItem>
              </SelectContent>
            </Select>
            
            <Select value={priorityFilter} onValueChange={setPriorityFilter}>
              <SelectTrigger className="w-full sm:w-[180px] glassmorphism-input">
                <SelectValue placeholder="All Priority" />
              </SelectTrigger>
              <SelectContent className="glassmorphism-modal border-1">
                <SelectItem value="all">All Priority</SelectItem>
                <SelectItem value="low">Low</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="high">High</SelectItem>
                <SelectItem value="urgent">Urgent</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Error Display */}
      {fetchError && (
        <Alert variant="destructive" className="glassmorphism border-red-500/50 bg-red-50 dark:bg-red-900/20">
          <AlertTriangle className="h-4 w-4 text-red-600" />
          <AlertDescription className="text-red-700 dark:text-red-400">
            <div className="flex justify-between items-start">
              <div>
                <div className="font-medium mb-1">Failed to Load Deadlines</div>
                {fetchError}
              </div>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={fetchDeadlines}
                className="ml-4"
              >
                Retry
              </Button>
            </div>
          </AlertDescription>
        </Alert>
      )}

      {/* Deadlines List */}
      {loading ? (
        <div className="grid gap-6">
          {[...Array(3)].map((_, i) => (
            <Card key={i} className="glassmorphism-card border-1">
              <CardContent className="p-6">
                <div className="animate-pulse">
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-2"></div>
                  <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2 mb-4"></div>
                  <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/4"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : fetchError ? (
        // Show empty state when there's an error but don't repeat the error message
        <Card className="glassmorphism-card border-1">
          <CardContent className="p-12 text-center">
            <AlertTriangle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Unable to Load Deadlines</h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Please check your connection and try again.
            </p>
            <Button onClick={fetchDeadlines} className="glassmorphism-button">
              Try Again
            </Button>
          </CardContent>
        </Card>
      ) : filteredDeadlines.length > 0 ? (
        <>
        <div className="grid gap-6">
          {paginatedDeadlines.map((deadline) => (
            <Card key={deadline.id} className="glassmorphism-card border-1 hover:scale-[1.02] transition-transform duration-200">
              <CardContent className="p-6">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="text-lg font-semibold">{deadline.title}</h3>
                      <div className="flex items-center space-x-2 ml-4">
                        {getStatusIcon(deadline.status)}
                        <Badge className={`${getPriorityColor(deadline.priority)} text-white`}>
                          {deadline.priority}
                        </Badge>
                      </div>
                    </div>
                    
                    {deadline.description && (
                      <p className="text-gray-600 dark:text-gray-400 mb-3">
                        {deadline.description}
                      </p>
                    )}
                    
                    <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
                      <div className="flex items-center">
                        <Calendar className="h-4 w-4 mr-1" />
                        Due: {formatDate(deadline.due_date)}
                      </div>
                      
                      {deadline.subject && (
                        <div className="flex items-center">
                          <span className="w-2 h-2 bg-blue-500 rounded-full mr-2"></span>
                          {deadline.subject}
                        </div>
                      )}
                      
                      {(() => {
                        console.log(`Deadline ${deadline.id} collaborators:`, deadline.collaborators);
                        return deadline.collaborators && deadline.collaborators.length > 0 && (
                          <div className="flex items-center">
                            <Users className="h-4 w-4 mr-1" />
                            <span className="mr-1">
                              Collaborators ({deadline.collaborators.length}):
                            </span>
                            <div className="flex items-center space-x-1">
                              {deadline.collaborators
                                .slice(0, 3) // Show max 3 collaborators
                                .map((collaborator, index) => (
                                  <span
                                    key={collaborator.id || index}
                                    className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-blue-500 text-xs font-medium text-white"
                                    title={collaborator.full_name || collaborator.username}
                                  >
                                    {(collaborator.full_name || collaborator.username || 'U').charAt(0).toUpperCase()}
                                  </span>
                                ))
                              }
                              {deadline.collaborators.length > 3 && (
                                <span className="text-xs">
                                  +{deadline.collaborators.length - 3} more
                                </span>
                              )}
                            </div>
                          </div>
                        );
                      })()}
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2 mt-4 sm:mt-0">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="glassmorphism-button"
                      onClick={() => handleViewDeadline(deadline)}
                    >
                      <Eye className="h-4 w-4 mr-1" />
                      View
                    </Button>
                    <Button 
                      size="sm" 
                      className="glassmorphism-button"
                      onClick={() => handleEditDeadline(deadline)}
                    >
                      <Edit className="h-4 w-4 mr-1" />
                      Edit
                    </Button>
                    <Button 
                      variant="destructive" 
                      size="sm"
                      onClick={() => handleDeleteDeadline(deadline)}
                    >
                      <Trash2 className="h-4 w-4 mr-1" />
                      Delete
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Pagination Controls */}
        <div className="flex items-center justify-between mt-6">
          <div className="text-sm text-gray-600 dark:text-gray-400">
            Showing {startIndex + 1} - {Math.min(endIndex, totalDeadlines)} of {totalDeadlines}
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
            >
              Prev
            </Button>

            {/* Simple page numbers */}
            <div className="hidden sm:flex items-center space-x-1">
              {Array.from({ length: totalPages }, (_, i) => i + 1).slice(0, 10).map((page) => (
                <Button
                  key={page}
                  size="sm"
                  variant={page === currentPage ? 'default' : 'outline'}
                  onClick={() => setCurrentPage(page)}
                >
                  {page}
                </Button>
              ))}
              {totalPages > 10 && <span className="px-2">...</span>}
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
            >
              Next
            </Button>
          </div>
        </div>
        </>
      ) : (
        <Card className="glassmorphism-card border-0">
          <CardContent className="p-12 text-center">
            <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No deadlines found</h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              {searchTerm || statusFilter !== 'all' || priorityFilter !== 'all'
                ? 'Try adjusting your filters to see more results.'
                : 'Get started by creating your first deadline.'}
            </p>
            <Button 
              onClick={() => {
                setSelectedDeadline(null);
                setDeadlineModalOpen(true);
              }}
              className="glassmorphism-button"
            >
              <Plus className="mr-2 h-4 w-4" />
              Add Your First Deadline
            </Button>
          </CardContent>
        </Card>
      )}

      {/* View Deadline Modal */}
      <Dialog open={viewModalOpen} onOpenChange={setViewModalOpen}>
    <DialogContent className="glassmorphism-modal w-full max-w-[calc(100%-2rem)] sm:max-w-2xl p-4 sm:p-6 text-sm sm:text-base">
          <DialogHeader>
            <DialogTitle className="flex items-center">
              <Eye className="h-5 w-5 mr-2" />
              View Deadline
            </DialogTitle>
          </DialogHeader>
          
          {/* Error Display */}
          {viewModalError && (
            <Alert variant="destructive" className="glassmorphism border-red-500/50 bg-red-50 dark:bg-red-900/20">
              <AlertTriangle className="h-4 w-4 text-red-600" />
              <AlertDescription className="text-red-700 dark:text-red-400">
                <div className="font-medium mb-1">Error</div>
                {viewModalError}
              </AlertDescription>
            </Alert>
          )}
          
          {selectedDeadline && !viewModalError ? (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-500">Title</label>
                  <p className="text-lg font-semibold">{selectedDeadline.title}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Priority</label>
                  <Badge className={`${getPriorityColor(selectedDeadline.priority)} text-white`}>
                    {selectedDeadline.priority}
                  </Badge>
                </div>
              </div>
              
              {selectedDeadline.description && (
                <div>
                  <label className="text-sm font-medium text-gray-500">Description</label>
                  <p className="text-gray-700 dark:text-gray-300">{selectedDeadline.description}</p>
                </div>
              )}
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-500">Due Date</label>
                  <p>{formatDate(selectedDeadline.due_date)}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Status</label>
                  <div className="flex items-center">
                    {getStatusIcon(selectedDeadline.status)}
                    <span className="ml-2 capitalize">{selectedDeadline.status.replace('_', ' ')}</span>
                  </div>
                </div>
              </div>
              
              {(selectedDeadline.subject || selectedDeadline.category) && (
                <div className="grid grid-cols-2 gap-4">
                  {selectedDeadline.subject && (
                    <div>
                      <label className="text-sm font-medium text-gray-500">Subject</label>
                      <p>{selectedDeadline.subject}</p>
                    </div>
                  )}
                  {selectedDeadline.category && (
                    <div>
                      <label className="text-sm font-medium text-gray-500">Category</label>
                      <p>{selectedDeadline.category}</p>
                    </div>
                  )}
                </div>
              )}
              
              {(selectedDeadline.estimated_hours || selectedDeadline.actual_hours) && (
                <div className="grid grid-cols-2 gap-4">
                  {selectedDeadline.estimated_hours && (
                    <div>
                      <label className="text-sm font-medium text-gray-500">Estimated Hours</label>
                      <p>{selectedDeadline.estimated_hours} hours</p>
                    </div>
                  )}
                  {selectedDeadline.actual_hours && (
                    <div>
                      <label className="text-sm font-medium text-gray-500">Actual Hours</label>
                      <p>{selectedDeadline.actual_hours} hours</p>
                    </div>
                  )}
                </div>
              )}
              
              {selectedDeadline.notes && (
                <div>
                  <label className="text-sm font-medium text-gray-500">Notes</label>
                  <p className="text-gray-700 dark:text-gray-300 bg-gray-50 dark:bg-gray-800 p-3 rounded">{selectedDeadline.notes}</p>
                </div>
              )}
              
              {/* Collaborators Section */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-sm font-medium text-gray-500">
                    Collaborators
                    {(() => {
                      console.log('Collaborators data in view modal:', selectedDeadline.collaborators);
                      console.log('Collaborators length:', selectedDeadline.collaborators?.length);
                      return selectedDeadline.collaborators && selectedDeadline.collaborators.length > 0 && (
                        <span className="ml-2 text-xs bg-blue-100 dark:bg-black text-blue-600 dark:text-gray-300 px-2 py-1 rounded-full">
                          {selectedDeadline.collaborators.length}
                        </span>
                      );
                    })()}
                  </label>
                  {selectedDeadline.user_role === 'owner' && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleAddCollaborators(selectedDeadline)}
                      className="glassmorphism-button text-xs"
                    >
                      <UserPlus className="h-3 w-3 mr-1" />
                      {selectedDeadline.collaborators && selectedDeadline.collaborators.length > 0 ? 'Add More' : 'Add Collaborators'}
                    </Button>
                  )}
                </div>
                
                {selectedDeadline.collaborators && selectedDeadline.collaborators.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {selectedDeadline.collaborators
                      .map((collaborator, index) => (
                        <div
                          key={collaborator.id || index}
                          className="flex items-center space-x-2 bg-blue-50 dark:bg-black px-3 py-1 rounded-full"
                        >
                          <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-blue-500 text-xs font-medium text-white">
                            {(collaborator.full_name || collaborator.username || 'U').charAt(0).toUpperCase()}
                          </span>
                          <span className="text-sm">{collaborator.full_name || collaborator.username}</span>
                        </div>
                      ))
                    }
                  </div>
                ) : (
                  <p className="text-sm text-gray-500">No collaborators added yet</p>
                )}
                
                {/* Collaborator Error Display moved outside modal below */}
              </div>
            </div>
          ) : !viewModalError ? (
            <div className="text-center py-8">
              <AlertTriangle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">No deadline data available</p>
            </div>
          ) : null}
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Modal */}
      <AlertDialog open={deleteModalOpen} onOpenChange={setDeleteModalOpen}>
    <AlertDialogContent className="glassmorphism-modal w-full max-w-[calc(100%-2rem)] sm:max-w-md p-4 sm:p-6 text-sm sm:text-base">
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center">
              <Trash2 className="h-5 w-5 mr-2 text-red-500" />
              Delete Deadline
            </AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete <strong>{selectedDeadline?.title}</strong>? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              disabled={modalLoading}
              className="bg-red-600 hover:bg-red-700"
            >
              {modalLoading ? 'Deleting...' : 'Delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Collaborator Modal */}
      <CollaboratorModal
        isOpen={collaboratorModalOpen}
        onClose={() => {
          setCollaboratorModalOpen(false);
          // Clear error when closing modal
          setCollaboratorError('');
        }}
        deadline={selectedDeadline}
        onSuccess={handleCollaboratorSuccess}
        onError={handleCollaboratorError}
      />

      {/* Add/Edit Deadline Modal */}
      <DeadlineModal
        isOpen={deadlineModalOpen}
        onClose={() => setDeadlineModalOpen(false)}
        deadline={selectedDeadline}
        onSuccess={handleDeadlineModalSuccess}
      />
    </div>
  );
}