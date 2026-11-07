'use server';
import { revalidatePath } from 'next/cache';
import { requireMember } from '@/features/auth/guards';
import { profileSchema } from '@/lib/validation';
import { rateLimit } from '@/lib/rate-limit';
import type { FormState } from '@/components/action-form';
export async function saveProfile(_state: FormState, form: FormData): Promise<FormState> {
  const member = await requireMember();
  const parsed = profileSchema.safeParse({
    ...Object.fromEntries(form),
    public_profile: form.get('public_profile') === 'on',
    updates: form.get('updates') === 'on',
    interests: form.getAll('interests'),
  });
  if (!parsed.success)
    return {
      message:
        'Revisá los campos. Completá nombre y ciudad; usá enlaces válidos y una bio de hasta 500 caracteres.',
    };
  if (!(await rateLimit('profile', member.user.id)))
    return { message: 'Esperá unos minutos antes de volver a guardar.' };
  const { interests, ...profile } = parsed.data;
  const { error } = await member.client.rpc('save_profile', {
    p_data: profile,
    p_interests: interests,
  });
  if (error) return { message: 'No pudimos guardar tu perfil. Intentá de nuevo.' };
  revalidatePath('/dashboard');
  revalidatePath('/community');
  return {
    ok: true,
    message:
      'Guardamos tu perfil y tus preferencias. Ya podés participar en encuentros y compartir proyectos.',
  };
}
export async function requestDeletion(_state: FormState, form: FormData): Promise<FormState> {
  const member = await requireMember();
  if (form.get('confirm') !== 'on')
    return { message: 'Confirmá que querés solicitar la eliminación.' };
  const { error } = await member.client.rpc('request_deletion');
  if (error) return { message: 'No pudimos registrar tu solicitud. Intentá de nuevo.' };
  revalidatePath('/dashboard/settings');
  revalidatePath('/community');
  return {
    ok: true,
    message:
      'Registramos tu solicitud y ocultamos tu perfil público. La organización debe completar la eliminación de tu cuenta.',
  };
}
export async function uploadAvatar(_state: FormState, form: FormData): Promise<FormState> {
  const member = await requireMember();
  const file = form.get('avatar');
  if (
    !(file instanceof File) ||
    file.size === 0 ||
    file.size > 2097152 ||
    !['image/png', 'image/jpeg', 'image/webp'].includes(file.type)
  )
    return { message: 'Elegí una imagen PNG, JPG o WebP de hasta 2 MB.' };
  if (!(await rateLimit('avatar', member.user.id)))
    return { message: 'Intentá de nuevo más tarde.' };
  const bytes = new Uint8Array(await file.arrayBuffer());
  const valid =
    (file.type === 'image/png' &&
      bytes[0] === 137 &&
      bytes[1] === 80 &&
      bytes[2] === 78 &&
      bytes[3] === 71) ||
    (file.type === 'image/jpeg' && bytes[0] === 255 && bytes[1] === 216 && bytes[2] === 255) ||
    (file.type === 'image/webp' &&
      String.fromCharCode(...bytes.slice(0, 4)) === 'RIFF' &&
      String.fromCharCode(...bytes.slice(8, 12)) === 'WEBP');
  if (!valid) return { message: 'El archivo no coincide con el formato de imagen.' };
  const ext = file.type === 'image/jpeg' ? 'jpg' : file.type === 'image/png' ? 'png' : 'webp';
  const path = `${member.user.id}/avatar.${ext}`;
  const { error } = await member.client.storage
    .from('avatars')
    .upload(path, bytes, { contentType: file.type, upsert: true });
  if (error) return { message: 'No pudimos guardar la imagen.' };
  const saved = await member.client.rpc('set_avatar', { p_path: path });
  if (saved.error) return { message: 'No pudimos asociar la imagen a tu perfil.' };
  revalidatePath('/dashboard/profile');
  return { ok: true, message: 'Guardamos tu imagen en tu espacio privado.' };
}
