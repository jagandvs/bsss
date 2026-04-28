export interface Profile {
  id?: string;
  /**
   * Legacy field (kept for backward compatibility with existing stored docs).
   * New profiles should use `id` as the Registration Number (Reg No).
   */
  username?: string;
  gender?: 'Male' | 'Female' | '';
  // Details Section
  sect: string;
  subsect: string;
  gothram: string;
  dob: string;
  tob: string;
  pob: string;
  star: string;
  padam: string;
  padam_colour: string;
  height_in_cm: string;
  required_qualification: string;
  required_job: string;
  required_marital_status: string;
  // Personal Details Section
  surname: string;
  name: string;
  marital_status: string;
  qualification: string;
  designation: string;
  organisation: string;
  place_of_work: string;
  country_of_work: string;
  salary_per_anum: string;
  father_name: string;
  address: string;
  mobile: string;
  whatsapp: string;
  email: string;
  createdAt?: number;
  updatedAt?: number;
}

