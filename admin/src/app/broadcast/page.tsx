'use client';

import { useState } from 'react';
import { api } from '@/lib/api';
import { useConfirm } from '@/components/ConfirmProvider';
import { useToast } from '@/components/ToastProvider';
import { Button, Card, Field, Input, PageHeader, TextArea } from '@/components/ui';

export default function BroadcastPage() {
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [result, setResult] = useState('');
  const confirm = useConfirm();
  const toast = useToast();

  return (
    <div>
      <PageHeader
        title="Bildirim yayınla"
        subtitle="Tüm aktif kullanıcılara inbox bildirimi kuyruğa alınır"
      />
      <Card className="max-w-lg space-y-4">
        <Field label="Başlık">
          <Input
            placeholder="Yeni özellik"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
        </Field>
        <Field label="Mesaj">
          <TextArea
            rows={4}
            placeholder="Kullanıcılara gidecek metin"
            value={body}
            onChange={(e) => setBody(e.target.value)}
          />
        </Field>
        <Button
          onClick={async () => {
            const ok = await confirm({
              title: 'Bildirim gönderilsin mi?',
              description: 'Tüm aktif kullanıcılara bu mesaj iletilecek.',
              confirmLabel: 'Gönder',
            });
            if (!ok) return;
            const { data } = await api.post('/admin/notifications/broadcast', { title, body });
            const msg =
              data.queued != null
                ? `Kuyruğa alındı (${data.queued} kullanıcı)`
                : `${data.sent} kullanıcıya gönderildi`;
            setResult(msg);
            toast(msg);
            setTitle('');
            setBody('');
          }}
        >
          Gönder
        </Button>
        {result ? <p className="text-sm text-(--muted)">{result}</p> : null}
      </Card>
    </div>
  );
}
