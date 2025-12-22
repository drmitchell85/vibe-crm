import { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../lib/api';
import { format } from 'date-fns';
import { Modal } from '../components/Modal';
import { ContactForm } from '../components/ContactForm';
import { InteractionForm } from '../components/InteractionForm';
import { InteractionTimeline } from '../components/InteractionTimeline';
import { RemindersList } from '../components/RemindersList';
import { ReminderForm } from '../components/ReminderForm';
import { LoadingState, Spinner } from '../components/ui';
import type { UpdateContactInput, Interaction, CreateInteractionInput, UpdateInteractionInput, Reminder, CreateReminderInput, UpdateReminderInput } from '../types';

/**
 * Contact detail page - displays full information for a single contact
 */
export function ContactDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isInteractionModalOpen, setIsInteractionModalOpen] = useState(false);
  const [editingInteraction, setEditingInteraction] = useState<Interaction | null>(null);
  const [isReminderModalOpen, setIsReminderModalOpen] = useState(false);
  const [editingReminder, setEditingReminder] = useState<Reminder | null>(null);

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

  // Create interaction mutation
  const createInteractionMutation = useMutation({
    mutationFn: (data: CreateInteractionInput) => api.createInteraction(id!, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['interactions', id] });
      closeInteractionModal();
    },
  });

  // Update interaction mutation
  const updateInteractionMutation = useMutation({
    mutationFn: ({ interactionId, data }: { interactionId: string; data: UpdateInteractionInput }) =>
      api.updateInteraction(interactionId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['interactions', id] });
      closeInteractionModal();
    },
  });

  // Delete interaction mutation
  const deleteInteractionMutation = useMutation({
    mutationFn: (interactionId: string) => api.deleteInteraction(interactionId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['interactions', id] });
      closeInteractionModal();
    },
  });

  // Create reminder mutation
  const createReminderMutation = useMutation({
    mutationFn: (data: CreateReminderInput) => api.createReminder(id!, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reminders'] });
      closeReminderModal();
    },
  });

  // Update reminder mutation
  const updateReminderMutation = useMutation({
    mutationFn: ({ reminderId, data }: { reminderId: string; data: UpdateReminderInput }) =>
      api.updateReminder(reminderId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reminders'] });
      closeReminderModal();
    },
  });

  // Delete reminder mutation
  const deleteReminderMutation = useMutation({
    mutationFn: (reminderId: string) => api.deleteReminder(reminderId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reminders'] });
      closeReminderModal();
    },
  });

  // Handlers for interaction modal
  const openAddInteractionModal = () => {
    setEditingInteraction(null);
    setIsInteractionModalOpen(true);
  };

  const openEditInteractionModal = (interaction: Interaction) => {
    setEditingInteraction(interaction);
    setIsInteractionModalOpen(true);
  };

  const closeInteractionModal = () => {
    setIsInteractionModalOpen(false);
    setEditingInteraction(null);
  };

  const handleInteractionSubmit = async (data: CreateInteractionInput | UpdateInteractionInput) => {
    if (editingInteraction) {
      await updateInteractionMutation.mutateAsync({
        interactionId: editingInteraction.id,
        data: data as UpdateInteractionInput,
      });
    } else {
      await createInteractionMutation.mutateAsync(data as CreateInteractionInput);
    }
  };

  const handleInteractionDelete = () => {
    if (editingInteraction) {
      deleteInteractionMutation.mutate(editingInteraction.id);
    }
  };

  // Handlers for reminder modal
  const openAddReminderModal = () => {
    setEditingReminder(null);
    setIsReminderModalOpen(true);
  };

  const openEditReminderModal = (reminder: Reminder) => {
    setEditingReminder(reminder);
    setIsReminderModalOpen(true);
  };

  const closeReminderModal = () => {
    setIsReminderModalOpen(false);
    setEditingReminder(null);
  };

  const handleReminderSubmit = async (data: CreateReminderInput | UpdateReminderInput) => {
    if (editingReminder) {
      await updateReminderMutation.mutateAsync({
        reminderId: editingReminder.id,
        data: data as UpdateReminderInput,
      });
    } else {
      await createReminderMutation.mutateAsync(data as CreateReminderInput);
    }
  };

  const handleReminderDelete = () => {
    if (editingReminder) {
      deleteReminderMutation.mutate(editingReminder.id);
    }
  };

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow">
          <LoadingState message="Loading contact..." size="lg" />
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
              {deleteMutation.isPending && <Spinner size="xs" color="white" />}
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
        onAddInteraction={openAddInteractionModal}
        onEditInteraction={openEditInteractionModal}
      />

      {/* Create/Edit Interaction Modal */}
      <Modal
        isOpen={isInteractionModalOpen}
        onClose={closeInteractionModal}
        title={editingInteraction ? 'Edit Interaction' : 'Log Interaction'}
        size="lg"
      >
        <InteractionForm
          interaction={editingInteraction || undefined}
          onSubmit={handleInteractionSubmit}
          onCancel={closeInteractionModal}
          onDelete={editingInteraction ? handleInteractionDelete : undefined}
          isLoading={createInteractionMutation.isPending || updateInteractionMutation.isPending}
          isDeleting={deleteInteractionMutation.isPending}
        />
      </Modal>

      {/* Reminders Section */}
      <RemindersList
        contactId={id!}
        onAddReminder={openAddReminderModal}
        onEditReminder={openEditReminderModal}
      />

      {/* Create/Edit Reminder Modal */}
      <Modal
        isOpen={isReminderModalOpen}
        onClose={closeReminderModal}
        title={editingReminder ? 'Edit Reminder' : 'Add Reminder'}
        size="lg"
      >
        <ReminderForm
          reminder={editingReminder || undefined}
          onSubmit={handleReminderSubmit}
          onCancel={closeReminderModal}
          onDelete={editingReminder ? handleReminderDelete : undefined}
          isLoading={createReminderMutation.isPending || updateReminderMutation.isPending}
          isDeleting={deleteReminderMutation.isPending}
        />
      </Modal>

      {/* Future: Notes section will go here */}
      <div className="bg-gray-100 border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
        <p className="text-gray-600">
          Notes will appear here in Phase 4
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
