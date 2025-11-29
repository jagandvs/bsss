import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { firestoreService } from '../services/firestoreService';
import type { Profile } from '../types';
import './PrintAll.css';

export default function PrintAll() {
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

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadPDF = async () => {
    if (!printRef.current) return;
    
    try {
      const html2pdf = (await import('html2pdf.js')).default;
      const opt = {
        margin: [10, 10, 10, 10] as [number, number, number, number],
        filename: `all-profiles.pdf`,
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

  const renderProfileTable = (profile: Profile, index: number) => (
    <div key={profile.id} className="profile-section">
      <div className="print-header-section">
        <div className="print-header-title">బ్రహ్మముడి బ్రాహ్మణ కళ్యాణ బంధం</div>
      </div>
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
      <div className="print-footer-section">
        <div className="page-number">Page {index + 1}</div>
      </div>
    </div>
  );

  if (loading) {
    return <div className="loading">Loading profiles...</div>;
  }

  if (profiles.length === 0) {
    return (
      <div className="print-all-container">
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
    <div className="print-all-container">
      <div className="print-actions">
        <button onClick={() => navigate('/list')} className="btn-back">
          ← Back to List
        </button>
        <button onClick={handlePrint} className="btn-print-action">
          Print All
        </button>
        <button onClick={handleDownloadPDF} className="btn-download-pdf">
          Download as PDF
        </button>
      </div>

      <div ref={printRef} className="print-content">
        {profiles.map((profile, index) => renderProfileTable(profile, index))}
      </div>
    </div>
  );
}

