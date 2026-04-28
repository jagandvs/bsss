import {
  AlignmentType,
  BorderStyle,
  Document,
  Packer,
  PageBreak,
  Paragraph,
  Table,
  TableCell,
  TableRow,
  TextRun,
  VerticalAlign,
  WidthType,
} from 'docx';
import type { Profile } from '../types';

function parseDateLoose(input: string): Date | null {
  const s = (input || '').trim();
  if (!s) return null;
  if (/^\d{4}-\d{2}-\d{2}$/.test(s)) {
    const d = new Date(`${s}T00:00:00`);
    return Number.isNaN(d.getTime()) ? null : d;
  }
  const d = new Date(s);
  return Number.isNaN(d.getTime()) ? null : d;
}

function computeAgeYears(dobRaw: string): string {
  const d = parseDateLoose(dobRaw);
  if (!d) return '-';
  const today = new Date();
  let age = today.getFullYear() - d.getFullYear();
  const m = today.getMonth() - d.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < d.getDate())) age -= 1;
  if (age < 0 || age > 120) return '-';
  return String(age);
}

const TITLE_TEXT = 'బ్రహ్మముడి బ్రాహ్మణ కళ్యాణ బంధం';

function para(text: string, opts?: { bold?: boolean; size?: number; align?: any }) {
  return new Paragraph({
    alignment: opts?.align,
    children: [new TextRun({ text, bold: opts?.bold, size: opts?.size })],
  });
}

function cellParagraph(text: string, opts?: { bold?: boolean }) {
  return new Paragraph({
    children: [new TextRun({ text, bold: opts?.bold })],
  });
}

function tableCell(
  text: string,
  opts?: {
    bold?: boolean;
    shading?: string;
    vAlign?: any;
    widthPct?: number;
    rowMerge?: 'restart' | 'continue';
    center?: boolean;
  },
) {
  return new TableCell({
    verticalAlign: opts?.vAlign,
    width: opts?.widthPct ? { size: opts.widthPct, type: WidthType.PERCENTAGE } : undefined,
    shading: opts?.shading ? { fill: opts.shading } : undefined,
    verticalMerge: opts?.rowMerge,
    children: [
      new Paragraph({
        alignment: opts?.center ? AlignmentType.CENTER : undefined,
        children: [new TextRun({ text, bold: opts?.bold })],
      }),
    ],
  });
}

function profileTable(profile: Profile, regNoText: string): Table {
  const detailsPairs: Array<{ label: string; value: string }> = [
    { label: 'Sect', value: profile.sect },
    { label: 'Subsect', value: profile.subsect },
    { label: 'Gothram', value: profile.gothram },
    { label: 'Date of Birth', value: profile.dob },
    { label: 'Time of Birth', value: profile.tob },
    { label: 'Place of Birth', value: profile.pob },
    { label: 'Star', value: profile.star },
    { label: 'Padam', value: profile.padam },
    { label: 'Colour', value: profile.padam_colour },
    { label: 'Height in CM', value: profile.height_in_cm ? `${profile.height_in_cm} (Required)` : '' },
    { label: 'Qualification', value: profile.required_qualification },
    { label: 'Job', value: profile.required_job },
    { label: 'Marital Status', value: profile.required_marital_status },
  ];

  const personalPairs: Array<{ label: string; value: string }> = [
    { label: 'Surname', value: profile.surname },
    { label: 'Name', value: profile.name },
    { label: 'Age', value: computeAgeYears(profile.dob) },
    { label: 'Marital Status', value: profile.marital_status },
    { label: 'Qualification', value: profile.qualification },
    { label: 'Designation', value: profile.designation },
    { label: 'Organisation', value: profile.organisation },
    { label: 'Place of Work', value: profile.place_of_work },
    { label: 'Country of Work', value: profile.country_of_work },
    { label: 'Salary Per Anum', value: profile.salary_per_anum },
    { label: 'Father Name', value: profile.father_name },
    { label: 'Address', value: profile.address },
    { label: 'Mobile', value: profile.mobile },
    { label: 'WhatsApp', value: profile.whatsapp },
    { label: 'E-Mail', value: profile.email },
  ];

  const bodyRowsCount = Math.max(detailsPairs.length, personalPairs.length);
  const rows: TableRow[] = [];

  // Header row
  rows.push(
    new TableRow({
      children: [
        tableCell('Reg No', { bold: true, shading: 'F0F0F0', widthPct: 15, center: true, vAlign: VerticalAlign.CENTER }),
        tableCell('Details', { bold: true, shading: 'F0F0F0', widthPct: 42, center: true, vAlign: VerticalAlign.CENTER }),
        tableCell('Personal Details', { bold: true, shading: 'F0F0F0', widthPct: 43, center: true, vAlign: VerticalAlign.CENTER }),
      ],
    }),
  );

  // Body: two rows per pair (label row, value row) to mimic PDF
  for (let i = 0; i < bodyRowsCount; i++) {
    const d = detailsPairs[i] ?? { label: '', value: '' };
    const p = personalPairs[i] ?? { label: '', value: '' };

    // label row
    rows.push(
      new TableRow({
        children: [
          tableCell(regNoText, {
            bold: true,
            widthPct: 15,
            center: true,
            vAlign: VerticalAlign.CENTER,
            rowMerge: i === 0 ? 'restart' : 'continue',
          }),
          tableCell(d.label || '', { bold: true, shading: 'F5F5F5', widthPct: 42, vAlign: VerticalAlign.CENTER }),
          tableCell(p.label || '', { bold: true, shading: 'F5F5F5', widthPct: 43, vAlign: VerticalAlign.CENTER }),
        ],
      }),
    );

    // value row
    rows.push(
      new TableRow({
        children: [
          tableCell('', { widthPct: 15, rowMerge: 'continue' }),
          new TableCell({
            width: { size: 42, type: WidthType.PERCENTAGE },
            children: [cellParagraph(d.value?.trim() ? d.value.trim() : '-')],
          }),
          new TableCell({
            width: { size: 43, type: WidthType.PERCENTAGE },
            children: [cellParagraph(p.value?.trim() ? p.value.trim() : '-')],
          }),
        ],
      }),
    );
  }

  return new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    borders: {
      top: { style: BorderStyle.SINGLE, size: 2, color: '000000' },
      bottom: { style: BorderStyle.SINGLE, size: 2, color: '000000' },
      left: { style: BorderStyle.SINGLE, size: 2, color: '000000' },
      right: { style: BorderStyle.SINGLE, size: 2, color: '000000' },
      insideHorizontal: { style: BorderStyle.SINGLE, size: 1, color: '000000' },
      insideVertical: { style: BorderStyle.SINGLE, size: 1, color: '000000' },
    },
    rows,
  });
}

function profileToDocChildren(profile: Profile, regNoText: string): Array<Paragraph | Table> {
  return [
    para(TITLE_TEXT, { bold: true, size: 32, align: AlignmentType.CENTER }),
    new Paragraph({ children: [], spacing: { after: 180 } }),
    profileTable(profile, regNoText),
  ];
}

function formatDobForCell(dobRaw: string): [string, string] {
  const s = (dobRaw || '').trim();
  if (!s) return ['', ''];
  const tryDate = /^\d{4}-\d{2}-\d{2}$/.test(s) ? new Date(`${s}T00:00:00`) : new Date(s);
  if (!Number.isNaN(tryDate.getTime())) {
    const day = tryDate.toLocaleString('en-GB', { day: '2-digit' });
    const mon = tryDate.toLocaleString('en-GB', { month: 'short' });
    const year = tryDate.toLocaleString('en-GB', { year: 'numeric' });
    return [`${day} ${mon}`, year];
  }
  const parts = s.split(/\s+/);
  if (parts.length >= 2) {
    const maybeYear = parts[parts.length - 1];
    const first = parts.slice(0, -1).join(' ');
    return [first, maybeYear];
  }
  return [s, ''];
}

function normalizeGender(g: Profile['gender'] | undefined): 'Male' | 'Female' | 'Unknown' {
  const s = (g || '').toString().trim().toLowerCase();
  if (s === 'male' || s === 'm' || s === 'boy' || s === 'groom') return 'Male';
  if (s === 'female' || s === 'f' || s === 'girl' || s === 'bride') return 'Female';
  return 'Unknown';
}

function listDetailsRuns(profile: Profile, regNo: number): TextRun[] {
  const fullName = [profile.surname, profile.name].filter(Boolean).join(' ').trim();
  const parts: Array<{ label: string; value: string }> = [];

  // same as PrintAllList: Reg No first, labels bold, values normal
  parts.push({ label: 'Reg No', value: String(regNo) });
  if (fullName) parts.push({ label: 'Name', value: fullName });
  if (profile.sect?.trim()) parts.push({ label: 'Sect', value: profile.sect.trim() });
  if (profile.subsect?.trim()) parts.push({ label: 'Sub-Sect', value: profile.subsect.trim() });
  if (profile.gothram?.trim()) parts.push({ label: 'Gothram', value: profile.gothram.trim() });
  if (profile.dob?.trim()) parts.push({ label: 'DOB', value: profile.dob.trim() });
  if (profile.tob?.trim()) parts.push({ label: 'TOB', value: profile.tob.trim() });
  if (profile.pob?.trim()) parts.push({ label: 'POB', value: profile.pob.trim() });
  if (profile.star?.trim() || profile.padam?.trim()) {
    const sp = [profile.star?.trim(), profile.padam?.trim()].filter(Boolean).join(' ');
    if (sp) parts.push({ label: 'Star/Padam', value: sp });
  }
  if (profile.padam_colour?.trim()) parts.push({ label: 'Colour', value: profile.padam_colour.trim() });
  if (profile.height_in_cm?.trim()) parts.push({ label: 'Height', value: profile.height_in_cm.trim() });
  if (profile.marital_status?.trim()) parts.push({ label: 'Marital Status', value: profile.marital_status.trim() });
  {
    const age = computeAgeYears(profile.dob);
    if (age && age !== '-') parts.push({ label: 'Age', value: age });
  }
  if (profile.qualification?.trim()) parts.push({ label: 'Educational Qualifications', value: profile.qualification.trim() });
  {
    const jobBits = [profile.designation, profile.organisation, profile.place_of_work, profile.country_of_work]
      .map(v => (v || '').trim())
      .filter(Boolean);
    if (jobBits.length) parts.push({ label: 'Employment Details', value: jobBits.join(', ') });
  }
  if (profile.salary_per_anum?.trim()) parts.push({ label: 'Salary', value: profile.salary_per_anum.trim() });
  if (profile.father_name?.trim()) parts.push({ label: "Father's Name", value: profile.father_name.trim() });
  {
    const reqBits = [
      profile.required_qualification?.trim() ? `Qualification: ${profile.required_qualification.trim()}` : '',
      profile.required_job?.trim() ? `Job: ${profile.required_job.trim()}` : '',
      profile.required_marital_status?.trim() ? `Marital Status: ${profile.required_marital_status.trim()}` : '',
    ].filter(Boolean);
    if (reqBits.length) parts.push({ label: 'Requirements', value: reqBits.join('; ') });
  }
  if (profile.address?.trim()) parts.push({ label: 'Address', value: profile.address.trim() });
  {
    const contactBits = [
      profile.mobile?.trim() ? `Mobile: ${profile.mobile.trim()}` : '',
      profile.whatsapp?.trim() ? `WhatsApp: ${profile.whatsapp.trim()}` : '',
      profile.email?.trim() ? `E-Mail: ${profile.email.trim()}` : '',
    ].filter(Boolean);
    if (contactBits.length) parts.push({ label: 'Contact', value: contactBits.join('; ') });
  }

  const runs: TextRun[] = [];
  parts.forEach((p, idx) => {
    runs.push(new TextRun({ text: `${p.label}:`, bold: true }));
    runs.push(new TextRun({ text: ` ${p.value || '-'}${idx < parts.length - 1 ? '. ' : '.'}` }));
  });
  return runs;
}

function listFormatTable(profiles: Profile[]): Table {
  const enriched = profiles.map((p, idx) => ({
    profile: p,
    genderGroup: normalizeGender(p.gender),
    key: p.id ?? `${idx}`,
  }));

  const men = enriched.filter(r => r.genderGroup === 'Male');
  const women = enriched.filter(r => r.genderGroup === 'Female');
  const unknown = enriched.filter(r => r.genderGroup === 'Unknown');

  const ordered = [...men, ...women, ...unknown].map((r, i) => ({
    ...r,
    regNo: i + 1,
  }));

  const rows: TableRow[] = [];

  // Header row: Reg No | DOB | Details
  rows.push(
    new TableRow({
      children: [
        tableCell('Reg No', { bold: true, shading: 'F2F2F2', widthPct: 6, center: true, vAlign: VerticalAlign.CENTER }),
        tableCell('DOB', { bold: true, shading: 'F2F2F2', widthPct: 12, center: true, vAlign: VerticalAlign.CENTER }),
        tableCell('Details', { bold: true, shading: 'F2F2F2', widthPct: 82, center: true, vAlign: VerticalAlign.CENTER }),
      ],
    }),
  );

  const pushSection = (label: string, items: typeof ordered) => {
    if (!items.length) return;
    rows.push(
      new TableRow({
        children: [
          new TableCell({
            columnSpan: 3,
            children: [
              new Paragraph({
                alignment: AlignmentType.CENTER,
                children: [new TextRun({ text: label, bold: true })],
              }),
            ],
          }),
        ],
      }),
    );

    items.forEach((r) => {
      const [dobTop, dobBottom] = formatDobForCell(r.profile.dob);
      rows.push(
        new TableRow({
          children: [
            tableCell(String(r.regNo), { widthPct: 6, center: true, vAlign: VerticalAlign.CENTER }),
            new TableCell({
              width: { size: 12, type: WidthType.PERCENTAGE },
              verticalAlign: VerticalAlign.CENTER,
              children: [
                new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: dobTop })] }),
                new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: dobBottom })] }),
              ],
            }),
            new TableCell({
              width: { size: 82, type: WidthType.PERCENTAGE },
              children: [new Paragraph({ children: listDetailsRuns(r.profile, r.regNo) })],
            }),
          ],
        }),
      );
    });
  };

  pushSection('MEN', ordered.filter(r => r.genderGroup === 'Male'));
  pushSection('WOMEN', ordered.filter(r => r.genderGroup === 'Female'));
  pushSection('UNKNOWN', ordered.filter(r => r.genderGroup === 'Unknown'));

  return new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    borders: {
      top: { style: BorderStyle.SINGLE, size: 2, color: '000000' },
      bottom: { style: BorderStyle.SINGLE, size: 2, color: '000000' },
      left: { style: BorderStyle.SINGLE, size: 2, color: '000000' },
      right: { style: BorderStyle.SINGLE, size: 2, color: '000000' },
      insideHorizontal: { style: BorderStyle.SINGLE, size: 1, color: '000000' },
      insideVertical: { style: BorderStyle.SINGLE, size: 1, color: '000000' },
    },
    rows,
  });
}

async function saveBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  try {
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
  } finally {
    URL.revokeObjectURL(url);
  }
}

export async function downloadProfileDocx(profile: Profile, filename: string) {
  const doc = new Document({
    sections: [
      {
        properties: {},
        children: profileToDocChildren(profile, profile.id || '-') as any,
      },
    ],
  });

  const blob = await Packer.toBlob(doc);
  await saveBlob(blob, filename);
}

export async function downloadProfilesDocx(profiles: Profile[], filename: string) {
  const children: Array<Paragraph | Table> = [];
  profiles.forEach((p, idx) => {
    const regNoText = p.id || String(idx + 1);
    children.push(...profileToDocChildren(p, regNoText));
    if (idx !== profiles.length - 1) children.push(new Paragraph({ children: [new PageBreak()] }));
  });

  const doc = new Document({
    sections: [{ properties: {}, children: children as any }],
  });

  const blob = await Packer.toBlob(doc);
  await saveBlob(blob, filename);
}

export async function downloadProfilesListDocx(profiles: Profile[], filename: string) {
  const doc = new Document({
    sections: [
      {
        properties: {},
        children: [
          para(TITLE_TEXT, { bold: true, size: 32, align: AlignmentType.CENTER }),
          new Paragraph({ children: [], spacing: { after: 180 } }),
          listFormatTable(profiles),
        ] as any,
      },
    ],
  });

  const blob = await Packer.toBlob(doc);
  await saveBlob(blob, filename);
}

