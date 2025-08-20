import { motion, AnimatePresence } from 'framer-motion';
import React from 'react';
import { type Account } from '@/lib/db';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import {
  User,
  Mail,
  Phone,
  MapPin,
  Building2,
  Calendar,
  FileText,
  Eye,
  Edit3,
  Trash2,
} from 'lucide-react';
import { formatCurrency } from '@/lib/utils';

interface ViewCustomerModalProps<T extends Account = Account> {
  open: boolean;
  onClose: () => void;
  /** Your API often stores extra profile fields on the same record.
   *  Extend Account with those optional fields so we can type them safely. */
  customer: (T & {
    email?: string | null;
    address?: string | null;
    city?: string | null;
    notes?: string | null;
    profilePhoto?: string | null;
    accountType?: string | null; // some codebases use `type`, some `accountType`
    type?: string | null;
    createdAt?: string | number | Date | null;
    updatedAt?: string | number | Date | null;
  }) | null;
  balance?: number;
  onEdit?: () => void;
  onDelete?: () => void;
}

export function ViewCustomerModal({
  open,
  onClose,
  customer,
  balance = 0,
  onEdit,
  onDelete,
}: ViewCustomerModalProps) {
  if (!customer) return null;

  const getInitials = (name: string) =>
    name
      .split(' ')
      .filter(Boolean)
      .map((n) => n[0]!)
      .join('')
      .toUpperCase();

  const isAdvance = balance > 0;
  const balanceColor = isAdvance ? 'text-green-400' : 'text-red-400';
  const balanceLabel = isAdvance ? 'Advance' : 'Due';

  const displayType =
    customer.accountType ||
    customer.type ||
    'Customer';

  const created = customer.createdAt ? new Date(customer.createdAt) : null;
  const updated = customer.updatedAt ? new Date(customer.updatedAt) : null;

  return (
    <AnimatePresence>
      {open && (
        <Dialog
          open={open}
          // FIX: onOpenChange gives (nextOpen: boolean) => void
          onOpenChange={(next) => {
            if (!next) onClose();
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
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-lime-500/20 rounded-lg">
                      <Eye className="h-5 w-5 text-lime-400" />
                    </div>
                    <div>
                      <DialogTitle className="text-xl font-semibold text-white">
                        Customer Details
                      </DialogTitle>
                      <DialogDescription className="text-gray-400">
                        View customer information and account details
                      </DialogDescription>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    {onEdit && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={onEdit}
                        className="bg-transparent border-lime-500 text-lime-400 hover:bg-lime-500 hover:text-black transition-all duration-200"
                      >
                        <Edit3 className="h-4 w-4" />
                      </Button>
                    )}
                    {onDelete && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={onDelete}
                        className="bg-transparent border-red-500 text-red-400 hover:bg-red-500 hover:text-white transition-all duration-200"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </div>
              </DialogHeader>

              <div className="space-y-6 mt-6">
                {/* Customer Profile */}
                <Card className="bg-gray-800 border-gray-700">
                  <CardContent className="p-6">
                    <div className="flex flex-col sm:flex-row items-center gap-6">
                      <Avatar className="w-24 h-24 border-2 border-lime-400">
                        {customer.profilePhoto ? (
                          <AvatarImage src={customer.profilePhoto} alt={customer.name} />
                        ) : (
                          <AvatarFallback className="bg-gray-700 text-lime-400 text-lg">
                            {getInitials(customer.name)}
                          </AvatarFallback>
                        )}
                      </Avatar>

                      <div className="flex-1 text-center sm:text-left">
                        <h3 className="text-2xl font-bold text-white mb-2">{customer.name}</h3>
                        <div className="flex flex-wrap gap-2 justify-center sm:justify-start mb-4">
                          <Badge className="bg-lime-500/20 text-lime-400 border-lime-500">
                            {displayType}
                          </Badge>
                          <Badge
                            className={
                              isAdvance
                                ? 'bg-green-500/20 text-green-400 border-green-500'
                                : 'bg-red-500/20 text-red-400 border-red-500'
                            }
                          >
                            {balanceLabel}: {formatCurrency(Math.abs(balance))}
                          </Badge>
                        </div>

                        <div className="text-sm text-gray-400">
                          <div className="flex items-center gap-2 mb-1">
                            <Calendar className="h-4 w-4" />
                            Created:{' '}
                            {created ? created.toLocaleDateString() : '—'}
                          </div>
                          {updated && (
                            <div className="flex items-center gap-2">
                              <Calendar className="h-4 w-4" />
                              Updated: {updated.toLocaleDateString()}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Contact Information */}
                {(customer.phone || customer.email || customer.city || customer.address) && (
                  <Card className="bg-gray-800 border-gray-700">
                    <CardContent className="p-6">
                      <h4 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                        <Phone className="h-5 w-5 text-lime-400" />
                        Contact Information
                      </h4>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {customer.phone && (
                          <div className="flex items-center gap-3 p-3 bg-gray-700/50 rounded-lg">
                            <Phone className="h-4 w-4 text-lime-400" />
                            <div>
                              <p className="text-sm text-gray-400">Phone</p>
                              <p className="text-white">{customer.phone}</p>
                            </div>
                          </div>
                        )}

                        {customer.email && (
                          <div className="flex items-center gap-3 p-3 bg-gray-700/50 rounded-lg">
                            <Mail className="h-4 w-4 text-lime-400" />
                            <div>
                              <p className="text-sm text-gray-400">Email</p>
                              <p className="text-white">{customer.email}</p>
                            </div>
                          </div>
                        )}

                        {customer.city && (
                          <div className="flex items-center gap-3 p-3 bg-gray-700/50 rounded-lg">
                            <Building2 className="h-4 w-4 text-lime-400" />
                            <div>
                              <p className="text-sm text-gray-400">City</p>
                              <p className="text-white">{customer.city}</p>
                            </div>
                          </div>
                        )}

                        {customer.address && (
                          <div className="flex items-start gap-3 p-3 bg-gray-700/50 rounded-lg md:col-span-2">
                            <MapPin className="h-4 w-4 text-lime-400 mt-1" />
                            <div>
                              <p className="text-sm text-gray-400">Address</p>
                              <p className="text-white">{customer.address}</p>
                            </div>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Account Balance */}
                <Card className="bg-gray-800 border-gray-700">
                  <CardContent className="p-6">
                    <h4 className="text-lg font-semibold text-white mb-4">Account Balance</h4>
                    <div className="text-center p-6 bg-gray-700/50 rounded-lg">
                      <p className="text-sm text-gray-400 mb-2">{balanceLabel}</p>
                      <p className={`text-3xl font-bold ${balanceColor}`}>
                        {formatCurrency(Math.abs(balance))}
                      </p>
                    </div>
                  </CardContent>
                </Card>

                {/* Notes */}
                {customer.notes && (
                  <Card className="bg-gray-800 border-gray-700">
                    <CardContent className="p-6">
                      <h4 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                        <FileText className="h-5 w-5 text-lime-400" />
                        Notes
                      </h4>
                      <div className="p-4 bg-gray-700/50 rounded-lg">
                        <p className="text-gray-300 whitespace-pre-wrap">{customer.notes}</p>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Close */}
                <div className="flex justify-end pt-4">
                  <Button
                    onClick={onClose}
                    className="bg-gray-700 hover:bg-gray-600 text-white transition-all duration-200"
                  >
                    Close
                  </Button>
                </div>
              </div>
            </motion.div>
          </DialogContent>
        </Dialog>
      )}
    </AnimatePresence>
  );
}
