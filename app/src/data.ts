// Demo content for the Owner app prototype — ported verbatim from
// `Owner App Prototype.dc.html`. Persona: Nana Mensah (owner); Ama (daughter,
// primary contact), Kofi (son, backup contact), Efua (solicitor, recipient only).

export type PersonId = 'ama' | 'kofi' | 'efua';
export type CondId = 'pass' | 'inc' | 'unr';
/** 'mask' = tap to reveal; 'face' = Face ID required to reveal. */
export type Secure = 'mask' | 'face' | null;

export interface Field {
  label: string;
  value: string;
  secure: Secure;
  /** Masked display string, shown while the field is hidden. */
  m: string | null;
}

export interface RecordItem {
  id: string;
  type: string;
  title: string;
  badge?: string;
  /** Display date of last confirmation, or "Draft · …". */
  confirmed: string;
  /** Months since last confirmed — 12+ puts the record into review. */
  months: number;
  cond: CondId;
  to: PersonId[];
  /** Masked value shown on the category card. */
  peek?: string;
  /** Longer free text, shown in serif (letters, wishes, ideas). */
  note?: string;
  fields: Field[];
  docs: [name: string, meta: string][];
}

export interface Category {
  id: string;
  name: string;
  blurb: string;
  /** Suggested record not yet added. */
  suggest?: string;
  records: RecordItem[];
}

export interface RecordWithCat extends RecordItem {
  cat: Category;
}

export interface Scenario {
  title: string;
  desc: string;
  s1: string;
  s2: string;
  s3: string;
  ama: string;
  kofi: string;
  efua: string;
  note: string;
}

export const PEOPLE: Record<PersonId, { name: string; initial: string; dark?: boolean }> = {
  ama: { name: 'Ama', initial: 'A', dark: true },
  kofi: { name: 'Kofi', initial: 'K' },
  efua: { name: 'Efua', initial: 'E' },
};

export const COND: Record<CondId, string> = {
  pass: 'After my passing',
  inc: 'If I’m incapacitated',
  unr: 'If I’m unreachable',
};

const F = (label: string, value: string, secure?: Secure, m?: string): Field => ({
  label,
  value,
  secure: secure || null,
  m: m || null,
});

export const CATS: Category[] = [
 { id:'fin', name:'Financial accounts', blurb:'Bank accounts, savings, pensions and money owed either way.', records:[
  { id:'barclays', type:'Financial record', title:'Barclays current account', confirmed:'12 Sep 2026', months:0, cond:'pass', to:['ama','kofi'], peek:'•••• 4481', fields:[F('Account holder','Nana Mensah'),F('Account number','20936611 0027 4481','mask','•••• 4481'),F('Sort code','20-45-77','mask','••-••-••'),F('Online banking password','Harm@ttan!2024','face','••••••••••'),F('Notes','Salary and pension are paid here. Direct debits for the mortgage, council tax and energy.')], docs:[['Statement — Aug 2026.pdf','1.2 MB · encrypted'],['Account opening letter.jpg','640 KB']] },
  { id:'isa', type:'Financial record', title:'Barclays Stocks & Shares ISA', confirmed:'12 Sep 2026', months:0, cond:'pass', to:['ama'], peek:'•••• 9920', fields:[F('Provider','Barclays Smart Investor'),F('Account number','SI-7731-9920','mask','•••• 9920'),F('Approx. value','£48,300 (Sep 2026)'),F('Notes','Invested in two index funds. Ama should speak to Efua before selling anything.')], docs:[['Valuation — Sep 2026.pdf','380 KB']] },
  { id:'nationwide', type:'Financial record', title:'Nationwide savings account', confirmed:'3 Jun 2026', months:4, cond:'pass', to:['ama','kofi'], peek:'•••• 1183', fields:[F('Account number','07115 1183','mask','•••• 1183'),F('Sort code','07-01-16','mask','••-••-••'),F('Approx. balance','£12,400')], docs:[] },
  { id:'sipp', type:'Financial record', title:'Vanguard personal pension (SIPP)', confirmed:'12 Sep 2026', months:0, cond:'pass', to:['ama'], peek:'•••• 2207', fields:[F('Account number','VG-2207-5581','mask','•••• 2207'),F('Nominated beneficiary','Ama Mensah (100%) — expression of wish filed 2024'),F('Approx. value','£186,000')], docs:[['Expression of wish — 2024.pdf','210 KB']] },
  { id:'gcb', type:'Financial record', title:'GCB Bank account, Accra', confirmed:'29 Aug 2025', months:13, cond:'pass', to:['kofi'], peek:'•••• 6604', fields:[F('Branch','GCB Bank, Osu branch, Accra'),F('Account number','1011 6604 2231','mask','•••• 6604'),F('Approx. balance','GH₵ 38,000'),F('Notes','Used for the Kumasi house upkeep. Auntie Akosua has signing authority.')], docs:[] },
  { id:'yaw', type:'Money I owe', title:'Loan from Uncle Yaw Darko', confirmed:'2 Jul 2026', months:3, cond:'pass', to:['ama'], fields:[F('Amount outstanding','£9,500 of £15,000'),F('Borrowed','March 2023 · for the catering van'),F('Repayment','£300 a month · standing order from Barclays current'),F('Contact','+233 24 ••• 7781','mask','+233 24 ••• 7781'),F('My wish','Please repay him in full from my estate before anything else is shared. He trusted me without paperwork.')], docs:[['Handwritten IOU — signed.jpg','940 KB']] },
  { id:'abena', type:'Money owed to me', title:'Loan to cousin Abena — school fees', confirmed:'10 Sep 2026', months:0, cond:'pass', to:['ama'], fields:[F('Amount','GH₵ 25,000 · given Sept 2025'),F('Agreed','Repay when she finishes nursing school (2027)'),F('My wish','If I’m gone, forgive half. The rest goes to Kofi’s twins’ education fund.')], docs:[] },
  { id:'kwame', type:'Money owed to me', title:'Loan to Kwame Asante', confirmed:'15 Jan 2026', months:8, cond:'pass', to:['ama','kofi'], fields:[F('Amount outstanding','£4,000 of £6,000'),F('Agreed repayment','£250 a month by bank transfer'),F('Contact','+44 7700 ••• 442','mask','+44 7700 ••• 442'),F('Notes','No written agreement. Kwame is honest — don’t chase him hard, but it is owed.')], docs:[['WhatsApp agreement — screenshot.jpg','1.1 MB']] },
 ]},
 { id:'prop', name:'Property & assets', blurb:'Homes, land, vehicles and valuable items.', records:[
  { id:'elm', type:'Asset record', title:'14 Elm Road, Croydon CR0', confirmed:'12 Sep 2026', months:0, cond:'pass', to:['ama','kofi'], fields:[F('Ownership','Sole owner · freehold'),F('Mortgage','Halifax · approx. £61,000 remaining · ends 2031'),F('Title number','SGL 448 712','mask','SGL ••• •••'),F('Keys & alarm','Spare keys with Mrs Patel at no. 16. Alarm code:','face','Alarm code ••••'),F('Notes','Boiler serviced every March (British Gas HomeCare).')], docs:[['Title deeds — Land Registry.pdf','2.4 MB'],['Halifax mortgage statement 2026.pdf','410 KB']] },
  { id:'kumasi', type:'Asset record', title:'Family house, Asokwa, Kumasi', confirmed:'29 Aug 2025', months:13, cond:'pass', to:['kofi','ama'], fields:[F('Ownership','Inherited from my father · shared with Auntie Akosua'),F('Land title','Indenture held by Lawyer Mensah-Bonsu, Kumasi'),F('Notes','My wish is that it stays in the family. Kofi should take the lead with Auntie Akosua.')], docs:[['Indenture — scanned.pdf','3.8 MB']] },
  { id:'dubai', type:'Asset record', badge:'Sealed', title:'Apartment 1204, Marina Gate, Dubai', confirmed:'18 Aug 2026', months:1, cond:'pass', to:['efua'], fields:[F('Ownership','Sole owner · freehold · bought 2019'),F('Title deed no.','DLD 0441-••••-2019','face','DLD ••••-••••-2019'),F('Managed by','Haus & Haus property management · rented out'),F('Rental income','AED 9,500 a month → Emirates NBD account'),F('Emirates NBD account','AE07 0260 •••• •••• 5512','face','AE07 •••• •••• •••• ••••'),F('Who knows','Only Efua. The children do not know about this yet.'),F('My wish','Efua should tell Ama and Kofi together, in person, and read them my letter first. Sell it and split it equally.')], docs:[['Title deed — DLD.pdf','1.4 MB · encrypted'],['Haus & Haus management agreement.pdf','860 KB'],['A letter to explain — for Ama & Kofi.pdf','90 KB']] },
  { id:'rav4', type:'Asset record', title:'Toyota RAV4 Hybrid, 2022', confirmed:'5 Apr 2026', months:6, cond:'inc', to:['kofi'], peek:'LB22 •••', fields:[F('Registration','LB22 KVP','mask','LB22 •••'),F('V5C logbook','In the grey folder, study desk, bottom drawer'),F('Finance','None — owned outright'),F('Spare key','Kitchen drawer, left of the cooker')], docs:[] },
 ]},
 { id:'ins', name:'Insurance', blurb:'Policies that pay out or need to be claimed.', suggest:'Car insurance', records:[
  { id:'aviva', type:'Insurance record', title:'Aviva life insurance', confirmed:'12 Sep 2026', months:0, cond:'pass', to:['ama','kofi'], peek:'•••• 3310', fields:[F('Policy number','AV-LT-883310','mask','•••• 3310'),F('Cover','£250,000 level term · ends Nov 2039'),F('Beneficiaries','Ama 50% · Kofi 50% (written in trust)'),F('Claims line','0800 015 ••••','mask','0800 015 ••••'),F('Premium','£42.10 a month from Barclays current account')], docs:[['Policy schedule.pdf','520 KB'],['Trust form — signed.pdf','300 KB']] },
  { id:'lg', type:'Insurance record', title:'Legal & General home insurance', confirmed:'14 Feb 2026', months:7, cond:'inc', to:['ama'], peek:'•••• 7745', fields:[F('Policy number','LG-HM-227745','mask','•••• 7745'),F('Cover','Buildings & contents · 14 Elm Road'),F('Renewal','14 February each year — auto-renews'),F('Claims line','0370 900 ••••','mask','0370 900 ••••')], docs:[['Policy documents 2026.pdf','1.6 MB']] },
 ]},
 { id:'biz', name:'Business & ideas', blurb:'Companies you own, and the ideas you haven’t finished yet.', records:[
  { id:'catering', type:'Business record', title:'Nana’s Kitchen Catering Ltd', confirmed:'12 Sep 2026', months:0, cond:'inc', to:['kofi','efua'], fields:[F('Company no.','11829043 · Companies House'),F('Shareholding','Nana 80% · Kofi 20%'),F('Accountant','Dapo Adeyemi, Adeyemi & Co · 020 8771 ••••','mask','Dapo Adeyemi, Adeyemi & Co'),F('Business bank','Starling · •••• 0938','mask','Starling · •••• ••••'),F('If I’m incapacitated','Kofi runs day to day. Honour the church Christmas booking (deposit taken).'),F('After my passing','Kofi has first right to buy my shares at a fair value.')], docs:[['Shareholders agreement.pdf','720 KB'],['2025 accounts.pdf','1.1 MB']] },
  { id:'shito', type:'Unfinished idea', badge:'Intellectual property', title:'Shito sauce brand — “Mama Nana’s”', confirmed:'1 Sep 2026', months:1, cond:'pass', to:['ama','kofi'], note:'The recipe is my mother’s, with my changes: more dried shrimp, less oil, a little smoked mackerel. I tested it with Waitrose’s local buyer in July and they asked for a second sample. Someone should finish this.', fields:[F('Recipe','Full recipe & quantities (batch of 40 jars)','face','Recipe locked · Face ID'),F('Trademark','“Mama Nana’s” · UK00003981122 · filed, pending'),F('Contact','Waitrose local sourcing · Hannah Clarke','mask','Waitrose local sourcing · ••••••'),F('Status','Packaging designs done, need food-safety certificate')], docs:[['Label designs v3.pdf','4.2 MB'],['Trademark filing receipt.pdf','180 KB']] },
  { id:'app', type:'Unfinished idea', badge:'Intellectual property', title:'Idea: app for booking Ghanaian caterers', confirmed:'15 Jun 2025', months:15, cond:'pass', to:['ama'], note:'A simple way for families in the UK to book Ghanaian caterers for weddings, funerals and outdoorings. I spoke to 12 caterers and 9 said they would pay. Ama — you’re the one who understands tech. Do something with it if you want to.', fields:[F('Notes & research','Interview notes from 12 caterers'),F('Domain','chopbook.co.uk · renews every April')], docs:[['Interview notes.pdf','300 KB'],['Rough sketches.jpg','2.0 MB']] },
 ]},
 { id:'docs', name:'Documents', blurb:'Scans of the originals, and where to find them.', records:[
  { id:'will', type:'Legal document', badge:'Legal document', title:'Will — signed copy', confirmed:'12 Sep 2026', months:0, cond:'pass', to:['efua','ama'], fields:[F('Executed','18 March 2024 · witnessed'),F('Original held by','Efua Boateng, Boateng & Co Solicitors, Croydon'),F('Executors','Ama Mensah and Efua Boateng'),F('Notes','This is a scan of the signed will. The original is what counts.')], docs:[['Last Will & Testament — signed scan.pdf','1.9 MB']] },
  { id:'ukpass', type:'Identity document', title:'UK passport', confirmed:'5 Apr 2026', months:6, cond:'inc', to:['ama'], fields:[F('Passport number','5411 ••••','mask','•••• ••••'),F('Expires','22 Oct 2031'),F('Where it is','Fireproof box, wardrobe, master bedroom')], docs:[['Passport — photo page.jpg','880 KB']] },
  { id:'ghpass', type:'Identity document', title:'Ghana passport', confirmed:'5 Apr 2026', months:6, cond:'inc', to:['kofi'], fields:[F('Passport number','G1 ••••','mask','•••• ••••'),F('Expires','9 Jan 2029'),F('Where it is','Same fireproof box as UK passport')], docs:[['Passport — photo page.jpg','790 KB']] },
  { id:'marriage', type:'Record', title:'Marriage certificate', confirmed:'5 Apr 2026', months:6, cond:'pass', to:['ama','kofi'], fields:[F('Registered','Croydon Register Office · 14 June 1986'),F('Where it is','Fireproof box, master bedroom'),F('Notes','Needed for the Aviva claim and the pension.')], docs:[['Marriage certificate — scan.pdf','640 KB']] },
 ]},
 { id:'dig', name:'Digital life', blurb:'Accounts, devices and what should happen to them.', records:[
  { id:'apple', type:'Digital account', title:'Apple ID & iPhone passcode', confirmed:'1 Aug 2025', months:14, cond:'inc', to:['ama'], fields:[F('Apple ID','nana.mensah@icloud.com'),F('iPhone passcode','••••••','face','••••••'),F('Apple ID password','••••••••••••','face','••••••••••••'),F('Legacy Contact','Ama is set as Apple Legacy Contact (access key in Documents)'),F('Notes','All family photos are in iCloud. Please keep them.')], docs:[['Apple legacy access key.pdf','120 KB']] },
  { id:'gmail', type:'Digital account', title:'Gmail', confirmed:'12 Sep 2026', months:0, cond:'inc', to:['ama'], fields:[F('Email','nana.mensah62@gmail.com'),F('Password','••••••••••••','face','••••••••••••'),F('Two-step','Codes go to my iPhone — see Apple ID record'),F('Inactive Account Manager','Set to notify Ama after 3 months')], docs:[] },
  { id:'facebook', type:'Digital account', title:'Facebook', confirmed:'3 Jun 2026', months:4, cond:'pass', to:['ama'], fields:[F('Profile','facebook.com/nana.mensah.62'),F('My wish','Memorialise the account — do not delete it. Ama is the Legacy Contact.')], docs:[] },
  { id:'whatsapp', type:'Digital account', title:'WhatsApp', confirmed:'3 Jun 2026', months:4, cond:'pass', to:['kofi'], fields:[F('Number','+44 7700 ••• 318','mask','+44 7700 ••• 318'),F('Backup','Daily to iCloud'),F('My wish','Please post one message in the church group and the family group, then close it.')], docs:[] },
  { id:'subs', type:'Digital account', title:'Subscriptions to cancel', confirmed:'15 May 2025', months:16, cond:'inc', to:['ama','kofi'], fields:[F('Netflix','£10.99 · Barclays card ending 4481'),F('Sky','£68 · direct debit · 0333 759 ••••','mask','£68 · direct debit · 0333 759 ••••'),F('Amazon Prime','£95 a year · renews March'),F('Gym — PureGym Croydon','£24.99 · cancel via app')], docs:[] },
 ]},
 { id:'msg', name:'Messages & memories', blurb:'Letters, recordings and photos meant for specific people.', records:[
  { id:'letter', type:'Private message', badge:'Private message', title:'Letter to Ama', confirmed:'Draft · 28 Sep 2026', months:0, cond:'pass', to:['ama'], note:'My dear Ama,\n\nIf you are reading this, then the time has come that we both knew would arrive and neither of us wanted to talk about. I want you to know first that I was not afraid —\n\n(draft continues · 640 words)', fields:[F('Format','Written letter · 640 words'),F('Status','Draft — only you can see it until you mark it ready')], docs:[] },
  { id:'voice', type:'Recorded message', badge:'Private message', title:'Voice note for Kofi’s 40th', confirmed:'3 Sep 2026', months:1, cond:'pass', to:['kofi'], fields:[F('Recording','2 min 14 sec · recorded 3 Sep 2026'),F('Deliver','On or after 11 May 2029 (Kofi’s 40th birthday)'),F('Note to self','Re-record if the twins arrive before then.')], docs:[['Kofi-40th.m4a','3.1 MB · encrypted']] },
 ]},
 { id:'wish', name:'Wishes & instructions', blurb:'What you would like to happen. These are wishes, not legal documents.', records:[
  { id:'funeral', type:'Legacy instruction', badge:'Wishes · not a will', title:'Funeral wishes', confirmed:'12 Sep 2026', months:0, cond:'pass', to:['ama','kofi'], note:'A service at St Andrew’s, Croydon, then burial at Asokwa beside my mother. No black — wear kente if you have it. Play “Amazing Grace” and Daddy Lumba. Keep it simple and let people eat well afterwards.', fields:[F('Prepaid plan','Co-op Funeralcare plan no. ••• 2210','mask','Co-op Funeralcare plan no. ••• 2210'),F('Notes','These are my wishes. The will is the legal document.')], docs:[['Co-op funeral plan.pdf','450 KB']] },
  { id:'medical', type:'Legacy instruction', badge:'Wishes · not a will', title:'Medical wishes', confirmed:'12 Sep 2026', months:0, cond:'inc', to:['ama','kofi'], note:'If I cannot speak for myself: I do not want to be kept alive on machines with no real hope of recovery. Comfort first. Ama has Lasting Power of Attorney for health.', fields:[F('LPA — health & welfare','Registered 2023 · OPG ref 1177 ••••','mask','Registered 2023 · OPG ref 1177 ••••'),F('GP','Dr Osei, Thornton Heath Medical Centre · 020 8684 ••••','mask','Dr Osei, Thornton Heath Medical Centre · 020 8684 ••••'),F('Allergies','Penicillin'),F('Medication','Amlodipine 5mg daily')], docs:[['LPA — health & welfare.pdf','2.2 MB']] },
  { id:'emergency', type:'Emergency information', title:'Emergency information', confirmed:'12 Sep 2026', months:0, cond:'unr', to:['ama','kofi'], fields:[F('Blood type','O positive'),F('Allergies','Penicillin'),F('GP','Dr Osei, Thornton Heath Medical Centre'),F('Next of kin','Ama Mensah · +44 7700 ••• 901','mask','Ama Mensah · +44 7700 ••• 901'),F('Neighbour with key','Mrs Patel, 16 Elm Road')], docs:[] },
  { id:'bills', type:'Legacy instruction', title:'Household bills & direct debits', confirmed:'14 Feb 2026', months:7, cond:'inc', to:['ama'], fields:[F('Mortgage','Halifax · 1st of month · Barclays current'),F('Council tax','Croydon · 15th · Barclays current'),F('Energy','Octopus · monthly · Barclays current'),F('Water','Thames Water · quarterly')], docs:[] },
  { id:'travel', type:'Travel information', title:'Travel itinerary & insurance', confirmed:'20 Sep 2026', months:0, cond:'unr', to:['ama','kofi'], fields:[F('Current trip','Accra & Kumasi · 4–25 Oct 2026'),F('Flights','BA 081 out · BA 078 back · ref ••••••','mask','BA 081 out · BA 078 back · ref ••••••'),F('Travel insurance','Post Office · policy ••• 5520 · 24h line 020 8865 ••••','mask','Post Office · policy ••• 5520'),F('Staying with','Auntie Akosua, Asokwa')], docs:[['Itinerary.pdf','220 KB']] },
 ]},
];

export const REC: Record<string, RecordWithCat> = {};
CATS.forEach((c) => c.records.forEach((r) => { REC[r.id] = { ...r, cat: c }; }));

export const SCEN: Scenario[] = [
  { title:'If I’m unreachable', desc:'Only what helps people find or help you — nothing financial, nothing private.', s1:'Two check-ins missed and 14 days without a reply', s2:'Ama confirms she can’t reach you either', s3:'48-hour waiting period — we keep trying', ama:'2 records', kofi:'2 records', efua:'Nothing', note:'21 records stay sealed.' },
  { title:'If I’m incapacitated', desc:'What your family needs to keep life running while you can’t.', s1:'Ama or Kofi reports it and verifies their identity', s2:'A second trusted person confirms, or a medical letter is reviewed', s3:'3-day waiting period — we keep trying to reach you', ama:'4 records', kofi:'4 records', efua:'Nothing', note:'19 records stay sealed.' },
  { title:'After my passing', desc:'Your broader legacy — accounts, property, documents and the messages you’ve written.', s1:'Ama or Kofi reports it and verifies their identity', s2:'A second trusted person confirms, or a certificate is reviewed', s3:'7-day waiting period — we keep trying to reach you', ama:'8 records', kofi:'6 records', efua:'2 documents', note:'5 records are assigned to no one and stay private.' }
];
