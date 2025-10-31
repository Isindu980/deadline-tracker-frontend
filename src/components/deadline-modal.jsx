'use client';

import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
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
} from "@/components/ui/dialog";
import { Alert, AlertDescription } from '@/components/ui/alert';
import { deadlineService } from '@/services';
import { useAuth } from '@/contexts/auth-context';
import { Save, X, Loader2, AlertTriangle, CheckCircle } from 'lucide-react';

export default function DeadlineModal({ 
  isOpen, 
  onClose, 
  deadline = null, 
  onSuccess 
}) {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const isSubmittingRef = useRef(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [validationErrors, setValidationErrors] = useState([]);
  
  const isEdit = deadline !== null;
  
  const [formData, setFormData] = useState({
    student_id: '',
    title: '',
    description: '',
    due_date: '',
    priority: 'medium',
    status: 'pending',
    category: '',
    subject: '',
    estimated_hours: '',
    actual_hours: '',
    notes: ''
  });

  // Initialize form data when modal opens
  useEffect(() => {
    if (isOpen) {
      if (isEdit && deadline) {
        // Format the due_date for datetime-local input (YYYY-MM-DDTHH:mm)
        let formattedDueDate = '';
        if (deadline.due_date) {
          const date = new Date(deadline.due_date);
          const year = date.getFullYear();
          const month = String(date.getMonth() + 1).padStart(2, '0');
          const day = String(date.getDate()).padStart(2, '0');
          const hours = String(date.getHours()).padStart(2, '0');
          const minutes = String(date.getMinutes()).padStart(2, '0');
          formattedDueDate = `${year}-${month}-${day}T${hours}:${minutes}`;
        }
        
        setFormData({
          student_id: deadline.student_id || user?.id,
          title: deadline.title || '',
          description: deadline.description || '',
          due_date: formattedDueDate,
          priority: deadline.priority || 'medium',
          status: deadline.status || 'pending',
          category: deadline.category || '',
          subject: deadline.subject || '',
          estimated_hours: deadline.estimated_hours || '',
          actual_hours: deadline.actual_hours || '',
          notes: deadline.notes || ''
        });
      } else {
        // Reset form for new deadline
        setFormData({
          student_id: user?.id || '',
          title: '',
          description: '',
          due_date: '',
          priority: 'medium',
          status: 'pending',
          category: '',
          subject: '',
          estimated_hours: '',
          actual_hours: '',
          notes: ''
        });
      }
      
      // Clear any previous messages
      setError('');
      setSuccess('');
      setValidationErrors([]);
      // reset submit lock when modal opens
      isSubmittingRef.current = false;
    }
  }, [isOpen, isEdit, deadline, user]);

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    // prevent duplicate submissions synchronously
    if (isSubmittingRef.current) return;
    isSubmittingRef.current = true;
    setError('');
    setSuccess('');
    setValidationErrors([]);
    setLoading(true);

    try {
      // Client-side validation
      const clientErrors = [];
      
      if (!formData.title?.trim()) {
        clientErrors.push('Title is required');
      }
      
      if (!formData.due_date) {
        clientErrors.push('Due date is required');
      } else {
        const dateTest = new Date(formData.due_date);
        if (isNaN(dateTest.getTime())) {
          clientErrors.push('Invalid due date format');
        }
      }
      
      if (!formData.student_id && !user?.id) {
        clientErrors.push('User not authenticated');
      }
      
      if (formData.estimated_hours && isNaN(parseInt(formData.estimated_hours))) {
        clientErrors.push('Estimated hours must be a valid number');
      }
      
      if (clientErrors.length > 0) {
        setValidationErrors(clientErrors);
        setError('Please fix the validation errors below');
        return;
      }

      // Prepare data for submission
      const submitData = {
        student_id: parseInt(formData.student_id || user?.id),
        title: formData.title?.trim(),
        description: formData.description?.trim() || null,
        due_date: formData.due_date.includes(':') ? 
          formData.due_date + ':00' : formData.due_date,
        priority: formData.priority || 'medium',
        status: formData.status || 'pending',
        category: formData.category?.trim() || null,
        subject: formData.subject?.trim() || null,
        estimated_hours: formData.estimated_hours ? parseInt(formData.estimated_hours) : null,
        actual_hours: formData.actual_hours ? parseInt(formData.actual_hours) : null,
        notes: formData.notes?.trim() || null
      };

      let result;
      if (isEdit) {
        result = await deadlineService.updateDeadline(deadline.id, submitData);
      } else {
        result = await deadlineService.createDeadline(submitData);
      }

      if (result.success) {
        setSuccess(result.message || `Deadline ${isEdit ? 'updated' : 'created'} successfully!`);
        // Immediately notify parent and close modal to avoid duplicate submissions
        try {
          onSuccess && onSuccess();
        } catch (err) {
          // swallow errors from parent handler
          console.error('onSuccess handler failed:', err);
        }
        onClose();
        // Clear states after a short delay so animations complete
        setTimeout(() => {
          setSuccess('');
          setError('');
          setValidationErrors([]);
        }, 300);
      } else {
        // Handle API errors with specific error messaging
        setError(result.error || `Failed to ${isEdit ? 'update' : 'create'} deadline`);
        if (result.validationErrors && Array.isArray(result.validationErrors)) {
          setValidationErrors(result.validationErrors);
        }
        console.error(`${isEdit ? 'Update' : 'Create'} deadline error:`, result);
      }
    } catch (error) {
      // Handle network/unexpected errors
      console.error(`${isEdit ? 'Update' : 'Create'} deadline failed:`, error);
      setError('Network error occurred. Please check your connection and try again.');
    } finally {
      setLoading(false);
      // release submit lock
      isSubmittingRef.current = false;
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={loading ? undefined : onClose}>
      <DialogContent 
        className="glassmorphism-modal border-2 max-h-[85vh] overflow-y-auto w-full max-w-[calc(100%-2rem)] sm:max-w-lg md:max-w-2xl p-4 sm:p-6 text-sm sm:text-base"
      >
        {/* Loading Overlay */}
        {loading && (
          <div className="absolute inset-0 bg-black/20 dark:bg-white/10 backdrop-blur-sm z-50 flex items-center justify-center rounded-lg">
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg flex items-center space-x-3">
              <Loader2 className="h-5 w-5 animate-spin text-blue-600" />
              <span className="text-sm font-medium">
                {isEdit ? 'Updating deadline...' : 'Creating deadline...'}
              </span>
            </div>
          </div>
        )}

        <DialogHeader>
          <DialogTitle className="text-base sm:text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            {isEdit ? 'Edit Deadline' : 'Create New Deadline'}
          </DialogTitle>
          <DialogDescription>
            {isEdit ? 'Update your deadline details' : 'Add a new deadline to track'}
          </DialogDescription>
        </DialogHeader>

        {/* Messages */}
        {success && (
          <Alert className="glassmorphism border-green-500/50">
            <AlertDescription className="text-green-600 dark:text-green-400">
              {success}
            </AlertDescription>
          </Alert>
        )}

        {error && (
          <Alert variant="destructive" className="glassmorphism border-red-500/50">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {validationErrors.length > 0 && (
          <Alert variant="destructive" className="glassmorphism border-red-500/50">
            <AlertDescription>
              <div className="space-y-1">
                <div className="font-medium">Validation Errors:</div>
                <ul className="list-disc list-inside space-y-1">
                  {validationErrors.map((error, index) => (
                    <li key={index} className="text-sm">{error}</li>
                  ))}
                </ul>
              </div>
            </AlertDescription>
          </Alert>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-2">
          {/* Title */}
          <div className="space-y-2">
            <label htmlFor="title" className="text-sm font-medium">
              Title *
            </label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => handleChange('title', e.target.value)}
              placeholder="Enter deadline title"
              className="glassmorphism-input"
              required
            />
          </div>

          {/* Description */}
          <div className="space-y-2">
            <label htmlFor="description" className="text-sm font-medium">
              Description
            </label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => handleChange('description', e.target.value)}
              placeholder="Describe your deadline..."
              className="glassmorphism-input"
              rows={3}
            />
          </div>

          {/* Due Date, Priority, and Status */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="space-y-2 md:col-span-2">
              <label htmlFor="due_date" className="text-sm font-medium">
                Due Date *
              </label>
              <Input
                id="due_date"
                type="datetime-local"
                value={formData.due_date}
                onChange={(e) => handleChange('due_date', e.target.value)}
                className="glassmorphism-input"
                required
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="priority" className="text-sm font-medium">
                Priority
              </label>
              <Select value={formData.priority} onValueChange={(value) => handleChange('priority', value)}>
                <SelectTrigger className="glassmorphism-input">
                  <SelectValue placeholder="Select priority" />
                </SelectTrigger>
                <SelectContent className="glassmorphism-modal border-0">
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="critical">Critical</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label htmlFor="status" className="text-sm font-medium">
                Status
              </label>
              <Select value={formData.status} onValueChange={(value) => handleChange('status', value)}>
                <SelectTrigger className="glassmorphism-input">
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent className="glassmorphism-modal border-0">
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="in_progress">In Progress</SelectItem>
                  {isEdit && <SelectItem value="overdue">Overdue</SelectItem>}
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Subject and Category */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label htmlFor="subject" className="text-sm font-medium">
                Subject
              </label>
              <Input
                id="subject"
                value={formData.subject}
                onChange={(e) => handleChange('subject', e.target.value)}
                placeholder="e.g., Mathematics, History"
                className="glassmorphism-input"
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="category" className="text-sm font-medium">
                Category
              </label>
              <Input
                id="category"
                value={formData.category}
                onChange={(e) => handleChange('category', e.target.value)}
                placeholder="e.g., Assignment, Project"
                className="glassmorphism-input"
              />
            </div>
          </div>

          {/* Estimated Hours and Actual Hours */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label htmlFor="estimated_hours" className="text-sm font-medium">
                Estimated Hours
              </label>
              <Input
                id="estimated_hours"
                type="number"
                min="0"
                value={formData.estimated_hours}
                onChange={(e) => handleChange('estimated_hours', e.target.value)}
                placeholder="Hours needed"
                className="glassmorphism-input"
              />
            </div>

            {/* Always show Actual Hours field, but it's more relevant in edit mode */}
            <div className="space-y-2">
              <label htmlFor="actual_hours" className="text-sm font-medium">
                Actual Hours {!isEdit && '(Optional)'}
              </label>
              <Input
                id="actual_hours"
                type="number"
                min="0"
                value={formData.actual_hours}
                onChange={(e) => handleChange('actual_hours', e.target.value)}
                placeholder="Hours actually spent"
                className="glassmorphism-input"
              />
            </div>
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <label htmlFor="notes" className="text-sm font-medium">
              Notes
            </label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => handleChange('notes', e.target.value)}
              placeholder="Additional notes..."
              className="glassmorphism-input"
              rows={2}
            />
          </div>

          {/* Form Actions */}
          <div className="flex justify-end space-x-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={loading}
              className="glassmorphism-button"
            >
              <X className="mr-2 h-4 w-4" />
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={loading}
              className="glassmorphism-button"
            >
              <Save className="mr-2 h-4 w-4" />
              {loading ? 'Saving...' : (isEdit ? 'Update' : 'Create')}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}