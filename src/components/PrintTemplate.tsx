import { useRef } from 'react';
import type { Profile } from '../types';
import './PrintTemplate.css';

interface PrintTemplateProps {
  profile: Profile;
  onPrint?: () => void;
}

export default function PrintTemplate({ profile, onPrint }: PrintTemplateProps) {
  const printRef = useRef<HTMLDivElement>(null);

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
        filename: `${profile.regn_number || 'profile'}.pdf`,
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

  return (
    <div className="print-template-container">
      <div className="print-actions">
        <button onClick={handlePrint} className="btn-print-action">
          Print
        </button>
        <button onClick={handleDownloadPDF} className="btn-download-pdf">
          Download as PDF
        </button>
      </div>

      <div ref={printRef} className="print-content">
        <div className="print-header-section">
          <div className="print-header-title">బ్రహ్మముడి బ్రాహ్మణ కళ్యాణ బంధం</div>
        </div>
        <div className="print-body">
          <table className="profile-table">
            <tbody>
              <tr>
                <td className="label-cell">Regn Number</td>
                <td className="value-cell">{profile.regn_number || '-'}</td>
              </tr>
              <tr>
                <td className="label-cell">Gender</td>
                <td className="value-cell">{profile.gender || '-'}</td>
              </tr>
              <tr>
                <td className="label-cell">Full Name (With surname)</td>
                <td className="value-cell">{profile.full_name_with_surname || '-'}</td>
              </tr>
              <tr>
                <td className="label-cell">Sect /Subsect</td>
                <td className="value-cell">{profile.sect_subsect || '-'}</td>
              </tr>
              <tr>
                <td className="label-cell">Gothram</td>
                <td className="value-cell">{profile.gothram || '-'}</td>
              </tr>
              <tr>
                <td className="label-cell">DOB</td>
                <td className="value-cell">{profile.dob || '-'}</td>
              </tr>
              <tr>
                <td className="label-cell">TOB</td>
                <td className="value-cell">{profile.tob || '-'}</td>
              </tr>
              <tr>
                <td className="label-cell">POB</td>
                <td className="value-cell">{profile.pob || '-'}</td>
              </tr>
              <tr>
                <td className="label-cell">Star-Padam</td>
                <td className="value-cell">{profile.star_padam || '-'}</td>
              </tr>
              <tr>
                <td className="label-cell">Height</td>
                <td className="value-cell">{profile.height || '-'}</td>
              </tr>
              <tr>
                <td className="label-cell">Complexion</td>
                <td className="value-cell">{profile.complexion || '-'}</td>
              </tr>
              <tr>
                <td className="label-cell">Educational Qualifications</td>
                <td className="value-cell">{profile.educational_qualifications || '-'}</td>
              </tr>
              <tr>
                <td className="label-cell">Employment Details</td>
                <td className="value-cell">{profile.employment_details || '-'}</td>
              </tr>
              <tr>
                <td className="label-cell">Salary</td>
                <td className="value-cell">{profile.salary || '-'}</td>
              </tr>
              <tr>
                <td className="label-cell">Father's Name</td>
                <td className="value-cell">{profile.father_name || '-'}</td>
              </tr>
              <tr>
                <td className="label-cell">Mother's Name</td>
                <td className="value-cell">{profile.mother_name || '-'}</td>
              </tr>
              <tr>
                <td className="label-cell">Siblings</td>
                <td className="value-cell">{profile.siblings || '-'}</td>
              </tr>
              <tr>
                <td className="label-cell">Requirements Spouse</td>
                <td className="value-cell">{profile.requirements_spouse || '-'}</td>
              </tr>
              <tr>
                <td className="label-cell">Subsect bar/ No bar</td>
                <td className="value-cell">{profile.subsect_bar_no_bar || '-'}</td>
              </tr>
              <tr>
                <td className="label-cell">Marital status</td>
                <td className="value-cell">{profile.marital_status || '-'}</td>
              </tr>
              <tr>
                <td className="label-cell">Any other details</td>
                <td className="value-cell">{profile.any_other_details || '-'}</td>
              </tr>
              <tr>
                <td className="label-cell">Address</td>
                <td className="value-cell">{profile.address || '-'}</td>
              </tr>
              <tr>
                <td className="label-cell">Contact No</td>
                <td className="value-cell">{profile.contact_no || '-'}</td>
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

