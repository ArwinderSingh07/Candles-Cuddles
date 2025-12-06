import { useState, useRef, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { 
  UserIcon, 
  EnvelopeIcon, 
  DocumentTextIcon, 
  PhotoIcon,
  CheckCircleIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';
import { SparklesIcon } from '@heroicons/react/24/solid';
import { requestPresignedUrl } from '../api/uploads';
import { submitCustomOrder } from '../api/customOrders';

const schema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Please enter a valid email address'),
  theme: z.string().min(2, 'Theme must be at least 2 characters'),
  message: z.string().min(10, 'Please provide more details (at least 10 characters)'),
  referenceImage: z
    .any()
    .optional()
    .refine((fileList) => !fileList || fileList.length <= 1, 'Upload a single reference image'),
});

type FormValues = z.infer<typeof schema>;

export const CustomOrderPage = () => {
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [uploadUrl, setUploadUrl] = useState<string | null>(null);
  const [status, setStatus] = useState<'idle' | 'uploading' | 'submitted'>('idle');
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors },
  } = useForm<FormValues>({ resolver: zodResolver(schema) });

  const watchedFile = watch('referenceImage');

  // Handle file preview
  useEffect(() => {
    if (watchedFile && watchedFile[0]) {
      const file = watchedFile[0];
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    } else {
      setPreviewUrl(null);
    }
  }, [watchedFile]);

  const removeImage = () => {
    setPreviewUrl(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    setValue('referenceImage', undefined);
  };

  const onSubmit = async (values: FormValues) => {
    try {
      setStatus('uploading');
      setError(null);
      let referenceUrl: string | undefined;
      const file = values.referenceImage?.[0];
      if (file) {
        const presign = await requestPresignedUrl(file.type);
        await fetch(presign.uploadUrl, {
          method: 'PUT',
          headers: { 'Content-Type': file.type },
          body: file,
        });
        referenceUrl = presign.publicUrl;
        setUploadUrl(referenceUrl);
      }
      
      // Submit to backend
      await submitCustomOrder({
        name: values.name,
        email: values.email,
        theme: values.theme,
        message: values.message,
        referenceImageUrl: referenceUrl,
      });
      
      setStatus('submitted');
      reset();
      setPreviewUrl(null);
      setUploadUrl(null);
    } catch (err: any) {
      setStatus('idle');
      setError(err.response?.data?.message || err.message || 'Failed to submit order. Please try again.');
    }
  };

  return (
    <section className="relative min-h-[calc(100vh-120px)] bg-gradient-to-b from-brand-light/40 to-white">
      {/* Background decoration */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(198,93,123,0.08),transparent_35%),radial-gradient(circle_at_80%_80%,rgba(198,93,123,0.06),transparent_30%)]" />
      
      <div className="relative mx-auto max-w-5xl px-6 py-16 md:py-20">
        {/* Header */}
        <div className="mb-12 text-center">
          <p className="text-sm uppercase tracking-[0.4em] text-brand-dark/70">Custom studio</p>
          <h1 className="mt-3 font-display text-4xl leading-tight text-brand-dark md:text-5xl">
            Design your set
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-brand-dark/80">
            Share your inspiration, upload a mood-board, and our concierges will send a curated quote within 24h. Perfect for weddings, gifting, or brand drops.
          </p>
        </div>

        <div className="grid gap-8 md:grid-cols-3">
          {/* Helpful Tips Sidebar */}
          <div className="md:col-span-1">
            <div className="sticky top-6 space-y-6">
              <div className="rounded-3xl border border-brand/10 bg-white/90 p-6 shadow-sm">
                <h3 className="mb-4 font-display text-xl text-brand-dark">What to include</h3>
                <ul className="space-y-3 text-sm text-brand-dark/70">
                  <li className="flex items-start gap-2">
                    <SparklesIcon className="mt-0.5 h-5 w-5 flex-shrink-0 text-brand" />
                    <span>Color palette preferences</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <SparklesIcon className="mt-0.5 h-5 w-5 flex-shrink-0 text-brand" />
                    <span>Occasion or event details</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <SparklesIcon className="mt-0.5 h-5 w-5 flex-shrink-0 text-brand" />
                    <span>Quantity needed</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <SparklesIcon className="mt-0.5 h-5 w-5 flex-shrink-0 text-brand" />
                    <span>Timeline or deadline</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <SparklesIcon className="mt-0.5 h-5 w-5 flex-shrink-0 text-brand" />
                    <span>Any specific scent notes</span>
                  </li>
                </ul>
              </div>
              
              <div className="rounded-3xl border border-accent/20 bg-accent/5 p-6">
                <p className="text-sm font-semibold text-brand-dark">Response time</p>
                <p className="mt-1 text-sm text-brand-dark/70">
                  We typically respond within 24 hours with a personalized quote and design recommendations.
                </p>
              </div>
            </div>
          </div>

          {/* Form Section */}
          <div className="md:col-span-2">
            {status === 'submitted' ? (
              <div className="animate-slide-down rounded-3xl border border-green-200 bg-green-50 p-8 text-center shadow-sm">
                <CheckCircleIcon className="mx-auto h-16 w-16 text-green-600" />
                <h2 className="mt-4 font-display text-2xl text-green-800">Brief received!</h2>
                <p className="mt-2 text-green-700">
                  Your custom order brief has been received. Our team will review it and get back to you within 24 hours.
                </p>
                {uploadUrl && (
                  <p className="mt-2 text-sm text-green-600">✓ Reference image uploaded securely</p>
                )}
              </div>
            ) : (
              <form 
                className="rounded-3xl border border-brand/10 bg-white/90 p-8 shadow-inner ring-1 ring-brand-light/80" 
                onSubmit={handleSubmit(onSubmit)}
              >
                {error && (
                  <div className="mb-6 animate-slide-down rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                    {error}
                  </div>
                )}

                <div className="space-y-6">
                  {/* Name Field */}
                  <div>
                    <label htmlFor="custom-name" className="mb-2 block text-sm font-semibold text-brand-dark">
                      Your Name
                    </label>
                    <div className="relative">
                      <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                        <UserIcon className="h-5 w-5 text-brand-dark/40" />
                      </div>
                      <input
                        id="custom-name"
                        type="text"
                        className={`w-full rounded-2xl border bg-white py-3 pl-10 pr-4 text-gray-700 transition placeholder:text-gray-400 focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20 ${
                          errors.name ? 'border-red-300' : 'border-brand/20'
                        }`}
                        placeholder="Aanya Kapoor"
                        {...register('name')}
                      />
                    </div>
                    {errors.name && (
                      <p className="mt-1.5 text-sm text-red-500">{errors.name.message}</p>
                    )}
                  </div>

                  {/* Email Field */}
        <div>
                    <label htmlFor="custom-email" className="mb-2 block text-sm font-semibold text-brand-dark">
                      Email Address
          </label>
                    <div className="relative">
                      <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                        <EnvelopeIcon className="h-5 w-5 text-brand-dark/40" />
                      </div>
                      <input
                        id="custom-email"
                        type="email"
                        className={`w-full rounded-2xl border bg-white py-3 pl-10 pr-4 text-gray-700 transition placeholder:text-gray-400 focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20 ${
                          errors.email ? 'border-red-300' : 'border-brand/20'
                        }`}
                        placeholder="you@example.com"
                        {...register('email')}
                      />
                    </div>
                    {errors.email && (
                      <p className="mt-1.5 text-sm text-red-500">{errors.email.message}</p>
                    )}
        </div>

                  {/* Theme Field */}
        <div>
                    <label htmlFor="custom-theme" className="mb-2 block text-sm font-semibold text-brand-dark">
                      Theme / Scent Direction
          </label>
                    <div className="relative">
                      <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                        <SparklesIcon className="h-5 w-5 text-brand-dark/40" />
                      </div>
                      <input
                        id="custom-theme"
                        type="text"
                        className={`w-full rounded-2xl border bg-white py-3 pl-10 pr-4 text-gray-700 transition placeholder:text-gray-400 focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20 ${
                          errors.theme ? 'border-red-300' : 'border-brand/20'
                        }`}
                        placeholder="e.g., Romantic rose garden, Coastal breeze, Warm vanilla"
                        {...register('theme')}
                      />
                    </div>
                    {errors.theme && (
                      <p className="mt-1.5 text-sm text-red-500">{errors.theme.message}</p>
                    )}
        </div>

                  {/* Message Field */}
        <div>
                    <label htmlFor="custom-message" className="mb-2 block text-sm font-semibold text-brand-dark">
                      Project Details
          </label>
                    <div className="relative">
                      <div className="pointer-events-none absolute left-3 top-3">
                        <DocumentTextIcon className="h-5 w-5 text-brand-dark/40" />
                      </div>
          <textarea
            id="custom-message"
                        className={`w-full rounded-2xl border bg-white py-3 pl-10 pr-4 text-gray-700 transition placeholder:text-gray-400 focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20 ${
                          errors.message ? 'border-red-300' : 'border-brand/20'
                        }`}
                        rows={6}
                        placeholder="Tell us about your occasion, quantity needed, timeline, color preferences, and any specific requirements..."
            {...register('message')}
          />
                    </div>
                    {errors.message && (
                      <p className="mt-1.5 text-sm text-red-500">{errors.message.message}</p>
                    )}
        </div>

                  {/* Image Upload Field */}
        <div>
                    <label htmlFor="custom-reference" className="mb-2 block text-sm font-semibold text-brand-dark">
                      Reference Image (Optional)
                    </label>
                    {!previewUrl ? (
                      <label
                        htmlFor="custom-reference"
                        className="flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-brand/30 bg-brand-light/20 p-8 transition hover:border-brand/50 hover:bg-brand-light/30"
                      >
                        <PhotoIcon className="h-12 w-12 text-brand/60" />
                        <span className="mt-3 text-sm font-medium text-brand-dark">
                          Click to upload or drag and drop
                        </span>
                        <span className="mt-1 text-xs text-brand-dark/60">
                          PNG, JPG up to 10MB
                        </span>
                        <input
                          id="custom-reference"
                          type="file"
                          accept="image/*"
                          className="hidden"
                          {...register('referenceImage')}
                          ref={(e) => {
                            const { ref } = register('referenceImage');
                            ref(e);
                            fileInputRef.current = e;
                          }}
                        />
          </label>
                    ) : (
                      <div className="relative">
                        <div className="relative overflow-hidden rounded-2xl border border-brand/20 bg-white">
                          <img
                            src={previewUrl}
                            alt="Preview"
                            className="h-64 w-full object-cover"
                          />
                          <button
                            type="button"
                            onClick={removeImage}
                            className="absolute right-2 top-2 rounded-full bg-white/90 p-1.5 text-brand-dark shadow-sm transition hover:bg-white"
                            aria-label="Remove image"
                          >
                            <XMarkIcon className="h-5 w-5" />
                          </button>
                        </div>
                        <p className="mt-2 text-xs text-brand-dark/60">
                          Click the X button to remove and upload a different image
                        </p>
                      </div>
                    )}
                    {errors.referenceImage && (
                      <p className="mt-1.5 text-sm text-red-500">
                        {errors.referenceImage.message as string}
                      </p>
                    )}
        </div>

                  {/* Submit Button */}
        <button
          type="submit"
                    className="w-full rounded-full bg-brand px-8 py-4 font-semibold text-white transition hover:bg-brand-dark disabled:opacity-60 disabled:cursor-not-allowed"
          disabled={status === 'uploading'}
        >
                    {status === 'uploading' ? (
                      <span className="flex items-center justify-center gap-2">
                        <svg className="h-5 w-5 animate-spin" viewBox="0 0 24 24">
                          <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                            fill="none"
                          />
                          <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                          />
                        </svg>
                        Uploading & Submitting...
                      </span>
                    ) : (
                      'Submit Brief'
                    )}
        </button>
                </div>
      </form>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};

