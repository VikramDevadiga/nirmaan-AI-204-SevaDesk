export interface FieldDefinition {
  key: string;
  label: string;
  question: string;
  type: 'text' | 'number' | 'date' | 'select' | 'phone' | 'email' | 'textarea';
  options?: string[];
  validation?: (value: string) => boolean;
  validationMessage?: string;
  placeholder?: string;
  hint?: string;
}

export interface ServiceFlow {
  id: string;
  service: string;
  document: string;
  title: string;
  description: string;
  icon: string;
  estimatedTime: string;
  requiredDocuments: string[];
  fields: FieldDefinition[];
}

const INDIAN_STATES = [
  'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh',
  'Goa', 'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jharkhand', 'Karnataka',
  'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Manipur', 'Meghalaya', 'Mizoram',
  'Nagaland', 'Odisha', 'Punjab', 'Rajasthan', 'Sikkim', 'Tamil Nadu',
  'Telangana', 'Tripura', 'Uttar Pradesh', 'Uttarakhand', 'West Bengal',
  'Delhi', 'Jammu & Kashmir', 'Ladakh', 'Puducherry', 'Chandigarh',
  'Andaman & Nicobar Islands', 'Dadra & Nagar Haveli and Daman & Diu', 'Lakshadweep',
];

const ID_PROOFS = [
  'Aadhaar Card', 'Voter ID Card', 'Passport', 'Driving License', 'Bank Certificate',
];
const ADDRESS_PROOFS = [
  'Aadhaar Card', 'Voter ID Card', 'Passport', 'Driving License',
  'Electricity Bill (last 3 months)', 'Telephone/Mobile Bill', 'Bank Account Statement',
  'Gas Connection Book', 'Water Bill',
];
const DOB_PROOFS = [
  'Birth Certificate', 'Matriculation/10th Certificate', 'Aadhaar Card',
  'Passport', 'Driving License', 'Voter ID Card',
];

// ─── PAN CARD NEW APPLICATION ─────────────────────────────────────────────────
const panNewFields: FieldDefinition[] = [
  {
    key: 'title',
    label: 'Title',
    question: 'What is your title?',
    type: 'select',
    options: ['Shri', 'Smt.', 'Kumari', 'M/s'],
  },
  {
    key: 'lastName',
    label: 'Last Name / Surname',
    question: "What is your **last name / surname**? (as it should appear on PAN card)",
    type: 'text',
    hint: 'Enter exactly as you want on the card (e.g., SHARMA)',
    validation: (v) => v.trim().length >= 2,
    validationMessage: 'Please enter a valid last name (at least 2 characters)',
  },
  {
    key: 'firstName',
    label: 'First Name',
    question: "What is your **first name**?",
    type: 'text',
    validation: (v) => v.trim().length >= 2,
    validationMessage: 'Please enter a valid first name',
  },
  {
    key: 'middleName',
    label: 'Middle Name',
    question: "What is your **middle name**? (Type 'None' if not applicable)",
    type: 'text',
  },
  {
    key: 'dob',
    label: 'Date of Birth',
    question: "What is your **date of birth**?",
    type: 'date',
    hint: 'Format: DD/MM/YYYY  (e.g., 15/08/1990)',
    placeholder: 'DD/MM/YYYY',
    validation: (v) => {
      if (!/^\d{2}\/\d{2}\/\d{4}$/.test(v)) return false;
      const [d, m, y] = v.split('/').map(Number);
      const dt = new Date(y, m - 1, d);
      return dt.getFullYear() === y && dt.getMonth() === m - 1 && dt.getDate() === d && y >= 1900 && y <= new Date().getFullYear() - 18;
    },
    validationMessage: 'Enter date as DD/MM/YYYY and applicant must be at least 18 years old',
  },
  {
    key: 'gender',
    label: 'Gender',
    question: "What is your **gender**?",
    type: 'select',
    options: ['Male', 'Female', 'Transgender'],
  },
  {
    key: 'fatherLastName',
    label: "Father's Last Name",
    question: "What is your **father's last name**?",
    type: 'text',
    validation: (v) => v.trim().length >= 2,
    validationMessage: 'Please enter a valid name',
  },
  {
    key: 'fatherFirstName',
    label: "Father's First Name",
    question: "What is your **father's first name**?",
    type: 'text',
    validation: (v) => v.trim().length >= 2,
    validationMessage: 'Please enter a valid name',
  },
  {
    key: 'mobile',
    label: 'Mobile Number',
    question: "What is your **mobile number**?",
    type: 'phone',
    hint: '10-digit Indian mobile number starting with 6, 7, 8, or 9',
    placeholder: '9876543210',
    validation: (v) => /^[6-9]\d{9}$/.test(v.replace(/[\s-]/g, '')),
    validationMessage: 'Enter a valid 10-digit Indian mobile number',
  },
  {
    key: 'email',
    label: 'Email Address',
    question: "What is your **email address**?",
    type: 'email',
    validation: (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v),
    validationMessage: 'Enter a valid email address',
  },
  {
    key: 'addressFlat',
    label: 'Flat/House No., Building',
    question: "Enter your **flat/house number and building name**:",
    type: 'text',
    hint: 'e.g., Flat 301, Sunrise Apartments',
    validation: (v) => v.trim().length >= 3,
    validationMessage: 'Please enter a valid flat/house number',
  },
  {
    key: 'addressStreet',
    label: 'Street/Road/Lane',
    question: "Enter your **street, road, or lane name**:",
    type: 'text',
    hint: 'e.g., MG Road',
  },
  {
    key: 'addressArea',
    label: 'Area / Locality',
    question: "Enter your **area or locality**:",
    type: 'text',
    hint: 'e.g., Banjara Hills',
  },
  {
    key: 'city',
    label: 'City / Town',
    question: "Which **city or town** do you live in?",
    type: 'text',
    validation: (v) => v.trim().length >= 2,
    validationMessage: 'Enter a valid city name',
  },
  {
    key: 'state',
    label: 'State',
    question: "Which **state** are you from?",
    type: 'select',
    options: INDIAN_STATES,
  },
  {
    key: 'pincode',
    label: 'PIN Code',
    question: "What is your **area PIN code**?",
    type: 'text',
    hint: '6-digit PIN code',
    validation: (v) => /^\d{6}$/.test(v),
    validationMessage: 'Enter a valid 6-digit PIN code',
  },
  {
    key: 'idProofType',
    label: 'Identity Proof Document',
    question: "Which document will you submit as **identity proof**?",
    type: 'select',
    options: ID_PROOFS,
  },
  {
    key: 'addressProofType',
    label: 'Address Proof Document',
    question: "Which document will you submit as **address proof**?",
    type: 'select',
    options: ADDRESS_PROOFS,
  },
  {
    key: 'dobProofType',
    label: 'Date of Birth Proof',
    question: "Which document will you submit as **date of birth proof**?",
    type: 'select',
    options: DOB_PROOFS,
  },
];

// ─── AADHAAR UPDATE ───────────────────────────────────────────────────────────
const aadhaarUpdateFields: FieldDefinition[] = [
  {
    key: 'aadhaarNumber',
    label: 'Aadhaar Number',
    question: "Please enter your **existing 12-digit Aadhaar number**:",
    type: 'text',
    hint: 'e.g., 1234 5678 9012',
    validation: (v) => /^\d{12}$/.test(v.replace(/\s/g, '')),
    validationMessage: 'Aadhaar number must be exactly 12 digits',
  },
  {
    key: 'registeredName',
    label: 'Name on Aadhaar',
    question: "What is the **name currently registered** on your Aadhaar?",
    type: 'text',
    validation: (v) => v.trim().length >= 2,
    validationMessage: 'Enter a valid name',
  },
  {
    key: 'updateType',
    label: 'Update Field',
    question: "What would you like to **update on your Aadhaar**?",
    type: 'select',
    options: ['Name', 'Date of Birth', 'Gender', 'Address', 'Mobile Number', 'Email Address', 'Language'],
  },
  {
    key: 'newValue',
    label: 'New Value',
    question: "What is the **new/corrected value** for the field you want to update?",
    type: 'text',
    hint: 'Enter the corrected information',
    validation: (v) => v.trim().length >= 1,
    validationMessage: 'Please enter the new value',
  },
  {
    key: 'mobile',
    label: 'Registered Mobile',
    question: "What is the **mobile number registered** with your Aadhaar?",
    type: 'phone',
    hint: 'OTP will be sent to this number for verification',
    validation: (v) => /^[6-9]\d{9}$/.test(v.replace(/[\s-]/g, '')),
    validationMessage: 'Enter a valid 10-digit mobile number',
  },
  {
    key: 'supportingDoc',
    label: 'Supporting Document',
    question: "Which document will you provide as **supporting proof** for this update?",
    type: 'select',
    options: [
      'Aadhaar Letter', 'Voter ID Card', 'Passport', 'Driving License',
      'Birth Certificate', 'Matriculation Certificate', 'Bank Passbook',
      'Electricity Bill', 'Telephone Bill', 'Ration Card',
    ],
  },
];

// ─── PASSPORT (FRESH) ─────────────────────────────────────────────────────────
const passportFreshFields: FieldDefinition[] = [
  {
    key: 'applicationType',
    label: 'Application Type',
    question: "What type of passport application is this?",
    type: 'select',
    options: ['Normal (30 days)', 'Tatkal (7 days, higher fee)'],
  },
  {
    key: 'givenName',
    label: 'Given Name',
    question: "What is your **given name (first + middle)**?",
    type: 'text',
    hint: 'As it should appear on passport. E.g., RAHUL MOHAN',
    validation: (v) => v.trim().length >= 2,
    validationMessage: 'Enter a valid given name',
  },
  {
    key: 'surname',
    label: 'Surname',
    question: "What is your **surname/family name**? (Type 'None' if not applicable)",
    type: 'text',
  },
  {
    key: 'dob',
    label: 'Date of Birth',
    question: "What is your **date of birth**?",
    type: 'date',
    hint: 'Format: DD/MM/YYYY',
    validation: (v) => /^\d{2}\/\d{2}\/\d{4}$/.test(v),
    validationMessage: 'Enter date as DD/MM/YYYY',
  },
  {
    key: 'placeOfBirth',
    label: 'Place of Birth',
    question: "What is your **place of birth** (city/town and state)?",
    type: 'text',
    hint: 'e.g., Hyderabad, Telangana',
    validation: (v) => v.trim().length >= 3,
    validationMessage: 'Enter a valid place of birth',
  },
  {
    key: 'gender',
    label: 'Gender',
    question: "What is your **gender**?",
    type: 'select',
    options: ['Male', 'Female', 'Transgender'],
  },
  {
    key: 'fatherName',
    label: "Father's Full Name",
    question: "What is your **father's full name**?",
    type: 'text',
    validation: (v) => v.trim().length >= 3,
    validationMessage: 'Enter a valid name',
  },
  {
    key: 'motherName',
    label: "Mother's Full Name",
    question: "What is your **mother's full name**?",
    type: 'text',
    validation: (v) => v.trim().length >= 3,
    validationMessage: 'Enter a valid name',
  },
  {
    key: 'maritalStatus',
    label: 'Marital Status',
    question: "What is your **marital status**?",
    type: 'select',
    options: ['Single', 'Married', 'Divorced', 'Widowed', 'Separated'],
  },
  {
    key: 'mobile',
    label: 'Mobile Number',
    question: "What is your **mobile number**?",
    type: 'phone',
    validation: (v) => /^[6-9]\d{9}$/.test(v.replace(/[\s-]/g, '')),
    validationMessage: 'Enter a valid 10-digit mobile number',
  },
  {
    key: 'email',
    label: 'Email Address',
    question: "What is your **email address**?",
    type: 'email',
    validation: (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v),
    validationMessage: 'Enter a valid email address',
  },
  {
    key: 'presentAddress',
    label: 'Present Address',
    question: "What is your **complete present address**?",
    type: 'textarea',
    hint: 'Include flat/house no., street, area, city, state, PIN code',
    validation: (v) => v.trim().length >= 10,
    validationMessage: 'Please enter your complete address',
  },
  {
    key: 'state',
    label: 'State',
    question: "Which **state** do you currently reside in?",
    type: 'select',
    options: INDIAN_STATES,
  },
  {
    key: 'pincode',
    label: 'PIN Code',
    question: "What is your **area PIN code**?",
    type: 'text',
    validation: (v) => /^\d{6}$/.test(v),
    validationMessage: 'Enter a valid 6-digit PIN code',
  },
  {
    key: 'aadhaarNumber',
    label: 'Aadhaar Number',
    question: "What is your **Aadhaar number**? (for eKYC verification)",
    type: 'text',
    hint: '12-digit Aadhaar number',
    validation: (v) => /^\d{12}$/.test(v.replace(/\s/g, '')),
    validationMessage: 'Aadhaar number must be 12 digits',
  },
  {
    key: 'employmentType',
    label: 'Employment Type',
    question: "What is your **employment/occupation type**?",
    type: 'select',
    options: [
      'Government Servant', 'Public Sector Undertaking', 'Statutory Body',
      'Private Sector', 'Self-Employed', 'Student', 'Homemaker',
      'Retired', 'Others',
    ],
  },
];

// ─── DRIVING LICENSE (LEARNER'S) ──────────────────────────────────────────────
const drivingLicenseFields: FieldDefinition[] = [
  {
    key: 'state',
    label: 'State',
    question: "Which **state** are you applying for the driving licence?",
    type: 'select',
    options: INDIAN_STATES,
  },
  {
    key: 'rtoOffice',
    label: 'RTO Office',
    question: "Which **RTO (Regional Transport Office)** is nearest to you?",
    type: 'text',
    hint: 'e.g., RTO-12 Banjara Hills, Hyderabad',
    validation: (v) => v.trim().length >= 3,
    validationMessage: 'Enter your nearest RTO office',
  },
  {
    key: 'fullName',
    label: 'Full Name',
    question: "What is your **full name**?",
    type: 'text',
    hint: 'As per identity proof document',
    validation: (v) => v.trim().length >= 3,
    validationMessage: 'Enter your full name',
  },
  {
    key: 'dob',
    label: 'Date of Birth',
    question: "What is your **date of birth**?",
    type: 'date',
    hint: 'Must be at least 16 years old (18 for transport vehicles). Format: DD/MM/YYYY',
    validation: (v) => {
      if (!/^\d{2}\/\d{2}\/\d{4}$/.test(v)) return false;
      const [d, m, y] = v.split('/').map(Number);
      const age = new Date().getFullYear() - y;
      return age >= 16 && age <= 80;
    },
    validationMessage: 'Enter date as DD/MM/YYYY. Must be 16-80 years old',
  },
  {
    key: 'fatherHusbandName',
    label: "Father's / Husband's Name",
    question: "What is your **father's or husband's name**?",
    type: 'text',
    validation: (v) => v.trim().length >= 2,
    validationMessage: 'Enter a valid name',
  },
  {
    key: 'bloodGroup',
    label: 'Blood Group',
    question: "What is your **blood group**?",
    type: 'select',
    options: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'],
  },
  {
    key: 'mobile',
    label: 'Mobile Number',
    question: "What is your **mobile number**?",
    type: 'phone',
    validation: (v) => /^[6-9]\d{9}$/.test(v.replace(/[\s-]/g, '')),
    validationMessage: 'Enter a valid 10-digit mobile number',
  },
  {
    key: 'email',
    label: 'Email Address',
    question: "What is your **email address**?",
    type: 'email',
    validation: (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v),
    validationMessage: 'Enter a valid email address',
  },
  {
    key: 'presentAddress',
    label: 'Present Address',
    question: "What is your **complete present address**?",
    type: 'textarea',
    hint: 'Include house no., street, locality, city, PIN code',
    validation: (v) => v.trim().length >= 10,
    validationMessage: 'Enter your complete address',
  },
  {
    key: 'aadhaarNumber',
    label: 'Aadhaar Number',
    question: "What is your **Aadhaar number**? (Mandatory for DigiLocker integration)",
    type: 'text',
    validation: (v) => /^\d{12}$/.test(v.replace(/\s/g, '')),
    validationMessage: 'Aadhaar number must be 12 digits',
  },
  {
    key: 'vehicleClass',
    label: 'Vehicle Class',
    question: "For which **type of vehicle** are you applying for the licence?",
    type: 'select',
    options: [
      'MCWOG (Motorcycle without gear - Moped)',
      'MCWG (Motorcycle with gear)',
      'LMV (Light Motor Vehicle - Car)',
      'LMV-NT (Light Motor Vehicle Non-Transport)',
      'MCWOG + LMV',
      'MCWG + LMV',
    ],
  },
  {
    key: 'idProofType',
    label: 'Identity Proof',
    question: "Which document will you submit as **identity proof**?",
    type: 'select',
    options: ID_PROOFS,
  },
  {
    key: 'addressProofType',
    label: 'Address Proof',
    question: "Which document will you submit as **address proof**?",
    type: 'select',
    options: ADDRESS_PROOFS,
  },
];

// ─── VOTER ID ─────────────────────────────────────────────────────────────────
const voterIdFields: FieldDefinition[] = [
  {
    key: 'state',
    label: 'State',
    question: "Which **state** are you registering as a voter in?",
    type: 'select',
    options: INDIAN_STATES,
  },
  {
    key: 'district',
    label: 'District',
    question: "What is your **district**?",
    type: 'text',
    validation: (v) => v.trim().length >= 2,
    validationMessage: 'Enter a valid district name',
  },
  {
    key: 'assemblyConstituency',
    label: 'Assembly Constituency',
    question: "What is the name of your **Assembly Constituency**?",
    type: 'text',
    hint: 'You can find this on the Election Commission website',
    validation: (v) => v.trim().length >= 2,
    validationMessage: 'Enter your assembly constituency name',
  },
  {
    key: 'fullName',
    label: 'Full Name',
    question: "What is your **full name**?",
    type: 'text',
    validation: (v) => v.trim().length >= 3,
    validationMessage: 'Enter your full name',
  },
  {
    key: 'dob',
    label: 'Date of Birth',
    question: "What is your **date of birth**?",
    type: 'date',
    hint: 'Must be at least 18 years old. Format: DD/MM/YYYY',
    validation: (v) => {
      if (!/^\d{2}\/\d{2}\/\d{4}$/.test(v)) return false;
      const [, , y] = v.split('/').map(Number);
      return new Date().getFullYear() - y >= 18;
    },
    validationMessage: 'Enter date as DD/MM/YYYY. Must be 18 years or older',
  },
  {
    key: 'gender',
    label: 'Gender',
    question: "What is your **gender**?",
    type: 'select',
    options: ['Male', 'Female', 'Third Gender'],
  },
  {
    key: 'relationType',
    label: 'Relation Type',
    question: "Select your **relation type** for the second name field:",
    type: 'select',
    options: ["Father's Name", "Mother's Name", "Husband's Name"],
  },
  {
    key: 'relationName',
    label: 'Relation Name',
    question: "What is that **person's full name**?",
    type: 'text',
    validation: (v) => v.trim().length >= 2,
    validationMessage: 'Enter a valid name',
  },
  {
    key: 'presentAddress',
    label: 'Present Address',
    question: "What is your **complete present address** (as proof of residence)?",
    type: 'textarea',
    hint: 'House/Flat No., Street, Locality, City, PIN Code',
    validation: (v) => v.trim().length >= 10,
    validationMessage: 'Enter your complete address',
  },
  {
    key: 'mobile',
    label: 'Mobile Number',
    question: "What is your **mobile number**?",
    type: 'phone',
    validation: (v) => /^[6-9]\d{9}$/.test(v.replace(/[\s-]/g, '')),
    validationMessage: 'Enter a valid 10-digit mobile number',
  },
  {
    key: 'email',
    label: 'Email Address (Optional)',
    question: "What is your **email address**? (Type 'Skip' if not available)",
    type: 'text',
  },
  {
    key: 'aadhaarNumber',
    label: 'Aadhaar Number',
    question: "Please provide your **Aadhaar number** for identity verification:",
    type: 'text',
    validation: (v) => v.toLowerCase() === 'skip' || /^\d{12}$/.test(v.replace(/\s/g, '')),
    validationMessage: 'Enter a valid 12-digit Aadhaar number or type Skip',
  },
];

// ─── RATION CARD (NEW) ────────────────────────────────────────────────────────
const rationCardFields: FieldDefinition[] = [
  {
    key: 'state',
    label: 'State',
    question: "Which **state** are you applying for Ration Card?",
    type: 'select',
    options: INDIAN_STATES,
  },
  {
    key: 'district',
    label: 'District',
    question: "What is your **district**?",
    type: 'text',
    validation: (v) => v.trim().length >= 2,
    validationMessage: 'Enter a valid district name',
  },
  {
    key: 'category',
    label: 'Ration Card Category',
    question: "Which **ration card category** are you eligible for?",
    type: 'select',
    options: [
      'AAY (Antyodaya Anna Yojana) - Poorest of poor',
      'PHH (Priority Household) - Below Poverty Line',
      'NPHH (Non-Priority Household) - Above Poverty Line',
    ],
  },
  {
    key: 'headName',
    label: "Head of Family - Full Name",
    question: "What is the **full name of the head of the family**?",
    type: 'text',
    validation: (v) => v.trim().length >= 3,
    validationMessage: 'Enter a valid name',
  },
  {
    key: 'headAadhaar',
    label: "Head's Aadhaar Number",
    question: "What is the **Aadhaar number of the head of the family**?",
    type: 'text',
    validation: (v) => /^\d{12}$/.test(v.replace(/\s/g, '')),
    validationMessage: 'Aadhaar number must be 12 digits',
  },
  {
    key: 'headDob',
    label: "Head's Date of Birth",
    question: "What is the **date of birth of the head of the family**?",
    type: 'date',
    hint: 'Format: DD/MM/YYYY',
    validation: (v) => /^\d{2}\/\d{2}\/\d{4}$/.test(v),
    validationMessage: 'Enter date as DD/MM/YYYY',
  },
  {
    key: 'headGender',
    label: "Head's Gender",
    question: "What is the **gender of the head of the family**?",
    type: 'select',
    options: ['Male', 'Female', 'Other'],
  },
  {
    key: 'familyMembers',
    label: 'Number of Family Members',
    question: "How many **total family members** will be included on this card?",
    type: 'number',
    validation: (v) => /^\d+$/.test(v) && parseInt(v) >= 1 && parseInt(v) <= 20,
    validationMessage: 'Enter a valid number between 1 and 20',
  },
  {
    key: 'presentAddress',
    label: 'Residential Address',
    question: "What is your **complete residential address**?",
    type: 'textarea',
    hint: 'House No., Street, Ward, Village/Town, district already entered',
    validation: (v) => v.trim().length >= 10,
    validationMessage: 'Enter your complete address',
  },
  {
    key: 'mobile',
    label: 'Mobile Number',
    question: "What is the **mobile number** of the head of family?",
    type: 'phone',
    validation: (v) => /^[6-9]\d{9}$/.test(v.replace(/[\s-]/g, '')),
    validationMessage: 'Enter a valid 10-digit mobile number',
  },
  {
    key: 'annualIncome',
    label: 'Annual Family Income',
    question: "What is your **annual family income** (in Rupees)?",
    type: 'text',
    hint: 'Enter approximate annual income (e.g., 150000)',
    validation: (v) => /^\d+$/.test(v.replace(/,/g, '')),
    validationMessage: 'Enter a valid income amount in numbers',
  },
];

// ─── BIRTH CERTIFICATE ────────────────────────────────────────────────────────
const birthCertificateFields: FieldDefinition[] = [
  {
    key: 'state',
    label: 'State',
    question: "In which **state** did the birth occur?",
    type: 'select',
    options: INDIAN_STATES,
  },
  {
    key: 'district',
    label: 'District',
    question: "In which **district** did the birth occur?",
    type: 'text',
    validation: (v) => v.trim().length >= 2,
    validationMessage: 'Enter a valid district name',
  },
  {
    key: 'childName',
    label: "Child's Name",
    question: "What is the **child's full name**? (Type 'Not Yet Named' if not decided)",
    type: 'text',
    validation: (v) => v.trim().length >= 2,
    validationMessage: 'Enter the child\'s name',
  },
  {
    key: 'dob',
    label: 'Date of Birth',
    question: "What is the **child's date of birth**?",
    type: 'date',
    hint: 'Format: DD/MM/YYYY',
    validation: (v) => /^\d{2}\/\d{2}\/\d{4}$/.test(v),
    validationMessage: 'Enter date as DD/MM/YYYY',
  },
  {
    key: 'gender',
    label: "Child's Gender",
    question: "What is the **child's gender**?",
    type: 'select',
    options: ['Male', 'Female', 'Other'],
  },
  {
    key: 'placeOfBirth',
    label: 'Place of Birth',
    question: "Where was the child born?",
    type: 'select',
    options: ['Government Hospital', 'Private Hospital/Nursing Home', 'At Home', 'Other'],
  },
  {
    key: 'hospitalName',
    label: 'Hospital Name',
    question: "What is the **name and address of the hospital/place** where birth occurred?",
    type: 'text',
    validation: (v) => v.trim().length >= 3,
    validationMessage: 'Enter the hospital or place name',
  },
  {
    key: 'fatherName',
    label: "Father's Full Name",
    question: "What is the **father's full name**?",
    type: 'text',
    validation: (v) => v.trim().length >= 3,
    validationMessage: 'Enter a valid name',
  },
  {
    key: 'fatherAadhaar',
    label: "Father's Aadhaar",
    question: "What is the **father's Aadhaar number**?",
    type: 'text',
    validation: (v) => /^\d{12}$/.test(v.replace(/\s/g, '')),
    validationMessage: 'Aadhaar number must be 12 digits',
  },
  {
    key: 'motherName',
    label: "Mother's Full Name",
    question: "What is the **mother's full name**?",
    type: 'text',
    validation: (v) => v.trim().length >= 3,
    validationMessage: 'Enter a valid name',
  },
  {
    key: 'motherAadhaar',
    label: "Mother's Aadhaar",
    question: "What is the **mother's Aadhaar number**?",
    type: 'text',
    validation: (v) => /^\d{12}$/.test(v.replace(/\s/g, '')),
    validationMessage: 'Aadhaar number must be 12 digits',
  },
  {
    key: 'parentsAddress',
    label: "Parents' Address",
    question: "What is the **parents' permanent address**?",
    type: 'textarea',
    hint: 'Complete address with PIN code',
    validation: (v) => v.trim().length >= 10,
    validationMessage: 'Enter complete address',
  },
  {
    key: 'mobile',
    label: 'Contact Mobile',
    question: "What is the **parents' contact mobile number**?",
    type: 'phone',
    validation: (v) => /^[6-9]\d{9}$/.test(v.replace(/[\s-]/g, '')),
    validationMessage: 'Enter a valid 10-digit mobile number',
  },
];

// ─── SCHOLARSHIP APPLICATION (MAHARASHTRA) ──────────────────────────────────
const scholarshipApplicationFields: FieldDefinition[] = [
  {
    key: 'schemeName',
    label: 'Scholarship Scheme',
    question: 'Which **Maharashtra scholarship scheme** are you applying for?',
    type: 'select',
    options: [
      'Government of India Post-Matric Scholarship (SC/ST)',
      'Post-Matric Scholarship (OBC / VJNT / SBC)',
      'Rajarshi Chhatrapati Shahu Maharaj Shikshan Shulk Scholarship (EBC)',
      'Dr Panjabrao Deshmukh Hostel Allowance',
      'Eklavya Scholarship (PG Students)',
      'State Government Open Merit Scholarship',
      'Minority Scholarship',
    ],
  },
  {
    key: 'applicantName',
    label: 'Student Full Name',
    question: 'What is your **full name** as per admission records?',
    type: 'text',
    validation: (v) => v.trim().length >= 3,
    validationMessage: 'Please enter your full name',
  },
  {
    key: 'mobile',
    label: 'Mobile Number',
    question: 'What is your **mobile number**? (Aadhaar-linked preferred for DBT)',
    type: 'phone',
    hint: '10-digit Indian mobile number',
    validation: (v) => /^[6-9]\d{9}$/.test(v.replace(/[\s-]/g, '')),
    validationMessage: 'Enter a valid 10-digit Indian mobile number',
  },
  {
    key: 'email',
    label: 'Email Address',
    question: 'What is your **email address**? (Type Skip if not available)',
    type: 'text',
    validation: (v) => v.toLowerCase() === 'skip' || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v),
    validationMessage: 'Enter a valid email address or type Skip',
  },
  {
    key: 'domicileState',
    label: 'Domicile State',
    question: 'Which **state domicile** do you hold?',
    type: 'select',
    options: INDIAN_STATES,
  },
  {
    key: 'category',
    label: 'Category',
    question: 'What is your **social category**?',
    type: 'select',
    options: ['SC', 'ST', 'OBC', 'VJNT', 'SBC', 'EWS', 'Open', 'Minority', 'Other'],
  },
  {
    key: 'religion',
    label: 'Religion',
    question: 'What is your **religion**? (Needed for minority schemes, otherwise type NA)',
    type: 'select',
    options: ['Hindu', 'Muslim', 'Christian', 'Sikh', 'Buddhist', 'Jain', 'Parsi', 'Other', 'NA'],
  },
  {
    key: 'annualFamilyIncome',
    label: 'Annual Family Income (INR)',
    question: 'What is your **annual family income** in rupees?',
    type: 'text',
    hint: 'Enter numbers only, e.g. 240000',
    validation: (v) => /^\d+$/.test(v.replace(/,/g, '')),
    validationMessage: 'Enter a valid income amount in numbers',
  },
  {
    key: 'courseLevel',
    label: 'Course Level',
    question: 'What is your **course level**?',
    type: 'select',
    options: [
      '11th/12th',
      'Diploma',
      'UG (Degree)',
      'PG (MA/MSc/MCom)',
      'Professional (Engineering/Pharmacy/MBA/Architecture)',
    ],
  },
  {
    key: 'collegeName',
    label: 'College / Institute Name',
    question: 'What is your **college/institute name**?',
    type: 'text',
    validation: (v) => v.trim().length >= 3,
    validationMessage: 'Enter a valid college/institute name',
  },
  {
    key: 'universityOrBoard',
    label: 'University / Board',
    question: 'Enter your **university or board** name:',
    type: 'text',
    validation: (v) => v.trim().length >= 2,
    validationMessage: 'Enter a valid university/board name',
  },
  {
    key: 'currentYear',
    label: 'Current Academic Year',
    question: 'Which **academic year/semester** are you currently in?',
    type: 'text',
    hint: 'Example: FY BTech / Semester 3 / MA Year 1',
    validation: (v) => v.trim().length >= 2,
    validationMessage: 'Enter your current academic year/semester',
  },
  {
    key: 'previousExamPercent',
    label: 'Previous Exam Percentage',
    question: 'What is your **previous exam percentage**?',
    type: 'text',
    hint: 'Example: 78.40',
    validation: (v) => /^(100(\.0{1,2})?|\d{1,2}(\.\d{1,2})?)$/.test(v.trim()),
    validationMessage: 'Enter a valid percentage between 0 and 100',
  },
  {
    key: 'aadhaarNumber',
    label: 'Aadhaar Number',
    question: 'Please enter your **12-digit Aadhaar number**:',
    type: 'text',
    validation: (v) => /^\d{12}$/.test(v.replace(/\s/g, '')),
    validationMessage: 'Aadhaar number must be exactly 12 digits',
  },
  {
    key: 'bankAccountLinked',
    label: 'Aadhaar-linked Bank Account',
    question: 'Do you have an **Aadhaar-linked bank account** for DBT payments?',
    type: 'select',
    options: ['Yes', 'No'],
  },
  {
    key: 'documentsReady',
    label: 'Document Readiness',
    question: 'Are these documents ready: Aadhaar, domicile, income certificate, marksheets, fee receipt, admission proof, bank passbook?',
    type: 'select',
    options: ['Yes, all ready', 'Partially ready', 'Need assistance'],
  },
];

// ─── RETRIEVE FLOWS ───────────────────────────────────────────────────────────
const retrievePanFields: FieldDefinition[] = [
  {
    key: 'panNumber',
    label: 'PAN Number',
    question: "Please enter your **PAN number** to retrieve details:",
    type: 'text',
    hint: 'Format: ABCDE1234F (5 letters, 4 numbers, 1 letter)',
    validation: (v) => /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/.test(v.toUpperCase()),
    validationMessage: 'Enter a valid PAN number (e.g., ABCDE1234F)',
  },
  {
    key: 'dob',
    label: 'Date of Birth',
    question: "Enter your **date of birth** for verification:",
    type: 'date',
    hint: 'Format: DD/MM/YYYY',
    validation: (v) => /^\d{2}\/\d{2}\/\d{4}$/.test(v),
    validationMessage: 'Enter date as DD/MM/YYYY',
  },
];

const retrieveAadhaarFields: FieldDefinition[] = [
  {
    key: 'aadhaarNumber',
    label: 'Aadhaar Number',
    question: "Please enter your **12-digit Aadhaar number**:",
    type: 'text',
    validation: (v) => /^\d{12}$/.test(v.replace(/\s/g, '')),
    validationMessage: 'Aadhaar number must be exactly 12 digits',
  },
  {
    key: 'mobile',
    label: 'Registered Mobile',
    question: "Enter the **mobile number registered** with your Aadhaar (OTP will be sent):",
    type: 'phone',
    validation: (v) => /^[6-9]\d{9}$/.test(v.replace(/[\s-]/g, '')),
    validationMessage: 'Enter a valid 10-digit mobile number',
  },
];

const retrievePassportFields: FieldDefinition[] = [
  {
    key: 'fileNumber',
    label: 'File Number / Application Reference',
    question: "Enter your **passport file number or application reference number**:",
    type: 'text',
    hint: 'You got this when you submitted your application',
    validation: (v) => v.trim().length >= 6,
    validationMessage: 'Enter a valid file/reference number',
  },
  {
    key: 'dob',
    label: 'Date of Birth',
    question: "Enter your **date of birth** for verification:",
    type: 'date',
    hint: 'Format: DD/MM/YYYY',
    validation: (v) => /^\d{2}\/\d{2}\/\d{4}$/.test(v),
    validationMessage: 'Enter date as DD/MM/YYYY',
  },
];

// ─── SERVICE FLOW MAP ─────────────────────────────────────────────────────────
const serviceFlows: ServiceFlow[] = [
  {
    id: 'apply-pan',
    service: 'apply',
    document: 'pan',
    title: 'PAN Card Application',
    description: 'Apply for a new Permanent Account Number',
    icon: '🪪',
    estimatedTime: '15–20 working days',
    requiredDocuments: [
      'Proof of Identity (Aadhaar/Voter ID/Passport/Driving License)',
      'Proof of Address (Aadhaar/Utility Bill/Bank Statement)',
      'Proof of Date of Birth (Birth Certificate/Matriculation Certificate)',
      'Two recent passport-size photographs',
    ],
    fields: panNewFields,
  },
  {
    id: 'update-aadhaar',
    service: 'apply',
    document: 'aadhaar',
    title: 'Aadhaar Update/Correction',
    description: 'Update details on your existing Aadhaar card',
    icon: '🆔',
    estimatedTime: '5–7 working days',
    requiredDocuments: [
      'Existing Aadhaar Card',
      'Supporting document for the specific update (as applicable)',
    ],
    fields: aadhaarUpdateFields,
  },
  {
    id: 'apply-passport',
    service: 'apply',
    document: 'passport',
    title: 'Fresh Passport Application',
    description: 'Apply for a brand new Indian Passport',
    icon: '📔',
    estimatedTime: '30 days (Normal) / 7 days (Tatkal)',
    requiredDocuments: [
      'Aadhaar Card (mandatory)',
      'Proof of Date of Birth (Birth Certificate/Matriculation)',
      'Proof of Address (Aadhaar/Utility Bill)',
      'Proof of Indian Citizenship',
      'Two recent passport-size photographs',
    ],
    fields: passportFreshFields,
  },
  {
    id: 'apply-dl',
    service: 'apply',
    document: 'driving-license',
    title: "Learner's Driving Licence",
    description: "Apply for a learner's driving licence online",
    icon: '🚗',
    estimatedTime: '7 working days (after passing LL test)',
    requiredDocuments: [
      'Aadhaar Card (mandatory for DigiLocker)',
      'Proof of Age (Aadhaar/Birth Certificate/Matriculation)',
      'Proof of Address (Aadhaar/Voter ID/Utility Bill)',
      'One recent passport-size photograph',
      'Medical certificate (Form 1-A) if age > 40 or for transport vehicles',
    ],
    fields: drivingLicenseFields,
  },
  {
    id: 'apply-voter-id',
    service: 'apply',
    document: 'voter-id',
    title: 'Voter ID Registration',
    description: "Register as a new voter and get your EPIC card",
    icon: '🗳️',
    estimatedTime: '30–60 days',
    requiredDocuments: [
      'Proof of Age (Aadhaar/Birth Certificate/Matriculation)',
      'Proof of Residence (Aadhaar/Utility Bill/Rent Agreement)',
      'One recent passport-size photograph',
    ],
    fields: voterIdFields,
  },
  {
    id: 'apply-ration-card',
    service: 'apply',
    document: 'ration-card',
    title: 'Ration Card Application',
    description: 'Apply for a new ration card under NFSA',
    icon: '🍚',
    estimatedTime: '30 days',
    requiredDocuments: [
      "Aadhaar card of head of family (mandatory)",
      "Aadhaar cards of all family members",
      "Proof of residence",
      "Income certificate",
      "Bank passbook (for DBT)",
    ],
    fields: rationCardFields,
  },
  {
    id: 'apply-birth-certificate',
    service: 'apply',
    document: 'birth-certificate',
    title: 'Birth Certificate Registration',
    description: 'Register a birth and obtain a birth certificate',
    icon: '📜',
    estimatedTime: '7–15 working days',
    requiredDocuments: [
      "Hospital discharge summary / birth slip",
      "Father's Aadhaar card",
      "Mother's Aadhaar card",
      "Marriage certificate of parents",
    ],
    fields: birthCertificateFields,
  },
  {
    id: 'apply-scholarship',
    service: 'apply',
    document: 'scholarship',
    title: 'Maharashtra Government Scholarships',
    description: 'Apply for Maharashtra state and central post-matric scholarship schemes',
    icon: '🎓',
    estimatedTime: '15-30 days (profile verification and institute approval dependent)',
    requiredDocuments: [
      'Aadhaar card',
      'Maharashtra domicile certificate',
      'Income certificate (Tehsildar)',
      'Caste certificate (if applicable)',
      '10th / 12th and previous year marksheets',
      'College admission proof and bonafide certificate',
      'Fee receipt',
      'Aadhaar-linked bank passbook',
      'Passport photo and self-declaration form',
    ],
    fields: scholarshipApplicationFields,
  },
  {
    id: 'retrieve-pan',
    service: 'retrieve',
    document: 'pan',
    title: 'PAN Card Status / Details',
    description: "Check your PAN card status or retrieve basic information",
    icon: '🔍',
    estimatedTime: 'Instant',
    requiredDocuments: ['Your PAN Number', 'Date of Birth'],
    fields: retrievePanFields,
  },
  {
    id: 'retrieve-aadhaar',
    service: 'retrieve',
    document: 'aadhaar',
    title: 'Aadhaar Status / e-Aadhaar',
    description: 'Download e-Aadhaar or check linked mobile/bank',
    icon: '🔍',
    estimatedTime: 'Instant',
    requiredDocuments: ['Your 12-digit Aadhaar Number', 'Registered Mobile Number'],
    fields: retrieveAadhaarFields,
  },
  {
    id: 'retrieve-passport',
    service: 'retrieve',
    document: 'passport',
    title: 'Passport Application Status',
    description: 'Track your passport application status',
    icon: '🔍',
    estimatedTime: 'Instant',
    requiredDocuments: ['File Number / Application Reference', 'Date of Birth'],
    fields: retrievePassportFields,
  },
];

export function getServiceFlow(service: string, document: string): ServiceFlow | null {
  return serviceFlows.find((f) => f.service === service && f.document === document) || null;
}

export function getDocumentOptions(service: string): { label: string; value: string; icon: string }[] {
  const docs = serviceFlows.filter((f) => f.service === service);
  return docs.map((f) => ({ label: f.title, value: f.document, icon: f.icon }));
}

export { serviceFlows };
