import { useState, FormEvent } from 'react';
import type { Contact, CreateContactInput, UpdateContactInput } from '../types';
import { FormError } from './ui';
import {
  inputStyles,
  labelStyles,
  primaryButtonStyles,
  secondaryButtonStyles,
} from '../lib/formStyles';

interface ContactFormProps {
  contact?: Contact; // If provided, form is in "edit" mode
  onSubmit: (data: CreateContactInput | UpdateContactInput) => Promise<void>;
  onCancel: () => void;
  isLoading?: boolean;
}

/**
 * Reusable contact form component for creating and editing contacts
 */
export function ContactForm({ contact, onSubmit, onCancel, isLoading = false }: ContactFormProps) {
  const isEditMode = !!contact;

  // Form state
  const [formData, setFormData] = useState({
    firstName: contact?.firstName || '',
    lastName: contact?.lastName || '',
    email: contact?.email || '',
    phone: contact?.phone || '',
    company: contact?.company || '',
    jobTitle: contact?.jobTitle || '',
    address: contact?.address || '',
    birthday: contact?.birthday ? contact.birthday.split('T')[0] : '',
  });

  // Social media state - stored as array of {platform, username} for easier editing
  const [socialMedia, setSocialMedia] = useState<Array<{ platform: string; username: string }>>(
    contact?.socialMedia
      ? Object.entries(contact.socialMedia).map(([platform, username]) => ({ platform, username }))
      : []
  );

  const [error, setError] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleAddSocialMedia = () => {
    setSocialMedia([...socialMedia, { platform: '', username: '' }]);
  };

  const handleRemoveSocialMedia = (index: number) => {
    setSocialMedia(socialMedia.filter((_, i) => i !== index));
  };

  const handleSocialMediaChange = (index: number, field: 'platform' | 'username', value: string) => {
    const updated = [...socialMedia];
    updated[index][field] = value;
    setSocialMedia(updated);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);

    try {
      // Convert socialMedia array to object
      const socialMediaObject = socialMedia
        .filter((item) => item.platform && item.username) // Only include completed entries
        .reduce((acc, item) => {
          acc[item.platform] = item.username;
          return acc;
        }, {} as Record<string, string>);

      const submitData: CreateContactInput = {
        ...formData,
        socialMedia: Object.keys(socialMediaObject).length > 0 ? socialMediaObject : undefined,
        birthday: formData.birthday || undefined,
      };

      await onSubmit(submitData);
    } catch (err: any) {
      setError(err?.error?.message || 'Failed to save contact');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Error Message */}
      <FormError message={error} />

      {/* Basic Information */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Basic Information</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="firstName" className={labelStyles}>
              First Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="firstName"
              name="firstName"
              value={formData.firstName}
              onChange={handleChange}
              required
              className={inputStyles}
            />
          </div>

          <div>
            <label htmlFor="lastName" className={labelStyles}>
              Last Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="lastName"
              name="lastName"
              value={formData.lastName}
              onChange={handleChange}
              required
              className={inputStyles}
            />
          </div>

          <div>
            <label htmlFor="email" className={labelStyles}>
              Email
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className={inputStyles}
            />
          </div>

          <div>
            <label htmlFor="phone" className={labelStyles}>
              Phone
            </label>
            <input
              type="tel"
              id="phone"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              className={inputStyles}
            />
          </div>

          <div>
            <label htmlFor="company" className={labelStyles}>
              Company
            </label>
            <input
              type="text"
              id="company"
              name="company"
              value={formData.company}
              onChange={handleChange}
              className={inputStyles}
            />
          </div>

          <div>
            <label htmlFor="jobTitle" className={labelStyles}>
              Job Title
            </label>
            <input
              type="text"
              id="jobTitle"
              name="jobTitle"
              value={formData.jobTitle}
              onChange={handleChange}
              className={inputStyles}
            />
          </div>

          <div className="md:col-span-2">
            <label htmlFor="address" className={labelStyles}>
              Address
            </label>
            <input
              type="text"
              id="address"
              name="address"
              value={formData.address}
              onChange={handleChange}
              className={inputStyles}
            />
          </div>

          <div>
            <label htmlFor="birthday" className={labelStyles}>
              Birthday
            </label>
            <input
              type="date"
              id="birthday"
              name="birthday"
              value={formData.birthday}
              onChange={handleChange}
              className={inputStyles}
            />
          </div>
        </div>
      </div>

      {/* Social Media */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Social Media</h3>
          <button
            type="button"
            onClick={handleAddSocialMedia}
            className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 font-medium"
          >
            + Add Platform
          </button>
        </div>

        {socialMedia.length === 0 ? (
          <p className="text-gray-500 dark:text-gray-400 text-sm italic">No social media links yet</p>
        ) : (
          <div className="space-y-3">
            {socialMedia.map((item, index) => (
              <div key={index} className="flex gap-3">
                <input
                  type="text"
                  placeholder="Platform (e.g., twitter)"
                  value={item.platform}
                  onChange={(e) => handleSocialMediaChange(index, 'platform', e.target.value)}
                  className={`flex-1 ${inputStyles}`}
                />
                <input
                  type="text"
                  placeholder="Username (e.g., @username)"
                  value={item.username}
                  onChange={(e) => handleSocialMediaChange(index, 'username', e.target.value)}
                  className={`flex-1 ${inputStyles}`}
                />
                <button
                  type="button"
                  onClick={() => handleRemoveSocialMedia(index)}
                  className="px-3 py-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition-colors"
                >
                  Remove
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Form Actions */}
      <div className="flex justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
        <button
          type="button"
          onClick={onCancel}
          disabled={isLoading}
          className={secondaryButtonStyles}
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isLoading}
          className={primaryButtonStyles}
        >
          {isLoading && (
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
          )}
          {isEditMode ? 'Update Contact' : 'Create Contact'}
        </button>
      </div>
    </form>
  );
}
