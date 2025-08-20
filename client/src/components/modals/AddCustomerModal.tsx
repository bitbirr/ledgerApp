import React, { useState, useRef, useEffect } from 'react';
import { z } from 'zod'; // ← IMPORTANT
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { insertAccountSchema } from '@shared/schema';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import { motion, AnimatePresence } from 'framer-motion';

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
import { Badge } from '@/components/ui/badge';
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
} from 'lucide-react';

interface AddCustomerModalProps {
  open: boolean;
  onClose: () => void;
}

/**
 * Extend the base schema with extra profile fields.
 * We accept "" (empty string) for optional text inputs to play nicely with RHF defaults.
 */
const enhancedCustomerSchema = insertAccountSchema.extend({
  // if base schema already defines these, our definition will override (safe in Zod)
  email: z.string().email('Invalid email address').optional().or(z.literal('')),
  address: z.string().max(500, 'Address must be less than 500 characters').optional().or(z.literal('')),
  city: z.string().max(100, 'City must be less than 100 characters').optional().or(z.literal('')),
  notes: z.string().max(1000, 'Notes must be less than 1000 characters').optional().or(z.literal('')),
  photoUrl: z.string().url('Invalid image URL').optional().or(z.literal('')), // used by avatar preview
  archived: z.boolean().optional().default(false), // included in defaultValues
  // Some bases require phone; here we allow empty string to avoid validation fights with inputs:
  phone: z.string().optional().or(z.literal('')),
  // If you default to "general", make sure schema allows arbitrary strings:
  categoryId: z.string().optional().or(z.literal('')),
});

type EnhancedCustomer = z.infer<typeof enhancedCustomerSchema>;

export function AddCustomerModal({ open, onClose }: AddCustomerModalProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [photoPreview, setPhotoPreview] = useState<string>('');
  const [blobUrl, setBlobUrl] = useState<string>(''); // for cleanup
  const [uploadingPhoto, setUploadingPhoto] = useState(false);

  const form = useForm<EnhancedCustomer>({
    resolver: zodResolver(enhancedCustomerSchema),
    defaultValues: {
      name: '',
      phone: '',
      email: '',
      address: '',
      city: '',
      type: 'customer',
      categoryId: 'general',
      photoUrl: '',
      notes: '',
      archived: false,
    },
  });

  // Clean up object URL when component unmounts or when we replace it
  useEffect(() => {
    return () => {
      if (blobUrl) URL.revokeObjectURL(blobUrl);
    };
  }, [blobUrl]);

  const createAccountMutation = useMutation({
    mutationFn: async (data: EnhancedCustomer) => {
      // prepare payload (strip empty strings)
      const payload = {
        name: data.name.trim(),
        phone: data.phone?.trim() || undefined,
        email: data.email?.trim() || undefined,
        address: data.address?.trim() || undefined,
        city: data.city?.trim() || undefined,
        type: data.type,
        categoryId: data.categoryId && data.categoryId !== 'general' ? data.categoryId : undefined,
        photoUrl: data.photoUrl || undefined,
        notes: data.notes?.trim() || undefined,
        archived: !!data.archived,
      };

      const res = await fetch('/api/accounts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'user-id': 'default-user',     // TODO: replace with real user/business IDs from your auth/store
          'business-id': 'default-business',
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || `Failed to create customer (${res.status})`);
      }

      return await res.json();
    },
    onSuccess: (data: any) => {
      queryClient.invalidateQueries({ queryKey: ['accounts'] });
      queryClient.invalidateQueries({ queryKey: ['account-summary'] });
      queryClient.invalidateQueries({ queryKey: ['customers'] });

      toast({
        title: 'Success',
        description: `Customer "${data.name}" added successfully`,
        duration: 5000,
      });

      form.reset();
      setPhotoPreview('');
      if (blobUrl) {
        URL.revokeObjectURL(blobUrl);
        setBlobUrl('');
      }
      onClose();
    },
    onError: (error: any) => {
      console.error('Customer creation error:', error);
      toast({
        title: 'Error',
        description: error?.message || 'Failed to add customer. Please try again.',
        variant: 'destructive',
        duration: 7000,
      });
    },
  });

  const handlePhotoUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast({
        title: 'Invalid File',
        description: 'Please select an image file',
        variant: 'destructive',
      });
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: 'File Too Large',
        description: 'Image must be less than 5MB',
        variant: 'destructive',
      });
      return;
    }

    setUploadingPhoto(true);

    try {
      // Release previous URL if any
      if (blobUrl) {
        URL.revokeObjectURL(blobUrl);
        setBlobUrl('');
      }

      // Make an object URL for preview & save
      const url = URL.createObjectURL(file);
      setPhotoPreview(url);
      setBlobUrl(url);
      form.setValue('photoUrl', url, { shouldDirty: true });

      // If you upload to external storage, do it here, then set the final CDN URL into 'photoUrl'
      // const cdnUrl = await uploadToStorage(file);
      // form.setValue('photoUrl', cdnUrl, { shouldDirty: true });
      // URL.revokeObjectURL(url); setBlobUrl('');

    } catch {
      toast({
        title: 'Upload Failed',
        description: 'Failed to upload photo. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setUploadingPhoto(false);
    }
  };

  const onSubmit = (data: EnhancedCustomer) => {
    createAccountMutation.mutate(data);
  };

  const handleClose = () => {
    if (createAccountMutation.isPending) {
      toast({
        title: 'Please Wait',
        description: 'Customer is being saved. Please wait...',
      });
      return;
    }
    form.reset();
    setPhotoPreview('');
    if (blobUrl) {
      URL.revokeObjectURL(blobUrl);
      setBlobUrl('');
    }
    onClose();
  };

  return (
    <AnimatePresence>
      {open && (
        <Dialog open={open} onOpenChange={(next) => !next && handleClose()}>
          <DialogContent className="bg-gray-900 border-gray-700 text-white max-w-2xl max-h-[90vh] overflow-y-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.2 }}
            >
              <DialogHeader className="border-b border-gray-700 pb-4">
                <div className="flex justify-between items-center">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-lime-500/20 rounded-lg">
                      <User className="h-5 w-5 text-lime-400" />
                    </div>
                    <div>
                      <DialogTitle className="text-xl font-semibold text-white">
                        Add New Customer
                      </DialogTitle>
                      <DialogDescription className="text-gray-400 mt-1">
                        Create a comprehensive customer profile with contact details
                      </DialogDescription>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0 text-gray-400 hover:text-white hover:bg-gray-800 transition-colors"
                    onClick={handleClose}
                    disabled={createAccountMutation.isPending}
                    data-testid="button-close-modal"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </DialogHeader>

              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 pt-6">
                  {/* Photo Upload */}
                  <motion.div
                    className="flex flex-col items-center space-y-4 p-6 bg-gray-800/50 rounded-lg border border-gray-700"
                    whileHover={{ borderColor: '#84cc16' }}
                    transition={{ duration: 0.2 }}
                  >
                    <div className="relative">
                      <Avatar className="w-24 h-24 border-2 border-lime-400/50 shadow-lg">
                        {photoPreview ? (
                          <AvatarImage src={photoPreview} alt="Customer photo" />
                        ) : (
                          <AvatarFallback className="bg-gray-700 text-gray-300">
                            <User className="h-8 w-8" />
                          </AvatarFallback>
                        )}
                      </Avatar>
                      {uploadingPhoto && (
                        <div className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-full">
                          <Loader2 className="h-6 w-6 animate-spin text-lime-400" />
                        </div>
                      )}
                    </div>
                    <div className="flex space-x-2">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        className="border-lime-400/50 text-lime-400 hover:bg-lime-400/10 hover:border-lime-400 transition-all duration-200"
                        onClick={() => fileInputRef.current?.click()}
                        disabled={uploadingPhoto}
                        data-testid="button-choose-photo"
                      >
                        <Upload className="h-4 w-4 mr-2" />
                        {uploadingPhoto ? 'Uploading...' : 'Choose Photo'}
                      </Button>
                      {photoPreview && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="text-gray-400 hover:text-white"
                          onClick={() => {
                            setPhotoPreview('');
                            form.setValue('photoUrl', '', { shouldDirty: true });
                            if (blobUrl) {
                              URL.revokeObjectURL(blobUrl);
                              setBlobUrl('');
                            }
                          }}
                        >
                          Remove
                        </Button>
                      )}
                    </div>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handlePhotoUpload}
                      className="hidden"
                    />
                  </motion.div>

                  {/* Fields */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField
                      control={form.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem className="md:col-span-2">
                          <FormLabel className="text-white font-medium flex items-center">
                            <User className="h-4 w-4 mr-2 text-lime-400" />
                            Customer Name *
                          </FormLabel>
                          <FormControl>
                            <Input
                              placeholder="Enter full customer name"
                              className="bg-gray-800 border-gray-600 text-white placeholder:text-gray-400 focus:border-lime-400 focus:ring-lime-400/20 transition-all duration-200"
                              {...field}
                              data-testid="input-customer-name"
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
                          <FormLabel className="text-white font-medium flex items-center">
                            <Phone className="h-4 w-4 mr-2 text-lime-300" />
                            Phone Number
                          </FormLabel>
                          <FormControl>
                            <Input
                              type="tel"
                              placeholder="+251 9XX XX XX XX"
                              className="bg-gray-800 border-gray-600 text-white placeholder:text-gray-400 focus:border-lime-400 focus:ring-lime-400/20 transition-all duration-200"
                              {...field}
                              data-testid="input-customer-phone"
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
                          <FormLabel className="text-white font-medium flex items-center">
                            <Mail className="h-4 w-4 mr-2 text-lime-300" />
                            Email Address
                          </FormLabel>
                          <FormControl>
                            <Input
                              type="email"
                              placeholder="customer@example.com"
                              className="bg-gray-800 border-gray-600 text-white placeholder:text-gray-400 focus:border-lime-400 focus:ring-lime-400/20 transition-all duration-200"
                              {...field}
                              data-testid="input-customer-email"
                            />
                          </FormControl>
                          <FormMessage className="text-red-400" />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="address"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-white font-medium flex items-center">
                            <MapPin className="h-4 w-4 mr-2 text-lime-300" />
                            Address
                          </FormLabel>
                          <FormControl>
                            <Input
                              placeholder="Street address"
                              className="bg-gray-800 border-gray-600 text-white placeholder:text-gray-400 focus:border-lime-400 focus:ring-lime-400/20 transition-all duration-200"
                              {...field}
                              data-testid="input-customer-address"
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
                          <FormLabel className="text-white font-medium flex items-center">
                            <Building2 className="h-4 w-4 mr-2 text-lime-300" />
                            City
                          </FormLabel>
                          <FormControl>
                            <Input
                              placeholder="City name"
                              className="bg-gray-800 border-gray-600 text-white placeholder:text-gray-400 focus:border-lime-400 focus:ring-lime-400/20 transition-all duration-200"
                              {...field}
                              data-testid="input-customer-city"
                            />
                          </FormControl>
                          <FormMessage className="text-red-400" />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="type"
                      render={({ field }) => (
                        <FormItem className="md:col-span-2">
                          <FormLabel className="text-white font-medium">Account Type</FormLabel>
                          <Select value={field.value} onValueChange={field.onChange}>
                            <FormControl>
                              <SelectTrigger
                                className="bg-gray-800 border-gray-600 text-white focus:border-lime-400 focus:ring-lime-400/20 transition-all duration-200"
                                data-testid="select-customer-type"
                              >
                                <SelectValue placeholder="Select account type" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent className="bg-gray-800 border-gray-600">
                              <SelectItem value="customer" className="text-white hover:bg-gray-700">
                                <div className="flex items-center">
                                  <Badge variant="secondary" className="mr-2 bg-blue-500/20 text-blue-400">
                                    Customer
                                  </Badge>
                                  Regular customer account
                                </div>
                              </SelectItem>
                              <SelectItem value="supplier" className="text-white hover:bg-gray-700">
                                <div className="flex items-center">
                                  <Badge variant="secondary" className="mr-2 bg-orange-500/20 text-orange-400">
                                    Supplier
                                  </Badge>
                                  Supplier/vendor account
                                </div>
                              </SelectItem>
                              <SelectItem value="other" className="text-white hover:bg-gray-700">
                                <div className="flex items-center">
                                  <Badge variant="secondary" className="mr-2 bg-gray-500/20 text-gray-400">
                                    Other
                                  </Badge>
                                  Other account type
                                </div>
                              </SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage className="text-red-400" />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="notes"
                      render={({ field }) => (
                        <FormItem className="md:col-span-2">
                          <FormLabel className="text-white font-medium">Notes</FormLabel>
                          <FormControl>
                            <Textarea
                              placeholder="Additional notes about the customer..."
                              className="bg-gray-800 border-gray-600 text-white placeholder:text-gray-400 focus:border-lime-400 focus:ring-lime-400/20 transition-all duration-200 min-h-[80px]"
                              {...field}
                              data-testid="textarea-customer-notes"
                            />
                          </FormControl>
                          <FormMessage className="text-red-400" />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="flex justify-end space-x-3 pt-6 border-t border-gray-700">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={handleClose}
                      disabled={createAccountMutation.isPending}
                      className="border-gray-600 text-gray-300 hover:bg-gray-800 hover:text-white transition-all duration-200"
                    >
                      Cancel
                    </Button>
                    <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                      <Button
                        type="submit"
                        className="bg-lime-500 hover:bg-lime-600 text-black font-medium px-6 transition-all duration-200 shadow-lg hover:shadow-lime-500/25"
                        disabled={createAccountMutation.isPending}
                      >
                        {createAccountMutation.isPending ? (
                          <>
                            <Loader2 className="animate-spin h-4 w-4 mr-2" />
                            Creating Customer...
                          </>
                        ) : (
                          <>
                            <CheckCircle className="h-4 w-4 mr-2" />
                            Add Customer
                          </>
                        )}
                      </Button>
                    </motion.div>
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
