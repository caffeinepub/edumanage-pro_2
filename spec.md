# EduManage Pro

## Current State
- App has Student Management, Mark Entry, Report Card, Admission Form modules
- Report Card has schoolName, block, district fields stored in studentProfiles per student (not a global school profile)
- Admission Form has schoolName, block, schoolDistrict, schoolCode, udiseCode fields filled manually
- No dedicated School Profile page exists
- Sidebar has: dashboard, students, teachers, attendance, results, markEntry, reportCard, admissionForm, profile

## Requested Changes (Diff)

### Add
- **SchoolProfileView** (new page): Admin can fill and save school details globally
  - Fields: schoolName (Hindi + English), principal name, school code, UDISE code, block/vikas khand, district, state, address, contact, email, affiliation board
  - Data saved to localStorage key `"schoolProfile"`
  - Save button with success feedback
- **"School Profile"** nav item in sidebar (admin-only)

### Modify
- **Report Card**: On load, read `localStorage.getItem("schoolProfile")` and auto-fill schoolName, block, district fields
- **Admission Form**: On load, read `localStorage.getItem("schoolProfile")` and auto-fill schoolName, block, schoolDistrict, schoolCode, udiseCode fields
- **App.tsx**: Add schoolProfile nav item routing
- **Sidebar**: Add schoolProfile nav item for admin role

### Remove
- Nothing removed

## Implementation Plan
1. Create `src/frontend/src/views/SchoolProfileView.tsx` with form for school details, save to `localStorage.schoolProfile`
2. Update `Sidebar.tsx`: add `"schoolProfile"` NavItem type, add to admin roleItems, add icon+label
3. Update `App.tsx`: import SchoolProfileView, add routing case
4. Update `ReportCardView.tsx`: on mount, read `schoolProfile` from localStorage and use for schoolName/block/district with fallback to per-student stored values
5. Update `AdmissionFormView.tsx`: on mount, read `schoolProfile` and auto-fill school section fields
