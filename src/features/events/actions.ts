'use server';
import { z } from 'zod';
import { revalidatePath } from 'next/cache';
import { requireMember } from '@/features/auth/guards';
import { rateLimit } from '@/lib/rate-limit';
import type { FormState } from '@/components/action-form';
export async function registrationAction(_state: FormState, form: FormData): Promise<FormState> {
  const member = await requireMember();
  const id = z.uuid().safeParse(form.get('event_id'));
  if (!id.success) return { message: 'El evento no es válido.' };
  if (!member.profile?.onboarded) return { message: 'Completá tu perfil antes de inscribirte.' };
  if (!(await rateLimit('registration', member.user.id)))
    return { message: 'Esperá unos minutos antes de volver a intentar.' };
  const cancel = form.get('intent') === 'cancel';
  const { data, error } = await member.client.rpc(
    cancel ? 'cancel_registration' : 'register_event',
    { p_event: id.data },
  );
  if (error)
    return {
      message:
        'No pudimos cambiar tu inscripción. Revisá que el evento siga disponible e intentá nuevamente.',
    };
  revalidatePath('/events');
  revalidatePath('/dashboard/events');
  return {
    ok: true,
    message: cancel
      ? 'Cancelaste tu inscripción.'
      : data === 'waitlisted'
        ? 'Estás en la lista de espera. Te avisaremos si se libera un lugar.'
        : 'Tu lugar está confirmado. Podés ver la inscripción en tu espacio.',
  };
}
