import { z } from 'zod';
import { isCountryCode } from '@/lib/countries';
const optionalUrl = z
  .union([
    z.literal(''),
    z.url().refine((v) => /^https?:\/\//.test(v), 'Usá una URL http o https.'),
  ])
  .default('');
export const profileSchema = z.object({
  display_name: z.string().trim().min(2).max(80),
  city: z.string().trim().min(2).max(100),
  country: z.string().refine(isCountryCode),
  experience: z.enum(['starting', 'student', 'junior', 'mid', 'senior']),
  bio: z.string().trim().max(500),
  github_url: optionalUrl.refine(
    (v) => !v || new URL(v).hostname === 'github.com',
    'Usá tu URL de GitHub.',
  ),
  linkedin_url: optionalUrl,
  website: optionalUrl,
  public_profile: z.boolean(),
  updates: z.boolean(),
  interests: z.array(z.string().uuid()).max(15),
});
export const projectSchema = z.object({
  title: z.string().trim().min(3).max(100),
  description: z.string().trim().min(30).max(5000),
  github_url: optionalUrl,
  demo_url: optionalUrl,
  technologies: z.string().max(300),
  visibility: z.enum(['public', 'private']),
});
export const inquirySchema = z.object({
  name: z.string().trim().min(2).max(100),
  email: z.email().max(254),
  organization: z.string().trim().min(2).max(150),
  category: z.enum(['technology', 'education', 'community', 'event', 'venue']),
  message: z.string().trim().min(20).max(3000),
  consent: z.literal(true),
});
export const eventSchema = z
  .object({
    title: z.string().trim().min(3).max(150),
    slug: z
      .string()
      .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/)
      .max(160),
    description: z.string().min(20).max(15000),
    category: z.string().min(2).max(60),
    starts_at: z.iso.datetime({ offset: true }),
    ends_at: z.iso.datetime({ offset: true }),
    capacity: z.coerce.number().int().min(1).max(10000),
    status: z.enum(['draft', 'published', 'completed', 'cancelled']),
    registration_status: z.enum(['open', 'closed']),
    venue_id: z.union([z.literal(''), z.uuid()]),
    registration_opens_at: z.union([z.literal(''), z.iso.datetime({ offset: true })]),
    registration_closes_at: z.union([z.literal(''), z.iso.datetime({ offset: true })]),
    recap: z.string().max(15000),
  })
  .refine((v) => Date.parse(v.ends_at) > Date.parse(v.starts_at), {
    message: 'La fecha de cierre debe ser posterior al inicio.',
  })
  .refine(
    (v) =>
      !v.registration_opens_at ||
      !v.registration_closes_at ||
      Date.parse(v.registration_opens_at) < Date.parse(v.registration_closes_at),
    { message: 'Revisá el período de inscripción.' },
  );
