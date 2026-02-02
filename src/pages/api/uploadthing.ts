import { createRouteHandler } from 'uploadthing/next-legacy';
import { uploadRouter } from '@/lib/uploadthing';

const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:9000';

export default createRouteHandler({
  router: uploadRouter,
  config: {
    // Ensure UploadThing generates the correct callback URL (this project runs on :9000)
    callbackUrl: `${baseUrl}/api/uploadthing`,
    // Make upstream errors visible in the terminal while debugging
    logLevel: process.env.NODE_ENV === 'development' ? 'Debug' : 'Error',
  },
});
