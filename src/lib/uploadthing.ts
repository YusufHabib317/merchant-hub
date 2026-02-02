import { createUploadthing, type FileRouter } from 'uploadthing/next-legacy';
import { UploadThingError } from 'uploadthing/server';
import { auth } from '@/lib/auth';

const f = createUploadthing({
  // Helps surface UploadThing upstream errors (e.g. /prepareUpload 400) during development
  errorFormatter: (err) => {
    let devDetails;

    if (process.env.NODE_ENV === 'development') {
      // BadRequestError from @uploadthing/shared includes a `json` payload
      if (typeof err.cause === 'object' && err.cause && 'json' in err.cause) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        devDetails = (err.cause as any).json;
      } else if (err.cause instanceof Error) {
        devDetails = err.cause.message;
      } else if (typeof err.cause === 'string') {
        devDetails = err.cause;
      }
    }

    return {
      message: err.message,
      code: err.code,
      ...(devDetails ? { details: devDetails } : {}),
    };
  },
});

/**
 * Authenticate user from request using Better Auth
 * Throws UploadThingError if user is not authenticated
 */
async function authenticateUser(req: Parameters<Parameters<ReturnType<typeof f>['middleware']>[0]>[0]['req']) {
  try {
    const session = await auth.api.getSession({
      headers: req.headers as unknown as Headers,
    });

    if (!session?.user?.id) {
      throw new UploadThingError('Unauthorized - Please log in to upload files');
    }

    return { userId: session.user.id, email: session.user.email };
  } catch (error) {
    if (error instanceof UploadThingError) {
      throw error;
    }
    throw new UploadThingError('Authentication failed');
  }
}

export const uploadRouter = {
  productImage: f({ image: { maxFileSize: '4MB', maxFileCount: 3 } })
    .middleware(async ({ req }) => {
      const user = await authenticateUser(req);
      return { userId: user.userId };
    })
    .onUploadComplete(async ({ metadata, file }) => ({
      url: file.url,
      uploadedBy: metadata.userId,
    })),
  merchantLogo: f({ image: { maxFileSize: '2MB', maxFileCount: 1 } })
    .middleware(async ({ req }) => {
      const user = await authenticateUser(req);
      return { userId: user.userId };
    })
    .onUploadComplete(async ({ metadata, file }) => ({
      url: file.url,
      uploadedBy: metadata.userId,
    })),
} satisfies FileRouter;

export type UploadRouter = typeof uploadRouter;
