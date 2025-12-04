import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { requestPresignedUrl } from '../api/uploads';

const schema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  theme: z.string().min(2),
  message: z.string().min(10),
  referenceImage: z
    .any()
    .optional()
    .refine((fileList) => !fileList || fileList.length <= 1, 'Upload a single reference image'),
});

type FormValues = z.infer<typeof schema>;

export const CustomOrderPage = () => {
  const [uploadUrl, setUploadUrl] = useState<string | null>(null);
  const [status, setStatus] = useState<'idle' | 'uploading' | 'submitted'>('idle');
  const [error, setError] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormValues>({ resolver: zodResolver(schema) });

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
      // In a real system, send the brief + referenceUrl to CRM/support via backend.
      console.info('Custom order brief', { ...values, referenceUrl });
      setStatus('submitted');
      reset();
    } catch (err) {
      setStatus('idle');
      setError(err instanceof Error ? err.message : 'Upload failed');
    }
  };

  return (
    <section className="mx-auto max-w-4xl px-6 py-16">
      <p className="text-sm uppercase tracking-[0.3em] text-brand-dark/60">Custom studio</p>
      <h1 className="mt-2 font-display text-4xl text-brand-dark">Design your set</h1>
      <p className="mt-4 text-brand-dark/70">
        Share your inspiration, upload a mood-board, and our concierges will send a quote within 24h. Reference uploads stream directly to our S3 bucket via presigned URLs.
      </p>
      <form className="mt-10 space-y-6" onSubmit={handleSubmit(onSubmit)}>
        <div>
          <label htmlFor="custom-name" className="text-sm font-semibold text-brand-dark">
            Name
          </label>
          <input id="custom-name" className="mt-2 w-full rounded-2xl border border-brand/20 px-4 py-3" {...register('name')} />
          {errors.name && <p className="text-sm text-red-500">{errors.name.message}</p>}
        </div>
        <div>
          <label htmlFor="custom-email" className="text-sm font-semibold text-brand-dark">
            Email
          </label>
          <input id="custom-email" className="mt-2 w-full rounded-2xl border border-brand/20 px-4 py-3" {...register('email')} />
          {errors.email && <p className="text-sm text-red-500">{errors.email.message}</p>}
        </div>
        <div>
          <label htmlFor="custom-theme" className="text-sm font-semibold text-brand-dark">
            Theme / Scent direction
          </label>
          <input id="custom-theme" className="mt-2 w-full rounded-2xl border border-brand/20 px-4 py-3" {...register('theme')} />
          {errors.theme && <p className="text-sm text-red-500">{errors.theme.message}</p>}
        </div>
        <div>
          <label htmlFor="custom-message" className="text-sm font-semibold text-brand-dark">
            Project details
          </label>
          <textarea
            id="custom-message"
            className="mt-2 w-full rounded-2xl border border-brand/20 px-4 py-3"
            rows={4}
            {...register('message')}
          />
          {errors.message && <p className="text-sm text-red-500">{errors.message.message}</p>}
        </div>
        <div>
          <label htmlFor="custom-reference" className="text-sm font-semibold text-brand-dark">
            Reference image (optional)
          </label>
          <input id="custom-reference" type="file" accept="image/*" className="mt-2 w-full" {...register('referenceImage')} />
          {errors.referenceImage && <p className="text-sm text-red-500">{errors.referenceImage.message as string}</p>}
        </div>
        <button
          type="submit"
          className="rounded-full bg-brand px-6 py-3 font-semibold text-white disabled:opacity-60"
          disabled={status === 'uploading'}
        >
          {status === 'uploading' ? 'Uploading...' : 'Submit brief'}
        </button>
      </form>
      {status === 'submitted' && (
        <div className="mt-8 rounded-3xl border border-brand/20 bg-white p-6 text-sm text-brand-dark/80">
          Request captured! Our concierge will email next steps. {uploadUrl && 'Reference uploaded securely.'}
        </div>
      )}
      {error && <p className="mt-4 text-sm text-red-500">{error}</p>}
    </section>
  );
};

