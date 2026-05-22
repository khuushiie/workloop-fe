import React from "react";
import { useSignedUrl } from "../../store/hooks/useSignedUrl";

interface SignedImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  rawUrl: string;
}

/**
 * Renders an <img> that automatically resolves a signed URL
 * from a raw storage URL (S3/GCS). Use this for profile images
 * stored with private bucket access.
 */
const SignedImage: React.FC<SignedImageProps> = ({ rawUrl, alt, ...rest }) => {
  const src = useSignedUrl(rawUrl);
  return <img src={src} alt={alt} {...rest} />;
};

export default SignedImage;
