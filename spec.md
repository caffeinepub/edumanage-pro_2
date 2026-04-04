# EduManage Pro

## Current State
StudentsView का Add/Edit Student dialog में ये fields हैं:
- Student Name (English + Hindi transliteration)
- Father Name (English + Hindi)
- Mother Name (English + Hindi)
- समग्र आई.डी., आधार नं., स्कॉलर क्रमांक
- जन्म तिथि (DOB)
- Class, Section

AdmissionFormView में ये अतिरिक्त fields हैं:
- Guardian (संरक्षक) नाम English/Hindi + Relation
- Gender (लिंग)
- Blood Group (रक्त समूह)
- Category (जाति वर्ग)
- Religion (धर्म)
- Nationality (राष्ट्रीयता)
- CWSN
- APAAR ID, BPL No.
- School Code, UDISE Code
- Admission Class, Admission Date, Roll No.
- Previous School, Previous Class, TC No., TC Date
- Address: address, village, post, tehsil, district, state, pincode
- Contact: mobileNo, alternateMobile, email

## Requested Changes (Diff)

### Add
- StudentsView Add/Edit dialog में वो सभी fields जोड़ें जो Admission Form में हैं:
  - Guardian नाम (English + Hindi + relation)
  - Gender, Blood Group, Category, Religion, Nationality, CWSN
  - APAAR ID, BPL No., School Code, UDISE Code
  - Admission Date, Previous School, Previous Class, TC No., TC Date
  - Address section: address, village, post, tehsil, district, state, pincode
  - Contact: mobileNo, alternateMobile, email
- Student interface में ये सभी fields add करें
- handleSaveStudent में save करें
- loadStudentData (AdmissionFormView) में ये नए fields भी load करें

### Modify
- StudentsView का Student interface extend करें
- Add/Edit dialog को scrollable बनाएं (sections में organize)
- openEditDialog में नए fields load करें
- resetForm में नए fields reset करें

### Remove
कुछ नहीं हटाना है

## Implementation Plan
1. StudentsView.tsx का Student interface extend करें (सभी नए fields)
2. State variables add करें (formGuardianEng, formGuardian​Hin, formGender, formBloodGroup, etc.)
3. resetForm() और openEditDialog() update करें
4. handleSaveStudent() में नए fields save करें
5. Dialog form में sections बनाकर सभी नए fields add करें (accordion/tabbed या scrollable)
6. AdmissionFormView.tsx में loadStudentData() update करें ताकि नए fields भी auto-fill हों
