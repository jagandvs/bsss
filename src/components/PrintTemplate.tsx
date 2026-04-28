import { useRef } from 'react';
import type { Profile } from '../types';
import './PrintTemplate.css';
import { downloadProfileDocx } from '../utils/docxExport';

interface PrintTemplateProps {
  profile: Profile;
  onPrint?: () => void;
}

export default function PrintTemplate({ profile, onPrint }: PrintTemplateProps) {
  const printRef = useRef<HTMLDivElement>(null);
  const regNo = profile.id || '-';

  const computeAgeYears = (dobRaw: string): string => {
    const s = (dobRaw || '').trim();
    if (!s) return '-';
    const d = /^\d{4}-\d{2}-\d{2}$/.test(s) ? new Date(`${s}T00:00:00`) : new Date(s);
    if (Number.isNaN(d.getTime())) return '-';
    const today = new Date();
    let age = today.getFullYear() - d.getFullYear();
    const m = today.getMonth() - d.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < d.getDate())) age -= 1;
    if (age < 0 || age > 120) return '-';
    return String(age);
  };

  const handlePrint = () => {
    if (onPrint) {
      onPrint();
    } else {
      window.print();
    }
  };

  const handleDownloadPDF = async () => {
    if (!printRef.current) return;
    
    try {
      const html2pdf = (await import('html2pdf.js')).default;
      const opt = {
        margin: [10, 10, 10, 10] as [number, number, number, number],
        filename: `${profile.id || 'profile'}.pdf`,
        image: { type: 'jpeg' as const, quality: 0.98 },
        html2canvas: { scale: 2 },
        jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' as const }
      };
      await html2pdf().set(opt).from(printRef.current).save();
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('Failed to generate PDF. Please use the Print button instead.');
    }
  };

  const handleDownloadWord = async () => {
    try {
      await downloadProfileDocx(profile, `${profile.id || 'profile'}.docx`);
    } catch (error) {
      console.error('Error generating Word file:', error);
      alert('Failed to generate Word file.');
    }
  };

  return (
    <div className="print-template-container">
      <div className="print-actions">
        <button onClick={handlePrint} className="btn-print-action">
          Print
        </button>
        <button onClick={handleDownloadPDF} className="btn-download-pdf">
          Download as PDF
        </button>
        <button onClick={handleDownloadWord} className="btn-download-docx">
          Download as Word
        </button>
      </div>

      <div ref={printRef} className="print-content">
        <div className="print-header-section">
          <div className="print-header-title">బ్రహ్మముడి బ్రాహ్మణ కళ్యాణ బంధం</div>
        </div>
        <div className="print-body">
          <table className="profile-table">
            <thead>
              <tr>
                <th className="username-col">Reg No</th>
                <th className="details-col">Details</th>
                <th className="personal-col">Personal Details</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="username-cell" rowSpan={28}>{regNo}</td>
                <td className="details-label">Sect</td>
                <td className="personal-label">Surname</td>
              </tr>
              <tr>
                <td className="details-value">{profile.sect || '-'}</td>
                <td className="personal-value">{profile.surname || '-'}</td>
              </tr>
              <tr>
                <td className="details-label">Subsect</td>
                <td className="personal-label">Name</td>
              </tr>
              <tr>
                <td className="details-value">{profile.subsect || '-'}</td>
                <td className="personal-value">{profile.name || '-'}</td>
              </tr>
              <tr>
                <td className="details-label">Gothram</td>
                <td className="personal-label">Age</td>
              </tr>
              <tr>
                <td className="details-value">{profile.gothram || '-'}</td>
                <td className="personal-value">{computeAgeYears(profile.dob)}</td>
              </tr>
              <tr>
                <td className="details-label"></td>
                <td className="personal-label">Marital Status</td>
              </tr>
              <tr>
                <td className="details-value"></td>
                <td className="personal-value">{profile.marital_status || '-'}</td>
              </tr>
              <tr>
                <td className="details-label">Date of Birth</td>
                <td className="personal-label">Qualification</td>
              </tr>
              <tr>
                <td className="details-value">{profile.dob || '-'}</td>
                <td className="personal-value">{profile.qualification || '-'}</td>
              </tr>
              <tr>
                <td className="details-label">Time of Birth</td>
                <td className="personal-label">Designation</td>
              </tr>
              <tr>
                <td className="details-value">{profile.tob || '-'}</td>
                <td className="personal-value">{profile.designation || '-'}</td>
              </tr>
              <tr>
                <td className="details-label">Place of Birth</td>
                <td className="personal-label">Organisation</td>
              </tr>
              <tr>
                <td className="details-value">{profile.pob || '-'}</td>
                <td className="personal-value">{profile.organisation || '-'}</td>
              </tr>
              <tr>
                <td className="details-label">Star</td>
                <td className="personal-label">Place of Work</td>
              </tr>
              <tr>
                <td className="details-value">{profile.star || '-'}</td>
                <td className="personal-value">{profile.place_of_work || '-'}</td>
              </tr>
              <tr>
                <td className="details-label">Padam</td>
                <td className="personal-label">Country of Work</td>
              </tr>
              <tr>
                <td className="details-value">{profile.padam || '-'}</td>
                <td className="personal-value">{profile.country_of_work || '-'}</td>
              </tr>
              <tr>
                <td className="details-label">Colour</td>
                <td className="personal-label">Salary Per Anum</td>
              </tr>
              <tr>
                <td className="details-value">{profile.padam_colour || '-'}</td>
                <td className="personal-value">{profile.salary_per_anum || '-'}</td>
              </tr>
              <tr>
                <td className="details-label">Height in CM</td>
                <td className="personal-label">Father Name</td>
              </tr>
              <tr>
                <td className="details-value">{profile.height_in_cm ? `${profile.height_in_cm} (Required)` : '-'}</td>
                <td className="personal-value">{profile.father_name || '-'}</td>
              </tr>
              <tr>
                <td className="details-label">Qualification</td>
                <td className="personal-label">Address</td>
              </tr>
              <tr>
                <td className="details-value">{profile.required_qualification || '-'}</td>
                <td className="personal-value">{profile.address || '-'}</td>
              </tr>
              <tr>
                <td className="details-label">Job</td>
                <td className="personal-label">Mobile</td>
              </tr>
              <tr>
                <td className="details-value">{profile.required_job || '-'}</td>
                <td className="personal-value">{profile.mobile || '-'}</td>
              </tr>
              <tr>
                <td className="details-label">Marital Status</td>
                <td className="personal-label">WhatsApp</td>
              </tr>
              <tr>
                <td className="details-value">{profile.required_marital_status || '-'}</td>
                <td className="personal-value">{profile.whatsapp || '-'}</td>
              </tr>
              <tr>
                <td className="username-cell"></td>
                <td className="details-label"></td>
                <td className="personal-label">E-Mail</td>
              </tr>
              <tr>
                <td className="username-cell"></td>
                <td className="details-value"></td>
                <td className="personal-value">{profile.email || '-'}</td>
              </tr>
            </tbody>
          </table>
        </div>
        <div className="print-footer-section">
          <div className="page-number">Page 1</div>
        </div>
      </div>
    </div>
  );
}
