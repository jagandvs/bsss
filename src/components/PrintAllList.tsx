import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { firestoreService } from '../services/firestoreService';
import type { Profile } from '../types';
import { buildListPrintRows, type ListPrintRow } from '../utils/printListUtils';
import './PrintAllList.css';
import { downloadProfilesListDocx } from '../utils/docxExport';

function renderSection(label: string, rows: ListPrintRow[]) {
  if (!rows.length) return null;
  return (
    <>
      <div className="grid-row section-row" role="row">
        <div className="grid-cell section-cell" role="cell">{label}</div>
      </div>
      {rows.map((r) => (
        <div key={r.key} className="grid-row" role="row">
          <div className="grid-cell col-serial cell-serial" role="cell">{r.regNo}</div>
          <div className="grid-cell col-dob cell-dob" role="cell">
            <div className="dob-top">{r.dobTop}</div>
            <div className="dob-bottom">{r.dobBottom}</div>
          </div>
          <div className="grid-cell col-details cell-details" role="cell">
            <div className="details-text">
              {r.details.map((line, i) => (
                <span key={`${line.label}-${i}`}>
                  <strong>{line.label}:</strong> {line.value}
                  {i < r.details.length - 1 ? '. ' : '.'}
                </span>
              ))}
            </div>
          </div>
        </div>
      ))}
    </>
  );
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

  const rows = useMemo(() => buildListPrintRows(profiles), [profiles]);

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

  const handleDownloadWord = async () => {
    try {
      await downloadProfilesListDocx(profiles, 'profiles-list.docx');
    } catch (error) {
      console.error('Error generating Word file:', error);
      alert('Failed to generate Word file.');
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
        <button onClick={handleDownloadWord} className="btn-download-docx">
          Download as Word
        </button>
      </div>

      <div ref={printRef} className="print-content">
        <div className="print-header-section">
          <div className="print-header-title">బ్రహ్మముడి బ్రాహ్మణ కళ్యాణ బంధం</div>
        </div>

        <div className="list-grid" role="table" aria-label="Profiles list print">
          <div className="grid-row grid-header" role="row">
            <div className="grid-cell col-serial cell-serial" role="columnheader">Reg No</div>
            <div className="grid-cell col-dob cell-dob" role="columnheader">DOB</div>
            <div className="grid-cell col-details cell-details" role="columnheader">Details</div>
          </div>

          {renderSection('BRIDE', rows.bride)}
          {renderSection('GROOM', rows.groom)}
          {renderSection('DIVORCED', rows.divorced)}
        </div>

        <div className="print-footer-section">
          <div className="page-number">Page 1</div>
        </div>
      </div>
    </div>
  );
}
