import { z } from 'zod';
import { identity } from '@/features/auth/guards';
import { csv } from '@/lib/utils';
export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const member = await identity();
  if (!member) return new Response('Unauthorized', { status: 401 });
  if (!member.roles.some((r) => ['organizer', 'admin'].includes(r)))
    return new Response('Forbidden', { status: 403 });
  const { id } = await params;
  if (!z.uuid().safeParse(id).success) return new Response('Invalid event', { status: 400 });
  const { data, error } = await member.client
    .from('event_registrations')
    .select('status,attended_at,profiles(display_name,city)')
    .eq('event_id', id)
    .order('created_at');
  if (error) return new Response('Export unavailable', { status: 500 });
  return new Response(
    csv([
      ['Nombre', 'Ciudad', 'Inscripción', 'Asistencia'],
      ...data.map((r) => {
        const p = r.profiles as unknown as { display_name: string; city: string } | null;
        return [p?.display_name, p?.city, r.status, r.attended_at ? 'Sí' : 'No'];
      }),
    ]),
    {
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': `attachment; filename="igua-event-${id}.csv"`,
        'Cache-Control': 'private, no-store',
      },
    },
  );
}
