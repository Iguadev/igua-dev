'use client';

import { useActionState, useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import { ImagePlus, LockKeyhole, Upload } from 'lucide-react';
import { useI18n } from '@/components/i18n/provider';
import { Button } from '@/components/ui/button';
import type { FormState } from '@/components/action-form';
import { uploadAvatar } from '@/features/members/actions';
import { avatarTypes, isAvatarFile } from '@/features/members/avatar';

type Selection = { file: File; preview: string };
type UploadState = FormState & { preview?: string };

export function ProfilePhoto({ savedPhoto }: { savedPhoto?: string }) {
  const { t } = useI18n();
  const fileInput = useRef<HTMLInputElement>(null);
  const [selection, setSelection] = useState<Selection | null>(null);
  const [loadedPreview, setLoadedPreview] = useState<string>();
  const [fileError, setFileError] = useState('');
  const preview = selection?.preview;

  useEffect(() => {
    if (preview) return () => URL.revokeObjectURL(preview);
  }, [preview]);

  const [state, save, pending] = useActionState<UploadState, FormData>(async (_, form) => {
    if (!selection || loadedPreview !== selection.preview) return {};
    form.set('avatar', selection.file);
    const result = await uploadAvatar({}, form);
    if (result.ok) setSelection(null);
    return { ...result, preview: selection.preview };
  }, {});

  const photo = preview ?? savedPhoto;
  const message =
    fileError ||
    (state.ok ? !selection && state.message : state.preview === preview && state.message);

  return (
    <section className="profile-photo" aria-labelledby="profile-photo-title">
      <div className="profile-photo-preview">
        {photo ? (
          <Image
            key={photo}
            src={photo}
            unoptimized
            alt={preview ? t('Vista previa de la imagen') : t('Tu imagen de perfil')}
            width={96}
            height={96}
            onLoad={preview ? () => setLoadedPreview(preview) : undefined}
            onError={
              preview
                ? () => {
                    setSelection(null);
                    setFileError('No pudimos abrir la imagen. Elegí otro archivo.');
                  }
                : undefined
            }
          />
        ) : (
          <ImagePlus size={29} strokeWidth={1.5} aria-hidden="true" />
        )}
      </div>

      <div className="profile-photo-content">
        <h2 id="profile-photo-title">{t('Foto de perfil')}</h2>
        <p id="profile-photo-formats">{t('Imagen PNG, JPG o WebP, hasta 2 MB')}</p>

        <form action={save} className="profile-photo-form">
          <input
            ref={fileInput}
            type="file"
            accept={avatarTypes.join(',')}
            hidden
            onChange={(event) => {
              const file = event.currentTarget.files?.[0];
              event.currentTarget.value = '';
              if (!file) return;
              if (!isAvatarFile(file)) {
                setSelection(null);
                setFileError('Elegí una imagen PNG, JPG o WebP de hasta 2 MB.');
                return;
              }
              setFileError('');
              setSelection({ file, preview: URL.createObjectURL(file) });
            }}
          />
          <div className="profile-photo-actions">
            <Button
              variant="outline"
              type="button"
              disabled={pending}
              aria-describedby="profile-photo-formats"
              onClick={() => fileInput.current?.click()}
            >
              <Upload size={16} aria-hidden="true" />
              {photo ? t('Elegí otra imagen') : t('Elegí una imagen')}
            </Button>
            <Button type="submit" disabled={!selection || loadedPreview !== preview || pending}>
              {pending ? t('Guardando imagen…') : t('Guardar imagen')}
            </Button>
          </div>
          {selection && (
            <div className="profile-photo-selection">
              <span role="status">{selection.file.name}</span>
              <Button
                variant="ghost"
                size="sm"
                type="button"
                disabled={pending}
                onClick={() => setSelection(null)}
              >
                {t('Descartar selección')}
              </Button>
            </div>
          )}
          {message && (
            <p
              className={fileError || !state.ok ? 'form-message error' : 'form-message'}
              role={fileError || !state.ok ? 'alert' : 'status'}
            >
              {t(message)}
            </p>
          )}
        </form>

        <p className="profile-photo-private">
          <LockKeyhole size={14} aria-hidden="true" />
          {t('Tu foto se guarda en privado.')}
        </p>
      </div>
    </section>
  );
}
