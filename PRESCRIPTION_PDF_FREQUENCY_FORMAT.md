# Prescription PDF Frequency Format Update

## Issue Description
**Request**: Display frequency in **1+1+1** format (M+A+N) in PDF print and download, not as converted text  
**Location**: PDF generation for prescriptions  
**Impact**: Both print and download PDFs

## Problem
Previously, the PDF was converting the **1+1+1** format to text:
- **Before**: "1 in morning, 1 in afternoon, 1 at night" ❌
- **Desired**: "1+1+1" ✅

## Solution Implemented

### 1. Updated `parseFrequency` Function
**File**: `src/lib/pdf/prescription-generator.ts`

```typescript
// Before - Converting to text
function parseFrequency(frequency: string): string {
  const pattern = /^(\d+)\+(\d+)\+(\d+)$/
  const match = frequency.match(pattern)
  
  if (match) {
    const [_, morning, afternoon, night] = match
    const parts = []
    if (morning !== '0') parts.push(`${morning} in morning`)
    if (afternoon !== '0') parts.push(`${afternoon} in afternoon`)
    if (night !== '0') parts.push(`${night} at night`)
    
    return parts.join(', ')
  }
  
  return frequency
}

// After - Keeping M+A+N format
function parseFrequency(frequency: string): string {
  // Keep M+A+N format as-is (e.g., "1+1+1", "1+0+1", "2+2+2")
  if (frequency && frequency.match(/^\d+\+\d+\+\d+$/)) {
    return frequency // Return as-is: "1+1+1"
  }
  
  // Return original if not in M+A+N format
  return frequency || 'As directed'
}
```

### 2. Updated Table Header
Added clear label to indicate format:

```typescript
// Before
head: [['#', 'Medicine', 'Dosage', 'Frequency', 'Duration', 'Instructions']]

// After
head: [['#', 'Medicine', 'Dosage', 'Frequency\n(M+A+N)', 'Duration', 'Instructions']]
```

### 3. Added Frequency Legend
Added explanatory note below the medications table:

```typescript
doc.setFontSize(7)
doc.setFont('helvetica', 'italic')
doc.text(
  'Note: Frequency format is M+A+N (Morning + Afternoon + Night). Example: 1+0+1 means 1 in morning, 0 at afternoon, 1 at night',
  25, currentY
)
```

### 4. Improved Table Styling
- **Increased body font size**: 8 → 9 for better readability
- **Center-aligned frequency**: Makes the format stand out
- **Better cell padding**: Improved visual spacing

```typescript
bodyStyles: {
  fontSize: 9,        // Increased from 8
  cellPadding: 3,
  halign: 'left'
},
columnStyles: {
  3: { cellWidth: 35, halign: 'center' }, // Center align frequency
}
```

## PDF Output Format

### Medications Table Example
```
┌───┬──────────────┬─────────┬───────────┬──────────┬──────────────┐
│ # │   Medicine   │ Dosage  │ Frequency │ Duration │ Instructions │
│   │              │         │  (M+A+N)  │          │              │
├───┼──────────────┼─────────┼───────────┼──────────┼──────────────┤
│ 1 │ Paracetamol  │ 500mg   │  1+1+1    │ 7 days   │ After food   │
│ 2 │ Amoxicillin  │ 250mg   │  1+0+1    │ 5 days   │ Before food  │
│ 3 │ Vitamin C    │ 500mg   │  0+0+1    │ 30 days  │ After dinner │
└───┴──────────────┴─────────┴───────────┴──────────┴──────────────┘

Note: Frequency format is M+A+N (Morning + Afternoon + Night).
      Example: 1+0+1 means 1 in morning, 0 at afternoon, 1 at night
```

## Benefits

### 1. **Clarity** 🎯
- **Concise format**: "1+1+1" is shorter and easier to read than long text
- **Standard medical notation**: M+A+N is commonly used in medical prescriptions
- **Consistent display**: Same format in UI and PDF

### 2. **Space Efficiency** 📄
- **Shorter text**: Saves horizontal space in the table
- **More data visible**: Can show more information without wrapping
- **Better layout**: Cleaner, more professional appearance

### 3. **Professional** 💼
- **Medical standard**: Follows common prescription practices
- **Clear legend**: Explains the format for clarity
- **Easy to understand**: Simple notation with clear explanation

### 4. **Consistency** ✅
- **UI matches PDF**: Same format across all interfaces
- **FrequencyInput component**: Users enter in this format
- **FrequencyDisplay component**: Shows in this format
- **PDF output**: Now also uses this format

## Examples

### Example 1: Standard Dosing
**Input**: `1+1+1`  
**PDF Shows**: `1+1+1`  
**Meaning**: 1 tablet morning, 1 afternoon, 1 night

### Example 2: Morning and Night Only
**Input**: `1+0+1`  
**PDF Shows**: `1+0+1`  
**Meaning**: 1 tablet morning, 0 afternoon, 1 night

### Example 3: Higher Dosage
**Input**: `2+2+2`  
**PDF Shows**: `2+2+2`  
**Meaning**: 2 tablets morning, 2 afternoon, 2 night

### Example 4: Night Only
**Input**: `0+0+1`  
**PDF Shows**: `0+0+1`  
**Meaning**: 0 morning, 0 afternoon, 1 at night

### Example 5: Custom Text (fallback)
**Input**: `As needed`  
**PDF Shows**: `As needed`  
**Meaning**: Not in M+A+N format, shown as-is

## Technical Details

### Data Flow
```
Prescription Creation
→ User enters: "1+1+1" in FrequencyInput
→ Stored in DB: "1+1+1" (medications[].frequency)
→ Retrieved from API: "1+1+1"
→ Displayed in UI: "🌅1 + ☀️1 + 🌙1"
→ PDF Generation: "1+1+1" (no conversion)
→ PDF Table: Shows "1+1+1" center-aligned
→ PDF Legend: Explains M+A+N format
```

### Component Chain
1. **FrequencyInput**: User enters M+A+N format
2. **Database**: Stores as string
3. **API**: Returns as-is
4. **PrescriptionHistory**: Passes to PDF generator unchanged
5. **prescription-generator.ts**: `parseFrequency()` returns as-is
6. **PDF Output**: Displays in table with legend

## Testing Checklist

- [x] Create prescription with frequency "1+1+1"
- [x] Print PDF → Verify shows "1+1+1" not text
- [x] Download PDF → Verify shows "1+1+1" not text
- [x] Check table header shows "Frequency (M+A+N)"
- [x] Verify legend appears below table
- [x] Test with different formats: "1+0+1", "2+2+2", "0+0+1"
- [x] Test fallback: non-M+A+N format shows as-is
- [x] Verify center alignment of frequency column
- [x] Check font size is readable (9pt)

## Related Files

### Modified
- `src/lib/pdf/prescription-generator.ts` - PDF generation logic
  - Updated `parseFrequency()` function
  - Updated table header
  - Added frequency legend
  - Improved table styling

### Related (No Changes)
- `src/components/FrequencyInput.tsx` - Input component (already correct)
- `src/components/FrequencyDisplay.tsx` - Display component (already correct)
- `src/components/PrescriptionHistory.tsx` - Passes frequency as-is (already correct)

## User Documentation

### For Doctors
**Creating Prescriptions**:
1. Enter frequency in M+A+N format: e.g., "1+1+1"
2. M = Morning dose
3. A = Afternoon dose  
4. N = Night dose

**PDF Output**:
- The printed/downloaded prescription will show the frequency exactly as entered
- A note at the bottom explains the M+A+N format
- Patients will see: "1+1+1 (M+A+N)" with explanation

### For Patients
**Reading Prescriptions**:
- Look for the "Frequency (M+A+N)" column
- Example: "1+0+1" means:
  - Take 1 dose in the morning
  - Take 0 doses in the afternoon (skip)
  - Take 1 dose at night
- Check the note at the bottom for detailed explanation

## Future Enhancements

### Possible Additions
1. **Icon legends**: Add 🌅☀️🌙 icons to PDF legend
2. **Multi-language**: Support Bengali labels (M+A+N → সকাল+দুপুর+রাত)
3. **Color coding**: Different colors for morning/afternoon/night
4. **Visual indicators**: Small sun/moon icons in the table
5. **Daily total**: Show total doses per day (e.g., "1+1+1 = 3/day")

## Version History

**v1.0** - January 2025
- Initial implementation with text conversion
- Converted "1+1+1" to "1 in morning, 1 in afternoon, 1 at night"

**v2.0** - January 2025 (Current)
- Updated to keep M+A+N format
- Shows "1+1+1" directly
- Added table header label
- Added explanatory legend
- Improved table styling

---

**Status**: ✅ Implemented and Tested  
**Priority**: High - User-requested feature  
**Impact**: All prescription PDFs (print and download)  
**Breaking Changes**: None - backwards compatible
