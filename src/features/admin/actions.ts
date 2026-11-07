'use server';
import { z } from 'zod';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { getI18n } from '@/lib/i18n/server';
import { languagePath } from '@/lib/i18n/routing';
import { requireStaff } from '@/features/auth/guards';
import { eventSchema } from '@/lib/validation';
import { rateLimit } from '@/lib/rate-limit';
import { slugify } from '@/lib/utils';
import type { FormState } from '@/components/action-form';
export async function saveEvent(_state: FormState, form: FormData): Promise<FormState> {
  const member = await requireStaff();
  const raw = Object.fromEntries(form);
  const parsed = eventSchema.safeParse(raw);
  if (!parsed.success)
    return {
      message:
        'Revisá los campos, el slug y las fechas. Usá fechas ISO con zona horaria, por ejemplo 2027-03-20T18:00:00-03:00.',
    };
  const id = form.get('id');
  if (id && !z.uuid().safeParse(id).success) return { message: 'Evento inválido.' };
  if (!(await rateLimit('staff', member.user.id)))
    return { message: 'Esperá unos minutos antes de volver a guardar.' };
  const data = {
    ...parsed.data,
    venue_id: parsed.data.venue_id || null,
    registration_opens_at: parsed.data.registration_opens_at || null,
    registration_closes_at: parsed.data.registration_closes_at || null,
    ...(!id ? { organizer_id: member.user.id } : {}),
  };
  const result = id
    ? await member.client.from('events').update(data).eq('id', id).select('id').single()
    : await member.client.from('events').insert(data).select('id').single();
  if (result.error)
    return {
      message:
        'No pudimos guardar el evento. Revisá que el slug sea único y la capacidad no sea menor a las inscripciones confirmadas.',
    };
  revalidatePath('/events');
  revalidatePath('/admin/events');
  redirect(
    languagePath((await getI18n()).language, `/admin/events/${result.data.id}/edit?saved=1`),
  );
}
export async function staffMutation(_state: FormState, form: FormData): Promise<FormState> {
  const action = String(form.get('action'));
  const member = await requireStaff(
    !['attendance', 'venue', 'speaker', 'program', 'program_event'].includes(action),
  );
  if (!(await rateLimit('staff', member.user.id)))
    return { message: 'Esperá unos minutos antes de volver a intentar.' };
  const id = z.uuid().safeParse(form.get('id'));
  let error: unknown = null;
  if (action === 'role') {
    const role = z
      .enum(['member', 'contributor', 'organizer', 'admin'])
      .safeParse(form.get('role'));
    if (!id.success || !role.success) return { message: 'Datos inválidos.' };
    ({ error } = await member.client.rpc('set_member_role', {
      p_member: id.data,
      p_role: role.data,
    }));
  } else if (action === 'moderate') {
    const status = z.enum(['published', 'rejected']).safeParse(form.get('status'));
    if (!id.success || !status.success) return { message: 'Datos inválidos.' };
    ({ error } = await member.client.rpc('moderate_project', {
      p_id: id.data,
      p_status: status.data,
    }));
  } else if (action === 'attendance') {
    if (!id.success) return { message: 'Inscripción inválida.' };
    ({ error } = await member.client.rpc('mark_attendance', {
      p_registration: id.data,
      p_attended: form.get('attended') === 'true',
    }));
  } else if (action === 'inquiry') {
    const status = z.enum(['new', 'contacted', 'closed']).safeParse(form.get('status'));
    if (!id.success || !status.success) return { message: 'Datos inválidos.' };
    ({ error } = await member.client
      .from('partnership_inquiries')
      .update({ status: status.data })
      .eq('id', id.data));
  } else if (action === 'partner') {
    const parsed = z
      .object({
        name: z.string().trim().min(2).max(150),
        website: z.union([z.literal(''), z.url().refine((v) => /^https?:\/\//.test(v))]),
        category: z.string().min(2).max(60),
      })
      .safeParse(Object.fromEntries(form));
    if (!parsed.success) return { message: 'Revisá el nombre, la categoría y el enlace.' };
    const data = {
      ...parsed.data,
      website: parsed.data.website || null,
      approved: form.get('approved') === 'on',
    };
    if (form.get('id')) {
      if (!id.success) return { message: 'Datos inválidos.' };
      ({ error } = await member.client.from('partners').update(data).eq('id', id.data));
    } else {
      ({ error } = await member.client.from('partners').insert(data));
    }
  } else if (action === 'content') {
    const parsed = z
      .object({
        slug: z
          .string()
          .regex(/^[a-z0-9-]+$/)
          .max(80),
        title: z.string().trim().min(3).max(150),
        body: z.string().trim().min(20).max(15000),
      })
      .safeParse(Object.fromEntries(form));
    if (!parsed.success)
      return { message: 'Revisá el título, slug y contenido (mínimo 20 caracteres).' };
    ({ error } = await member.client
      .from('content_pages')
      .upsert(
        { ...parsed.data, published: form.get('published') === 'on' },
        { onConflict: 'slug' },
      ));
  } else if (action === 'venue') {
    const parsed = z
      .object({
        name: z.string().trim().min(2).max(150),
        address: z.string().trim().min(5).max(300),
        map_url: z.union([z.literal(''), z.url().startsWith('https://')]),
      })
      .safeParse(Object.fromEntries(form));
    if (!parsed.success) return { message: 'Revisá el nombre, dirección y URL del mapa.' };
    ({ error } = await member.client
      .from('venues')
      .insert({ ...parsed.data, map_url: parsed.data.map_url || null }));
  } else if (action === 'speaker') {
    const parsed = z
      .object({
        event_id: z.uuid(),
        display_name: z.string().trim().min(2).max(100),
        bio: z.string().max(1500),
      })
      .safeParse(Object.fromEntries(form));
    if (!parsed.success) return { message: 'Revisá los datos de la persona invitada.' };
    ({ error } = await member.client.from('event_speakers').insert(parsed.data));
  } else if (action === 'program') {
    const parsed = z
      .object({
        slug: z
          .string()
          .regex(/^[a-z0-9-]+$/)
          .max(100),
        title: z.string().trim().min(3).max(150),
        description: z.string().trim().min(20).max(2000),
        accent: z.enum(['green', 'purple', 'blue', 'orange']),
        status: z.enum(['draft', 'planned', 'active', 'archived']),
        sort_order: z.coerce.number().int().min(0).max(100),
      })
      .safeParse(Object.fromEntries(form));
    if (!parsed.success) return { message: 'Revisá el programa y su descripción.' };
    ({ error } = await member.client.from('programs').upsert(parsed.data, { onConflict: 'slug' }));
  } else if (action === 'program_event') {
    const parsed = z
      .object({ event_id: z.uuid(), program_id: z.uuid() })
      .safeParse(Object.fromEntries(form));
    if (!parsed.success) return { message: 'Elegí un programa y un evento.' };
    ({ error } = await member.client
      .from('program_events')
      .upsert(parsed.data, { onConflict: 'program_id,event_id' }));
  } else return { message: 'Acción no disponible.' };
  if (error) return { message: 'No pudimos completar la acción. Revisá los datos y tus permisos.' };
  revalidatePath('/', 'layout');
  return { ok: true, message: 'Cambio guardado.' };
}
export async function uploadEventCover(_state: FormState, form: FormData): Promise<FormState> {
  const member = await requireStaff();
  const id = z.uuid().safeParse(form.get('id'));
  const file = form.get('cover');
  if (
    !id.success ||
    !(file instanceof File) ||
    !['image/jpeg', 'image/png', 'image/webp'].includes(file.type) ||
    file.size === 0 ||
    file.size > 2097152
  )
    return { message: 'Elegí un evento y una imagen JPG, PNG o WebP de hasta 2 MB.' };
  if (!(await rateLimit('cover', member.user.id))) return { message: 'Intentá más tarde.' };
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
  if (!valid) return { message: 'El formato del archivo no coincide.' };
  const path = `${id.data}/${slugify(file.name).slice(0, 40)}-${crypto.randomUUID()}`;
  const { error } = await member.client.storage
    .from('covers')
    .upload(path, bytes, { contentType: file.type });
  if (error) return { message: 'No pudimos subir la portada.' };
  const update = await member.client.from('events').update({ cover_path: path }).eq('id', id.data);
  if (update.error)
    return {
      message: 'Se guardó el archivo, pero no se pudo asociar al evento. Intentá nuevamente.',
    };
  revalidatePath('/events');
  return { ok: true, message: 'Portada guardada.' };
}
