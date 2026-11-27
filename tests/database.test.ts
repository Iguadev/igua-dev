import { beforeAll, afterAll, describe, it, expect } from 'vitest';
import { PGlite } from '@electric-sql/pglite';
import { readFileSync, readdirSync } from 'node:fs';
const sql = new PGlite();
const A = '11111111-1111-4111-8111-111111111111',
  B = '22222222-2222-4222-8222-222222222222',
  C = '33333333-3333-4333-8333-333333333333',
  D = '44444444-4444-4444-8444-444444444444',
  E = 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa';
async function asUser<T>(user: string, query: string, params: unknown[] = []) {
  return sql.transaction(async (tx) => {
    await tx.exec('set local role authenticated');
    await tx.query("select set_config('request.jwt.claim.sub',$1,true)", [user]);
    return tx.query<T>(query, params);
  });
}
beforeAll(async () => {
  await sql.exec(readFileSync('tests/fixtures/bootstrap.sql', 'utf8'));
  const migrations = readdirSync('supabase/migrations')
    .filter((f) => f.endsWith('.sql'))
    .sort();
  for (const file of migrations)
    await sql.exec(readFileSync(`supabase/migrations/${file}`, 'utf8'));
  await sql.query('insert into auth.users values($1,$2),($3,$4),($5,$6),($7,$8)', [
    A,
    'a@test.invalid',
    B,
    'b@test.invalid',
    C,
    'c@test.invalid',
    D,
    'd@test.invalid',
  ]);
  await sql.exec(
    `update public.profiles set onboarded=true,display_name='Test',city='Iguazú';insert into public.events(id,slug,title,description,category,starts_at,ends_at,capacity,status,registration_status) values('${E}','test-event','TEST ONLY','Fictional integration test event','test',now()+interval '10 days',now()+interval '10 days 2 hours',1,'published','open');`,
  );
});
afterAll(async () => sql.close());
describe.sequential('PostgreSQL permissions and transactional registration', () => {
  it('enables RLS on every public table', async () => {
    const r = await sql.query<{ relname: string }>(
      "select relname from pg_class c join pg_namespace n on c.relnamespace=n.oid where n.nspname='public' and c.relkind='r' and not c.relrowsecurity",
    );
    expect(r.rows).toEqual([]);
  });
  it('limits the table grants inherited from the hosted defaults', async () => {
    const { rows } = await sql.query(`select
      has_table_privilege('anon', 'public.events', 'SELECT') as public_events,
      has_table_privilege('anon', 'public.events', 'INSERT') as anonymous_event_insert,
      has_table_privilege('anon', 'public.member_roles', 'SELECT') as anonymous_roles,
      has_table_privilege('authenticated', 'public.events', 'UPDATE') as staff_event_update,
      has_table_privilege('authenticated', 'public.events', 'TRUNCATE') as member_truncate,
      has_table_privilege('authenticated', 'public.event_registrations', 'INSERT') as direct_registration`);
    expect(rows).toEqual([
      {
        public_events: true,
        anonymous_event_insert: false,
        anonymous_roles: false,
        staff_event_update: true,
        member_truncate: false,
        direct_registration: false,
      },
    ]);
  });
  it('keeps profiles opt-in and preferences private', async () => {
    const r = await asUser<{ id: string }>(A, 'select id from profiles');
    expect(r.rows.map((x) => x.id)).toEqual([A]);
    const prefs = await asUser(A, 'select * from member_preferences where member_id=$1', [B]);
    expect(prefs.rows).toHaveLength(0);
  });
  it('prevents self-elevation through both table and RPC', async () => {
    await expect(
      asUser(A, "insert into member_roles(member_id,role) values($1,'admin')", [A]),
    ).rejects.toThrow();
    await expect(asUser(A, "select set_member_role($1,'admin')", [A])).rejects.toThrow('FORBIDDEN');
  });
  it('prevents direct writes to registrations', async () => {
    await expect(
      asUser(
        A,
        "insert into event_registrations(event_id,member_id,status) values($1,$2,'confirmed')",
        [E, A],
      ),
    ).rejects.toThrow();
  });
  it('allows exactly one seat and waitlists overflow under queued requests', async () => {
    const results = await Promise.all([
      asUser<{ register_event: string }>(A, 'select register_event($1)', [E]),
      asUser<{ register_event: string }>(B, 'select register_event($1)', [E]),
      asUser<{ register_event: string }>(C, 'select register_event($1)', [E]),
    ]);
    expect(results.map((r) => r.rows[0].register_event).sort()).toEqual([
      'confirmed',
      'waitlisted',
      'waitlisted',
    ]);
    const count = await sql.query<{ n: number }>(
      "select count(*)::int n from event_registrations where status='confirmed'",
    );
    expect(count.rows[0].n).toBe(1);
  });
  it('makes retries idempotent and does not enqueue duplicate email', async () => {
    await asUser(A, 'select register_event($1)', [E]);
    const count = await sql.query<{ n: number }>(
      'select count(*)::int n from private.email_outbox',
    );
    expect(count.rows[0].n).toBe(3);
  });
  it('promotes the oldest waitlist entry when a confirmed member cancels', async () => {
    const oldest = await sql.query<{ member_id: string }>(
      "select member_id from event_registrations where status='waitlisted' order by created_at,id limit 1",
    );
    await asUser(A, 'select cancel_registration($1)', [E]);
    const r = await sql.query<{ member_id: string; status: string }>(
      "select member_id,status from event_registrations where status='confirmed'",
    );
    expect(r.rows).toEqual([{ member_id: oldest.rows[0].member_id, status: 'confirmed' }]);
  });
  it('denies drafts and closed registration even for authenticated users', async () => {
    await sql.exec("update events set registration_status='closed'");
    await expect(asUser(D, 'select register_event($1)', [E])).rejects.toThrow(
      'REGISTRATION_CLOSED',
    );
    await sql.exec("update events set registration_status='open'");
  });
  it('does not allow capacity reduction below confirmed seats', async () => {
    await expect(sql.exec('update events set capacity=0')).rejects.toThrow();
  });
  it('rejects project edits and moderation by another member', async () => {
    const data = {
      slug: 'test-project',
      title: 'TEST ONLY project',
      description: 'This fictional project exists only in automated integration tests.',
      github_url: '',
      demo_url: '',
      visibility: 'public',
    };
    const r = await asUser<{ save_project: string }>(
      A,
      'select save_project(null,$1::jsonb,$2::text[])',
      [JSON.stringify(data), ['TypeScript']],
    );
    const id = r.rows[0].save_project;
    await expect(
      asUser(B, 'select save_project($1,$2::jsonb,$3::text[])', [id, JSON.stringify(data), []]),
    ).rejects.toThrow('NOT_OWNER');
    await expect(asUser(A, "select moderate_project($1,'published')", [id])).rejects.toThrow(
      'FORBIDDEN',
    );
    const hidden = await asUser(B, 'select * from projects where id=$1', [id]);
    expect(hidden.rows).toHaveLength(0);
  });
  it('publishes only after admin approval, and edits reset moderation', async () => {
    await sql.query("insert into member_roles(member_id,role) values($1,'admin')", [D]);
    const r = await sql.query<{ id: string }>('select id from projects limit 1');
    const id = r.rows[0].id;
    await asUser(D, "select moderate_project($1,'published')", [id]);
    expect((await asUser(B, 'select * from projects where id=$1', [id])).rows).toHaveLength(1);
    await asUser(A, 'select save_project($1,$2::jsonb,$3::text[])', [
      id,
      JSON.stringify({
        title: 'Edited project',
        description: 'This edited description is long enough to pass constraints.',
        visibility: 'public',
      }),
      [],
    ]);
    expect((await asUser(B, 'select * from projects where id=$1', [id])).rows).toHaveLength(0);
  });
  it('stores private inquiries without public insertion access', async () => {
    await expect(asUser(A, "select submit_inquiry('{}'::jsonb)")).rejects.toThrow();
    expect((await asUser(A, 'select * from partnership_inquiries')).rows).toHaveLength(0);
  });
  it('claims each queued email once during its delivery lease', async () => {
    const first = await sql.query('select * from public.claim_email_batch()');
    const second = await sql.query('select * from public.claim_email_batch()');
    expect(first.rows.length).toBeGreaterThan(0);
    expect(second.rows).toHaveLength(0);
  });
  it('records role and content changes in audit logs', async () => {
    const r = await sql.query<{ n: number }>(
      "select count(*)::int n from audit_logs where table_name='member_roles'",
    );
    expect(r.rows[0].n).toBeGreaterThan(0);
  });
});

describe.sequential('onboarding, public access and staff boundaries', () => {
  it('saves only the authenticated profile and keeps visibility opt-in', async () => {
    const data = {
      display_name: 'Updated A',
      city: 'Puerto Iguazú',
      experience: 'junior',
      bio: 'Bio',
      public_profile: false,
      updates: true,
    };
    await asUser(A, 'select save_profile($1::jsonb,$2::uuid[])', [
      JSON.stringify({ ...data, id: B, role: 'admin' }),
      [],
    ]);
    expect((await asUser(A, 'select display_name from profiles where id=$1', [A])).rows).toEqual([
      { display_name: 'Updated A' },
    ]);
    expect((await asUser(B, 'select id from profiles where id=$1', [A])).rows).toHaveLength(0);
    expect(
      (await asUser(A, "select role from member_roles where member_id=$1 and role='admin'", [A]))
        .rows,
    ).toHaveLength(0);
  });
  it('requires onboarding before registration even on direct RPC calls', async () => {
    await sql.query('update profiles set onboarded=false where id=$1', [C]);
    await expect(asUser(C, 'select register_event($1)', [E])).rejects.toThrow(
      'ONBOARDING_REQUIRED',
    );
    await sql.query('update profiles set onboarded=true where id=$1', [C]);
  });
  it('allows public venue reads only when referenced by a public event', async () => {
    const r = await sql.query<{ id: string }>(
      "insert into venues(name,address) values('TEST VENUE','TEST ADDRESS') returning id",
    );
    const id = r.rows[0].id;
    expect((await asUser(A, 'select * from venues where id=$1', [id])).rows).toHaveLength(0);
    await sql.query('update events set venue_id=$1 where id=$2', [id, E]);
    expect((await asUser(A, 'select * from venues where id=$1', [id])).rows).toHaveLength(1);
  });
  it('exposes availability counts without leaking attendee rows', async () => {
    expect(
      (await asUser<{ event_availability: number }>(C, 'select event_availability($1)', [E]))
        .rows[0].event_availability,
    ).toBe(0);
    expect(
      (await asUser(A, 'select * from event_registrations where member_id=$1', [B])).rows,
    ).toHaveLength(0);
  });
  it('restricts organizers to event management and keeps admin operations protected', async () => {
    await sql.query("insert into member_roles(member_id,role) values($1,'organizer')", [C]);
    await asUser(C, "update events set title='Updated by organizer' where id=$1", [E]);
    await expect(
      asUser(A, "update events set title='Hijacked' where id=$1", [E]),
    ).resolves.toMatchObject({ affectedRows: 0 });
    await expect(asUser(C, "select set_member_role($1,'admin')", [C])).rejects.toThrow('FORBIDDEN');
    await expect(
      asUser(C, "insert into partners(name,category,approved) values('Fake','test',true)"),
    ).rejects.toThrow();
  });
  it('hides draft events from members', async () => {
    await sql.query("update events set status='draft' where id=$1", [E]);
    expect((await asUser(A, 'select * from events where id=$1', [E])).rows).toHaveLength(0);
    await sql.query("update events set status='published' where id=$1", [E]);
  });
  it('stops actual capacity reductions below confirmed registrations', async () => {
    const r = await sql.query<{ id: string }>(
      "insert into events(slug,title,description,category,starts_at,ends_at,capacity,status,registration_status) values('capacity-test','TEST ONLY','Test capacity reduction','test',now()+interval '3 days',now()+interval '4 days',2,'published','open') returning id",
    );
    const id = r.rows[0].id;
    await asUser(A, 'select register_event($1)', [id]);
    await asUser(B, 'select register_event($1)', [id]);
    await expect(asUser(C, 'update events set capacity=1 where id=$1', [id])).rejects.toThrow(
      'CAPACITY_BELOW_CONFIRMED',
    );
  });
  it('hides public profiles immediately on deletion request', async () => {
    await sql.query('update profiles set public_profile=true where id=$1', [A]);
    await asUser(A, 'select request_deletion()');
    expect((await asUser(B, 'select * from profiles where id=$1', [A])).rows).toHaveLength(0);
    const r = await asUser<{ deletion_requested_at: string }>(
      A,
      'select deletion_requested_at from member_preferences where member_id=$1',
      [A],
    );
    expect(r.rows[0].deletion_requested_at).toBeTruthy();
  });
});
