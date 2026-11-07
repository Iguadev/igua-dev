// Separate, actual PostgreSQL sessions; no hosted database or real user data.
import EmbeddedPostgres from 'embedded-postgres';
import { readFile, readdir, mkdtemp } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { randomUUID } from 'node:crypto';
import assert from 'node:assert/strict';
const directory = await mkdtemp(join(tmpdir(), 'igua-postgres-'));
const pg = new EmbeddedPostgres({
  databaseDir: join(directory, 'db'),
  user: 'postgres',
  password: randomUUID(),
  port: 55439,
  persistent: false,
  postgresFlags: ['-h', '127.0.0.1'],
  onLog: () => {},
  onError: () => {},
});
let admin;
const clients = [];
try {
  await pg.initialise();
  await pg.start();
  admin = pg.getPgClient();
  await admin.connect();
  await admin.query(await readFile('tests/fixtures/bootstrap.sql', 'utf8'));
  for (const file of (await readdir('supabase/migrations'))
    .filter((f) => f.endsWith('.sql'))
    .sort())
    await admin.query(await readFile(`supabase/migrations/${file}`, 'utf8'));
  const event = randomUUID();
  await admin.query(
    "insert into events(id,slug,title,description,category,starts_at,ends_at,capacity,status,registration_status) values($1,'concurrent-test','TEST ONLY','Fictional concurrency test','test',now()+interval '1 day',now()+interval '2 days',5,'published','open')",
    [event],
  );
  for (let i = 0; i < 24; i++) {
    const id = randomUUID();
    await admin.query('insert into auth.users(id,email) values($1,$2)', [
      id,
      `test-${i}@example.invalid`,
    ]);
    await admin.query("update profiles set onboarded=true,display_name='TEST ONLY' where id=$1", [
      id,
    ]);
    const c = pg.getPgClient();
    await c.connect();
    await c.query('set role authenticated');
    await c.query("select set_config('request.jwt.claim.sub',$1,false)", [id]);
    clients.push(c);
  }
  const results = await Promise.all(
    clients.map((c) => c.query('select register_event($1) result', [event])),
  );
  assert.equal(results.filter((r) => r.rows[0].result === 'confirmed').length, 5);
  assert.equal(results.filter((r) => r.rows[0].result === 'waitlisted').length, 19);
  await Promise.all(clients.map((c) => c.query('select register_event($1)', [event])));
  assert.equal(
    (await admin.query('select count(*)::int n from event_registrations')).rows[0].n,
    24,
  );
  assert.equal(
    (await admin.query('select count(*)::int n from private.email_outbox')).rows[0].n,
    24,
  );
  const cancelled = results.findIndex((r) => r.rows[0].result === 'confirmed');
  const winner = results.findIndex((r) => r.rows[0].result === 'waitlisted');
  await Promise.all([
    clients[cancelled].query('select cancel_registration($1)', [event]),
    clients[winner].query('select register_event($1)', [event]),
  ]);
  assert.equal(
    (await admin.query("select count(*)::int n from event_registrations where status='confirmed'"))
      .rows[0].n,
    5,
  );
  console.log(
    'PASS: 24 concurrent sessions, 5 seats, 19 waitlisted, idempotent retries and cancellation race preserve capacity.',
  );
} finally {
  await Promise.all(clients.map((c) => c.end()));
  if (admin) await admin.end();
  await pg.stop();
}
