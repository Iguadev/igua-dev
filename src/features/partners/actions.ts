'use server';
import { inquirySchema } from '@/lib/validation';
import { rateLimit } from '@/lib/rate-limit';
import { serviceDb } from '@/lib/supabase/service';
import type { FormState } from '@/components/action-form';
export async function submitInquiry(_state: FormState, form: FormData): Promise<FormState> {
  if (form.get('website_check')) return { message: 'No pudimos enviar la consulta.' };
  const parsed = inquirySchema.safeParse({
    ...Object.fromEntries(form),
    consent: form.get('consent') === 'on',
  });
  if (!parsed.success)
    return {
      message:
        'Revisá los campos. Necesitamos tu nombre, email, organización y un mensaje de al menos 20 caracteres.',
    };
  if (!(await rateLimit('inquiry')))
    return { message: 'No pudimos enviar la consulta. Intentá más tarde.' };
  try {
    const { error } = await serviceDb().rpc('submit_inquiry', { p_data: parsed.data });
    if (error) return { message: 'No pudimos guardar tu consulta. Intentá de nuevo.' };
    return {
      ok: true,
      message:
        'Recibimos tu propuesta. La organización podrá responderte al email que compartiste.',
    };
  } catch {
    return { message: 'El formulario todavía no está habilitado. Volvé pronto.' };
  }
}
