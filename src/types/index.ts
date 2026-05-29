export interface Profile {
  id?: string;
  reg_no: string;
  gender?: 'Male' | 'Female' | '';
  divorced?: boolean;
  /** @deprecated legacy field */
  username?: string;
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
  /** @deprecated removed from form */
  required_job?: string;
  /** @deprecated removed from form */
  required_marital_status?: string;
  // Personal Details Section
  surname: string;
  name: string;
  /** @deprecated removed from form */
  marital_status?: string;
  qualification: string;
  designation: string;
  organisation: string;
  place_of_work: string;
  /** @deprecated removed from form */
  country_of_work?: string;
  salary_per_anum: string;
  father_name: string;
  mother_name: string;
  address: string;
  mobile: string;
  whatsapp: string;
  /** @deprecated removed from form */
  email?: string;
  createdAt?: number;
  updatedAt?: number;
}
