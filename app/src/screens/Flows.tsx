import React, { useEffect, useRef, useState } from 'react';
import { View } from 'react-native';
import Animated, {
  FadeIn,
  FadeInDown,
  FadeInRight,
  FadeOutLeft,
  SlideInLeft,
  SlideInRight,
  SlideOutLeft,
  SlideOutRight,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import { createRecord, reviewAnswer, saveDraftLater } from '../actions';
import {
  Avatar,
  Badge,
  Card,
  Choice,
  Field as Input,
  LinkText,
  NavBar,
  Note,
  PrimaryButton,
  Progress,
  Row,
  RowText,
  Screen,
  SecondaryButton,
  Section,
  SectionLabel,
  Serif,
  Spacer,
  T,
  Tap,
  TextButton,
  ring,
  s as ui,
  useReduceMotion,
} from '../components/ui';
import { CATS, COND, COND_HELP, COND_ORDER, CondId, ROLE_LABEL, TEMPLATES } from '../data';
import { back, go, openRec, tab } from '../nav';
import { fieldDisplay, maskOf, recordStatus, useNameOf, usePeople, useReviewList } from '../records';
import { useApp } from '../store';
import { smooth } from '../layout';
import { color } from '../theme';
import { typeLabel } from './Testament';

// ─── Review ───────────────────────────────────────────────────────────────────

const RESULT_TONE = {
  Confirmed: { bg: color.positiveBg, fg: color.positive },
  'To update': { bg: color.warningBg, fg: color.warning },
  Later: { bg: color.neutralBg, fg: color.inkSecondary },
} as const;

export function Review() {
  const list = useReviewList();
  const confirmed = useApp((s) => s.confirmed);
  const idx = useApp((s) => s.reviewIdx);
  const results = useApp((s) => s.reviewResults);
  const nameOf = useNameOf();
  const r = list[idx];
  const total = results.length + Math.max(0, list.length - idx);

  if (!r) {
    const c = results.filter((x) => x.label === 'Confirmed').length;
    const u = results.filter((x) => x.label === 'To update').length;
    const summary = results.length
      ? (c ? `${c} confirmed` : 'Nothing confirmed') + (u ? `, ${u} to update` : '') + '. We’ll ask again in a year.'
      : 'Everything in your Testament has been confirmed in the last year.';
    return (
      <Screen gap={20} bottom={6}>
        <NavBar onBack={back} title="Review" />
        <Animated.View entering={FadeInDown.springify().damping(16)} style={{ flex: 1, justifyContent: 'center', alignItems: 'center', gap: 14, minHeight: 260 }}>
          <View style={{ width: 56, height: 56, borderRadius: 28, backgroundColor: color.positiveBg, alignItems: 'center', justifyContent: 'center' }}>
            <T style={{ color: color.positive, fontSize: 24, fontWeight: '700' }}>✓</T>
          </View>
          <Serif style={{ fontSize: 34, lineHeight: 37 }}>All reviewed.</Serif>
          <T style={{ fontSize: 15, color: color.inkSecondary, lineHeight: 22.5, maxWidth: 300, textAlign: 'center' }}>{summary}</T>
        </Animated.View>
        {results.length > 0 && (
          <Card>
            {results.map((x, i) => (
              <Row key={x.id + i} onPress={() => (x.label === 'To update' ? go(`/record/${x.id}/edit`) : openRec(x.id))} last={i === results.length - 1} style={{ paddingVertical: 12 }}>
                <T numberOfLines={1} style={{ fontSize: 15, flexShrink: 1 }}>{x.title}</T>
                <Badge label={x.label === 'To update' ? 'Update now' : x.label} bg={RESULT_TONE[x.label].bg} fg={RESULT_TONE[x.label].fg} />
              </Row>
            ))}
          </Card>
        )}
        <PrimaryButton label="Back to Home" onPress={() => tab('home')} />
      </Screen>
    );
  }

  const st = recordStatus(r, confirmed, nameOf);
  return (
    <Screen gap={20} bottom={6} cascade={false}>
      <NavBar onBack={back} title="Review" />
      <Progress done={results.length} total={total} />
      <View style={{ gap: 8 }}>
        <T accessibilityRole="header" style={{ fontSize: 26, fontWeight: '700', lineHeight: 30 }}>Is this still correct?</T>
        <T style={{ fontSize: 15, color: color.inkSecondary, lineHeight: 22 }}>
          Record {results.length + 1} of {total} · {r.cat.name}
        </T>
      </View>
      <Animated.View key={r.id} entering={FadeInRight.springify().damping(18)} exiting={FadeOutLeft.duration(180)}>
        <View style={{ backgroundColor: '#fff', borderRadius: 16, padding: 20, gap: 14, boxShadow: `0 8px 24px rgba(26,26,26,0.08), ${ring}` }}>
          <View style={{ gap: 3 }}>
            <T style={typeLabel}>{r.type}</T>
            <T style={{ fontSize: 22, fontWeight: '700', lineHeight: 26 }}>{r.title}</T>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
              <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: color.warning }} />
              <T style={{ fontSize: 13, color: color.warning }}>{st.confirmedLong}</T>
            </View>
          </View>
          <View style={{ borderTopWidth: 1, borderTopColor: color.hairline }}>
            {r.fields.slice(0, 3).map((f, i) => {
              const d = fieldDisplay(f, false);
              return (
                <View key={i} style={{ paddingVertical: 11, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 12, borderBottomWidth: 1, borderBottomColor: color.hairline }}>
                  <T style={{ fontSize: 13, color: color.inkSecondary }}>{f.label}</T>
                  <T style={[{ fontSize: 15, textAlign: 'right', flexShrink: 1 }, d.mono && [ui.mono, { letterSpacing: 1.2 }]]}>{d.shown}</T>
                </View>
              );
            })}
          </View>
          <T style={{ fontSize: 13, color: color.inkSecondary, lineHeight: 19 }}>
            → {st.recipientsShort} · {st.condition}
          </T>
          <LinkText label="Open full record" onPress={() => openRec(r.id)} style={{ fontSize: 13 }} />
        </View>
      </Animated.View>
      <Spacer />
      <View style={{ gap: 10 }}>
        <PrimaryButton label="Yes, still correct" onPress={() => reviewAnswer('Confirmed')} />
        <View style={{ flexDirection: 'row', gap: 10 }}>
          <SecondaryButton label="Needs updating" onPress={() => reviewAnswer('To update')} style={{ flex: 1 }} />
          <TextButton label="Ask me later" onPress={() => reviewAnswer('Later')} style={{ flex: 1, height: 48 }} textStyle={{ fontSize: 15 }} />
        </View>
      </View>
    </Screen>
  );
}

// ─── Wizard scaffolding ───────────────────────────────────────────────────────

/** Steps slide in from the side you're moving towards. */
export function StepView({ step, dir, children }: { step: number; dir: 1 | -1; children: React.ReactNode }) {
  const reduce = useReduceMotion();
  return (
    <Animated.View
      key={step}
      entering={reduce ? FadeIn : (dir > 0 ? SlideInRight : SlideInLeft).springify().damping(22).stiffness(200)}
      exiting={reduce ? undefined : (dir > 0 ? SlideOutLeft : SlideOutRight).duration(200)}
      style={{ gap: 20, flexGrow: 1 }}
    >
      {children}
    </Animated.View>
  );
}

function Heading({ title, lead }: { title: string; lead?: string }) {
  return (
    <View style={{ gap: 8 }}>
      <T accessibilityRole="header" style={{ fontSize: 26, fontWeight: '700', lineHeight: 30 }}>{title}</T>
      {lead && <T style={{ fontSize: 15, color: color.inkSecondary, lineHeight: 22 }}>{lead}</T>}
    </View>
  );
}

// ─── Add record (6 steps) ─────────────────────────────────────────────────────

const STEPS = ['Type', 'Details', 'Evidence', 'Recipients', 'When', 'Review'];

function Upload({ name, onDone }: { name: string; onDone: () => void }) {
  const v = useSharedValue(0);
  useEffect(() => {
    v.value = withTiming(1, { duration: 1300 });
    const t = setTimeout(onDone, 1350);
    return () => clearTimeout(t);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps
  const bar = useAnimatedStyle(() => ({ width: `${v.value * 100}%` }));
  return (
    <View style={{ gap: 6, paddingVertical: 12, paddingHorizontal: 18 }}>
      <T style={{ fontSize: 15, fontWeight: '600' }}>{name}</T>
      <View style={{ height: 4, borderRadius: 2, backgroundColor: color.track, overflow: 'hidden' }}>
        <Animated.View style={[{ height: 4, backgroundColor: color.brand }, bar]} />
      </View>
      <T style={{ fontSize: 12, color: color.inkMuted }}>Encrypting and uploading…</T>
    </View>
  );
}

const SAMPLE_FILES: [string, string][] = [
  ['Policy schedule 2026.pdf', '420 KB · encrypted'],
  ['Photo of card — front.jpg', '1.3 MB · encrypted'],
  ['Renewal letter.pdf', '260 KB · encrypted'],
];

export function AddRecord({ templateId, catId }: { templateId?: string; catId?: string }) {
  const people = usePeople();
  const set = useApp((s) => s.set);
  const initialT = TEMPLATES.find((t) => t.id === templateId) ?? null;
  const [step, setStep] = useState(initialT ? 1 : 0);
  const dir = useRef<1 | -1>(1);
  const [pickCat, setPickCat] = useState<string | null>(initialT?.catId ?? catId ?? null);
  const [tplId, setTplId] = useState<string | null>(initialT?.id ?? null);
  const tpl = TEMPLATES.find((t) => t.id === tplId) ?? null;
  const [title, setTitle] = useState(initialT?.titleSample ?? '');
  const [values, setValues] = useState<string[]>(initialT?.fields.map((f) => f.sample) ?? []);
  const [note, setNote] = useState(initialT?.note ?? '');
  const [docs, setDocs] = useState<[string, string][]>([]);
  const [uploading, setUploading] = useState<string | null>(null);
  const [tooBig, setTooBig] = useState(false);
  const [to, setTo] = useState<string[]>(['ama']);
  const [cond, setCond] = useState<CondId>(initialT?.catId === 'ins' ? 'pass' : 'pass');
  const nameOf = useNameOf();

  const chooseTemplate = (id: string) => {
    const t = TEMPLATES.find((x) => x.id === id)!;
    setTplId(id);
    setTitle(t.titleSample);
    setValues(t.fields.map((f) => f.sample));
    setNote(t.note ?? '');
    if (t.catId === 'wish' || t.catId === 'msg') setCond('pass');
    next();
  };
  const next = () => {
    dir.current = 1;
    setStep((s) => Math.min(STEPS.length - 1, s + 1));
  };
  const prev = () => {
    dir.current = -1;
    if (step === 0 || (step === 1 && initialT)) {
      if (!tpl) return back();
      return set({ dialog: { title: 'Leave this record?', body: 'You can keep it as a draft and finish later, or discard it.', confirm: 'Discard', cancel: 'Keep editing', danger: true, noFace: true, then: back } });
    }
    if (step === 0 && pickCat) return setPickCat(null);
    setStep((s) => s - 1);
  };
  const addFile = () => {
    if (uploading) return;
    const f = SAMPLE_FILES[docs.length % SAMPLE_FILES.length];
    setTooBig(false);
    setUploading(f[0]);
  };

  const recipientsLine = to.length ? to.map(nameOf).join(', ') : 'Only you';

  return (
    <Screen gap={20} bottom={6} cascade={false}>
      <NavBar
        onBack={() => (step === 0 && pickCat && !initialT ? setPickCat(null) : prev())}
        title={STEPS[step]}
        right={tpl ? <LinkText label="Save & finish later" onPress={saveDraftLater} style={{ fontSize: 15 }} /> : undefined}
      />
      <Progress done={step + 1} total={STEPS.length} />

      {step === 0 && !pickCat && (
        <StepView step={0} dir={dir.current}>
          <Heading title="What would you like to preserve?" lead="Choose a kind of record. Each one asks only for what matters." />
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10 }}>
            {CATS.map((c, i) => (
              <Animated.View key={c.id} entering={FadeInDown.delay(i * 30)} style={{ width: '48%', flexGrow: 1 }}>
                <Tap onPress={() => setPickCat(c.id)} scale haptic style={{ backgroundColor: '#fff', borderRadius: 12, padding: 16, gap: 6, boxShadow: ring, minHeight: 96 }}>
                  <T style={{ fontSize: 15, fontWeight: '600' }}>{c.name}</T>
                  <T style={{ fontSize: 12, color: color.inkSecondary, lineHeight: 16 }} numberOfLines={3}>{c.blurb}</T>
                </Tap>
              </Animated.View>
            ))}
          </View>
        </StepView>
      )}

      {step === 0 && pickCat && (
        <StepView step={0.5} dir={1}>
          <Heading title={CATS.find((c) => c.id === pickCat)?.name ?? ''} lead="Pick a template. You can change any field." />
          <Card>
            {TEMPLATES.filter((t) => t.catId === pickCat).map((t, i, arr) => (
              <Row key={t.id} onPress={() => chooseTemplate(t.id)} last={i === arr.length - 1}>
                <RowText title={t.name} sub={t.hint} />
                <T style={{ color: color.inkMuted }}>›</T>
              </Row>
            ))}
          </Card>
          <LinkText label="Choose a different kind" onPress={() => setPickCat(null)} />
        </StepView>
      )}

      {step === 1 && tpl && (
        <StepView step={1} dir={dir.current}>
          <Heading title={tpl.name} lead="Sensitive fields are encrypted and masked once saved." />
          <Card>
            <Input label="Name this record" value={title} onChangeText={setTitle} last={tpl.fields.length === 0 && !tpl.note} />
          </Card>
          {tpl.note !== undefined && (
            <Card>
              <Input label={tpl.catId === 'msg' ? 'Your letter' : 'In your own words'} value={note} onChangeText={setNote} multiline last />
            </Card>
          )}
          {tpl.fields.length > 0 && (
            <Card>
              {tpl.fields.map((f, i) => (
                <View key={f.label}>
                  <Input
                    label={f.label + (f.secure === 'face' ? ' · Face ID to reveal' : f.secure === 'mask' ? ' · masked' : '')}
                    value={values[i]}
                    secureTextEntry={f.secure === 'face'}
                    mono={!!f.secure}
                    onChangeText={(v) => setValues((vs) => vs.map((x, j) => (j === i ? v : x)))}
                    last={i === tpl.fields.length - 1}
                  />
                </View>
              ))}
            </Card>
          )}
          {tpl.catId === 'wish' && <Note body="This will be saved as a wish — not a legally binding will. Upload a signed will under Documents." />}
          <Spacer />
          <PrimaryButton label="Continue" onPress={next} disabled={!title.trim()} />
        </StepView>
      )}

      {step === 2 && (
        <StepView step={2} dir={dir.current}>
          <Heading title="Add supporting documents" lead="Statements, photos, certificates. Optional — you can add them later." />
          {(docs.length > 0 || uploading) && (
            <Card>
              {docs.map(([n, m], i) => (
                <Animated.View key={n + i} entering={FadeIn} layout={smooth}>
                  <Row last={i === docs.length - 1 && !uploading}>
                    <View style={{ width: 28, height: 36, borderRadius: 4, backgroundColor: color.stone, borderWidth: 1, borderColor: color.track }} />
                    <RowText title={n} sub={m} titleStyle={{ fontSize: 15 }} />
                    <Tap onPress={() => setDocs((d) => d.filter((_, j) => j !== i))} hitSlop={8}>
                      <T style={{ fontSize: 15, color: color.danger, fontWeight: '600' }}>Remove</T>
                    </Tap>
                  </Row>
                </Animated.View>
              ))}
              {uploading && (
                <Upload
                  name={uploading}
                  onDone={() => {
                    const f = SAMPLE_FILES.find((x) => x[0] === uploading)!;
                    setDocs((d) => [...d, f]);
                    setUploading(null);
                  }}
                />
              )}
            </Card>
          )}
          {tooBig && (
            <Animated.View entering={FadeInDown}>
              <Note tone="danger" title="That video is too large" body="Files can be up to 50 MB. Try a shorter clip, or add it from a computer." />
            </Animated.View>
          )}
          <View style={{ flexDirection: 'row', gap: 10 }}>
            <SecondaryButton label="Scan a document" onPress={addFile} style={{ flex: 1 }} />
            <SecondaryButton label="Choose a file" onPress={addFile} style={{ flex: 1 }} />
          </View>
          <LinkText label="Try adding a video (too large)" onPress={() => setTooBig(true)} style={{ fontSize: 13, color: color.inkSecondary }} />
          <Spacer />
          <PrimaryButton label={docs.length ? 'Continue' : 'Skip for now'} onPress={next} disabled={!!uploading} />
        </StepView>
      )}

      {step === 3 && (
        <StepView step={3} dir={dir.current}>
          <Heading title="Who should receive this?" lead={`${title || tpl?.name}. You’ll choose when in the next step. Only you can see it until then.`} />
          <Card>
            {people.map((p, i) => (
              <Choice
                key={p.id}
                on={to.includes(p.id)}
                title={p.full}
                sub={`${p.relationship} · ${p.status === 'invited' ? 'Invitation pending' : ROLE_LABEL[p.role]}`}
                left={<Avatar initial={p.initial} dark={p.dark} />}
                onPress={() => setTo((t) => (t.includes(p.id) ? t.filter((x) => x !== p.id) : [...t, p.id]))}
                last={i === people.length - 1}
              />
            ))}
          </Card>
          <Card>
            <Choice on={to.length === 0} title="No one yet" sub="Keep it private. You can add people later." onPress={() => setTo([])} last />
          </Card>
          <LinkText label="+ Add a new trusted person" onPress={() => go('/add-person')} />
          <Spacer />
          <PrimaryButton label="Continue" onPress={next} />
        </StepView>
      )}

      {step === 4 && (
        <StepView step={4} dir={dir.current}>
          <Heading title="When can they receive it?" lead="Missed check-ins alone never release anything." />
          <Card>
            {COND_ORDER.map((c, i) => (
              <Choice key={c} radio on={cond === c} title={COND[c]} sub={COND_HELP[c]} onPress={() => setCond(c)} last={i === COND_ORDER.length - 1} />
            ))}
          </Card>
          <Animated.View key={cond + to.join()} entering={FadeIn.duration(250)}>
            <Note title="If this happens" body={to.length ? `${recipientsLine} receive${to.length === 1 ? 's' : ''} “${title}” — after verification and a waiting period you can stop.` : 'Nobody receives this. It stays private to you.'} />
          </Animated.View>
          <Spacer />
          <PrimaryButton label="Review" onPress={next} />
        </StepView>
      )}

      {step === 5 && tpl && (
        <StepView step={5} dir={dir.current}>
          <Heading title="Check and save" lead="Here’s exactly what will be stored." />
          <Card>
            <Row>
              <View style={{ gap: 3, flex: 1 }}>
                <T style={typeLabel}>{tpl.type}</T>
                <T style={{ fontSize: 20, fontWeight: '700' }}>{title}</T>
              </View>
              <LinkText label="Edit" onPress={() => { dir.current = -1; setStep(1); }} />
            </Row>
            {tpl.fields.map((f, i) => (
              <Row key={f.label} last={i === tpl.fields.length - 1 && !docs.length}>
                <T style={{ fontSize: 13, color: color.inkSecondary }}>{f.label}</T>
                <T style={[{ fontSize: 15, flexShrink: 1, textAlign: 'right' }, f.secure && ui.mono]}>{f.secure === 'face' ? '••••••••••' : f.secure === 'mask' ? maskOf(values[i]) : values[i]}</T>
              </Row>
            ))}
            {docs.length > 0 && (
              <Row last>
                <T style={{ fontSize: 13, color: color.inkSecondary }}>Documents</T>
                <T style={{ fontSize: 15 }}>{docs.length} attached</T>
              </Row>
            )}
          </Card>
          <Card>
            <Row onPress={() => { dir.current = -1; setStep(3); }}>
              <RowText title="Who receives it" sub={recipientsLine} titleStyle={{ fontSize: 15, fontWeight: '400' }} />
              <T style={{ color: color.inkMuted }}>›</T>
            </Row>
            <Row last onPress={() => { dir.current = -1; setStep(4); }}>
              <RowText title="When" sub={to.length ? COND[cond] : 'Never — private'} titleStyle={{ fontSize: 15, fontWeight: '400' }} />
              <T style={{ color: color.inkMuted }}>›</T>
            </Row>
          </Card>
          <Spacer />
          <PrimaryButton
            label={to.length ? 'Save with Face ID' : 'Save'}
            onPress={() => createRecord({ templateId: tpl.id, title, values, note: tpl.note !== undefined ? note : undefined, to, cond: to.length ? cond : 'pass', docs })}
          />
        </StepView>
      )}
    </Screen>
  );
}

