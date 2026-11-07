import { timingSafeEqual } from 'node:crypto';
import { Resend } from 'resend';
import { serviceDb } from '@/lib/supabase/service';
import { eventDate } from '@/lib/utils';
import { siteUrl } from '@/lib/env';
export const maxDuration = 60;
export async function GET(request: Request) {
  const expected = process.env.CRON_SECRET;
  const actual = request.headers.get('authorization');
  if (!expected || !actual) return new Response('Unauthorized', { status: 401 });
  const a = Buffer.from(actual),
    b = Buffer.from(`Bearer ${expected}`);
  if (a.length !== b.length || !timingSafeEqual(a, b))
    return new Response('Unauthorized', { status: 401 });
  if (!process.env.RESEND_API_KEY || !process.env.RESEND_FROM)
    return Response.json({ error: 'Email not configured' }, { status: 503 });
  try {
    const client = serviceDb();
    const { data, error } = await client.rpc('claim_email_batch');
    if (error) return Response.json({ error: 'Queue unavailable' }, { status: 503 });
    const resend = new Resend(process.env.RESEND_API_KEY);
    let sent = 0;
    for (const job of data ?? []) {
      const labels: Record<string, string> = {
        confirmed: 'Tu lugar está confirmado',
        waitlisted: 'Estás en lista de espera',
        promoted: 'Se liberó un lugar: inscripción confirmada',
        cancelled: 'Tu inscripción fue cancelada',
      };
      const title = labels[job.kind] || 'Tu inscripción';
      const result = await resend.emails.send(
        {
          from: process.env.RESEND_FROM,
          to: job.recipient,
          subject: `${title} | IGUA.DEV`,
          text: `${title}\n\n${job.payload.title}\n${eventDate(job.payload.starts_at, job.payload.time_zone)}\n\nConsultá los detalles actualizados: ${siteUrl}/events/${job.payload.slug}\nGestioná tu inscripción: ${siteUrl}/dashboard/events`,
        },
        { idempotencyKey: job.id },
      );
      if (!result.error) {
        const ack = await client.rpc('ack_email', { p_id: job.id });
        if (!ack.error) sent++;
      }
    }
    return Response.json({ sent });
  } catch {
    return Response.json({ error: 'Delivery unavailable' }, { status: 503 });
  }
}
