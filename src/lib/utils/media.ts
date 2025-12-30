// utils/media.ts
// export const getMediaUrl = (path?: string) => {
//   if (!path) return '';
//   if (path.startsWith('http')) return path; // already full URL
//   return `http://localhost:8000${path}`;   // prepend backend URL
// };
export const getMediaUrl = (path?: string) => {
  if (!path) return '';
  if (path.startsWith('http')) return path;

  const baseUrl = process.env.NEXT_PUBLIC_NGROK_URL || "https://859d86ab0c3f.ngrok-free.app";;
  return `${baseUrl}${path}`;
};
