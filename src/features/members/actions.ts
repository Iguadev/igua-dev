'use server';
import { revalidatePath } from 'next/cache';
import { redirect, RedirectType } from 'next/navigation';
import { requireMember } from '@/features/auth/guards';
import { memberDestination } from '@/features/auth/destination';
import { getI18n } from '@/lib/i18n/server';
import { profileSchema } from '@/lib/validation';
import { cityName } from '@/lib/cities';
import { savedCountryCode } from '@/lib/countries';
import { rateLimit } from '@/lib/rate-limit';
import { isAvatarFile } from '@/features/members/avatar';
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
        'Completá tu nombre, ciudad y país. Usá enlaces válidos y una bio de hasta 500 caracteres.',
    };
  if (!(await rateLimit('profile', member.user.id)))
    return { message: 'Esperá unos minutos antes de volver a guardar.' };
  const { interests, ...profile } = parsed.data;
  const canonicalCity = await cityName(profile.country, profile.city);
  if (canonicalCity) {
    profile.city = canonicalCity;
  } else {
    // Earlier profiles allowed a free-text city. Keep it only with its original country.
    const { data } =
      member.profile?.city === profile.city
        ? await member.client
            .from('member_preferences')
            .select('country')
            .eq('member_id', member.user.id)
            .maybeSingle()
        : { data: null };
    if (savedCountryCode(data?.country) !== profile.country)
      return { message: 'Elegí una ciudad del país seleccionado.' };
  }
  const { error } = await member.client.rpc('save_profile', {
    p_data: profile,
    p_interests: interests,
  });
  if (error) return { message: 'No pudimos guardar tu perfil. Intentá de nuevo.' };
  revalidatePath('/dashboard');
  revalidatePath('/members');
  if (!member.profile?.onboarded)
    redirect(
      memberDestination((await getI18n()).language, form.get('next'), true),
      RedirectType.replace,
    );
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
  revalidatePath('/members');
  return {
    ok: true,
    message:
      'Registramos tu solicitud y ocultamos tu perfil público. La organización debe completar la eliminación de tu cuenta.',
  };
}
export async function uploadAvatar(_state: FormState, form: FormData): Promise<FormState> {
  const member = await requireMember();
  const file = form.get('avatar');
  if (!isAvatarFile(file)) return { message: 'Elegí una imagen PNG, JPG o WebP de hasta 2 MB.' };
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
