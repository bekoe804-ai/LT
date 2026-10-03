import React, { useState } from 'react';
import { View } from 'react-native';
import Animated, { FadeIn, FadeInDown } from 'react-native-reanimated';
import * as Clipboard from 'expo-clipboard';
import { archiveRecord, askDeleteRecord, confirmRecord, saveRecordEdits } from '../actions';
import {
  Avatar,
  Badge,
  Card,
  Chevron,
  Choice,
  Dot,
  Empty,
  Field as Input,
  GlassPill,
  LinkText,
  NavBar,
  Note,
  Page,
  PrimaryButton,
  Row,
  Screen,
  Section,
  SectionLabel,
  Serif,
  T,
  Tap,
  s as ui,
} from '../components/ui';
import { COND, COND_HELP, COND_ORDER, CondId, Field } from '../data';
import { back, go, openPerson } from '../nav';
import { fieldDisplay, fieldKey, maskOf, recordStatus, useNameOf, usePeople, useRecord } from '../records';
import { useApp } from '../store';
import { smooth } from '../layout';
import { color } from '../theme';
import { typeLabel } from './Testament';

// ─── Record ───────────────────────────────────────────────────────────────────

const hideTimers: Record<string, ReturnType<typeof setTimeout>> = {};

function revealField(key: string, label: string, secure: 'mask' | 'face') {
  const { revealed, set, withFace } = useApp.getState();
  if (revealed[key]) {
    set({ revealed: { ...revealed, [key]: false } });
    return;
  }
  const show = () => {
    set({ revealed: { ...useApp.getState().revealed, [key]: true } });
    // Secrets re-mask themselves after 30 seconds.
    clearTimeout(hideTimers[key]);
    hideTimers[key] = setTimeout(() => set({ revealed: { ...useApp.getState().revealed, [key]: false } }), 30000);
  };
  if (secure === 'face') withFace('Reveal ' + label.toLowerCase(), show);
  else show();
}

function copyField(value: string, label: string) {
  Clipboard.setStringAsync(value).catch(() => {});
  useApp.getState().showToast(`${label} copied · clears in 60 seconds`);
  setTimeout(() => Clipboard.setStringAsync('').catch(() => {}), 60000);
}

export function RecordScreen({ id }: { id: string }) {
  const r = useRecord(id);
  const confirmed = useApp((s) => s.confirmed);
  const revealed = useApp((s) => s.revealed);
  const archived = useApp((s) => !!s.archived[id]);
  const people = usePeople();
  const nameOf = useNameOf();
  if (!r) {
    return (
      <Page title="Record">
        <Empty tone="neutral" icon="–" title="This record was deleted" body="It’s kept for 30 days. Ask support if you need it back." />
      </Page>
    );
  }
  const st = recordStatus(r, confirmed, nameOf);
  const recips = r.to.map((p, i) => ({ p: people.find((x) => x.id === p), id: p, when: COND[r.cond] + (i > 0 ? ` · if ${nameOf(r.to[0])} is unavailable` : '') }));
  return (
    <Screen bottom={26}>
      <NavBar onBack={back} right={<GlassPill label="Edit" onPress={() => go(`/record/${id}/edit`)} />} />
      <View style={{ gap: 6 }}>
        <View style={{ flexDirection: 'row', gap: 8, alignItems: 'center' }}>
          <T style={[typeLabel, { letterSpacing: 0.96 }]}>{r.type}</T>
          {r.badge && <Badge label={r.badge} bg={color.stone} fg={color.bronzeInk} style={{ paddingVertical: 3, paddingHorizontal: 7 }} />}
        </View>
        <T accessibilityRole="header" style={{ fontSize: 26, fontWeight: '700', lineHeight: 30 }}>{r.title}</T>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
          <Dot c={st.dotColor} />
          <T style={{ fontSize: 13, color: color.inkSecondary }}>{archived ? 'Archived · not released to anyone' : st.confirmedLong}</T>
        </View>
      </View>

      {st.stale && (
        <Animated.View exiting={undefined} style={{ backgroundColor: color.warningBg, borderRadius: 12, paddingVertical: 16, paddingHorizontal: 18, gap: 12 }}>
          <T style={{ fontSize: 15, lineHeight: 21 }}>{st.reviewPrompt}</T>
          <View style={{ flexDirection: 'row', gap: 8 }}>
            <PrimaryButton label="Yes, still correct" onPress={() => confirmRecord(r.id)} style={{ flex: 1, height: 40, borderRadius: 10 }} textStyle={{ fontSize: 15 }} />
            <PrimaryButton label="Update" onPress={() => go(`/record/${id}/edit`)} style={{ flex: 1, height: 40, borderRadius: 10, backgroundColor: '#fff' }} textStyle={{ fontSize: 15, color: color.brand }} />
          </View>
        </Animated.View>
      )}

      {r.note && (
        <Card style={{ padding: 18 }}>
          <Serif style={{ fontSize: 20, lineHeight: 29 }}>{r.note}</Serif>
        </Card>
      )}

      {r.fields.length > 0 && (
        <Card>
          {r.fields.map((f, i) => {
            const key = fieldKey(r.id, i);
            const on = !!revealed[key];
            const d = fieldDisplay(f, on);
            return (
              <Animated.View
                key={key}
                layout={smooth}
                style={[ui.row, { paddingVertical: 13 }, i < r.fields.length - 1 && ui.divider, f.secure === 'face' && { backgroundColor: color.stone }]}
              >
                <View style={{ gap: 3, flexShrink: 1 }}>
                  <T style={{ fontSize: 13, color: color.inkSecondary }}>{f.label}</T>
                  <Animated.View key={on ? 'on' : 'off'} entering={FadeIn.duration(220)}>
                    <T style={[{ fontSize: 17, lineHeight: 23, color: d.textColor }, d.mono && [ui.mono, { letterSpacing: 1.36 }]]}>{d.shown}</T>
                  </Animated.View>
                </View>
                {f.secure && (
                  <View style={{ alignItems: 'flex-end' }}>
                    <Tap onPress={() => revealField(key, f.label, f.secure as 'mask' | 'face')} accessibilityLabel={`${d.action} ${f.label}`} hitSlop={8}>
                      <T style={{ fontSize: 15, fontWeight: '600', color: color.brand, paddingVertical: 8, paddingLeft: 12 }}>{d.action}</T>
                    </Tap>
                    {on && (
                      <Animated.View entering={FadeIn}>
                        <Tap onPress={() => copyField(f.value, f.label)} hitSlop={8}>
                          <T style={{ fontSize: 13, fontWeight: '600', color: color.inkSecondary, paddingLeft: 12 }}>Copy</T>
                        </Tap>
                      </Animated.View>
                    )}
                  </View>
                )}
              </Animated.View>
            );
          })}
        </Card>
      )}

      {recips.length > 0 ? (
        <Section label="Who receives this">
          <Card>
            {recips.map((x, i) => (
              <Row key={x.id} onPress={() => openPerson(x.id)} last={i === recips.length - 1} style={{ paddingVertical: 12, justifyContent: 'flex-start' }}>
                <Avatar initial={x.p?.initial ?? '?'} dark={x.p?.dark} size={32} fontSize={13} />
                <View style={{ gap: 1, flex: 1 }}>
                  <T style={{ fontSize: 17, fontWeight: '600' }}>{x.p?.name ?? 'Removed person'}</T>
                  <T style={{ fontSize: 13, color: color.inkSecondary }}>{x.when}</T>
                </View>
                <Chevron />
              </Row>
            ))}
          </Card>
        </Section>
      ) : (
        <Tap onPress={() => go(`/record/${id}/edit`)} scale style={dashed}>
          <View style={{ gap: 2 }}>
            <T style={{ fontSize: 15, fontWeight: '600' }}>Only you can see this</T>
            <T style={{ fontSize: 13, color: color.inkSecondary }}>No recipient chosen yet</T>
          </View>
          <T style={{ fontSize: 15, fontWeight: '600', color: color.brand }}>Choose</T>
        </Tap>
      )}

      {r.docs.length > 0 && (
        <Section label={`Documents · ${r.docs.length}`}>
          <Card>
            {r.docs.map(([name, m], i) => (
              <Row key={name} onPress={() => go(`/document?rec=${id}&i=${i}`)} last={i === r.docs.length - 1} style={{ paddingVertical: 12, justifyContent: 'flex-start' }}>
                <View style={{ width: 32, height: 40, borderRadius: 4, backgroundColor: color.stone, borderWidth: 1, borderColor: color.track }} />
                <View style={{ gap: 1, flex: 1 }}>
                  <T numberOfLines={1} style={{ fontSize: 15, fontWeight: '600' }}>{name}</T>
                  <T style={{ fontSize: 13, color: color.inkSecondary }}>{m}</T>
                </View>
                <Chevron />
              </Row>
            ))}
          </Card>
        </Section>
      )}

      <View style={{ flexDirection: 'row', justifyContent: 'center', gap: 24, paddingVertical: 6 }}>
        <LinkText label="History" onPress={() => go(`/record/${id}/history`)} />
        {!archived && <LinkText label="Archive" onPress={() => archiveRecord(r.id)} />}
        <LinkText label="Delete" danger onPress={() => askDeleteRecord(r.id)} />
      </View>
    </Screen>
  );
}
const dashed = { borderWidth: 1, borderStyle: 'dashed', borderColor: color.bronze, borderRadius: 12, paddingVertical: 14, paddingHorizontal: 18, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 12 } as const;

// ─── History ──────────────────────────────────────────────────────────────────

export function RecordHistory({ id }: { id: string }) {
  const r = useRecord(id);
  const events = useApp((s) => s.history[id] ?? []);
  const nameOf = useNameOf();
  if (!r) return <Page title="History"><Empty tone="neutral" title="Record not found" /></Page>;
  const seed = r.id.startsWith('new')
    ? []
    : [
        { text: r.months >= 12 ? `Last confirmed correct · ${r.months} months ago` : `Confirmed correct`, when: r.confirmed },
        { text: `Recipients set · ${r.to.map(nameOf).join(', ') || 'only you'} · ${COND[r.cond]}`, when: 'When created' },
        { text: `Created · ${r.type}`, when: r.months >= 12 ? `${r.months + 2} months ago` : 'Earlier this year' },
      ];
  const all = [...events, ...seed];
  return (
    <Page title="History" heading={r.title} lead="Every change is recorded. Nothing about this record changes silently.">
      <Card style={{ padding: 18 }}>
        {all.map((e, i) => (
          <Animated.View key={i} entering={FadeInDown.delay(i * 50)} style={{ flexDirection: 'row', gap: 14 }}>
            <View style={{ alignItems: 'center' }}>
              <View style={{ width: 12, height: 12, borderRadius: 6, marginTop: 4, backgroundColor: i === 0 ? color.brand : 'transparent', borderWidth: 2, borderColor: i === 0 ? color.brand : color.border }} />
              {i < all.length - 1 && <View style={{ width: 2, flex: 1, backgroundColor: color.track }} />}
            </View>
            <View style={{ paddingBottom: i < all.length - 1 ? 18 : 0, gap: 2, flex: 1 }}>
              <T style={{ fontSize: 15, fontWeight: '600' }}>{e.text}</T>
              <T style={{ fontSize: 13, color: color.inkMuted }}>{e.when}</T>
            </View>
          </Animated.View>
        ))}
      </Card>
      <T style={{ fontSize: 13, color: color.inkMuted, textAlign: 'center' }}>Secret values are never stored in history.</T>
    </Page>
  );
}

// ─── Secure document viewer ──────────────────────────────────────────────────

export function DocumentViewer({ recId, index }: { recId: string; index: number }) {
  const r = useRecord(recId);
  const withFace = useApp((s) => s.withFace);
  const showToast = useApp((s) => s.showToast);
  const doc = r?.docs[index];
  const encrypted = !!doc?.[1].includes('encrypted') || r?.badge === 'Sealed';
  const [open, setOpen] = useState(!encrypted);
  const [page, setPage] = useState(0);
  if (!r || !doc) return <Page title="Document"><Empty tone="neutral" title="Document not found" /></Page>;
  const pages = /\.(jpg|png)$/i.test(doc[0]) ? 1 : 3;
  const isAudio = /\.m4a$/i.test(doc[0]);
  return (
    <Page title={doc[0]} gap={16}>
      <View style={{ aspectRatio: isAudio ? 2.2 : 0.75, borderRadius: 12, backgroundColor: '#fff', boxShadow: '0 8px 24px rgba(26,26,26,0.08), 0 0 0 1px #E8E4DC', overflow: 'hidden', padding: 22, gap: 10 }}>
        {open ? (
          <Animated.View key={page} entering={FadeIn.duration(260)} style={{ flex: 1, gap: 10 }}>
            {isAudio ? (
              <View style={{ flex: 1, justifyContent: 'center', gap: 14 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 3, height: 40 }}>
                  {Array.from({ length: 36 }, (_, i) => (
                    <View key={i} style={{ flex: 1, height: 8 + ((i * 37) % 30), borderRadius: 2, backgroundColor: i < 12 ? color.brand : color.track }} />
                  ))}
                </View>
                <T style={{ fontSize: 13, color: color.inkSecondary }}>0:42 / 2:14 · Voice note</T>
              </View>
            ) : (
              <>
                <T style={{ fontSize: 13, fontWeight: '700', color: color.inkTertiary }}>{r.title.toUpperCase()}</T>
                {Array.from({ length: 11 }, (_, i) => (
                  <View key={i} style={{ height: 7, borderRadius: 3, backgroundColor: color.hairline, width: `${92 - ((i * 23 + page * 11) % 38)}%` }} />
                ))}
                <View style={{ flex: 1 }} />
                <T style={{ fontSize: 11, color: color.inkMuted, textAlign: 'center' }}>Viewed by Nana Mensah · 3 Oct 2026 · Page {page + 1} of {pages}</T>
              </>
            )}
          </Animated.View>
        ) : (
          <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12 }}>
            <View style={{ width: 48, height: 48, borderRadius: 24, backgroundColor: color.stone, alignItems: 'center', justifyContent: 'center' }}>
              <View style={{ width: 16, height: 12, borderRadius: 3, backgroundColor: color.brand, marginTop: 6 }} />
              <View style={{ position: 'absolute', top: 11, width: 12, height: 12, borderRadius: 6, borderWidth: 2.5, borderColor: color.brand }} />
            </View>
            <T style={{ fontSize: 17, fontWeight: '600' }}>Encrypted document</T>
            <T style={{ fontSize: 13, color: color.inkSecondary, textAlign: 'center', maxWidth: 240, lineHeight: 19 }}>Previews stay hidden until you confirm it’s you.</T>
            <PrimaryButton label="View with Face ID" onPress={() => withFace('View document', () => setOpen(true))} style={{ paddingHorizontal: 22, marginTop: 6 }} />
          </View>
        )}
      </View>
      {open && pages > 1 && (
        <View style={{ flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 18 }}>
          <LinkText label="‹ Previous" onPress={() => setPage((p) => Math.max(0, p - 1))} style={page === 0 ? { color: color.inkMuted } : undefined} />
          <T style={{ fontSize: 13, color: color.inkSecondary }}>{page + 1} / {pages}</T>
          <LinkText label="Next ›" onPress={() => setPage((p) => Math.min(pages - 1, p + 1))} style={page === pages - 1 ? { color: color.inkMuted } : undefined} />
        </View>
      )}
      <Card>
        <Row><T style={{ fontSize: 15, color: color.inkSecondary }}>File</T><T style={{ fontSize: 15 }}>{doc[1]}</T></Row>
        <Row><T style={{ fontSize: 15, color: color.inkSecondary }}>Attached to</T><T style={{ fontSize: 15, flexShrink: 1, textAlign: 'right' }}>{r.title}</T></Row>
        <Row last><T style={{ fontSize: 15, color: color.inkSecondary }}>Screenshots</T><T style={{ fontSize: 15 }}>Blocked</T></Row>
      </Card>
      <View style={{ flexDirection: 'row', gap: 10 }}>
        <PrimaryButton label="Save a copy" onPress={() => withFace('Download document', () => showToast('Saved to Files · encrypted'))} style={{ flex: 1, height: 48, backgroundColor: color.stone }} textStyle={{ color: color.brand, fontSize: 15 }} />
        <PrimaryButton label="Replace file" onPress={() => showToast('Choose a file to replace it — uploads are encrypted')} style={{ flex: 1, height: 48, backgroundColor: color.stone }} textStyle={{ color: color.brand, fontSize: 15 }} />
      </View>
    </Page>
  );
}

// ─── Edit record ──────────────────────────────────────────────────────────────

export function EditRecord({ id }: { id: string }) {
  const r = useRecord(id);
  const people = usePeople();
  const withFace = useApp((s) => s.withFace);
  const set = useApp((s) => s.set);
  const [title, setTitle] = useState(r?.title ?? '');
  const [values, setValues] = useState(r?.fields.map((f) => f.value) ?? []);
  const [unlocked, setUnlocked] = useState<Record<number, boolean>>({});
  const [note, setNote] = useState(r?.note ?? '');
  const [to, setTo] = useState<string[]>(r?.to ?? []);
  const [cond, setCond] = useState<CondId>(r?.cond ?? 'pass');
  if (!r) return <Page title="Edit"><Empty tone="neutral" title="Record not found" /></Page>;
  const dirty = title !== r.title || note !== (r.note ?? '') || cond !== r.cond || to.join() !== r.to.join() || values.some((v, i) => v !== r.fields[i].value);
  const releaseChanged = cond !== r.cond || to.join() !== r.to.join();
  const leave = () => {
    if (!dirty) return back();
    set({ dialog: { title: 'Discard changes?', body: 'Your edits to this record haven’t been saved.', confirm: 'Discard', cancel: 'Keep editing', danger: true, noFace: true, then: back } });
  };
  const save = () => {
    const fields: Field[] = r.fields.map((f, i) => ({ ...f, value: values[i], m: f.secure === 'mask' && values[i] !== f.value ? maskOf(values[i]) : f.m }));
    saveRecordEdits(id, { title, fields, to, cond, note: r.note !== undefined ? note : undefined });
  };
  return (
    <Page title="Edit record" onBack={leave} right={<LinkText label="Save" onPress={save} style={!dirty ? { color: color.inkMuted } : undefined} />}>
      <Card>
        <Input label="Title" value={title} onChangeText={setTitle} last={r.fields.length === 0 && r.note === undefined} />
      </Card>
      {r.note !== undefined && (
        <Card>
          <Input label="Your words" value={note} onChangeText={setNote} multiline last />
        </Card>
      )}
      {r.fields.length > 0 && (
        <Card>
          {r.fields.map((f, i) =>
            f.secure === 'face' && !unlocked[i] ? (
              <Row key={i} last={i === r.fields.length - 1} style={{ backgroundColor: color.stone }}>
                <View style={{ gap: 3, flex: 1 }}>
                  <T style={{ fontSize: 13, color: color.inkSecondary }}>{f.label}</T>
                  <T style={[{ fontSize: 17, color: color.inkSecondary }, ui.mono]}>{f.m}</T>
                </View>
                <LinkText label="Face ID to edit" onPress={() => withFace(`Edit ${f.label.toLowerCase()}`, () => setUnlocked((u) => ({ ...u, [i]: true })))} />
              </Row>
            ) : (
              <Input key={i} label={f.label} value={values[i]} mono={!!f.secure} onChangeText={(v) => setValues((vs) => vs.map((x, j) => (j === i ? v : x)))} last={i === r.fields.length - 1} multiline={values[i].length > 60} />
            ),
          )}
        </Card>
      )}
      <Section label="Who receives this">
        <Card>
          {people.map((p, i) => (
            <Choice
              key={p.id}
              on={to.includes(p.id)}
              title={p.full}
              sub={`${p.relationship} · ${p.status === 'invited' ? 'Invitation pending' : p.role === 'primary' ? 'Primary contact' : p.role === 'backup' ? 'Backup contact' : 'Recipient only'}`}
              left={<Avatar initial={p.initial} dark={p.dark} size={32} fontSize={13} />}
              onPress={() => setTo((t) => (t.includes(p.id) ? t.filter((x) => x !== p.id) : [...t, p.id]))}
              last={i === people.length - 1}
            />
          ))}
        </Card>
      </Section>
      <Section label="When can they receive it?">
        <Card>
          {COND_ORDER.map((c, i) => (
            <Choice key={c} radio on={cond === c} title={COND[c]} sub={COND_HELP[c]} onPress={() => setCond(c)} last={i === COND_ORDER.length - 1} />
          ))}
        </Card>
      </Section>
      {releaseChanged && (
        <Animated.View entering={FadeInDown}>
          <Note tone="warning" title="This changes who receives it" body="You’ll confirm with Face ID. Nobody is notified — they only see what you’ve left them if a release happens." />
        </Animated.View>
      )}
      <PrimaryButton label="Save changes" onPress={save} disabled={!dirty} />
    </Page>
  );
}

