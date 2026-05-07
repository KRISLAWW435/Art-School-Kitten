export function getAssetUrl(relativePath: string): string {
  // Replace leading slash if present to avoid double slashes
  const path = relativePath.startsWith('/') ? relativePath.slice(1) : relativePath;
  return `https://cdn.jsdelivr.net/gh/KRISLAWW435/Cat-assets-@main/${path}`;
}
