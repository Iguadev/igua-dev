'use client';

import { useI18n } from '@/components/i18n/provider';
import { useActionState } from 'react';
import { Button } from './ui/button';
import { motion, useReducedMotion } from 'motion/react';
export type FormState = { ok?: boolean; message?: string };
export type FormAction = (state: FormState, form: FormData) => Promise<FormState>;
export function ActionForm({
  action,
  children,
  submit = 'Guardar',
  disabled = false,
  className = '',
  danger = false,
}: {
  action: FormAction;
  children?: React.ReactNode;
  submit?: string;
  disabled?: boolean;
  className?: string;
  danger?: boolean;
}) {
  const { t, language } = useI18n();
  const [state, formAction, pending] = useActionState(action, {});
  const reduced = useReducedMotion();
  return (
    <form action={formAction} className={`form ${className}`}>
      {children}
      {state.message && (
        <motion.div
          initial={{ opacity: reduced ? 1 : 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.15 }}
          role={state.ok ? 'status' : 'alert'}
          aria-live="polite"
          className={`form-message ${state.ok ? '' : 'error'}`}
        >
          {t(state.message)}
        </motion.div>
      )}
      <Button
        type="submit"
        variant={danger ? 'destructive' : 'default'}
        disabled={disabled || pending}
      >
        {pending ? t('Un momento…') : t(submit)}
      </Button>
    </form>
  );
}
export function Field({
  label,
  name,
  type = 'text',
  defaultValue = '',
  required = false,
  placeholder = '',
  maxLength,
  minLength,
  autoComplete,
}: {
  label: string;
  name: string;
  type?: string;
  defaultValue?: string | number;
  required?: boolean;
  placeholder?: string;
  maxLength?: number;
  minLength?: number;
  autoComplete?: string;
}) {
  return (
    <div>
      <label htmlFor={name}>{label}</label>
      <input
        id={name}
        name={name}
        type={type}
        defaultValue={defaultValue}
        required={required}
        placeholder={placeholder}
        maxLength={maxLength}
        autoComplete={autoComplete}
        minLength={minLength}
      />
    </div>
  );
}
export function TextArea({
  label,
  name,
  defaultValue = '',
  required = false,
  minLength,
  maxLength,
}: {
  label: string;
  name: string;
  defaultValue?: string;
  required?: boolean;
  minLength?: number;
  maxLength?: number;
}) {
  return (
    <div>
      <label htmlFor={name}>{label}</label>
      <textarea
        id={name}
        name={name}
        defaultValue={defaultValue}
        required={required}
        minLength={minLength}
        maxLength={maxLength}
      />
    </div>
  );
}
