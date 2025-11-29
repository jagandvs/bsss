import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { firestoreService } from '../services/firestoreService';
import { useAuth } from '../contexts/AuthContext';
import type { Profile } from '../types';
import './EntriesList.css';

export default function EntriesList() {
  const navigate = useNavigate();
  const { logout, currentUser } = useAuth();
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [filteredProfiles, setFilteredProfiles] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchField, setSearchField] = useState<'regn_number' | 'full_name_with_surname' | 'pob' | 'gothram'>('regn_number');

  useEffect(() => {
    loadProfiles();
  }, []);

  useEffect(() => {
    filterProfiles();
  }, [searchTerm, searchField, profiles]);

  const loadProfiles = async () => {
    try {
      setLoading(true);
      const data = await firestoreService.getAllProfiles();
      setProfiles(data);
      setFilteredProfiles(data);
    } catch (error) {
      console.error('Error loading profiles:', error);
      alert('Failed to load profiles');
    } finally {
      setLoading(false);
    }
  };

  const filterProfiles = () => {
    if (!searchTerm.trim()) {
      setFilteredProfiles(profiles);
      return;
    }

    const term = searchTerm.toLowerCase();
    const filtered = profiles.filter(profile => {
      const value = profile[searchField]?.toLowerCase() || '';
      return value.includes(term);
    });
    setFilteredProfiles(filtered);
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to delete ${name}?`)) {
      return;
    }

    try {
      await firestoreService.deleteProfile(id);
      await loadProfiles();
    } catch (error) {
      console.error('Error deleting profile:', error);
      alert('Failed to delete profile');
    }
  };

  const extractCity = (address: string): string => {
    if (!address) return '';
    const cityMatch = address.match(/(Hyderabad|Vijayawada|Visakhapatnam|Bangalore|Chennai|Mumbai|Delhi|Pune|Kolkata)/i);
    return cityMatch ? cityMatch[0] : '';
  };

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Error logging out:', error);
      alert('Failed to logout');
    }
  };

  if (loading) {
    return <div className="loading">Loading profiles...</div>;
  }

  return (
    <div className="entries-list-container">
      <div className="list-header">
        <div>
          <h1>Profiles List</h1>
          {currentUser && (
            <p className="user-email">{currentUser.email}</p>
          )}
        </div>
        <div className="header-actions">
          <button onClick={() => navigate('/print-all')} className="btn-print-all">
            Print All
          </button>
          <button onClick={() => navigate('/form')} className="btn-primary">
            Create New Profile
          </button>
          <button onClick={() => navigate('/create-user')} className="btn-create-user">
            Create User
          </button>
          <button onClick={handleLogout} className="btn-logout">
            Logout
          </button>
        </div>
      </div>

      <div className="search-section">
        <div className="search-controls">
          <select
            value={searchField}
            onChange={(e) => setSearchField(e.target.value as any)}
            className="search-field-select"
          >
            <option value="regn_number">Registration Number</option>
            <option value="full_name_with_surname">Full Name</option>
            <option value="pob">Place of Birth</option>
            <option value="gothram">Gothram</option>
          </select>
          <input
            type="text"
            placeholder={`Search by ${searchField.replace('_', ' ')}...`}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
        </div>
        <div className="results-count">
          Showing {filteredProfiles.length} of {profiles.length} profiles
        </div>
      </div>

      {filteredProfiles.length === 0 ? (
        <div className="no-results">
          {profiles.length === 0 ? 'No profiles found. Create your first profile!' : 'No profiles match your search.'}
        </div>
      ) : (
        <div className="table-container">
          <table className="profiles-table">
            <thead>
              <tr>
                <th>Regn Number</th>
                <th>Full Name</th>
                <th>DOB</th>
                <th>POB</th>
                <th>City</th>
                <th>Contact No</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredProfiles.map((profile) => (
                <tr key={profile.id}>
                  <td>{profile.regn_number}</td>
                  <td>{profile.full_name_with_surname}</td>
                  <td>{profile.dob || '-'}</td>
                  <td>{profile.pob || '-'}</td>
                  <td>{extractCity(profile.address) || '-'}</td>
                  <td>{profile.contact_no}</td>
                  <td>
                    <div className="action-buttons">
                      <button
                        onClick={() => navigate(`/view/${profile.id}`)}
                        className="btn-view"
                        title="View"
                      >
                        View
                      </button>
                      <button
                        onClick={() => navigate(`/form/${profile.id}`)}
                        className="btn-edit"
                        title="Edit"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(profile.id!, profile.full_name_with_surname)}
                        className="btn-delete"
                        title="Delete"
                      >
                        Delete
                      </button>
                      <button
                        onClick={() => navigate(`/print/${profile.id}`)}
                        className="btn-print"
                        title="Print"
                      >
                        Print
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

