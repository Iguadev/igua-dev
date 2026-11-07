'use server';
import { z } from 'zod';
import { revalidatePath } from 'next/cache';
import { requireMember } from '@/features/auth/guards';
import { projectSchema } from '@/lib/validation';
import { slugify } from '@/lib/utils';
import { rateLimit } from '@/lib/rate-limit';
import type { FormState } from '@/components/action-form';
export async function saveProject(_state: FormState, form: FormData): Promise<FormState> {
  const member = await requireMember();
  const parsed = projectSchema.safeParse(Object.fromEntries(form));
  if (!parsed.success)
    return {
      message: 'Revisá el título, una descripción de al menos 30 caracteres y los enlaces.',
    };
  if (!member.profile?.onboarded)
    return { message: 'Completá tu perfil antes de enviar un proyecto.' };
  const id = form.get('id');
  if (id && !z.uuid().safeParse(id).success) return { message: 'Proyecto inválido.' };
  if (!(await rateLimit('project', member.user.id)))
    return { message: 'Intentá de nuevo en unos minutos.' };
  const { technologies, ...data } = parsed.data;
  const tech = technologies
    .split(',')
    .map((t) => t.trim())
    .filter(Boolean);
  if (tech.length > 15 || tech.some((t) => t.length > 40))
    return { message: 'Usá hasta 15 tecnologías, de hasta 40 caracteres cada una.' };
  const { error } = await member.client.rpc('save_project', {
    p_id: id || null,
    p_data: {
      ...data,
      slug: `${slugify(data.title).slice(0, 80)}-${crypto.randomUUID().slice(0, 8)}`,
    },
    p_technologies: tech,
  });
  if (error)
    return {
      message: 'No pudimos guardar el proyecto. Verificá que te pertenezca e intentá nuevamente.',
    };
  revalidatePath('/dashboard/projects');
  revalidatePath('/projects');
  return {
    ok: true,
    message:
      'Guardamos el proyecto para revisión. Si elegiste visibilidad pública, se mostrará cuando sea aprobado.',
  };
}
