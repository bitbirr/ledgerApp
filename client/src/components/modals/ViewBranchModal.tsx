import { motion, AnimatePresence } from 'framer-motion';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import {
  MapPin,
  Building2,
  Phone,
  Mail,
  Globe,
  Calendar,
  Eye,
  CheckCircle,
  XCircle,
} from 'lucide-react';
import type { Branch } from '@/lib/api';

interface ViewBranchModalProps {
  isOpen: boolean;
  onClose: () => void;
  branch: Branch | null;
}

function formatDateSafe(input: unknown) {
  if (!input) return '—';
  const d = new Date(input as any);
  return isNaN(d.getTime())
    ? '—'
    : d.toLocaleString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
}

function withProtocol(url?: string) {
  if (!url) return '';
  if (/^https?:\/\//i.test(url)) return url;
  return `https://${url}`;
}

export function ViewBranchModal({ isOpen, onClose, branch }: ViewBranchModalProps) {
  if (!branch) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <Dialog
          open={isOpen}
          // FIX: shadcn Dialog expects (nextOpen: boolean) => void
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
                <DialogTitle className="text-2xl font-bold text-lime-400 flex items-center gap-2">
                  <Eye className="h-6 w-6" />
                  Branch Details
                </DialogTitle>
                <DialogDescription className="text-gray-300">
                  Complete information about {branch.name}
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-6 mt-6">
                {/* Status and Basic Info */}
                <Card className="bg-gray-800 border-gray-700">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <Building2 className="h-8 w-8 text-lime-400" />
                        <div>
                          <h3 className="text-xl font-bold text-white">{branch.name}</h3>
                          <p className="text-gray-400">Code: {branch.code}</p>
                        </div>
                      </div>
                      <Badge
                        variant={branch.isActive ? 'default' : 'destructive'}
                        className={`flex items-center gap-1 ${
                          branch.isActive
                            ? 'bg-green-900 text-green-100 border-green-700'
                            : 'bg-red-900 text-red-100 border-red-700'
                        }`}
                      >
                        {branch.isActive ? (
                          <CheckCircle className="h-3 w-3" />
                        ) : (
                          <XCircle className="h-3 w-3" />
                        )}
                        {branch.isActive ? 'Active' : 'Inactive'}
                      </Badge>
                    </div>
                    {branch.description && (
                      <p className="text-gray-300 bg-gray-900 p-3 rounded-lg">
                        {branch.description}
                      </p>
                    )}
                  </CardContent>
                </Card>

                {/* Address Information */}
                <Card className="bg-gray-800 border-gray-700">
                  <CardContent className="p-6">
                    <h4 className="text-lg font-semibold text-green-400 mb-4 flex items-center gap-2">
                      <MapPin className="h-5 w-5" />
                      Address Information
                    </h4>
                    <div className="space-y-3">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="text-sm text-gray-400">Street Address</label>
                          <p className="text-white font-medium">
                            {branch.address || 'Not provided'}
                          </p>
                        </div>
                        <div>
                          <label className="text-sm text-gray-400">City</label>
                          <p className="text-white font-medium">
                            {branch.city || 'Not provided'}
                          </p>
                        </div>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="text-sm text-gray-400">State/Province</label>
                          <p className="text-white font-medium">
                            {branch.state || 'Not provided'}
                          </p>
                        </div>
                        <div>
                          <label className="text-sm text-gray-400">ZIP/Postal Code</label>
                          <p className="text-white font-medium">
                            {branch.zipCode || 'Not provided'}
                          </p>
                        </div>
                      </div>
                      <div>
                        <label className="text-sm text-gray-400">Country</label>
                        <p className="text-white font-medium">
                          {branch.country || 'Not provided'}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Contact Information */}
                <Card className="bg-gray-800 border-gray-700">
                  <CardContent className="p-6">
                    <h4 className="text-lg font-semibold text-green-400 mb-4 flex items-center gap-2">
                      <Phone className="h-5 w-5" />
                      Contact Information
                    </h4>
                    <div className="space-y-3">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="text-sm text-gray-400 flex items-center gap-1">
                            <Phone className="h-3 w-3" />
                            Phone Number
                          </label>
                          <p className="text-white font-medium">
                            {branch.phone || 'Not provided'}
                          </p>
                        </div>
                        <div>
                          <label className="text-sm text-gray-400 flex items-center gap-1">
                            <Mail className="h-3 w-3" />
                            Email Address
                          </label>
                          <p className="text-white font-medium">
                            {branch.email || 'Not provided'}
                          </p>
                        </div>
                      </div>
                      <div>
                        <label className="text-sm text-gray-400 flex items-center gap-1">
                          <Globe className="h-3 w-3" />
                          Website
                        </label>
                        {branch.website ? (
                          <a
                            href={withProtocol(branch.website)}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-lime-400 hover:text-lime-300 font-medium underline break-all"
                          >
                            {branch.website}
                          </a>
                        ) : (
                          <p className="text-white font-medium">Not provided</p>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Timestamps */}
                <Card className="bg-gray-800 border-gray-700">
                  <CardContent className="p-6">
                    <h4 className="text-lg font-semibold text-green-400 mb-4 flex items-center gap-2">
                      <Calendar className="h-5 w-5" />
                      Timeline
                    </h4>
                    <div className="space-y-3">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="text-sm text-gray-400">Created</label>
                          <p className="text-white font-medium">
                            {formatDateSafe((branch as any).createdAt)}
                          </p>
                        </div>
                        <div>
                          <label className="text-sm text-gray-400">Last Updated</label>
                          <p className="text-white font-medium">
                            {formatDateSafe((branch as any).updatedAt)}
                          </p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Actions */}
              <div className="flex justify-end pt-6 border-t border-gray-700">
                <Button
                  onClick={onClose}
                  className="bg-lime-500 hover:bg-lime-600 text-black font-semibold transition-all duration-200 hover:shadow-lg hover:shadow-lime-500/25"
                >
                  Close
                </Button>
              </div>
            </motion.div>
          </DialogContent>
        </Dialog>
      )}
    </AnimatePresence>
  );
}
