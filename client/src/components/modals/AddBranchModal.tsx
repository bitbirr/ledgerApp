import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import { api } from '@/lib/api';
import { Loader2, MapPin, Building2, Phone, Mail, Globe } from 'lucide-react';

const branchSchema = z.object({
  name: z.string().min(2, 'Branch name must be at least 2 characters'),
  code: z.string().min(2, 'Branch code must be at least 2 characters'),
  address: z.string().min(5, 'Address must be at least 5 characters'),
  city: z.string().min(2, 'City must be at least 2 characters'),
  state: z.string().min(2, 'State must be at least 2 characters'),
  zipCode: z.string().min(3, 'ZIP code must be at least 3 characters'),
  country: z.string().min(2, 'Country must be at least 2 characters'),
  phone: z.string().min(10, 'Phone number must be at least 10 digits'),
  email: z.string().email('Please enter a valid email address'),
  website: z.string().url('Please enter a valid website URL').optional().or(z.literal('')),
  description: z.string().optional().or(z.literal('')),
  isActive: z.boolean().default(true),
});

type BranchFormData = z.infer<typeof branchSchema>;

interface AddBranchModalProps {
  isOpen: boolean;
  onClose: () => void;
  businessId: string;
}

export function AddBranchModal({ isOpen, onClose, businessId }: AddBranchModalProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const form = useForm<BranchFormData>({
    resolver: zodResolver(branchSchema),
    defaultValues: {
      name: '',
      code: '',
      address: '',
      city: '',
      state: '',
      zipCode: '',
      country: '',
      phone: '',
      email: '',
      website: '',
      description: '',
      isActive: true,
    },
  });

  const createBranchMutation = useMutation({
    mutationFn: async (data: BranchFormData) => {
      // sanitize/trim before sending
      const payload = {
        name: data.name.trim(),
        code: data.code.trim(),
        address: data.address.trim(),
        city: data.city.trim(),
        state: data.state.trim(),
        zipCode: data.zipCode.trim(),
        country: data.country.trim(),
        phone: data.phone.trim(),
        email: data.email.trim(),
        website: (data.website || '').trim() || undefined,
        description: (data.description || '').trim() || undefined,
        isActive: data.isActive,
        businessId,
      };

      const res = await api.createBranch(payload);
      return res;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['branches', businessId] });
      toast({
        title: 'Success',
        description: 'Branch created successfully',
        className: 'bg-green-900 border-green-700 text-green-100',
      });
      form.reset();
      onClose();
    },
    onError: (error: any) => {
      const message =
        error?.message ||
        error?.response?.data?.error ||
        'Failed to create branch';
      toast({
        title: 'Error',
        description: message,
        variant: 'destructive',
        className: 'bg-red-900 border-red-700 text-red-100',
      });
    },
  });

  const isSubmitting = createBranchMutation.isPending;

  const onSubmit = async (data: BranchFormData) => {
    await createBranchMutation.mutateAsync(data);
  };

  const handleClose = () => {
    if (isSubmitting) {
      toast({ title: 'Please wait…', description: 'Creating branch in progress.' });
      return;
    }
    form.reset();
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <Dialog
          open={isOpen}
          // FIX: shadcn Dialog expects (nextOpen: boolean) => void
          onOpenChange={(next) => {
            if (!next) handleClose();
          }}
        >
          <DialogContent className="bg-gray-900 border-gray-700 text-white max-w-2xl max-h-[90vh] overflow-y-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.2 }}
            >
              <DialogHeader className="space-y-3">
                <DialogTitle className="text-2xl font-bold text-lime-400 flex items-center gap-2">
                  <Building2 className="h-6 w-6" />
                  Add New Branch
                </DialogTitle>
                <DialogDescription className="text-gray-300">
                  Create a new branch for your business. Fill in all the required information.
                </DialogDescription>
              </DialogHeader>

              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 mt-6">
                  {/* Basic Information */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-green-400 border-b border-gray-700 pb-2">
                      Basic Information
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="name"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-gray-200">Branch Name *</FormLabel>
                            <FormControl>
                              <Input
                                {...field}
                                placeholder="Enter branch name"
                                className="bg-gray-800 border-gray-600 text-white placeholder:text-gray-400 focus:border-lime-500 focus:ring-lime-500"
                              />
                            </FormControl>
                            <FormMessage className="text-red-400" />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="code"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-gray-200">Branch Code *</FormLabel>
                            <FormControl>
                              <Input
                                {...field}
                                placeholder="Enter branch code"
                                className="bg-gray-800 border-gray-600 text-white placeholder:text-gray-400 focus:border-lime-500 focus:ring-lime-500"
                              />
                            </FormControl>
                            <FormMessage className="text-red-400" />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>

                  {/* Address Information */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-green-400 border-b border-gray-700 pb-2 flex items-center gap-2">
                      <MapPin className="h-5 w-5" />
                      Address Information
                    </h3>
                    <FormField
                      control={form.control}
                      name="address"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-gray-200">Street Address *</FormLabel>
                          <FormControl>
                            <Textarea
                              {...field}
                              placeholder="Enter street address"
                              className="bg-gray-800 border-gray-600 text-white placeholder:text-gray-400 focus:border-lime-500 focus:ring-lime-500 min-h-[80px]"
                            />
                          </FormControl>
                          <FormMessage className="text-red-400" />
                        </FormItem>
                      )}
                    />
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="city"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-gray-200">City *</FormLabel>
                            <FormControl>
                              <Input
                                {...field}
                                placeholder="Enter city"
                                className="bg-gray-800 border-gray-600 text-white placeholder:text-gray-400 focus:border-lime-500 focus:ring-lime-500"
                              />
                            </FormControl>
                            <FormMessage className="text-red-400" />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="state"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-gray-200">State/Province *</FormLabel>
                            <FormControl>
                              <Input
                                {...field}
                                placeholder="Enter state or province"
                                className="bg-gray-800 border-gray-600 text-white placeholder:text-gray-400 focus:border-lime-500 focus:ring-lime-500"
                              />
                            </FormControl>
                            <FormMessage className="text-red-400" />
                          </FormItem>
                        )}
                      />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="zipCode"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-gray-200">ZIP/Postal Code *</FormLabel>
                            <FormControl>
                              <Input
                                {...field}
                                placeholder="Enter ZIP code"
                                className="bg-gray-800 border-gray-600 text-white placeholder:text-gray-400 focus:border-lime-500 focus:ring-lime-500"
                              />
                            </FormControl>
                            <FormMessage className="text-red-400" />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="country"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-gray-200">Country *</FormLabel>
                            <FormControl>
                              <Input
                                {...field}
                                placeholder="Enter country"
                                className="bg-gray-800 border-gray-600 text-white placeholder:text-gray-400 focus:border-lime-500 focus:ring-lime-500"
                              />
                            </FormControl>
                            <FormMessage className="text-red-400" />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>

                  {/* Contact Information */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-green-400 border-b border-gray-700 pb-2 flex items-center gap-2">
                      <Phone className="h-5 w-5" />
                      Contact Information
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="phone"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-gray-200">Phone Number *</FormLabel>
                            <FormControl>
                              <Input
                                {...field}
                                placeholder="Enter phone number"
                                className="bg-gray-800 border-gray-600 text-white placeholder:text-gray-400 focus:border-lime-500 focus:ring-lime-500"
                              />
                            </FormControl>
                            <FormMessage className="text-red-400" />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="email"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-gray-200 flex items-center gap-2">
                              <Mail className="h-4 w-4" />
                              Email Address *
                            </FormLabel>
                            <FormControl>
                              <Input
                                {...field}
                                type="email"
                                placeholder="Enter email address"
                                className="bg-gray-800 border-gray-600 text-white placeholder:text-gray-400 focus:border-lime-500 focus:ring-lime-500"
                              />
                            </FormControl>
                            <FormMessage className="text-red-400" />
                          </FormItem>
                        )}
                      />
                    </div>
                    <FormField
                      control={form.control}
                      name="website"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-gray-200 flex items-center gap-2">
                            <Globe className="h-4 w-4" />
                            Website (Optional)
                          </FormLabel>
                          <FormControl>
                            <Input
                              {...field}
                              placeholder="https://example.com"
                              className="bg-gray-800 border-gray-600 text-white placeholder:text-gray-400 focus:border-lime-500 focus:ring-lime-500"
                            />
                          </FormControl>
                          <FormMessage className="text-red-400" />
                        </FormItem>
                      )}
                    />
                  </div>

                  {/* Additional Information */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-green-400 border-b border-gray-700 pb-2">
                      Additional Information
                    </h3>
                    <FormField
                      control={form.control}
                      name="description"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-gray-200">Description (Optional)</FormLabel>
                          <FormControl>
                            <Textarea
                              {...field}
                              placeholder="Enter branch description"
                              className="bg-gray-800 border-gray-600 text-white placeholder:text-gray-400 focus:border-lime-500 focus:ring-lime-500 min-h-[100px]"
                            />
                          </FormControl>
                          <FormMessage className="text-red-400" />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="isActive"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between rounded-lg border border-gray-700 p-4 bg-gray-800">
                          <div className="space-y-0.5">
                            <FormLabel className="text-base text-gray-200">Active Status</FormLabel>
                            <div className="text-sm text-gray-400">Enable this branch for operations</div>
                          </div>
                          <FormControl>
                            <Switch
                              checked={field.value}
                              onCheckedChange={field.onChange}
                              className="data-[state=checked]:bg-lime-500"
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                  </div>

                  {/* Form Actions */}
                  <div className="flex flex-col sm:flex-row gap-3 pt-6 border-t border-gray-700">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={handleClose}
                      disabled={isSubmitting}
                      className="flex-1 border-gray-600 text-gray-300 hover:bg-gray-800 hover:text-white"
                    >
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      disabled={isSubmitting}
                      className="flex-1 bg-lime-500 hover:bg-lime-600 text-black font-semibold transition-all duration-200 hover:shadow-lg hover:shadow-lime-500/25"
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Creating Branch...
                        </>
                      ) : (
                        'Create Branch'
                      )}
                    </Button>
                  </div>
                </form>
              </Form>
            </motion.div>
          </DialogContent>
        </Dialog>
      )}
    </AnimatePresence>
  );
}
