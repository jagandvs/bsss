import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { firestoreService } from '../services/firestoreService';
import type { Profile } from '../types';
import './FormEntry.css';

const initialFormData: Omit<Profile, 'id' | 'createdAt' | 'updatedAt'> = {
  regn_number: '',
  gender: '',
  full_name_with_surname: '',
  sect_subsect: '',
  gothram: '',
  dob: '',
  tob: '',
  pob: '',
  star_padam: '',
  height: '',
  complexion: '',
  educational_qualifications: '',
  employment_details: '',
  salary: '',
  father_name: '',
  mother_name: '',
  siblings: '',
  requirements_spouse: '',
  subsect_bar_no_bar: '',
  marital_status: '',
  any_other_details: '',
  address: '',
  contact_no: '',
};

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
        const { id, createdAt, updatedAt, ...profileData } = profile;
        setFormData(profileData);
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to load profile' });
    }
  };

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.regn_number.trim()) {
      newErrors.regn_number = 'Registration number is required';
    }
    if (!formData.full_name_with_surname.trim()) {
      newErrors.full_name_with_surname = 'Full name is required';
    }
    if (!formData.gender.trim()) {
      newErrors.gender = 'Gender is required';
    }
    if (!formData.contact_no.trim()) {
      newErrors.contact_no = 'Contact number is required';
    } else if (!/^\d{10}$/.test(formData.contact_no.replace(/\D/g, ''))) {
      newErrors.contact_no = 'Contact number must be 10 digits';
    }
    // Date validation removed - accept any format to match PDF

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
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

  const formFields = [
    { name: 'regn_number', label: 'Regn Number', required: true, type: 'text' },
    { name: 'gender', label: 'Gender', required: true, type: 'select', options: ['Girl', 'Boy'] },
    { name: 'full_name_with_surname', label: 'Full Name (With surname)', required: true, type: 'text' },
    { name: 'sect_subsect', label: 'Sect /Subsect', required: false, type: 'text' },
    { name: 'gothram', label: 'Gothram', required: false, type: 'text' },
    { name: 'dob', label: 'DOB', required: false, type: 'text', placeholder: 'e.g., 04/07/2000 or 9-May-2000' },
    { name: 'tob', label: 'TOB', required: false, type: 'text', placeholder: 'e.g., 1.47 pm' },
    { name: 'pob', label: 'POB', required: false, type: 'text' },
    { name: 'star_padam', label: 'Star-Padam', required: false, type: 'text' },
    { name: 'height', label: 'Height', required: false, type: 'text', placeholder: 'e.g., 5.5"' },
    { name: 'complexion', label: 'Complexion', required: false, type: 'text' },
    { name: 'educational_qualifications', label: 'Educational Qualifications', required: false, type: 'text' },
    { name: 'employment_details', label: 'Employment Details', required: false, type: 'text' },
    { name: 'salary', label: 'Salary', required: false, type: 'text' },
    { name: 'father_name', label: "Father's Name", required: false, type: 'text' },
    { name: 'mother_name', label: "Mother's Name", required: false, type: 'text' },
    { name: 'siblings', label: 'Siblings', required: false, type: 'text' },
    { name: 'requirements_spouse', label: 'Requirements Spouse', required: false, type: 'textarea' },
    { name: 'subsect_bar_no_bar', label: 'Subsect bar/ No bar', required: false, type: 'text' },
    { name: 'marital_status', label: 'Marital status', required: false, type: 'text' },
    { name: 'any_other_details', label: 'Any other details', required: false, type: 'textarea' },
    { name: 'address', label: 'Address', required: false, type: 'textarea' },
    { name: 'contact_no', label: 'Contact No', required: true, type: 'tel' },
  ];

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
        <div className="form-grid">
          {formFields.map(field => (
            <div key={field.name} className="form-field">
              <label htmlFor={field.name}>
                {field.label} {field.required && <span className="required">*</span>}
              </label>
              {field.type === 'textarea' ? (
                <textarea
                  id={field.name}
                  name={field.name}
                  value={formData[field.name as keyof typeof formData]}
                  onChange={handleChange}
                  rows={3}
                  className={errors[field.name] ? 'error' : ''}
                />
              ) : field.type === 'select' ? (
                <select
                  id={field.name}
                  name={field.name}
                  value={formData[field.name as keyof typeof formData]}
                  onChange={handleChange}
                  className={errors[field.name] ? 'error' : ''}
                >
                  <option value="">Select {field.label}</option>
                  {field.options?.map(opt => (
                    <option key={opt} value={opt}>{opt}</option>
                  ))}
                </select>
              ) : (
                <input
                  id={field.name}
                  name={field.name}
                  type={field.type}
                  value={formData[field.name as keyof typeof formData]}
                  onChange={handleChange}
                  placeholder={field.placeholder}
                  className={errors[field.name] ? 'error' : ''}
                />
              )}
              {errors[field.name] && (
                <span className="error-message">{errors[field.name]}</span>
              )}
            </div>
          ))}
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

