import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { firestoreService } from '../services/firestoreService';
import type { Profile } from '../types';
import './PrintAllList.css';

function formatDobForCell(dobRaw: string): string[] {
  const s = (dobRaw || '').trim();
  if (!s) return ['', ''];

  // Supports common inputs like "05 Jun 1994", "05/06/1994", "1994-06-05"
  const tryDate =
    /^\d{4}-\d{2}-\d{2}$/.test(s) ? new Date(`${s}T00:00:00`) : new Date(s);

  if (!Number.isNaN(tryDate.getTime())) {
    const day = tryDate.toLocaleString('en-GB', { day: '2-digit' });
    const mon = tryDate.toLocaleString('en-GB', { month: 'short' });
    const year = tryDate.toLocaleString('en-GB', { year: 'numeric' });
    return [`${day} ${mon}`, year];
  }

  // Fallback: split last token as year if present.
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

function formatDetails(profile: Profile, serialNo: number): string {
  const fullName = [profile.surname, profile.name].filter(Boolean).join(' ').trim();
  const chunks: string[] = [];

  if (fullName) chunks.push(`Name: ${fullName}`);
  chunks.push(`S. No. ${serialNo}`);

  if (profile.sect?.trim()) chunks.push(`Sect: ${profile.sect.trim()}`);
  if (profile.subsect?.trim()) chunks.push(`Sub-Sect: ${profile.subsect.trim()}`);
  if (profile.gothram?.trim()) chunks.push(`Gothram: ${profile.gothram.trim()}`);

  if (profile.dob?.trim()) chunks.push(`DOB: ${profile.dob.trim()}`);
  if (profile.tob?.trim()) chunks.push(`TOB: ${profile.tob.trim()}`);
  if (profile.pob?.trim()) chunks.push(`POB: ${profile.pob.trim()}`);

  if (profile.star?.trim() || profile.padam?.trim()) {
    const sp = [profile.star?.trim(), profile.padam?.trim()].filter(Boolean).join(' ');
    if (sp) chunks.push(`Star/Padam: ${sp}`);
  }
  if (profile.padam_colour?.trim()) chunks.push(`Colour: ${profile.padam_colour.trim()}`);
  if (profile.height_in_cm?.trim()) chunks.push(`Height: ${profile.height_in_cm.trim()}`);
  if (profile.marital_status?.trim()) chunks.push(`Marital Status: ${profile.marital_status.trim()}`);

  if (profile.qualification?.trim()) chunks.push(`Educational Qualifications: ${profile.qualification.trim()}`);
  {
    const jobBits = [profile.designation, profile.organisation, profile.place_of_work, profile.country_of_work]
      .map(v => (v || '').trim())
      .filter(Boolean);
    if (jobBits.length) chunks.push(`Employment Details: ${jobBits.join(', ')}`);
  }
  if (profile.salary_per_anum?.trim()) chunks.push(`Salary: ${profile.salary_per_anum.trim()}`);

  if (profile.father_name?.trim()) chunks.push(`Father's Name: ${profile.father_name.trim()}`);

  // Requirements (only include if any are present)
  {
    const reqBits = [
      profile.required_qualification?.trim() ? `Qualification: ${profile.required_qualification.trim()}` : '',
      profile.required_job?.trim() ? `Job: ${profile.required_job.trim()}` : '',
      profile.required_marital_status?.trim() ? `Marital Status: ${profile.required_marital_status.trim()}` : '',
    ].filter(Boolean);
    if (reqBits.length) chunks.push(`Requirements: ${reqBits.join('; ')}`);
  }

  if (profile.address?.trim()) chunks.push(`Address: ${profile.address.trim()}`);

  {
    const contactBits = [profile.mobile?.trim() ? `Mobile: ${profile.mobile.trim()}` : '', profile.whatsapp?.trim() ? `WhatsApp: ${profile.whatsapp.trim()}` : '', profile.email?.trim() ? `E-Mail: ${profile.email.trim()}` : ''].filter(Boolean);
    if (contactBits.length) chunks.push(contactBits.join('; '));
  }

  // Continuous flowing text (no forced line breaks)
  return chunks.join('. ') + '.';
}

export default function PrintAllList() {
  const navigate = useNavigate();
  const printRef = useRef<HTMLDivElement>(null);
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadProfiles();
  }, []);

  const loadProfiles = async () => {
    try {
      setLoading(true);
      const data = await firestoreService.getAllProfiles();
      setProfiles(data);
    } catch (error) {
      console.error('Error loading profiles:', error);
      alert('Failed to load profiles');
    } finally {
      setLoading(false);
    }
  };

  const rows = useMemo(() => {
    const enriched = profiles.map((p, idx) => {
      const [dobTop, dobBottom] = formatDobForCell(p.dob);
      return {
        key: p.id ?? `${p.username}-${idx}`,
        genderGroup: normalizeGender(p.gender),
        dobTop,
        dobBottom,
        details: formatDetails(p, idx + 1),
      };
    });

    const men = enriched.filter(r => r.genderGroup === 'Male');
    const women = enriched.filter(r => r.genderGroup === 'Female');
    const unknown = enriched.filter(r => r.genderGroup === 'Unknown');

    // Renumber S. No. based on print order (Men -> Women -> Unknown)
    const ordered = [...men, ...women, ...unknown].map((r, i) => ({
      ...r,
      serialNo: i + 1,
      details: r.details.replace(/S\. No\. \d+/, `S. No. ${i + 1}`),
    }));

    return {
      men: ordered.filter(r => r.genderGroup === 'Male'),
      women: ordered.filter(r => r.genderGroup === 'Female'),
      unknown: ordered.filter(r => r.genderGroup === 'Unknown'),
    };
  }, [profiles]);

  const handlePrint = () => window.print();

  const handleDownloadPDF = async () => {
    if (!printRef.current) return;
    try {
      const html2pdf = (await import('html2pdf.js')).default;
      const opt = {
        margin: [10, 10, 10, 10] as [number, number, number, number],
        filename: `profiles-list.pdf`,
        image: { type: 'jpeg' as const, quality: 0.98 },
        html2canvas: { scale: 2 },
        jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' as const },
      };
      await html2pdf().set(opt).from(printRef.current).save();
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('Failed to generate PDF. Please use the Print button instead.');
    }
  };

  if (loading) return <div className="loading">Loading profiles...</div>;

  if (profiles.length === 0) {
    return (
      <div className="print-all-list-container">
        <div className="print-actions">
          <button onClick={() => navigate('/list')} className="btn-back">
            ← Back to List
          </button>
        </div>
        <div className="no-profiles">No profiles to print.</div>
      </div>
    );
  }

  return (
    <div className="print-all-list-container">
      <div className="print-actions">
        <button onClick={() => navigate('/list')} className="btn-back">
          ← Back to List
        </button>
        <button onClick={handlePrint} className="btn-print-action">
          Print (List Format)
        </button>
        <button onClick={handleDownloadPDF} className="btn-download-pdf">
          Download as PDF
        </button>
      </div>

      <div ref={printRef} className="print-content">
        <div className="print-header-section">
          <div className="print-header-title">బ్రహ్మముడి బ్రాహ్మణ కళ్యాణ బంధం</div>
        </div>

        <div className="list-grid" role="table" aria-label="Profiles list print">
          <div className="grid-row grid-header" role="row">
            <div className="grid-cell col-serial cell-serial" role="columnheader">S.No</div>
            <div className="grid-cell col-dob cell-dob" role="columnheader">DOB</div>
            <div className="grid-cell col-details cell-details" role="columnheader">Details</div>
          </div>

          {rows.men.length > 0 && (
            <div className="grid-row section-row" role="row">
              <div className="grid-cell section-cell" role="cell">MEN</div>
            </div>
          )}
          {rows.men.map((r) => (
            <div key={r.key} className="grid-row" role="row">
              <div className="grid-cell col-serial cell-serial" role="cell">{r.serialNo}</div>
              <div className="grid-cell col-dob cell-dob" role="cell">
                <div className="dob-top">{r.dobTop}</div>
                <div className="dob-bottom">{r.dobBottom}</div>
              </div>
              <div className="grid-cell col-details cell-details" role="cell">
                <div className="details-text">{r.details}</div>
              </div>
            </div>
          ))}

          {rows.women.length > 0 && (
            <div className="grid-row section-row" role="row">
              <div className="grid-cell section-cell" role="cell">WOMEN</div>
            </div>
          )}
          {rows.women.map((r) => (
            <div key={r.key} className="grid-row" role="row">
              <div className="grid-cell col-serial cell-serial" role="cell">{r.serialNo}</div>
              <div className="grid-cell col-dob cell-dob" role="cell">
                <div className="dob-top">{r.dobTop}</div>
                <div className="dob-bottom">{r.dobBottom}</div>
              </div>
              <div className="grid-cell col-details cell-details" role="cell">
                <div className="details-text">{r.details}</div>
              </div>
            </div>
          ))}

          {rows.unknown.length > 0 && (
            <div className="grid-row section-row" role="row">
              <div className="grid-cell section-cell" role="cell">UNKNOWN</div>
            </div>
          )}
          {rows.unknown.map((r) => (
            <div key={r.key} className="grid-row" role="row">
              <div className="grid-cell col-serial cell-serial" role="cell">{r.serialNo}</div>
              <div className="grid-cell col-dob cell-dob" role="cell">
                <div className="dob-top">{r.dobTop}</div>
                <div className="dob-bottom">{r.dobBottom}</div>
              </div>
              <div className="grid-cell col-details cell-details" role="cell">
                <div className="details-text">{r.details}</div>
              </div>
            </div>
          ))}
        </div>

        <div className="print-footer-section">
          <div className="page-number">Page 1</div>
        </div>
      </div>
    </div>
  );
}

