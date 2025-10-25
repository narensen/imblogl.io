import { router, publicProcedure } from '../trpc';
import { z } from 'zod';
import { put } from '@vercel/blob';
import { TRPCError } from '@trpc/server';

export const blobRouter = router({

  createBlobPlaceholder: publicProcedure
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

        const blob = await put(filename, null, {
          access: 'public',
        });

        return {
          url: blob.url,
          downloadUrl: blob.downloadUrl
        };

      } catch (error) {
        console.error("Error creating blob placeholder:", error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to prepare file upload.',
        });
      }
    }),
});