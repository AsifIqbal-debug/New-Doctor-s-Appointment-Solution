# Admin Doctor Management Implementation

## Overview
Complete implementation of admin features for doctor management including adding doctors, removing doctors, and managing schedules/availability.

## Features Implemented

### 1. **Doctor Management Dashboard**
Location: `src/app/admin/doctors/page.tsx`

#### Features:
- **Doctor List View**
  - Display all doctors with profile information
  - Specialty, qualifications, experience, fees
  - Working days and schedule display
  - Interactive cards with actions

- **Statistics Dashboard**
  - Total doctors count
  - Number of specialties
  - Active schedules count
  - Real-time updates

- **Action Buttons**
  - Add New Doctor (primary CTA)
  - Manage Schedule (per doctor)
  - Manage Off Days (per doctor)
  - Remove Doctor (with confirmation)

### 2. **Add Doctor Functionality**

#### Modal Form Fields:
```typescript
- Full Name * (required)
- Email * (required, unique validation)
- Password * (required, bcrypt hashed)
- Specialty * (required)
- Qualification (optional)
- Experience Years (optional, numeric)
- Consultation Fee BDT * (required, numeric)
```

#### Backend API:
**Endpoint:** `POST /api/admin/doctors`

**Authentication:** Admin role required

**Process:**
1. Validate required fields
2. Check email uniqueness
3. Hash password with bcrypt
4. Create user account with DOCTOR role
5. Create doctor profile with details
6. Return created doctor data

**Transaction Safety:**
- User and doctor created in single transaction
- Rollback on any failure
- Prevents orphaned records

#### Success Flow:
```
User fills form → Validation passes → API call → 
User created → Doctor profile created → 
Query invalidation → UI updates → Success message
```

### 3. **Remove Doctor Functionality**

#### Safety Checks:
- ✅ Confirms admin authorization
- ✅ Verifies doctor exists
- ✅ Checks for active (BOOKED) appointments
- ✅ Prevents deletion if active appointments exist
- ✅ Shows active appointment count if blocked

#### Deletion Process (Transaction):
```
1. Delete doctor availability schedules
2. Delete doctor day-off records
3. Delete all prescriptions
4. Delete completed/cancelled appointments
5. Delete doctor profile
6. Delete user account
```

**Backend API:**
**Endpoint:** `DELETE /api/admin/doctors/[id]`

**Authentication:** Admin role required

**Cascade Logic:**
- Removes all related data safely
- Prevents orphaned records
- Transaction ensures atomicity

#### User Experience:
- Confirmation dialog before deletion
- Error message if active appointments exist
- Success message after deletion
- Automatic list refresh

### 4. **Update Doctor Functionality**

**Endpoint:** `PUT /api/admin/doctors/[id]`

**Updatable Fields:**
- Name (updates user table)
- Specialty
- Qualification
- Experience Years
- Consultation Fee

**Transaction Safety:**
- Updates user and doctor in single transaction
- Partial updates supported (only provided fields)

### 5. **Schedule Management** (Coming Soon)

#### Planned Features:
- Add working days and time slots
- Edit existing schedules
- Set slot duration
- Enable/disable availability
- Recurring schedule patterns

**API Endpoints (To Implement):**
- `POST /api/admin/doctors/[id]/availability`
- `PUT /api/admin/doctors/[id]/availability/[scheduleId]`
- `DELETE /api/admin/doctors/[id]/availability/[scheduleId]`

### 6. **Off Days Management** (Coming Soon)

#### Planned Features:
- Add single day offs
- Add date ranges
- Add reason/notes
- Recurring off days (holidays)
- Calendar view
- Conflict detection

**API Endpoints (To Implement):**
- `POST /api/admin/doctors/[id]/dayoffs`
- `DELETE /api/admin/doctors/[id]/dayoffs/[dayOffId]`

## Technical Implementation

### Database Schema

```prisma
model Doctor {
  id                  String                @id @default(cuid())
  userId              String                @unique
  specialty           String?
  bio                 String?
  roomNo              String?
  defaultSlotMinutes  Int                   @default(30)
  priceRuleSetId      String?
  user                User                  @relation(fields: [userId], references: [id])
  availabilities      DoctorAvailability[]
  dayOffs             DoctorDayOff[]
  appointments        Appointment[]
  prescriptions       Prescription[]
  priceRuleSet        PriceRuleSet?         @relation(fields: [priceRuleSetId], references: [id])
}

model DoctorAvailability {
  id        String  @id @default(cuid())
  doctorId  String
  weekday   Int
  startTime String
  endTime   String
  isActive  Boolean @default(true)
  doctor    Doctor  @relation(fields: [doctorId], references: [id])
}

model DoctorDayOff {
  id       String   @id @default(cuid())
  doctorId String
  date     DateTime
  reason   String?
  doctor   Doctor   @relation(fields: [doctorId], references: [id])
  
  @@unique([doctorId, date])
}
```

### API Architecture

#### Authentication Flow:
```typescript
1. Extract auth token from headers
2. Call getAuthUser(req) from auth-utils
3. Verify user exists and role === 'ADMIN'
4. Return 401 if unauthorized
5. Proceed with operation if authorized
```

#### Error Handling:
```typescript
try {
  // Verify admin auth
  // Validate input
  // Database operations
  // Return success
} catch (error) {
  console.error('Error:', error)
  return NextResponse.json(
    { error: 'Descriptive error message' },
    { status: appropriate_code }
  )
}
```

### Data Fetching (TanStack Query)

```typescript
const { data: doctors = [], isLoading } = useQuery({
  queryKey: ['admin-doctors'],
  queryFn: async () => {
    const token = localStorage.getItem('auth-token')
    const response = await fetch('/api/admin/doctors', {
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` })
      }
    })
    // Handle response
  },
  enabled: !loading && !!user && user.role === 'ADMIN'
})
```

#### Mutation Pattern:
```typescript
const mutation = useMutation({
  mutationFn: async (data) => {
    // API call
  },
  onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: ['admin-doctors'] })
    // Success feedback
  },
  onError: (error) => {
    // Error feedback
  }
})
```

## UI/UX Design

### Theme Support
All components use CSS variables for theme consistency:

```typescript
style={{
  backgroundColor: 'var(--background)',
  color: 'var(--foreground)',
  borderColor: 'var(--border)'
}}
```

### Responsive Design

**Statistics Cards:**
- Mobile: Stacked vertically (1 column)
- Tablet: 2 columns
- Desktop: 3 columns

**Doctor Cards:**
- Full width on all devices
- Responsive grid for details (2-4 columns)
- Stacked buttons on mobile
- Side-by-side buttons on desktop

### Modal Dialogs

**Add Doctor Modal:**
- Max width: 2xl (672px)
- Responsive 2-column form
- Validation on submit
- Loading state during submission
- Auto-close on success

**Schedule/Off Days Modals:**
- Placeholder screens
- Coming soon messaging
- Easy close action

### Loading States

```typescript
if (loading || doctorsLoading) {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2" />
      <p>Loading...</p>
    </div>
  )
}
```

### Empty States

```typescript
{doctors.length === 0 && (
  <div className="text-center py-12">
    <div className="text-6xl mb-4">👨‍⚕️</div>
    <h3>No Doctors Yet</h3>
    <p>Click "Add New Doctor" to get started</p>
  </div>
)}
```

## Security Considerations

### 1. **Authorization**
- All endpoints verify admin role
- Unauthorized requests return 401
- No data leakage in error messages

### 2. **Password Security**
- Bcrypt hashing with salt rounds (10)
- Passwords never stored in plain text
- Passwords never returned in API responses

### 3. **Input Validation**
- Required field validation
- Email format validation
- Numeric validation for fees/experience
- Email uniqueness check

### 4. **Transaction Safety**
- Related records created/deleted atomically
- Prevents data inconsistency
- Automatic rollback on errors

### 5. **Data Integrity**
- Active appointment check before deletion
- Cascade deletion of related records
- Foreign key constraints enforced

## Testing Checklist

### ✅ Add Doctor
- [x] Admin can access form
- [x] Non-admin cannot access
- [x] Required fields validated
- [x] Email uniqueness checked
- [x] Password hashed correctly
- [x] User and doctor created
- [x] Success message shown
- [x] List auto-refreshes

### ✅ Remove Doctor
- [x] Confirmation dialog shown
- [x] Deletion blocked if active appointments
- [x] Error message shows appointment count
- [x] All related data deleted
- [x] Success message shown
- [x] List auto-refreshes

### 🔲 Schedule Management (To Implement)
- [ ] Add availability schedule
- [ ] Edit existing schedule
- [ ] Delete schedule
- [ ] View schedule conflicts
- [ ] Enable/disable availability

### 🔲 Off Days Management (To Implement)
- [ ] Add single day off
- [ ] Add date range
- [ ] Delete day off
- [ ] View on calendar
- [ ] Recurring holidays

## Usage Guide

### For Administrators:

#### Adding a Doctor:
1. Navigate to Admin Dashboard → Doctors
2. Click "➕ Add New Doctor" button
3. Fill in required information:
   - Full name
   - Email (unique)
   - Password (secure)
   - Specialty
   - Consultation fee
4. Optionally add:
   - Qualifications
   - Years of experience
5. Click "Add Doctor"
6. Verify doctor appears in list

#### Removing a Doctor:
1. Find doctor in the list
2. Click "🗑️ Remove" button
3. Confirm deletion in dialog
4. If doctor has active appointments:
   - Error message shows count
   - Cannot delete until appointments completed/cancelled
5. If no active appointments:
   - Doctor and all related data deleted
   - Success message shown

#### Managing Schedule (Coming Soon):
1. Find doctor in list
2. Click "📅 Schedule" button
3. Modal opens with schedule management
4. Add/edit working days and hours
5. Save changes

#### Managing Off Days (Coming Soon):
1. Find doctor in list
2. Click "🏖️ Off Days" button
3. Modal opens with calendar
4. Add dates with optional reason
5. Save changes

## Future Enhancements

### Priority 1 (Immediate):
- [ ] Complete schedule management implementation
- [ ] Complete off days management implementation
- [ ] Add doctor profile editing
- [ ] Add search/filter functionality
- [ ] Add pagination for large doctor lists

### Priority 2 (Near Term):
- [ ] Bulk operations (import/export)
- [ ] Email notifications for schedule changes
- [ ] Calendar view for availability
- [ ] Conflict detection and warnings
- [ ] Doctor performance analytics

### Priority 3 (Long Term):
- [ ] Advanced scheduling rules
- [ ] Template schedules
- [ ] Multi-location support
- [ ] Doctor groups/departments
- [ ] Automated shift rotation
- [ ] Leave management system

## API Reference

### Get All Doctors
```http
GET /api/admin/doctors
Authorization: Bearer {token}
Role: ADMIN

Response 200:
{
  "doctors": [
    {
      "id": "cuid",
      "userId": "cuid",
      "specialty": "Cardiology",
      "qualification": "MBBS, MD",
      "experienceYears": 10,
      "feeBdt": 500,
      "user": {
        "id": "cuid",
        "name": "Dr. John Doe",
        "email": "john@clinic.local",
        "role": "DOCTOR"
      },
      "availabilities": [...],
      "dayOffs": [...]
    }
  ]
}
```

### Add Doctor
```http
POST /api/admin/doctors
Authorization: Bearer {token}
Role: ADMIN
Content-Type: application/json

Body:
{
  "name": "Dr. Jane Smith",
  "email": "jane@clinic.local",
  "password": "secure123",
  "specialty": "Pediatrics",
  "qualification": "MBBS, DCH",
  "experienceYears": 8,
  "feeBdt": 400
}

Response 201:
{
  "message": "Doctor added successfully",
  "doctor": { ... }
}

Error 400:
{
  "error": "Email already registered"
}
```

### Remove Doctor
```http
DELETE /api/admin/doctors/{id}
Authorization: Bearer {token}
Role: ADMIN

Response 200:
{
  "message": "Doctor removed successfully"
}

Error 400:
{
  "error": "Cannot delete doctor with active appointments",
  "activeAppointments": 5
}

Error 404:
{
  "error": "Doctor not found"
}
```

### Update Doctor
```http
PUT /api/admin/doctors/{id}
Authorization: Bearer {token}
Role: ADMIN
Content-Type: application/json

Body:
{
  "name": "Dr. Jane Smith Updated",
  "specialty": "Pediatric Surgery",
  "qualification": "MBBS, DCH, FRCS",
  "experienceYears": 10,
  "feeBdt": 600
}

Response 200:
{
  "message": "Doctor updated successfully",
  "doctor": { ... }
}
```

## Files Modified/Created

### Created Files:
1. `src/app/api/admin/doctors/route.ts` - GET/POST endpoints
2. `src/app/api/admin/doctors/[id]/route.ts` - DELETE/PUT endpoints
3. `ADMIN_DOCTOR_MANAGEMENT.md` - This documentation

### Modified Files:
1. `src/app/admin/doctors/page.tsx` - Complete UI implementation

## Dependencies
- Next.js 15.5.3
- React 19.1.0
- TanStack Query 5.90.2
- Prisma 6.16.2
- bcryptjs 2.4.3
- TypeScript 5.x

## Deployment Notes
1. Run database migration: `npm run prisma:migrate`
2. Verify admin role exists in seed data
3. Test API endpoints with admin credentials
4. Verify theme variables in globals.css
5. Test responsive design on mobile/tablet/desktop

---

**Status:** ✅ Add/Remove Doctor Complete | 🔲 Schedule/Off Days Pending
**Last Updated:** January 2025
**Version:** 1.0.0
