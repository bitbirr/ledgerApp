import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { 
  Search, 
  Filter, 
  MessageCircle,
  User,
  Calendar,
  Star,
  Reply
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';

export function Feedback() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFeedback, setSelectedFeedback] = useState<any>(null);
  
  // Mock feedback data
  const feedbacks = [
    { id: 1, user: 'John Doe', email: 'john@example.com', rating: 5, category: 'Feature Request', subject: 'Add dark mode', message: 'It would be great to have a dark mode option for better visibility in low light conditions.', status: 'new', timestamp: '2023-06-15 14:30:22' },
    { id: 2, user: 'Jane Smith', email: 'jane@example.com', rating: 4, category: 'Bug Report', subject: 'Invoice generation issue', message: 'Sometimes the invoice generation fails with a timeout error. Please look into this.', status: 'in-progress', timestamp: '2023-06-14 13:45:10' },
    { id: 3, user: 'Bob Johnson', email: 'bob@example.com', rating: 3, category: 'UI/UX', subject: 'Navigation improvement', message: 'The navigation could be improved by adding breadcrumbs for better orientation.', status: 'resolved', timestamp: '2023-06-13 12:15:45' },
    { id: 4, user: 'Alice Brown', email: 'alice@example.com', rating: 5, category: 'Feature Request', subject: 'Mobile app', message: 'Would love to see a mobile app version of this platform.', status: 'new', timestamp: '2023-06-12 11:20:33' },
    { id: 5, user: 'Charlie Wilson', email: 'charlie@example.com', rating: 2, category: 'Performance', subject: 'Slow loading times', message: 'The dashboard takes too long to load, especially with many transactions.', status: 'in-progress', timestamp: '2023-06-11 10:05:17' },
  ];

  const filteredFeedbacks = feedbacks.filter(feedback => 
    feedback.user.toLowerCase().includes(searchTerm.toLowerCase()) ||
    feedback.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
    feedback.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusVariant = (status: string) => {
    switch (status) {
      case 'new': return 'default';
      case 'in-progress': return 'secondary';
      case 'resolved': return 'outline';
      default: return 'secondary';
    }
  };

  const getRatingColor = (rating: number) => {
    if (rating >= 4) return 'text-green-500';
    if (rating >= 3) return 'text-yellow-500';
    return 'text-red-500';
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Feedback</h1>
          <p className="text-muted-foreground">Manage user feedback and feature requests</p>
        </div>
        <div className="flex gap-2">
          <Button className="gap-2">
            <MessageCircle className="h-4 w-4" />
            New Response Template
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card className="rounded-2xl">
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative md:col-span-2">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search feedback..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex gap-2">
              <Button variant="outline" className="gap-2">
                <Filter className="h-4 w-4" />
                Filters
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Feedback List */}
        <div className="lg:col-span-1 space-y-4">
          {filteredFeedbacks.map((feedback) => (
            <Card
              key={feedback.id}
              className={`cursor-pointer rounded-2xl ${selectedFeedback?.id === feedback.id ? 'border-primary' : ''}`}
              onClick={() => setSelectedFeedback(feedback)}
            >
              <CardHeader className="pb-2">
                <div className="flex justify-between items-start">
                  <CardTitle className="text-base flex items-center gap-2">
                    <User className="h-4 w-4 text-muted-foreground" />
                    {feedback.user}
                  </CardTitle>
                  <Badge variant={getStatusVariant(feedback.status)}>
                    {feedback.status}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <p className="font-medium text-foreground">{feedback.subject}</p>
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {feedback.message}
                  </p>
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-1">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`h-3 w-3 ${i < feedback.rating ? getRatingColor(feedback.rating) : 'text-muted'}`}
                          fill={i < feedback.rating ? 'currentColor' : 'none'}
                        />
                      ))}
                    </div>
                    <Badge variant="secondary">
                      {feedback.category}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Calendar className="h-3 w-3" />
                    {new Date(feedback.timestamp).toLocaleDateString()}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
          {filteredFeedbacks.length === 0 && (
            <Card className="rounded-2xl">
              <CardContent className="p-8 text-center">
                <MessageCircle className="h-12 w-12 mx-auto mb-4 text-muted-foreground/50" />
                <h3 className="text-lg font-medium mb-2">No feedback found</h3>
                <p className="text-sm text-muted-foreground">
                  Try adjusting your search or filter to find what you're looking for.
                </p>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Feedback Detail */}
        <div className="lg:col-span-2">
          {selectedFeedback ? (
            <Card className="rounded-2xl">
              <CardHeader className="pb-2">
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <User className="h-5 w-5 text-muted-foreground" />
                      {selectedFeedback.user}
                    </CardTitle>
                    <p className="text-sm text-muted-foreground">{selectedFeedback.email}</p>
                  </div>
                  <Badge variant={getStatusVariant(selectedFeedback.status)}>
                    {selectedFeedback.status}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <h3 className="text-lg font-medium">{selectedFeedback.subject}</h3>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge variant="secondary">
                        {selectedFeedback.category}
                      </Badge>
                      <div className="flex items-center gap-1">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`h-4 w-4 ${i < selectedFeedback.rating ? getRatingColor(selectedFeedback.rating) : 'text-muted'}`}
                            fill={i < selectedFeedback.rating ? 'currentColor' : 'none'}
                          />
                        ))}
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-muted/50 p-4 rounded-lg">
                    <p className="text-foreground">{selectedFeedback.message}</p>
                  </div>
                  
                  <div className="flex items-center justify-between text-sm text-muted-foreground">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      {new Date(selectedFeedback.timestamp).toLocaleString()}
                    </div>
                  </div>
                  
                  <div className="border-t pt-4">
                    <h4 className="font-medium mb-2">Respond to Feedback</h4>
                    <Textarea
                      placeholder="Type your response here..."
                      className="mb-3"
                    />
                    <div className="flex justify-end gap-2">
                      <Button variant="outline">
                        <Reply className="h-4 w-4 mr-2" />
                        Send Response
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card className="h-full flex items-center justify-center rounded-2xl">
              <CardContent className="text-center">
                <MessageCircle className="h-12 w-12 mx-auto mb-4 text-muted-foreground/50" />
                <h3 className="text-lg font-medium mb-2">Select Feedback</h3>
                <p className="text-sm text-muted-foreground">
                  Choose a feedback item from the list to view details and respond.
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}