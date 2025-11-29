# AMIC Matrimonial Profiles App

A React application for managing matrimonial profiles with Firebase Firestore integration. This app allows users to create, view, edit, delete, and print profiles in a format matching the AMIC matrimonial information template.

## Features

- ✅ Create and edit matrimonial profiles
- ✅ View all profiles in a searchable table
- ✅ Search/filter by Registration Number, Full Name, Place of Birth, or Gothram
- ✅ Print profiles in the exact layout of the PDF template
- ✅ Download profiles as PDF
- ✅ Firebase Firestore integration for data persistence

## Tech Stack

- **Frontend**: React 18 + TypeScript
- **Build Tool**: Vite
- **Routing**: React Router DOM
- **Database**: Firebase Firestore
- **PDF Generation**: html2pdf.js
- **Styling**: CSS Modules

## Setup Instructions

### 1. Install Dependencies

```bash
npm install
```

### 2. Firebase Configuration

1. Create a Firebase project at [Firebase Console](https://console.firebase.google.com/)
2. Enable Firestore Database
3. Copy your Firebase configuration
4. Create a `.env` file in the root directory:

```bash
cp .env.example .env
```

5. Add your Firebase configuration to `.env`:

```env
VITE_FIREBASE_API_KEY=your-api-key-here
VITE_FIREBASE_AUTH_DOMAIN=your-project-id.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project-id.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your-messaging-sender-id
VITE_FIREBASE_APP_ID=your-app-id
```

### 3. Firestore Security Rules

Set up Firestore security rules. For development, you can use:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /profiles/{document=**} {
      allow read, write: if true; // For development only - restrict in production
    }
  }
}
```

**Important**: For production, implement proper authentication and security rules.

### 4. Run the Application

```bash
npm run dev
```

The app will be available at `http://localhost:5173`

## Project Structure

```
src/
├── components/
│   ├── FormEntry.tsx          # Form for creating/editing profiles
│   ├── EntriesList.tsx        # List view with search functionality
│   ├── EntryView.tsx          # View/print page for individual profiles
│   └── PrintTemplate.tsx      # Print template matching PDF layout
├── config/
│   └── firebase.ts            # Firebase configuration
├── services/
│   └── firestoreService.ts    # Firestore CRUD operations
├── types/
│   └── index.ts               # TypeScript type definitions
├── App.tsx                    # Main app component with routing
└── main.tsx                   # Entry point
```

## Usage

### Creating a Profile

1. Navigate to the List page
2. Click "Create New Profile"
3. Fill in the required fields (marked with *)
4. Click "Create Profile"

### Searching Profiles

1. On the List page, select a search field from the dropdown
2. Enter your search term
3. Results will filter automatically

### Printing a Profile

1. Click "View" or "Print" on any profile
2. Click "Print" to open browser print dialog
3. Or click "Download as PDF" to generate a PDF file

## Data Model

Each profile document in Firestore contains:

- `regn_number` (required)
- `gender` (required)
- `full_name_with_surname` (required)
- `sect_subsect`
- `gothram`
- `dob` (Date of Birth)
- `tob` (Time of Birth)
- `pob` (Place of Birth)
- `star_padam`
- `height`
- `complexion`
- `educational_qualifications`
- `employment_details`
- `salary`
- `father_name`
- `mother_name`
- `siblings`
- `requirements_spouse`
- `subsect_bar_no_bar`
- `marital_status`
- `any_other_details`
- `address`
- `contact_no` (required)
- `createdAt` (timestamp)
- `updatedAt` (timestamp)

## Building for Production

```bash
npm run build
```

The built files will be in the `dist` directory, ready for deployment to platforms like Netlify, Vercel, or Firebase Hosting.

## Deployment

### Netlify

1. Build the project: `npm run build`
2. Deploy the `dist` folder to Netlify
3. Add environment variables in Netlify dashboard

### Vercel

1. Connect your repository to Vercel
2. Add environment variables in Vercel dashboard
3. Deploy

### Firebase Hosting

```bash
npm install -g firebase-tools
firebase login
firebase init hosting
firebase deploy
```

## License

MIT
