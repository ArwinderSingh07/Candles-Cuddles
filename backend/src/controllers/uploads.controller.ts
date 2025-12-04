import { Request, Response } from 'express';
import { z } from 'zod';
import { getPresignedUpload } from '../lib/s3';

const schema = z.object({
  contentType: z.string().default('image/jpeg'),
});

export const getPresignedUploadUrl = async (req: Request, res: Response) => {
  const parsed = schema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ errors: parsed.error.issues });

  const result = await getPresignedUpload(parsed.data.contentType);
  res.json(result);
};

