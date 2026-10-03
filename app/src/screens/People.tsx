import React, { useRef, useState } from 'react';
import { View } from 'react-native';
import Animated, { FadeIn, FadeInDown } from 'react-native-reanimated';
import { askChangeRole, askRemovePerson, invitePerson, replacePerson, resendInvite } from '../actions';
import {
  Avatar,
  Badge,
  Card,
  Chevron,
  Choice,
  Empty,
  Field as Input,
  GlassPill,
  LinkText,
  NavBar,
  Note,
  Page,
  PlusButton,
  PrimaryButton,
  Progress,
  Row,
  RowText,
  Screen,
  Section,
  SectionLabel,
  Segmented,
  Serif,
  Spacer,
  T,
  Tap,
  ring,
} from '../components/ui';
import { COND, COND_ORDER, Person, Role, ROLE_HELP, ROLE_LABEL } from '../data';
import { back, go, openPerson, openRec } from '../nav';
import { receivesBy, useActiveRecords, usePeople } from '../records';
import { useApp } from '../store';
import { smooth } from '../layout';
import { color } from '../theme';
import { StepView } from './Flows';

function statusBadge(p: Person) {
  return p.status === 'accepted' ? (
    <Badge label="Accepted" bg={color.positiveBg} fg={color.positive} style={{ alignSelf: 'center' }} />
  ) : p.status === 'declined' ? (
    <Badge label="Declined" bg={color.dangerBg} fg={color.danger} />
  ) : (
    <Badge label={p.statusNote} bg={color.infoBg} fg={color.info} />
  );
}

// ─── People (tab) ─────────────────────────────────────────────────────────────

export function People() {
  const people = usePeople();
  const records = useActiveRecords();
  return (
    <Screen kind="tab">
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end' }}>
        <T accessibilityRole="header" style={{ fontSize: 32, fontWeight: '700', letterSpacing: -0.32 }}>People</T>
        <PlusButton onPress={() => go('/add-person')} label="Add a trusted person" />
      </View>
      <T style={{ fontSize: 15, color: color.inkSecondary, lineHeight: 22 }}>
        Each person receives only what you assign to them, only when the condition you set is met.
      </T>
      <View style={{ gap: 10 }}>
        {people.map((p) => {
          const rc = receivesBy(records, p.id);
          return (
            <Animated.View key={p.id} layout={smooth} entering={FadeIn}>
              <Tap onPress={() => openPerson(p.id)} scale style={{ backgroundColor: '#fff', borderRadius: 12, padding: 16, flexDirection: 'row', gap: 14, alignItems: 'center', boxShadow: ring }}>
                <Avatar initial={p.initial} dark={p.dark} size={44} fontSize={17} />
                <View style={{ gap: 3, flex: 1 }}>
                  <T style={{ fontSize: 17, fontWeight: '600' }}>{p.full}</T>
                  <T style={sub}>{p.relationship} · {ROLE_LABEL[p.role]}</T>
                  <T style={sub}>{rc.total ? `Receives ${rc.total} records${rc.sealed ? ` · ${rc.sealed} sealed` : ''}` : 'Nothing assigned yet'}</T>
                </View>
                {p.status === 'invited' ? (
                  <View style={{ alignItems: 'flex-end', gap: 4 }}>
                    {statusBadge(p)}
                    <Tap onPress={() => resendInvite(p.id)} hitSlop={8}>
                      <T style={{ fontSize: 13, fontWeight: '600', color: color.brand }}>Resend</T>
                    </Tap>
                  </View>
                ) : (
                  statusBadge(p)
                )}
              </Tap>
            </Animated.View>
          );
        })}
      </View>
      <View style={{ gap: 8 }}>
        <SectionLabel>Roles</SectionLabel>
        <Card>
          {(['primary', 'backup', 'recipient'] as Role[]).map((r, i) => (
            <Row key={r} last={i === 2} style={{ paddingVertical: 12, flexDirection: 'column', alignItems: 'stretch', gap: 2 }}>
              <T style={{ fontSize: 15, fontWeight: '600' }}>{ROLE_LABEL[r]}</T>
              <T style={{ fontSize: 13, color: color.inkSecondary, lineHeight: 18 }}>{ROLE_HELP[r]}</T>
            </Row>
          ))}
        </Card>
      </View>
      <Tap onPress={() => go('/release-plan')} style={{ padding: 8 }}>
        <T style={{ fontSize: 15, fontWeight: '600', color: color.brand, textAlign: 'center' }}>See the full release plan</T>
      </Tap>
    </Screen>
  );
}
const sub = { fontSize: 13, color: color.inkSecondary } as const;

// ─── Person — what one person receives, by circumstance ──────────────────────

export function PersonScreen({ id }: { id: string }) {
  const people = usePeople();
  const records = useActiveRecords();
  const [open, setOpen] = useState<Record<string, boolean>>({});
  const p = people.find((x) => x.id === id);
  if (!p) return <Page title="Person"><Empty tone="neutral" icon="–" title="Removed" body="This person is no longer in your Testament." /></Page>;
  const rc = receivesBy(records, id);
  return (
    <Screen>
      <NavBar onBack={back} right={<GlassPill label="Edit" onPress={() => go(`/person/${id}/edit`)} />} />
      <View style={{ flexDirection: 'row', gap: 14, alignItems: 'center' }}>
        <Avatar initial={p.initial} dark={p.dark} size={56} fontSize={22} />
        <View style={{ gap: 3, flex: 1 }}>
          <T accessibilityRole="header" style={{ fontSize: 24, fontWeight: '700' }}>{p.full}</T>
          <T style={{ fontSize: 15, color: color.inkSecondary }}>{p.relationship} · {ROLE_LABEL[p.role]} · {p.statusNote}</T>
        </View>
      </View>
      {p.status === 'invited' && (
        <Note tone="warning" title="Invitation not accepted yet" body={`We emailed ${p.email}. Nothing is shared with ${p.name} either way — accepting only confirms they can be reached.`} />
      )}
      <View style={{ backgroundColor: color.stone, borderRadius: 12, paddingVertical: 16, paddingHorizontal: 18 }}>
        <T style={{ fontSize: 15, lineHeight: 22.5 }}>
          {rc.total ? (
            <>
              {p.name} will receive <T style={{ fontSize: 15, fontWeight: '700' }}>{rc.total} records</T> under {rc.groups.length === 1 ? 'one circumstance' : `${['', '', 'two', 'three'][rc.groups.length]} different circumstances`}. Nothing is visible to {p.relationship === 'Daughter' ? 'her' : p.relationship === 'Son' ? 'him' : 'them'} before then.
            </>
          ) : (
            `${p.name} doesn’t receive anything yet. Assign records from the Testament or with Edit.`
          )}
        </T>
      </View>
      {rc.groups.map((g) => {
        const expanded = open[g.cond] || g.records.length <= 3;
        const shown = expanded ? g.records : g.records.slice(0, 2);
        return (
          <Animated.View key={g.cond} layout={smooth} style={{ gap: 8 }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 2 }}>
              <SectionLabel style={{ paddingHorizontal: 0 }}>{g.label}</SectionLabel>
              <T style={{ fontSize: 12, color: color.inkMuted }}>{g.records.length} records</T>
            </View>
            <Card>
              {shown.map((r, i) => (
                <Animated.View key={r.id} entering={FadeIn.duration(220)}>
                  <Row onPress={() => openRec(r.id)} last={expanded && i === shown.length - 1} style={{ paddingVertical: 12 }}>
                    <T style={{ fontSize: 15, flexShrink: 1 }}>{r.title}</T>
                    {r.badge === 'Private message' || r.badge === 'Sealed' ? <T style={{ fontSize: 12, fontWeight: '600', color: color.bronzeInk }}>{r.badge}</T> : <Chevron />}
                  </Row>
                </Animated.View>
              ))}
              {!expanded && (
                <Row last onPress={() => setOpen((o) => ({ ...o, [g.cond]: true }))} style={{ paddingVertical: 12 }}>
                  <T style={{ fontSize: 15, color: color.inkSecondary }}>{g.records.length - 2} more</T>
                  <T style={{ fontSize: 13, color: color.inkMuted }}>Show</T>
                </Row>
              )}
            </Card>
          </Animated.View>
        );
      })}
      <Tap onPress={() => go(`/person/${id}/preview`)} scale style={{ height: 50, borderRadius: 12, borderWidth: 1, borderColor: color.bronze, alignItems: 'center', justifyContent: 'center' }}>
        <T style={{ fontSize: 17, fontWeight: '600' }}>Preview as {p.name}</T>
      </Tap>
      <View style={{ flexDirection: 'row', justifyContent: 'center', gap: 24 }}>
        <LinkText label="Change role" onPress={() => askChangeRole(id)} />
        <LinkText label="Replace" onPress={() => go(`/person/${id}/replace`)} />
        <LinkText label="Remove" danger onPress={() => askRemovePerson(id)} />
      </View>
    </Screen>
  );
}

// ─── Edit person (contact details) ───────────────────────────────────────────

export function EditPerson({ id }: { id: string }) {
  const p = usePeople().find((x) => x.id === id);
  const set = useApp((s) => s.set);
  const withFace = useApp((s) => s.withFace);
  const showToast = useApp((s) => s.showToast);
  const [email, setEmail] = useState(p?.email ?? '');
  const [phone, setPhone] = useState(p?.phone ?? '');
  const [rel, setRel] = useState(p?.relationship ?? '');
  if (!p) return <Page title="Edit"><Empty tone="neutral" title="Removed" /></Page>;
  const save = () =>
    withFace(`Update ${p.name}’s details`, () => {
      set((s) => ({ people: s.people.map((x) => (x.id === id ? { ...x, email, phone, relationship: rel } : x)) }));
      back();
      showToast(`${p.name}’s details updated`);
    });
  return (
    <Page title={`Edit ${p.name}`} lead="We use these details to reach them if we can’t reach you, and to verify them before any release.">
      <Card>
        <Input label="Relationship" value={rel} onChangeText={setRel} />
        <Input label="Email" value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" />
        <Input label="Mobile" value={phone} onChangeText={setPhone} keyboardType="phone-pad" last />
      </Card>
      <Card>
        <Row onPress={() => askChangeRole(id)}>
          <RowText title="Role" sub={ROLE_LABEL[p.role]} titleStyle={{ fontWeight: '400' }} />
          <Chevron />
        </Row>
        <Row last onPress={() => go('/release-plan')}>
          <RowText title="What they receive" sub="Set per record in the Testament" titleStyle={{ fontWeight: '400' }} />
          <Chevron />
        </Row>
      </Card>
      <PrimaryButton label="Save with Face ID" onPress={save} />
    </Page>
  );
}

// ─── Replace ──────────────────────────────────────────────────────────────────

export function ReplacePerson({ id }: { id: string }) {
  const people = usePeople();
  const records = useActiveRecords();
  const p = people.find((x) => x.id === id);
  const [pick, setPick] = useState<string | null>(null);
  if (!p) return <Page title="Replace"><Empty tone="neutral" title="Removed" /></Page>;
  const others = people.filter((x) => x.id !== id);
  const n = receivesBy(records, id).total;
  return (
    <Page title="Replace" heading={`Who should take ${p.name}’s place?`} lead={`They’ll receive the ${n} records ${p.name} would have received, under the same circumstances. Use this if ${p.name} is unwell, unreachable or has passed away.`}>
      <Card>
        {others.map((o, i) => (
          <Choice key={o.id} radio on={pick === o.id} title={o.full} sub={`${o.relationship} · ${ROLE_LABEL[o.role]}`} left={<Avatar initial={o.initial} dark={o.dark} size={32} fontSize={13} />} onPress={() => setPick(o.id)} last={i === others.length - 1} />
        ))}
      </Card>
      <LinkText label="+ Someone new" onPress={() => go('/add-person')} />
      <Spacer />
      <PrimaryButton label="Continue" disabled={!pick} onPress={() => pick && replacePerson(id, pick)} />
    </Page>
  );
}

// ─── Recipient preview — what they would see ─────────────────────────────────

export function RecipientPreview({ id }: { id: string }) {
  const p = usePeople().find((x) => x.id === id);
  const records = useActiveRecords();
  const [mode, setMode] = useState(0);
  if (!p) return <Page title="Preview"><Empty tone="neutral" title="Removed" /></Page>;
  const rc = receivesBy(records, id);
  const scenCond = COND_ORDER[Math.max(0, mode - 1)];
  const released = mode === 0 ? [] : rc.groups.find((g) => g.cond === scenCond)?.records ?? [];
  return (
    <Page title={`Preview as ${p.name}`}>
      <Segmented options={['Today', 'Unreachable', 'Incapacitated', 'Passing']} value={mode} onChange={setMode} />
      <Animated.View key={mode} entering={FadeIn.duration(260)} style={{ gap: 16 }}>
        <View style={{ backgroundColor: '#fff', borderRadius: 16, padding: 20, gap: 14, boxShadow: '0 8px 24px rgba(26,26,26,0.08), 0 0 0 1px #E8E4DC' }}>
          <T style={{ fontSize: 12, fontWeight: '600', letterSpacing: 0.96, color: color.inkTertiary }}>LAST TESTAMENT · RECIPIENT PORTAL</T>
          {mode === 0 ? (
            <>
              <Serif style={{ fontSize: 28, lineHeight: 31 }}>Hello, {p.name}.</Serif>
              <T style={{ fontSize: 17, lineHeight: 25 }}>
                Nana Mensah has named you as a trusted person. There’s nothing for you to see — and nothing will be shared unless something happens and it has been verified.
              </T>
              <Note body={`Your role: ${ROLE_LABEL[p.role]}. ${ROLE_HELP[p.role]}`} />
            </>
          ) : released.length ? (
            <>
              <Serif style={{ fontSize: 28, lineHeight: 31 }}>{released.length} items released to you</Serif>
              <T style={{ fontSize: 15, color: color.inkSecondary, lineHeight: 22 }}>{COND[scenCond]} · verified · after the waiting period</T>
              {released.map((r) => (
                <View key={r.id} style={{ paddingVertical: 10, borderTopWidth: 1, borderTopColor: color.hairline }}>
                  <T style={{ fontSize: 17, fontWeight: '600' }}>{r.title}</T>
                  <T style={{ fontSize: 13, color: color.inkSecondary }}>{r.type}</T>
                </View>
              ))}
            </>
          ) : (
            <>
              <Serif style={{ fontSize: 28, lineHeight: 31 }}>Nothing for you</Serif>
              <T style={{ fontSize: 17, lineHeight: 25 }}>In this situation, Nana hasn’t left anything for {p.name}.</T>
            </>
          )}
        </View>
      </Animated.View>
      <T style={{ fontSize: 13, color: color.inkMuted, lineHeight: 19, textAlign: 'center' }}>
        Before a release, recipients never see titles, counts or previews of what you’ve preserved. Large text is the default in the recipient portal.
      </T>
    </Page>
  );
}

// ─── Add a trusted person (4 steps) ──────────────────────────────────────────

const RELATIONSHIPS = ['Daughter', 'Son', 'Partner', 'Sibling', 'Friend', 'Solicitor', 'Other'];

export function AddPerson() {
  const [step, setStep] = useState(0);
  const dir = useRef<1 | -1>(1);
  const [first, setFirst] = useState('Abena');
  const [last, setLast] = useState('Owusu');
  const [rel, setRel] = useState('Friend');
  const [email, setEmail] = useState('abena.owusu@gmail.com');
  const [phone, setPhone] = useState('+44 7700 900 266');
  const [role, setRole] = useState<Role>('recipient');
  const next = () => {
    dir.current = 1;
    setStep((s) => s + 1);
  };
  const prev = () => {
    dir.current = -1;
    if (step === 0) back();
    else setStep((s) => s - 1);
  };
  const titles = ['Who is it?', 'How do we reach them?', 'What’s their role?', 'Check the invitation'];
  return (
    <Screen gap={20} bottom={6} cascade={false}>
      <NavBar onBack={prev} title="Add a trusted person" />
      <Progress done={step + 1} total={4} />
      <StepView step={step} dir={dir.current}>
        <T accessibilityRole="header" style={{ fontSize: 26, fontWeight: '700', lineHeight: 30 }}>{titles[step]}</T>
        {step === 0 && (
          <>
            <Card>
              <Input label="First name" value={first} onChangeText={setFirst} autoFocus />
              <Input label="Last name" value={last} onChangeText={setLast} last />
            </Card>
            <SectionLabel>Relationship</SectionLabel>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
              {RELATIONSHIPS.map((r) => (
                <Tap key={r} onPress={() => setRel(r)} scale haptic style={{ paddingVertical: 9, paddingHorizontal: 16, borderRadius: 999, backgroundColor: rel === r ? color.brand : '#fff', boxShadow: rel === r ? undefined : ring }}>
                  <T style={{ fontSize: 15, fontWeight: '600', color: rel === r ? '#fff' : color.ink }}>{r}</T>
                </Tap>
              ))}
            </View>
            <Spacer />
            <PrimaryButton label="Continue" onPress={next} disabled={!first.trim()} />
          </>
        )}
        {step === 1 && (
          <>
            <T style={{ fontSize: 15, color: color.inkSecondary, lineHeight: 22 }}>We’ll only contact {first} to invite them, and if we ever need to verify a release.</T>
            <Card>
              <Input label="Email" value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" />
              <Input label="Mobile" value={phone} onChangeText={setPhone} keyboardType="phone-pad" last />
            </Card>
            {!/^\S+@\S+\.\S+$/.test(email) && email.length > 0 && (
              <Animated.View entering={FadeInDown}>
                <T style={{ fontSize: 13, color: color.danger }}>Enter a valid email address, like name@example.com</T>
              </Animated.View>
            )}
            <Spacer />
            <PrimaryButton label="Continue" onPress={next} disabled={!/^\S+@\S+\.\S+$/.test(email)} />
          </>
        )}
        {step === 2 && (
          <>
            <Card>
              {(['primary', 'backup', 'recipient'] as Role[]).map((r, i) => (
                <Choice key={r} radio on={role === r} title={ROLE_LABEL[r]} sub={ROLE_HELP[r]} onPress={() => setRole(r)} last={i === 2} />
              ))}
            </Card>
            <Note body="A role never gives anyone your whole Testament. You choose what each person receives, record by record." />
            <Spacer />
            <PrimaryButton label="Continue" onPress={next} />
          </>
        )}
        {step === 3 && (
          <>
            <View style={{ backgroundColor: '#fff', borderRadius: 16, padding: 20, gap: 12, boxShadow: '0 8px 24px rgba(26,26,26,0.08), 0 0 0 1px #E8E4DC' }}>
              <T style={{ fontSize: 13, color: color.inkMuted }}>To: {email}</T>
              <Serif style={{ fontSize: 24, lineHeight: 28 }}>Dear {first},</Serif>
              <T style={{ fontSize: 15, lineHeight: 22 }}>
                Nana Mensah would like you to be a trusted person in their Last Testament. This doesn’t share anything with you now. If something ever happens, we may contact you to help verify it.
              </T>
              <T style={{ fontSize: 15, fontWeight: '600', color: color.brand }}>Accept or decline →</T>
            </View>
            <T style={{ fontSize: 13, color: color.inkMuted, lineHeight: 19 }}>{first} won’t see what you’ve preserved, how many records there are, or who else you’ve chosen.</T>
            <Spacer />
            <PrimaryButton
              label="Send invitation"
              onPress={() => invitePerson({ name: first.trim(), full: `${first.trim()} ${last.trim()}`.trim(), relationship: rel, role, email, phone, dark: role === 'primary' })}
            />
          </>
        )}
      </StepView>
    </Screen>
  );
}
