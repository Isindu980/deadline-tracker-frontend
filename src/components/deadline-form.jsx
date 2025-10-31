'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { deadlineService } from '@/services';
import { useAuth } from '@/contexts/auth-context';
import { format } from 'date-fns';
import { Calendar as CalendarIcon, Save, ArrowLeft } from 'lucide-react';

export default function DeadlineForm({ deadlineId = null, isEdit = false }) {
  const router = useRouter();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [validationErrors, setValidationErrors] = useState([]);
  const [calendarOpen, setCalendarOpen] = useState(false);
  
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
    completion_percentage: 0,
    notes: ''
  });

  // Load deadline data if editing
  useEffect(() => {
    if (isEdit && deadlineId) {
      loadDeadline();
    }
    
    // Set student_id from current user
    if (user?.id) {
      setFormData(prev => ({ ...prev, student_id: user.id }));
    }
  }, [isEdit, deadlineId, user]);

  const loadDeadline = async () => {
    try {
      setLoading(true);
      const result = await deadlineService.getDeadlineById(deadlineId);
      
      if (result.success) {
        const deadline = result.deadline;
        
        // Format the due_date for datetime-local input (YYYY-MM-DDTHH:mm)
        let formattedDueDate = '';
        if (deadline.due_date) {
          const date = new Date(deadline.due_date);
          // Get the date in local timezone and format for datetime-local input
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
          completion_percentage: deadline.completion_percentage || 0,
          notes: deadline.notes || ''
        });
      } else {
        setError(result.error);
      }
    } catch (error) {
      setError('Failed to load deadline');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
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
        // Just validate date format - allow any date (past, present, or future)
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
        // Don't convert to UTC - send the datetime as the user entered it
        due_date: formData.due_date.includes(':') ? 
          formData.due_date + ':00' : formData.due_date, // Add seconds if missing
        priority: formData.priority || 'medium',
        status: formData.status || 'pending',
        category: formData.category?.trim() || null,
        subject: formData.subject?.trim() || null,
        estimated_hours: formData.estimated_hours ? parseInt(formData.estimated_hours) : null,
        actual_hours: formData.actual_hours ? parseInt(formData.actual_hours) : null,
        completion_percentage: parseInt(formData.completion_percentage || 0),
        notes: formData.notes?.trim() || null
      };

      console.log('Submitting deadline data:', submitData);
      console.log('Current user:', user);

      let result;
      if (isEdit) {
        result = await deadlineService.updateDeadline(deadlineId, submitData);
      } else {
        result = await deadlineService.createDeadline(submitData);
      }

      if (result.success) {
        setSuccess(result.message || `Deadline ${isEdit ? 'updated' : 'created'} successfully!`);
        setTimeout(() => {
          router.push('/dashboard/deadlines');
        }, 1500);
      } else {
        setError(result.error);
        if (result.validationErrors && Array.isArray(result.validationErrors)) {
          setValidationErrors(result.validationErrors);
        }
        console.error('API Error:', result);
      }
    } catch (error) {
      setError('An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center space-x-4">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => router.back()}
          className="glassmorphism-button"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            {isEdit ? 'Edit Deadline' : 'Create New Deadline'}
          </h1>
          <p className="text-gray-600 dark:text-gray-300 mt-1">
            {isEdit ? 'Update your deadline details' : 'Add a new deadline to track'}
          </p>
        </div>
      </div>

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
      <Card className="glassmorphism-card border-0 max-w-4xl  mx-auto">
        <CardHeader>
          <CardTitle>Deadline Information</CardTitle>
          <CardDescription>
            Fill in the details for your deadline
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
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
                className="glassmorphism-input min-h-[100px]"
                rows={4}
              />
            </div>

            {/* Due Date and Priority */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
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
                <label className="text-sm font-medium">
                  Priority
                </label>
                <Select
                  value={formData.priority}
                  onValueChange={(value) => handleChange('priority', value)}
                >
                  <SelectTrigger className="glassmorphism-input">
                    <SelectValue placeholder="Select priority" />
                  </SelectTrigger>
                  <SelectContent className="glassmorphism-modal border-0">
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="urgent">Urgent</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Category and Subject */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label htmlFor="category" className="text-sm font-medium">
                  Category
                </label>
                <Input
                  id="category"
                  value={formData.category}
                  onChange={(e) => handleChange('category', e.target.value)}
                  placeholder="e.g., Work, Personal, School"
                  className="glassmorphism-input"
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="subject" className="text-sm font-medium">
                  Subject
                </label>
                <Input
                  id="subject"
                  value={formData.subject}
                  onChange={(e) => handleChange('subject', e.target.value)}
                  placeholder="e.g., Mathematics, Project Management"
                  className="glassmorphism-input"
                />
              </div>
            </div>

            {/* Status and Estimated Hours */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-medium">
                  Status
                </label>
                <Select
                  value={formData.status}
                  onValueChange={(value) => handleChange('status', value)}
                >
                  <SelectTrigger className="glassmorphism-input">
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent className="glassmorphism-modal border-0">
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="in_progress">In Progress</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                  </SelectContent>
                </Select>
              </div>

            <div className="space-y-2">
              <label htmlFor="estimated_hours" className="text-sm font-medium">
                Estimated Hours
              </label>
              <Input
                id="estimated_hours"
                type="number"
                value={formData.estimated_hours}
                onChange={(e) => handleChange('estimated_hours', e.target.value)}
                placeholder="Hours needed"
                className="glassmorphism-input"
                min="0"
                step="0.5"
              />
            </div>

            {/* Actual Hours */}
            <div className="space-y-2">
              <label htmlFor="actual_hours" className="text-sm font-medium">
                Actual Hours
              </label>
              <Input
                id="actual_hours"
                type="number"
                value={formData.actual_hours}
                onChange={(e) => handleChange('actual_hours', e.target.value)}
                placeholder="Hours actually spent"
                className="glassmorphism-input"
                min="0"
                step="0.5"
              />
            </div>
          </div>            {/* Completion Percentage */}
            <div className="space-y-2">
              <label htmlFor="completion_percentage" className="text-sm font-medium">
                Completion Percentage: {formData.completion_percentage}%
              </label>
              <Input
                id="completion_percentage"
                type="range"
                value={formData.completion_percentage}
                onChange={(e) => handleChange('completion_percentage', e.target.value)}
                className="glassmorphism-input"
                min="0"
                max="100"
                step="5"
              />
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
                placeholder="Additional notes or reminders..."
                className="glassmorphism-input"
                rows={3}
              />
            </div>

            {/* Submit Button */}
            <div className="flex justify-end space-x-4 pt-6">
              <Button
                type="button"
                variant="outline"
                onClick={() => router.back()}
                className="glassmorphism-button"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="glassmorphism-button"
                disabled={loading}
              >
                <Save className="mr-2 h-4 w-4" />
                {loading 
                  ? (isEdit ? 'Updating...' : 'Creating...') 
                  : (isEdit ? 'Update Deadline' : 'Create Deadline')
                }
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}