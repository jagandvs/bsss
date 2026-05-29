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
import {
  buildListPrintRows,
  formatListDetails,
  getRegNoDisplay,
  formatTobForPrint,
  type ListPrintRow,
} from './printListUtils';

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
    { label: 'Time of Birth', value: profile.tob ? formatTobForPrint(profile.tob) : '' },
    { label: 'Place of Birth', value: profile.pob },
    { label: 'Star', value: profile.star },
    { label: 'Padam', value: profile.padam },
    { label: 'Colour', value: profile.padam_colour },
    { label: 'Height in CM', value: profile.height_in_cm ? `${profile.height_in_cm} (Required)` : '' },
    { label: 'Required Qualification', value: profile.required_qualification },
  ];

  const personalPairs: Array<{ label: string; value: string }> = [
    { label: 'Surname', value: profile.surname },
    { label: 'Name', value: profile.name },
    { label: 'Qualification', value: profile.qualification },
    { label: 'Designation', value: profile.designation },
    { label: 'Organisation', value: profile.organisation },
    { label: 'Place of Work', value: profile.place_of_work },
    { label: 'Salary Per Anum', value: profile.salary_per_anum },
    { label: 'Father Name', value: profile.father_name },
    { label: 'Mother Name', value: profile.mother_name },
    { label: 'Address', value: profile.address },
    { label: 'Mobile', value: profile.mobile },
    { label: 'WhatsApp', value: profile.whatsapp },
  ];

  const bodyRowsCount = Math.max(detailsPairs.length, personalPairs.length);
  const rows: TableRow[] = [];

  rows.push(
    new TableRow({
      children: [
        tableCell('Reg No', { bold: true, shading: 'F0F0F0', widthPct: 15, center: true, vAlign: VerticalAlign.CENTER }),
        tableCell('Details', { bold: true, shading: 'F0F0F0', widthPct: 42, center: true, vAlign: VerticalAlign.CENTER }),
        tableCell('Personal Details', { bold: true, shading: 'F0F0F0', widthPct: 43, center: true, vAlign: VerticalAlign.CENTER }),
      ],
    }),
  );

  for (let i = 0; i < bodyRowsCount; i++) {
    const d = detailsPairs[i] ?? { label: '', value: '' };
    const p = personalPairs[i] ?? { label: '', value: '' };

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

function listDetailsRuns(profile: Profile): TextRun[] {
  const lines = formatListDetails(profile);
  const runs: TextRun[] = [];
  lines.forEach((line, idx) => {
    runs.push(new TextRun({ text: `${line.label}:`, bold: true }));
    runs.push(new TextRun({ text: ` ${line.value || '-'}${idx < lines.length - 1 ? '. ' : '.'}` }));
  });
  return runs;
}

function pushListSectionRows(rows: TableRow[], label: string, items: ListPrintRow[]) {
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
    rows.push(
      new TableRow({
        children: [
          tableCell(r.regNo, { widthPct: 6, center: true, vAlign: VerticalAlign.CENTER }),
          new TableCell({
            width: { size: 12, type: WidthType.PERCENTAGE },
            verticalAlign: VerticalAlign.CENTER,
            children: [
              new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: r.dobTop })] }),
              new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: r.dobBottom })] }),
            ],
          }),
          new TableCell({
            width: { size: 82, type: WidthType.PERCENTAGE },
            children: [new Paragraph({ children: listDetailsRuns(r.profile) })],
          }),
        ],
      }),
    );
  });
}

function listFormatTable(profiles: Profile[]): Table {
  const { bride, groom, divorced } = buildListPrintRows(profiles);
  const rows: TableRow[] = [];

  rows.push(
    new TableRow({
      children: [
        tableCell('Reg No', { bold: true, shading: 'F2F2F2', widthPct: 6, center: true, vAlign: VerticalAlign.CENTER }),
        tableCell('DOB', { bold: true, shading: 'F2F2F2', widthPct: 12, center: true, vAlign: VerticalAlign.CENTER }),
        tableCell('Details', { bold: true, shading: 'F2F2F2', widthPct: 82, center: true, vAlign: VerticalAlign.CENTER }),
      ],
    }),
  );

  pushListSectionRows(rows, 'BRIDE', bride);
  pushListSectionRows(rows, 'GROOM', groom);
  pushListSectionRows(rows, 'DIVORCED', divorced);

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
        children: profileToDocChildren(profile, getRegNoDisplay(profile)) as any,
      },
    ],
  });

  const blob = await Packer.toBlob(doc);
  await saveBlob(blob, filename);
}

export async function downloadProfilesDocx(profiles: Profile[], filename: string) {
  const children: Array<Paragraph | Table> = [];
  profiles.forEach((p, idx) => {
    const regNoText = getRegNoDisplay(p) !== '-' ? getRegNoDisplay(p) : String(idx + 1);
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
