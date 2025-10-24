import { router, publicProcedure } from '../trpc';
import { z } from 'zod';
import { put } from '@vercel/blob';
import { TRPCError } from '@trpc/server';

export const blobRouter = router({
  /**
   * Uploads an empty file placeholder to Vercel Blob server-side
   * and returns the final URL where the blob will be accessible
   * after the client uploads the actual content.
   * NOTE: This is a simplified approach. For robust client-side uploads,
   * consider using Vercel's recommended API route pattern with handleUpload.
   */
  createBlobPlaceholder: publicProcedure // Renamed for clarity
    .input(z.object({ filename: z.string() }))
    .mutation(async ({ input }) => {
      const filename = input.filename;

      if (!process.env.BLOB_READ_WRITE_TOKEN) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Missing Blob storage configuration.',
        });
      }

      try {
        // 'put' generates the blob URL by uploading an empty placeholder
        const blob = await put(filename, '', {
          access: 'public',
        });

        // FIX: Return the correct 'url' property from PutBlobResult
        return { url: blob.url };

      } catch (error) {
        console.error("Error creating blob placeholder:", error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to prepare file upload.',
        });
      }
    }),
});