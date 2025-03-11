import { createUploadthing, type FileRouter } from "uploadthing/next";
import { UploadThingError } from "uploadthing/server";

const f = createUploadthing();

// Mock authentication function (replace with real auth logic)
const auth = async (req: Request) => {
  // Simulate user authentication (replace with actual auth logic)
  return { id: "fakeId" }; // Return null if user is not authenticated
};

export const ourFileRouter: FileRouter = {
  imageUploader: f({
    image: {
      maxFileSize: "4MB",
      maxFileCount: 1,
    },
  })
    .middleware(async ({ req }) => {
      const user = await auth(req);
      if (!user) throw new UploadThingError("Unauthorized");
      return { userId: user.id };
    })
    .onUploadComplete(async ({ metadata, file }) => {
      return {
        uploadedBy: metadata.userId,
        fileUrl: file.ufsUrl, // Updated to use `file.ufsUrl` instead of deprecated `file.url`
        fileName: file.name,
      };
    }),
};

export type OurFileRouter = typeof ourFileRouter;