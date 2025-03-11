"use client";  // if using Next.js App Router, ensure this is a client-side component

import { useState } from "react";
import { UploadButton } from "@/utils/uploadthing";  // import the generated component

function ImageUploadComponent() {
  const [imageUrl, setImageUrl] = useState<string | null>(null);

  return (
    <UploadButton
      endpoint="ImageUploader"                       
      onClientUploadComplete={(res) => {
        console.log("Files:", res);
        if (res && res.length > 0) {
          setImageUrl(res[0].url);                     
        }
        alert("Upload completed!");
      }}
      onUploadError={(error) => {
        console.error(error);
        alert(`Upload failed: ${error.message}`);
      }}
    />
  );
}
