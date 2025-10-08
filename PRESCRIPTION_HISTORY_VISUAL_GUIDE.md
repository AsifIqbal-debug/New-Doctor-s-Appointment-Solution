# Prescription History Feature - Visual Guide

## 📋 Feature Overview

The prescription history feature provides a visual timeline of all prescriptions with expandable details, statistics, and action buttons.

---

## 🎨 Component Structure

```
┌─────────────────────────────────────────────────────────┐
│           PRESCRIPTION HISTORY                           │
│                                                          │
│  ┌───────────┐  ┌───────────┐  ┌───────────┐           │
│  │ 📊 Total  │  │ 💊 Total  │  │ 👨‍⚕️ Total │           │
│  │    12     │  │    45     │  │     3      │           │
│  │Prescriptions│ │Medications│ │  Doctors   │           │
│  └───────────┘  └───────────┘  └───────────┘           │
│                                                          │
│  ┌──────────────────────────────────────────────┐       │
│  │  ● ← Latest Prescription Badge (Pulse)       │       │
│  │  │                                            │       │
│  │  ├─ 📅 January 15, 2025                      │       │
│  │  ├─ 👨‍⚕️ Dr. Rahman Khan (Cardiologist)      │       │
│  │  │                                            │       │
│  │  ├─ [Expand ▼]                               │       │
│  │  │   💊 Aspirin 75mg                         │       │
│  │  │      🌅1 + ☀️0 + 🌙1 (2 times/day)        │       │
│  │  │      Duration: 30 days                    │       │
│  │  │                                            │       │
│  │  │   💊 Atorvastatin 10mg                    │       │
│  │  │      🌅0 + ☀️0 + 🌙1 (1 time/day)         │       │
│  │  │      Duration: 30 days                    │       │
│  │  │                                            │       │
│  │  ├─ 📋 Advice: Take with food               │       │
│  │  │                                            │       │
│  │  └─ [🖨️ Print] [📄 View Details]            │       │
│  │                                               │       │
│  ○  ← Timeline Dot (Card Color)                 │       │
│  │                                               │       │
│  ├─ 📅 December 10, 2024                        │       │
│  ├─ 👨‍⚕️ Dr. Sarah Ahmed (General)               │       │
│  │                                               │       │
│  ├─ [Expand ▼]                                  │       │
│  │   ... (collapsed)                            │       │
│  │                                               │       │
│  └─ [🖨️ Print] [📄 View Details]                │       │
│                                                  │       │
│  ○  ← Timeline Dot                              │       │
│  │                                               │       │
│  ├─ 📅 November 5, 2024                         │       │
│  ...                                             │       │
│  └──────────────────────────────────────────────┘       │
└─────────────────────────────────────────────────────────┘
```

---

## 🎯 Key Features

### 1. Statistics Cards (Top)
```
┌─────────────┐  ┌─────────────┐  ┌─────────────┐
│ 📊 Total    │  │ 💊 Total    │  │ 👨‍⚕️ Total   │
│    12       │  │    45       │  │     3       │
│Prescriptions│  │Medications  │  │  Doctors    │
└─────────────┘  └─────────────┘  └─────────────┘
```
- **Total Prescriptions**: Count of all prescriptions
- **Total Medications**: Sum of medications across all prescriptions
- **Different Doctors**: Unique count of prescribing doctors (patient view only)

### 2. Timeline View
```
    ●  ← Latest (Accent color with pulse)
    │
    ├─ Prescription Card (Expandable)
    │
    ○  ← Older (Card border color)
    │
    ├─ Prescription Card (Expandable)
    │
    ○
    │
    └─ ...
```

**Timeline Line**:
- Animated gradient from accent to transparent
- Connects all prescription dots
- Pulse effect on latest prescription

**Timeline Dots**:
- **Latest**: Accent color (#14B8A6) with pulse animation
- **Older**: Card border color with static display

### 3. Prescription Cards

#### Collapsed View:
```
┌────────────────────────────────────────┐
│ 📅 January 15, 2025                    │
│ 👨‍⚕️ Dr. Rahman Khan (Cardiologist)    │
│                                        │
│ [Expand ▼]                             │
│                                        │
│ [🖨️ Print] [📄 View Details]          │
└────────────────────────────────────────┘
```

#### Expanded View:
```
┌────────────────────────────────────────┐
│ 📅 January 15, 2025                    │
│ 👨‍⚕️ Dr. Rahman Khan (Cardiologist)    │
│                                        │
│ [Collapse ▲]                           │
│                                        │
│ 💊 Medications:                        │
│   ┌──────────────────────────────┐    │
│   │ Aspirin 75mg                 │    │
│   │ 🌅1 + ☀️0 + 🌙1 (2 times/day)│    │
│   │ Duration: 30 days            │    │
│   │ Take after meals             │    │
│   └──────────────────────────────┘    │
│                                        │
│   ┌──────────────────────────────┐    │
│   │ Atorvastatin 10mg            │    │
│   │ 🌅0 + ☀️0 + 🌙1 (1 time/day) │    │
│   │ Duration: 30 days            │    │
│   │ Take before bed              │    │
│   └──────────────────────────────┘    │
│                                        │
│ 📋 Advice:                             │
│   Take with food. Avoid alcohol.      │
│                                        │
│ 📎 Attachment: [View Lab Report]      │
│                                        │
│ [🖨️ Print] [📄 View Details]          │
└────────────────────────────────────────┘
```

### 4. Frequency Display
```
🌅1 + ☀️0 + 🌙1 (2 times/day)
│    │    │   └─ Daily total
│    │    └───── Night dose
│    └────────── Afternoon dose
└─────────────── Morning dose

Format: M+A+N
- M = Morning (🌅 Sunrise emoji)
- A = Afternoon (☀️ Sun emoji)
- N = Night (🌙 Moon emoji)
```

**Examples**:
- `1+1+1` = 🌅1 + ☀️1 + 🌙1 (3 times/day)
- `1+0+1` = 🌅1 + ☀️0 + 🌙1 (2 times/day)
- `0+0+1` = 🌅0 + ☀️0 + 🌙1 (1 time/day)
- `2+2+2` = 🌅2 + ☀️2 + 🌙2 (6 times/day)

### 5. Action Buttons
```
[🖨️ Print]  [📄 View Details]
    │              │
    │              └─ Navigate to full prescription page
    │
    └─ Opens browser print dialog
```

---

## 🎨 Theme Support

### Light Theme
```
Background:  #FFFFFF (white)
Cards:       #F9FAFB (light gray)
Text:        #171717 (near black)
Accent:      #14B8A6 (teal)
Borders:     #E5E7EB (gray)
```

### Dark Theme
```
Background:  #000000 (deep black)
Cards:       #0A0A0A (dark gray)
Text:        #FAFAFA (off-white)
Accent:      #14B8A6 (teal)
Borders:     #1F2937 (dark gray)
```

---

## 📱 Responsive Design

### Mobile (< 768px)
- Statistics cards stack vertically
- Timeline line adjusts width
- Cards take full width
- Buttons stack on smaller screens

### Tablet (768px - 1024px)
- Statistics cards in 3-column grid
- Timeline maintains vertical layout
- Cards have comfortable padding

### Desktop (> 1024px)
- Full 3-column stats grid
- Optimal spacing for timeline
- Hover effects on interactive elements

---

## 🔧 Usage Examples

### Patient View
```tsx
<PrescriptionHistory 
  prescriptions={patientPrescriptions} 
  userRole="PATIENT" 
/>
```
Shows:
- All prescriptions received
- Doctor names and specialties
- Statistics including different doctors

### Doctor View
```tsx
<PrescriptionHistory 
  prescriptions={doctorPrescriptions} 
  userRole="DOCTOR" 
/>
```
Shows:
- All prescriptions written
- Patient names
- Statistics without doctor count

### Admin View
```tsx
<PrescriptionHistory 
  prescriptions={allPrescriptions} 
  userRole="ADMIN" 
/>
```
Shows:
- System-wide prescriptions
- Both doctor and patient info
- Complete statistics

---

## ⚡ Performance Features

- **Conditional Rendering**: Only expanded cards show full details
- **Optimized Calculations**: Stats calculated once on mount
- **Smooth Animations**: CSS transitions for expand/collapse
- **Lazy Loading**: Timeline dots rendered efficiently

---

## 🎯 Accessibility

- **Semantic HTML**: Proper heading hierarchy
- **ARIA Labels**: Screen reader friendly
- **Keyboard Navigation**: Tab through interactive elements
- **Focus Indicators**: Clear focus states
- **Color Contrast**: WCAG AA compliant

---

## 📊 Data Flow

```
API Response
    ↓
prescriptions[]
    ↓
PrescriptionHistory Component
    ↓
├─ Calculate Statistics
├─ Sort by Date (newest first)
├─ Format Dates
└─ Render Timeline
    ↓
    ├─ Stats Cards
    ├─ Latest Badge (if applicable)
    ├─ Timeline Dots
    ├─ Prescription Cards
    │   ├─ Collapsed View (default)
    │   └─ Expanded View (on toggle)
    └─ Action Buttons
```

---

## 🚀 Future Enhancements

1. **Filter by Date Range**: Add date picker for custom ranges
2. **Search Medications**: Find prescriptions by medication name
3. **Export to PDF**: Download prescription history as PDF
4. **Comparison View**: Compare two prescriptions side-by-side
5. **Analytics Charts**: Visual trends of prescriptions over time
6. **Email Integration**: Send prescriptions via email
7. **Notes System**: Add follow-up notes to prescriptions
8. **Reminders**: Set medication reminders

---

**Component Location**: `src/components/PrescriptionHistory.tsx`  
**Patient Integration**: `src/app/prescriptions/page.tsx`  
**Doctor Integration**: `src/app/doctor/prescriptions/page.tsx`  
**Documentation**: `PRESCRIPTION_HISTORY_IMPLEMENTATION.md`
