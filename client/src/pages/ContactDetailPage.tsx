import { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../lib/api';
import { format } from 'date-fns';
import { Modal } from '../components/Modal';
import { ContactForm } from '../components/ContactForm';
import { InteractionTimeline } from '../components/InteractionTimeline';
import type { UpdateContactInput } from '../types';

/**
 * Contact detail page - displays full information for a single contact
 */
export function ContactDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isAddInteractionModalOpen, setIsAddInteractionModalOpen] = useState(false);

  const { data: contact, isLoading, error } = useQuery({
    queryKey: ['contact', id],
    queryFn: () => api.getContactById(id!),
    enabled: !!id,
  });

  // Update contact mutation
  const updateMutation = useMutation({
    mutationFn: (data: UpdateContactInput) => api.updateContact(id!, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contact', id] });
      queryClient.invalidateQueries({ queryKey: ['contacts'] });
      setIsEditModalOpen(false);
    },
  });

  // Delete contact mutation
  const deleteMutation = useMutation({
    mutationFn: () => api.deleteContact(id!),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contacts'] });
      navigate('/contacts');
    },
  });

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow p-12 text-center">
          <div className="inline-block w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="mt-4 text-gray-600">Loading contact...</p>
        </div>
      </div>
    );
  }

  if (error || !contact) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6">
          <h3 className="text-red-900 font-semibold mb-2">Contact Not Found</h3>
          <p className="text-red-700 mb-4">
            {(error as any)?.error?.message || 'This contact could not be found.'}
          </p>
          <Link to="/contacts" className="text-blue-600 hover:text-blue-800 font-medium">
            ← Back to Contacts
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate('/contacts')}
            className="text-gray-600 hover:text-gray-900"
          >
            ← Back
          </button>
          <h1 className="text-3xl font-bold text-gray-900">
            {contact.firstName} {contact.lastName}
          </h1>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => setIsEditModalOpen(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors font-medium"
          >
            Edit Contact
          </button>
          <button
            onClick={() => setIsDeleteModalOpen(true)}
            className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors font-medium"
          >
            Delete
          </button>
        </div>
      </div>

      {/* Edit Contact Modal */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        title="Edit Contact"
        size="xl"
      >
        <ContactForm
          contact={contact}
          onSubmit={async (data) => {
            await updateMutation.mutateAsync(data);
          }}
          onCancel={() => setIsEditModalOpen(false)}
          isLoading={updateMutation.isPending}
        />
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        title="Delete Contact"
        size="sm"
      >
        <div className="space-y-4">
          <p className="text-gray-700">
            Are you sure you want to delete <strong>{contact?.firstName} {contact?.lastName}</strong>?
            This action cannot be undone.
          </p>
          <div className="flex justify-end gap-3">
            <button
              onClick={() => setIsDeleteModalOpen(false)}
              disabled={deleteMutation.isPending}
              className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors font-medium disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              onClick={() => deleteMutation.mutate()}
              disabled={deleteMutation.isPending}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium disabled:opacity-50 flex items-center gap-2"
            >
              {deleteMutation.isPending && (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              )}
              Delete Contact
            </button>
          </div>
        </div>
      </Modal>

      {/* Contact Information */}
      <div className="bg-white rounded-lg shadow divide-y divide-gray-200">
        {/* Basic Info Section */}
        <div className="p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Contact Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <InfoField label="Email" value={contact.email} type="email" />
            <InfoField label="Phone" value={contact.phone} type="phone" />
            <InfoField label="Company" value={contact.company} />
            <InfoField label="Job Title" value={contact.jobTitle} />
            <InfoField label="Address" value={contact.address} />
            <InfoField 
              label="Birthday" 
              value={contact.birthday ? format(new Date(contact.birthday), 'MMMM d, yyyy') : undefined} 
            />
          </div>
        </div>

        {/* Social Media Section */}
        {contact.socialMedia && Object.keys(contact.socialMedia).length > 0 && (
          <div className="p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Social Media</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {Object.entries(contact.socialMedia).map(([platform, username]) => (
                <div key={platform} className="flex items-center gap-2">
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800 capitalize">
                    {platform}
                  </span>
                  <span className="text-gray-900">{username}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Metadata Section */}
        <div className="p-6 bg-gray-50">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Metadata</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <InfoField 
              label="Created" 
              value={format(new Date(contact.createdAt), 'PPpp')} 
            />
            <InfoField 
              label="Last Updated" 
              value={format(new Date(contact.updatedAt), 'PPpp')} 
            />
            <InfoField label="Contact ID" value={contact.id} mono />
          </div>
        </div>
      </div>

      {/* Interactions Timeline */}
      <InteractionTimeline
        contactId={id!}
        onAddInteraction={() => setIsAddInteractionModalOpen(true)}
      />

      {/* Add Interaction Modal - Form will be implemented in Chunk 2.5 */}
      <Modal
        isOpen={isAddInteractionModalOpen}
        onClose={() => setIsAddInteractionModalOpen(false)}
        title="Add Interaction"
        size="lg"
      >
        <div className="text-center py-8 text-gray-500">
          <p>Interaction form coming in Chunk 2.5</p>
          <button
            onClick={() => setIsAddInteractionModalOpen(false)}
            className="mt-4 px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300 transition-colors"
          >
            Close
          </button>
        </div>
      </Modal>

      {/* Future: Reminders and Notes sections will go here */}
      <div className="bg-gray-100 border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
        <p className="text-gray-600">
          Reminders and Notes will appear here in Phase 3-4
        </p>
      </div>
    </div>
  );
}

/**
 * Reusable info field component
 */
function InfoField({ 
  label, 
  value, 
  type, 
  mono = false 
}: { 
  label: string; 
  value?: string | null; 
  type?: 'email' | 'phone';
  mono?: boolean;
}) {
  if (!value) {
    return (
      <div>
        <label className="block text-sm font-medium text-gray-500 mb-1">{label}</label>
        <p className="text-gray-400">—</p>
      </div>
    );
  }

  let displayValue = value;
  let href: string | undefined;

  if (type === 'email') {
    href = `mailto:${value}`;
  } else if (type === 'phone') {
    href = `tel:${value}`;
  }

  return (
    <div>
      <label className="block text-sm font-medium text-gray-500 mb-1">{label}</label>
      {href ? (
        <a 
          href={href} 
          className="text-blue-600 hover:text-blue-800 font-medium"
        >
          {displayValue}
        </a>
      ) : (
        <p className={mono ? 'text-gray-900 font-mono text-xs' : 'text-gray-900'}>
          {displayValue}
        </p>
      )}
    </div>
  );
}
