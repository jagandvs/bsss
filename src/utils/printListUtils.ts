import type { Profile } from '../types';

export type PrintSection = 'bride' | 'groom' | 'divorced';

export type DetailLine = { label: string; value: string };

export function formatDobForCell(dobRaw: string): [string, string] {
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

export function normalizeGender(g: Profile['gender'] | undefined): 'Male' | 'Female' | 'Unknown' {
  const s = (g || '').toString().trim().toLowerCase();
  if (s === 'male' || s === 'm' || s === 'boy' || s === 'groom') return 'Male';
  if (s === 'female' || s === 'f' || s === 'girl' || s === 'bride') return 'Female';
  return 'Unknown';
}

export function isDivorced(profile: Profile): boolean {
  return profile.divorced === true;
}

export function getPrintSection(profile: Profile): PrintSection {
  if (isDivorced(profile)) return 'divorced';
  const gender = normalizeGender(profile.gender);
  // Men -> Bride, Women -> Groom
  if (gender === 'Male') return 'bride';
  if (gender === 'Female') return 'groom';
  return 'bride';
}

export function getRegNoDisplay(profile: Profile): string {
  return (profile.reg_no || '').trim() || '-';
}

export function formatListDetails(profile: Profile): DetailLine[] {
  const fullName = [profile.surname, profile.name].filter(Boolean).join(' ').trim();
  const regNo = getRegNoDisplay(profile);
  const lines: DetailLine[] = [];

  lines.push({ label: 'Reg No', value: regNo });
  if (fullName) lines.push({ label: 'Name', value: fullName });

  if (profile.sect?.trim()) lines.push({ label: 'Sect', value: profile.sect.trim() });
  if (profile.subsect?.trim()) lines.push({ label: 'Sub-Sect', value: profile.subsect.trim() });
  if (profile.gothram?.trim()) lines.push({ label: 'Gothram', value: profile.gothram.trim() });
  if (profile.dob?.trim()) lines.push({ label: 'DOB', value: profile.dob.trim() });
  if (profile.tob?.trim()) lines.push({ label: 'TOB', value: profile.tob.trim() });
  if (profile.pob?.trim()) lines.push({ label: 'POB', value: profile.pob.trim() });

  if (profile.star?.trim() || profile.padam?.trim()) {
    const sp = [profile.star?.trim(), profile.padam?.trim()].filter(Boolean).join(' ');
    if (sp) lines.push({ label: 'Star/Padam', value: sp });
  }
  if (profile.padam_colour?.trim()) lines.push({ label: 'Colour', value: profile.padam_colour.trim() });
  if (profile.height_in_cm?.trim()) lines.push({ label: 'Height', value: profile.height_in_cm.trim() });

  if (profile.qualification?.trim()) {
    lines.push({ label: 'Educational Qualifications', value: profile.qualification.trim() });
  }
  {
    const jobBits = [profile.designation, profile.organisation, profile.place_of_work]
      .map(v => (v || '').trim())
      .filter(Boolean);
    if (jobBits.length) lines.push({ label: 'Employment Details', value: jobBits.join(', ') });
  }
  if (profile.salary_per_anum?.trim()) lines.push({ label: 'Salary', value: profile.salary_per_anum.trim() });
  if (profile.father_name?.trim()) lines.push({ label: "Father's Name", value: profile.father_name.trim() });
  if (profile.mother_name?.trim()) lines.push({ label: "Mother's Name", value: profile.mother_name.trim() });

  if (profile.required_qualification?.trim()) {
    lines.push({ label: 'Required Qualification', value: profile.required_qualification.trim() });
  }

  if (profile.address?.trim()) lines.push({ label: 'Address', value: profile.address.trim() });

  {
    const contactBits = [
      profile.mobile?.trim() ? `Mobile: ${profile.mobile.trim()}` : '',
      profile.whatsapp?.trim() ? `WhatsApp: ${profile.whatsapp.trim()}` : '',
    ].filter(Boolean);
    if (contactBits.length) lines.push({ label: 'Contact', value: contactBits.join('; ') });
  }

  return lines;
}

export type ListPrintRow = {
  key: string;
  profile: Profile;
  regNo: string;
  dobTop: string;
  dobBottom: string;
  details: DetailLine[];
  section: PrintSection;
};

export function buildListPrintRows(profiles: Profile[]): {
  bride: ListPrintRow[];
  groom: ListPrintRow[];
  divorced: ListPrintRow[];
} {
  const rows: ListPrintRow[] = profiles.map((p, idx) => {
    const [dobTop, dobBottom] = formatDobForCell(p.dob);
    return {
      key: p.id ?? `${idx}`,
      profile: p,
      regNo: getRegNoDisplay(p),
      dobTop,
      dobBottom,
      details: formatListDetails(p),
      section: getPrintSection(p),
    };
  });

  return {
    bride: rows.filter(r => r.section === 'bride'),
    groom: rows.filter(r => r.section === 'groom'),
    divorced: rows.filter(r => r.section === 'divorced'),
  };
}
