import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { firestoreService } from '../services/firestoreService';
import type { Profile } from '../types';
import './FormEntry.css';

const initialFormData: Omit<Profile, 'id' | 'createdAt' | 'updatedAt'> = {
  reg_no: '',
  gender: '',
  divorced: false,
  sect: '',
  subsect: '',
  gothram: '',
  dob: '',
  tob: '',
  pob: '',
  star: '',
  padam: '',
  padam_colour: '',
  height_in_cm: '',
  required_qualification: '',
  surname: '',
  name: '',
  qualification: '',
  designation: '',
  organisation: '',
  place_of_work: '',
  salary_per_anum: '',
  father_name: '',
  mother_name: '',
  address: '',
  mobile: '',
  whatsapp: '',
};

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

export default function FormEntry() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [formData, setFormData] = useState(initialFormData);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    if (id) {
      loadProfile(id);
    }
  }, [id]);

  const loadProfile = async (profileId: string) => {
    try {
      const profile = await firestoreService.getProfileById(profileId);
      if (profile) {
        const { id: _id, createdAt, updatedAt, ...profileData } = profile;
        setFormData({
          ...initialFormData,
          ...profileData,
          reg_no: profile.reg_no || '',
          divorced: profile.divorced === true,
        });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to load profile' });
    }
  };

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.reg_no.trim()) {
      newErrors.reg_no = 'Registration number is required';
    }

    if (!formData.mobile.trim()) {
      newErrors.mobile = 'Mobile number is required';
    } else if (!/^\d{10}$/.test(formData.mobile.replace(/\D/g, ''))) {
      newErrors.mobile = 'Mobile number must be 10 digits';
    }

    if (formData.dob.trim()) {
      const d = parseDateLoose(formData.dob);
      if (!d) {
        newErrors.dob = 'Please select a valid date';
      } else {
        const today = new Date();
        if (d.getTime() > today.getTime()) newErrors.dob = 'Date of birth cannot be in the future';
      }
    }

    if (formData.tob.trim()) {
      if (!/^\d{2}:\d{2}$/.test(formData.tob.trim())) {
        newErrors.tob = 'Please select a valid time';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) {
      return;
    }

    setLoading(true);
    setMessage(null);

    try {
      if (id) {
        await firestoreService.updateProfile(id, formData);
        setMessage({ type: 'success', text: 'Profile updated successfully!' });
      } else {
        await firestoreService.createProfile(formData);
        setMessage({ type: 'success', text: 'Profile created successfully!' });
        setFormData(initialFormData);
      }
      setTimeout(() => {
        navigate('/list');
      }, 1500);
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to save profile. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="form-entry-container">
      <div className="form-header">
        <h1>{id ? 'Edit Profile' : 'Create New Profile'}</h1>
        <button onClick={() => navigate('/list')} className="btn-secondary">Back to List</button>
      </div>

      {message && (
        <div className={`message ${message.type}`}>
          {message.text}
        </div>
      )}

      <form onSubmit={handleSubmit} className="profile-form">
        <div className="form-section">
          <h2>Basic Information</h2>
          <div className="form-grid">
            <div className="form-field">
              <label htmlFor="reg_no">
                Reg No <span className="required">*</span>
              </label>
              <input
                id="reg_no"
                name="reg_no"
                type="text"
                value={formData.reg_no}
                onChange={handleChange}
                className={errors.reg_no ? 'error' : ''}
              />
              {errors.reg_no && <span className="error-message">{errors.reg_no}</span>}
            </div>
            <div className="form-field">
              <label htmlFor="gender">Gender</label>
              <select id="gender" name="gender" value={formData.gender || ''} onChange={handleChange}>
                <option value="">Select</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
              </select>
            </div>
            <div className="form-field form-field-checkbox">
              <label htmlFor="divorced" className="checkbox-label">
                <input
                  id="divorced"
                  name="divorced"
                  type="checkbox"
                  checked={formData.divorced === true}
                  onChange={handleChange}
                />
                Divorced
              </label>
            </div>
          </div>
        </div>

        <div className="form-section">
          <h2>Details</h2>
          <div className="form-grid">
            <div className="form-field">
              <label htmlFor="sect">Sect</label>
              <input id="sect" name="sect" type="text" value={formData.sect} onChange={handleChange} />
            </div>
            <div className="form-field">
              <label htmlFor="subsect">Subsect</label>
              <input id="subsect" name="subsect" type="text" value={formData.subsect} onChange={handleChange} />
            </div>
            <div className="form-field">
              <label htmlFor="gothram">Gothram</label>
              <input id="gothram" name="gothram" type="text" value={formData.gothram} onChange={handleChange} />
            </div>
            <div className="form-field">
              <label htmlFor="dob">Date of Birth</label>
              <input
                id="dob"
                name="dob"
                type="date"
                value={formData.dob}
                onChange={handleChange}
                className={errors.dob ? 'error' : ''}
              />
              {errors.dob && <span className="error-message">{errors.dob}</span>}
            </div>
            <div className="form-field">
              <label htmlFor="tob">Time of Birth</label>
              <input
                id="tob"
                name="tob"
                type="time"
                value={formData.tob}
                onChange={handleChange}
                className={errors.tob ? 'error' : ''}
              />
              {errors.tob && <span className="error-message">{errors.tob}</span>}
            </div>
            <div className="form-field">
              <label htmlFor="pob">Place of Birth</label>
              <input id="pob" name="pob" type="text" value={formData.pob} onChange={handleChange} />
            </div>
            <div className="form-field">
              <label htmlFor="star">Star</label>
              <input id="star" name="star" type="text" value={formData.star} onChange={handleChange} />
            </div>
            <div className="form-field">
              <label htmlFor="padam">Padam</label>
              <input id="padam" name="padam" type="text" value={formData.padam} onChange={handleChange} />
            </div>
            <div className="form-field">
              <label htmlFor="padam_colour">Colour</label>
              <input id="padam_colour" name="padam_colour" type="text" value={formData.padam_colour} onChange={handleChange} />
            </div>
            <div className="form-field">
              <label htmlFor="height_in_cm">Height in CM</label>
              <input id="height_in_cm" name="height_in_cm" type="text" value={formData.height_in_cm} onChange={handleChange} />
            </div>
            <div className="form-field form-field-full">
              <label htmlFor="required_qualification">Required Qualification</label>
              <textarea
                id="required_qualification"
                name="required_qualification"
                value={formData.required_qualification}
                onChange={handleChange}
                rows={3}
              />
            </div>
          </div>
        </div>

        <div className="form-section">
          <h2>Personal Details</h2>
          <div className="form-grid">
            <div className="form-field">
              <label htmlFor="surname">Surname</label>
              <input id="surname" name="surname" type="text" value={formData.surname} onChange={handleChange} />
            </div>
            <div className="form-field">
              <label htmlFor="name">Name</label>
              <input id="name" name="name" type="text" value={formData.name} onChange={handleChange} />
            </div>
            <div className="form-field">
              <label htmlFor="qualification">Qualification</label>
              <input id="qualification" name="qualification" type="text" value={formData.qualification} onChange={handleChange} />
            </div>
            <div className="form-field">
              <label htmlFor="designation">Designation</label>
              <input id="designation" name="designation" type="text" value={formData.designation} onChange={handleChange} />
            </div>
            <div className="form-field">
              <label htmlFor="organisation">Organisation</label>
              <input id="organisation" name="organisation" type="text" value={formData.organisation} onChange={handleChange} />
            </div>
            <div className="form-field">
              <label htmlFor="place_of_work">Place of Work</label>
              <input id="place_of_work" name="place_of_work" type="text" value={formData.place_of_work} onChange={handleChange} />
            </div>
            <div className="form-field">
              <label htmlFor="salary_per_anum">Salary Per Anum</label>
              <input id="salary_per_anum" name="salary_per_anum" type="text" value={formData.salary_per_anum} onChange={handleChange} />
            </div>
            <div className="form-field">
              <label htmlFor="father_name">Father Name</label>
              <input id="father_name" name="father_name" type="text" value={formData.father_name} onChange={handleChange} />
            </div>
            <div className="form-field">
              <label htmlFor="mother_name">Mother Name</label>
              <input id="mother_name" name="mother_name" type="text" value={formData.mother_name} onChange={handleChange} />
            </div>
            <div className="form-field">
              <label htmlFor="address">Address</label>
              <textarea id="address" name="address" value={formData.address} onChange={handleChange} rows={3} />
            </div>
            <div className="form-field">
              <label htmlFor="mobile">
                Mobile <span className="required">*</span>
              </label>
              <input id="mobile" name="mobile" type="tel" value={formData.mobile} onChange={handleChange} className={errors.mobile ? 'error' : ''} />
              {errors.mobile && <span className="error-message">{errors.mobile}</span>}
            </div>
            <div className="form-field">
              <label htmlFor="whatsapp">WhatsApp</label>
              <input id="whatsapp" name="whatsapp" type="tel" value={formData.whatsapp} onChange={handleChange} />
            </div>
          </div>
        </div>

        <div className="form-actions">
          <button type="submit" disabled={loading} className="btn-primary">
            {loading ? 'Saving...' : id ? 'Update Profile' : 'Create Profile'}
          </button>
          <button type="button" onClick={() => navigate('/list')} className="btn-secondary">
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
