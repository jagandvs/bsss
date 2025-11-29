import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { firestoreService } from '../services/firestoreService';
import type { Profile } from '../types';
import PrintTemplate from './PrintTemplate';
import './EntryView.css';

export default function EntryView() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      loadProfile(id);
    }
  }, [id]);

  const loadProfile = async (profileId: string) => {
    try {
      setLoading(true);
      const data = await firestoreService.getProfileById(profileId);
      if (data) {
        setProfile(data);
      } else {
        alert('Profile not found');
        navigate('/list');
      }
    } catch (error) {
      console.error('Error loading profile:', error);
      alert('Failed to load profile');
      navigate('/list');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="loading">Loading profile...</div>;
  }

  if (!profile) {
    return <div className="error">Profile not found</div>;
  }

  return (
    <div className="entry-view-container">
      <div className="view-header">
        <button onClick={() => navigate('/list')} className="btn-back">
          ← Back to List
        </button>
        <button onClick={() => navigate(`/form/${id}`)} className="btn-edit">
          Edit Profile
        </button>
      </div>
      <PrintTemplate profile={profile} />
    </div>
  );
}

