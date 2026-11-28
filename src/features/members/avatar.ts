export const avatarTypes = ['image/png', 'image/jpeg', 'image/webp'];
const maxAvatarBytes = 2 * 1024 * 1024;

export function isAvatarFile(file: unknown): file is File {
  return (
    file instanceof File &&
    file.size > 0 &&
    file.size <= maxAvatarBytes &&
    avatarTypes.includes(file.type)
  );
}
