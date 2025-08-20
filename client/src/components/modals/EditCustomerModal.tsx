import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { insertAccountSchema } from '@shared/schema';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { z } from 'zod';
import { type Account } from '@/lib/db';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Textarea } from '@/components/ui/textarea';
import {
  User,
  X,
  Upload,
  Mail,
  Phone,
  MapPin,
  Building2,
  CheckCircle,
  Loader2,
  Edit3,
} from 'lucide-react';

interface EditCustomerModalProps {
  open: boolean;
  onClose: () => void;
  customer: (Account & {
    email?: string | null;
    address?: string | null;
    city?: string | null;
    notes?: string | null;
    profilePhoto?: string | null;
    photoUrl?: string | null;
    accountType?: string | null;
    type?: string | null;
    categoryId?: string | null;
  }) | null;
}

// Allow empty strings for optional fields so RHF defaults validate cleanly
const enhancedCustomerSchema = insertAccountSchema.extend({
  email: z.string().email('Invalid email address').optional().or(z.literal('')),
  address: z.string().max(500, 'Address must be less than 500 characters').optional().or(z.literal('')),
  city: z.string().max(100, 'City must be less than 100 characters').optional().or(z.literal('')),
  notes: z.string().max(1000, 'Notes must be less than 1000 characters').optional().or(z.literal('')),
  profilePhoto: z.string().optional().or(z.literal('')), // data: or blob: URLs are allowed
  photoUrl: z.string().optional().or(z.literal('')),     // tolerate either name in form/state
  phone: z.string().optional().or(z.literal('')),
  categoryId: z.string().optional().or(z.literal('')),
  // keep base 'type' from insertAccountSchema (usually required) — do not override to optional
});

type EnhancedCustomer = z.infer<typeof enhancedCustomerSchema>;

export function EditCustomerModal({ open, onClose, customer }: EditCustomerModalProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [photoPreview, setPhotoPreview] = useState<string | null>(customer?.profilePhoto || customer?.photoUrl || null);
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const form = useForm<EnhancedCustomer>({
    resolver: zodResolver(enhancedCustomerSchema),
    defaultValues: {
      name: '',
      phone: '',
      type: 'customer',       // <-- bind the select to `type` to match your backend schema
      categoryId: 'general',  // harmless default; we’ll strip if equals 'general'
      profilePhoto: '',
      photoUrl: '',
      email: '',
      address: '',
      city: '',
      notes: '',
    },
  });

  // Reset form when customer changes
  useEffect(() => {
    if (customer && open) {
      const derivedType = customer.type || customer.accountType || 'customer';
      form.reset({
        name: customer.name || '',
        phone: customer.phone || '',
        type: derivedType,
        categoryId: customer.categoryId || 'general',
        profilePhoto: customer.profilePhoto || '',
        photoUrl: customer.photoUrl || '',
        email: customer.email || '',
        address: customer.address || '',
        city: customer.city || '',
        notes: customer.notes || '',
      });
      setPhotoPreview(customer.profilePhoto || customer.photoUrl || null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [customer, open]);

  const updateCustomerMutation = useMutation({
    mutationFn: async (data: EnhancedCustomer) => {
      if (!customer) throw new Error('No customer to update');

      // Shape the payload for your API: trim strings, map profilePhoto → photoUrl
      const payload = {
        name: data.name.trim(),
        phone: data.phone?.trim() || undefined,
        type: (data as any).type || 'customer',
        categoryId: data.categoryId && data.categoryId !== 'general' ? data.categoryId : undefined,
        photoUrl: (data.profilePhoto || data.photoUrl || '').trim() || undefined,
        email: data.email?.trim() || undefined,
        address: data.address?.trim() || undefined,
        city: data.city?.trim() || undefined,
        notes: data.notes?.trim() || undefined,
      };

      const response = await fetch(`/api/accounts/${customer.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          // If your API requires auth/business context, add them:
          // 'user-id': 'default-user',
          // 'business-id': 'default-business',
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        let msg = '';
        try {
          const j = await response.json();
          msg = j?.error || '';
        } catch {
          msg = await response.text();
        }
        throw new Error(msg || 'Failed to update customer');
      }

      try {
        return await response.json();
      } catch {
        return null;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['accounts'] });
      queryClient.invalidateQueries({ queryKey: ['account-summary'] });
      queryClient.invalidateQueries({ queryKey: ['customers'] });
      toast({
        title: 'Success!',
        description: 'Customer updated successfully.',
        className: 'bg-gray-900 border-lime-500 text-white',
      });
      onClose();
    },
    onError: (error: Error) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to update customer. Please try again.',
        variant: 'destructive',
        className: 'bg-gray-900 border-red-500 text-white',
      });
    },
  });

  const handlePhotoUpload = (file: File) => {
    if (!file.type.startsWith('image/')) {
      toast({
        title: 'Invalid file',
        description: 'Please select an image file.',
        variant: 'destructive',
      });
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: 'File too large',
        description: 'Please select an image smaller than 5MB.',
        variant: 'destructive',
        className: 'bg-gray-900 border-red-500 text-white',
      });
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const result = (e.target?.result as string) || '';
      setPhotoPreview(result);
      // store in both for compatibility; payload maps to photoUrl anyway
      form.setValue('profilePhoto', result, { shouldDirty: true });
      form.setValue('photoUrl', result, { shouldDirty: true });
    };
    reader.readAsDataURL(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    const files = Array.from(e.dataTransfer.files);
    const imageFile = files.find((f) => f.type.startsWith('image/'));
    if (imageFile) handlePhotoUpload(imageFile);
  };

  const onSubmit = (data: EnhancedCustomer) => {
    updateCustomerMutation.mutate(data);
  };

  const handleClose = (force = false) => {
    if (!force && updateCustomerMutation.isPending) {
      toast({ title: 'Please wait…', description: 'Update in progress.' });
      return;
    }
    form.reset();
    setPhotoPreview(null);
    onClose();
  };

  if (!customer) return null;

  return (
    <AnimatePresence>
      {open && (
        <Dialog
          open={open}
          // IMPORTANT: shadcn dialog provides (nextOpen: boolean)
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
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-lime-500/20 rounded-lg">
                    <Edit3 className="h-5 w-5 text-lime-400" />
                  </div>
                  <div>
                    <DialogTitle className="text-xl font-semibold text-white">
                      Edit Customer
                    </DialogTitle>
                    <DialogDescription className="text-gray-400">
                      Update customer information and details
                    </DialogDescription>
                  </div>
                </div>
              </DialogHeader>

              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 mt-6">
                  {/* Photo Upload */}
                  <div className="flex flex-col items-center space-y-4">
                    <div className="relative">
                      <Avatar className="w-24 h-24 border-2 border-lime-400">
                        {photoPreview ? (
                          <AvatarImage src={photoPreview} alt="Customer photo" />
                        ) : (
                          <AvatarFallback className="bg-gray-800 text-lime-400 text-lg">
                            <User className="h-8 w-8" />
                          </AvatarFallback>
                        )}
                      </Avatar>
                      {photoPreview && (
                        <motion.button
                          type="button"
                          onClick={() => {
                            setPhotoPreview(null);
                            form.setValue('profilePhoto', '', { shouldDirty: true });
                            form.setValue('photoUrl', '', { shouldDirty: true });
                          }}
                          className="absolute -top-2 -right-2 p-1 bg-red-500 rounded-full text-white hover:bg-red-600 transition-colors"
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                        >
                          <X className="h-3 w-3" />
                        </motion.button>
                      )}
                    </div>

                    <div
                      className={`border-2 border-dashed rounded-lg p-6 text-center transition-all duration-200 cursor-pointer ${
                        isDragOver
                          ? 'border-lime-400 bg-lime-400/10'
                          : 'border-gray-600 hover:border-lime-400 hover:bg-gray-800'
                      }`}
                      onDrop={handleDrop}
                      onDragOver={(e) => {
                        e.preventDefault();
                        setIsDragOver(true);
                      }}
                      onDragLeave={() => setIsDragOver(false)}
                      onClick={() => fileInputRef.current?.click()}
                    >
                      <Upload className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                      <p className="text-sm text-gray-400">Drop an image here or click to browse</p>
                      <p className="text-xs text-gray-500 mt-1">PNG, JPG up to 5MB</p>
                    </div>

                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) handlePhotoUpload(file);
                      }}
                    />
                  </div>

                  {/* Fields */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField
                      control={form.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-gray-300 flex items-center gap-2">
                            <User className="h-4 w-4 text-lime-400" />
                            Customer Name *
                          </FormLabel>
                          <FormControl>
                            <Input
                              {...field}
                              placeholder="Enter customer name"
                              className="bg-gray-800 border-gray-600 text-white placeholder:text-gray-500 focus:border-lime-400 focus:ring-lime-400"
                            />
                          </FormControl>
                          <FormMessage className="text-red-400" />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="phone"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-gray-300 flex items-center gap-2">
                            <Phone className="h-4 w-4 text-lime-400" />
                            Phone Number
                          </FormLabel>
                          <FormControl>
                            <Input
                              {...field}
                              placeholder="Enter phone number"
                              className="bg-gray-800 border-gray-600 text-white placeholder:text-gray-500 focus:border-lime-400 focus:ring-lime-400"
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
                          <FormLabel className="text-gray-300 flex items-center gap-2">
                            <Mail className="h-4 w-4 text-lime-400" />
                            Email Address
                          </FormLabel>
                          <FormControl>
                            <Input
                              {...field}
                              type="email"
                              placeholder="Enter email address"
                              className="bg-gray-800 border-gray-600 text-white placeholder:text-gray-500 focus:border-lime-400 focus:ring-lime-400"
                            />
                          </FormControl>
                          <FormMessage className="text-red-400" />
                        </FormItem>
                      )}
                    />

                    {/* Account Type → bind to `type` to match backend */}
                    <FormField
                      control={form.control}
                      name="type"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-gray-300 flex items-center gap-2">
                            <Building2 className="h-4 w-4 text-lime-400" />
                            Account Type
                          </FormLabel>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                              <SelectTrigger className="bg-gray-800 border-gray-600 text-white focus:border-lime-400 focus:ring-lime-400">
                                <SelectValue placeholder="Select account type" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent className="bg-gray-800 border-gray-600">
                              <SelectItem value="customer" className="text-white hover:bg-gray-700">
                                Customer
                              </SelectItem>
                              <SelectItem value="supplier" className="text-white hover:bg-gray-700">
                                Supplier
                              </SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage className="text-red-400" />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField
                      control={form.control}
                      name="address"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-gray-300 flex items-center gap-2">
                            <MapPin className="h-4 w-4 text-lime-400" />
                            Address
                          </FormLabel>
                          <FormControl>
                            <Textarea
                              {...field}
                              placeholder="Enter address"
                              className="bg-gray-800 border-gray-600 text-white placeholder:text-gray-500 focus:border-lime-400 focus:ring-lime-400 min-h-[80px]"
                            />
                          </FormControl>
                          <FormMessage className="text-red-400" />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="city"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-gray-300 flex items-center gap-2">
                            <Building2 className="h-4 w-4 text-lime-400" />
                            City
                          </FormLabel>
                          <FormControl>
                            <Input
                              {...field}
                              placeholder="Enter city"
                              className="bg-gray-800 border-gray-600 text-white placeholder:text-gray-500 focus:border-lime-400 focus:ring-lime-400"
                            />
                          </FormControl>
                          <FormMessage className="text-red-400" />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="notes"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-gray-300">Notes</FormLabel>
                        <FormControl>
                          <Textarea
                            {...field}
                            placeholder="Additional notes about the customer"
                            className="bg-gray-800 border-gray-600 text-white placeholder:text-gray-500 focus:border-lime-400 focus:ring-lime-400 min-h-[100px]"
                          />
                        </FormControl>
                        <FormMessage className="text-red-400" />
                      </FormItem>
                    )}
                  />

                  {/* Action Buttons */}
                  <div className="flex flex-col-reverse sm:flex-row gap-3 pt-6">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => handleClose()}
                      className="flex-1 bg-transparent border-gray-600 text-gray-300 hover:bg-gray-800 hover:text-white transition-all duration-200"
                      disabled={updateCustomerMutation.isPending}
                    >
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      className="flex-1 bg-lime-500 hover:bg-lime-600 text-black font-medium transition-all duration-200 hover:shadow-lg hover:shadow-lime-500/25"
                      disabled={updateCustomerMutation.isPending}
                    >
                      {updateCustomerMutation.isPending ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Updating...
                        </>
                      ) : (
                        <>
                          <CheckCircle className="h-4 w-4 mr-2" />
                          Update Customer
                        </>
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
