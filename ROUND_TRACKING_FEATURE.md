# Round-by-Round Result Tracking Feature

**Implementation Date:** 2026-02-07
**Status:** ✅ Completed and Tested

## Overview

This feature enables athletes to track individual round scores for EMOM and Tabata workouts instead of just entering a single total. The system automatically calculates the final score as the sum of all rounds while preserving the detailed round breakdown for analysis.

## Key Features

### 1. Round Details Storage
- **Database:** New `round_details` JSONB column in `results` table
- **Format:** `{"rounds": [10, 12, 11, 13, 10, 14, 12, 13]}`
- **Index:** GIN index for efficient JSONB queries
- **Migration:** `0003_add_round_details.sql`

### 2. Dual Input Modes
Users can choose between two input modes when adding/editing results:

**Simple Mode ("Wynik końcowy"):**
- Single input field for total score
- Traditional workflow - enter final result directly
- No round details stored

**Rounds Mode ("Rundy"):**
- Dynamic round inputs with + button to add more rounds
- Each round can be edited individually
- Live sum calculation displayed
- Round details stored in database
- Remove button (✕) for each round

### 3. Automatic Sum Calculation
- Backend calculates sum from rounds: `calculateRoundSum()`
- Sum stored in `resultValue` field
- `resultNumeric` derived for sorting
- No manual entry of total needed

### 4. Expandable Round Display
- Results with round details show expand/collapse button (▶/▼)
- Clicking reveals grid of individual round scores
- Responsive grid: 4 cols (mobile) → 6 cols (tablet) → 8 cols (desktop)
- Each round displayed as: "R1", "R2", etc.

### 5. Data Validation
- Maximum 100 rounds per result
- All rounds must be non-negative numbers
- Empty rounds array rejected
- Invalid data types rejected with clear error messages

### 6. Backward Compatibility
- Existing results without rounds continue to work normally
- `roundDetails` column is nullable
- Simple mode still available for all workout types
- No breaking changes to existing data

## Technical Implementation

### Backend Changes

**Files Modified:**
1. `backend/src/db/migrations/0003_add_round_details.sql` - Migration
2. `backend/src/db/migrate.ts` - Added migration to list
3. `backend/src/db/schema.ts` - Added `roundDetails` field
4. `backend/src/utils/resultParser.ts` - Added `calculateRoundSum()`
5. `backend/src/services/resultService.ts` - Updated add/update methods
6. `backend/src/routes/results.ts` - Added validation

**Key Functions:**
```typescript
// Calculate sum from rounds
export function calculateRoundSum(roundDetails: { rounds: number[] } | null): number | null

// Add result with optional round details
export async function addResult(data: {
  workoutId: string;
  athleteName: string;
  gender: 'M' | 'F';
  resultValue: string;
  roundDetails?: { rounds: number[] } | null;
})

// Update result with optional round details
export async function updateResult(
  id: string,
  resultToken: string,
  data: {
    athleteName?: string;
    gender?: 'M' | 'F';
    resultValue?: string;
    roundDetails?: { rounds: number[] } | null;
  }
)
```

### Frontend Changes

**Files Modified:**
1. `frontend/src/types/index.ts` - Added `RoundDetails` interface
2. `frontend/src/services/api.ts` - Updated API methods
3. `frontend/src/components/result/AddResultForm.tsx` - Added round input UI
4. `frontend/src/components/result/EditResultModal.tsx` - Added round editing
5. `frontend/src/components/result/ResultRow.tsx` - Added expand/collapse

**Key Components:**

**Mode Toggle:**
```tsx
<button onClick={() => setInputMode('simple')}>Wynik końcowy</button>
<button onClick={() => setInputMode('rounds')}>Rundy</button>
```

**Round Inputs:**
```tsx
{rounds.map((round, idx) => (
  <div>
    <span>Runda {idx + 1}:</span>
    <input value={round} onChange={(e) => updateRound(idx, parseInt(e.target.value))} />
    <button onClick={() => removeRound(idx)}>✕</button>
  </div>
))}
<Button onClick={addRound}>+ Dodaj rundę</Button>
<div>Suma: {total}</div>
```

**Expandable Display:**
```tsx
{hasRoundDetails && (
  <button onClick={() => setIsExpanded(!isExpanded)}>
    {isExpanded ? '▼' : '▶'}
  </button>
)}
{isExpanded && (
  <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8">
    {rounds.map((round, idx) => (
      <div>
        <div>R{idx + 1}</div>
        <div>{round}</div>
      </div>
    ))}
  </div>
)}
```

## Testing

### Integration Tests (7 scenarios)
All tests passing ✅

1. ✓ EMOM workout creation with proper type
2. ✓ Result creation with round details
3. ✓ Automatic sum calculation (95 = 10+12+11+13+10+14+12+13)
4. ✓ Result creation without rounds (simple mode)
5. ✓ Retrieve results showing both modes
6. ✓ Update result with new round details
7. ✓ Validation (empty array, negative numbers)
8. ✓ Backward compatibility (old results work)

**Test Command:**
```bash
node test-round-tracking.js
```

### Manual Testing Checklist
- [x] Create EMOM workout
- [x] Switch between Simple/Rounds mode
- [x] Add multiple rounds
- [x] Remove rounds
- [x] See live sum calculation
- [x] Submit result with rounds
- [x] Expand round details in list
- [x] Edit result and modify rounds
- [x] Add result in simple mode
- [x] Verify sorting still works
- [x] Check mobile responsiveness

## User Workflow

### Adding Result with Rounds

1. Navigate to EMOM or Tabata workout detail page
2. Fill in athlete name and gender
3. Click "Rundy" button to switch to rounds mode
4. Click "+ Dodaj rundę" for each round
5. Enter score for each round (e.g., 10, 12, 11, 13...)
6. See automatic sum calculation at bottom
7. Click "Dodaj wynik" to submit
8. Result appears in ranking with total score

### Viewing Round Details

1. Find result in ranking (shows total score)
2. Click expand arrow (▶) next to score
3. See grid of individual round scores
4. Click collapse arrow (▼) to hide details

### Editing Result with Rounds

1. Click "Edytuj" on your result
2. Modal opens with rounds pre-populated
3. Modify any round values
4. See updated sum automatically
5. Click "Zapisz zmiany" to update
6. Ranking updates with new total

## API Changes

### POST /api/results
**Request Body (new optional field):**
```json
{
  "workoutId": "uuid",
  "athleteName": "Jan Kowalski",
  "gender": "M",
  "resultValue": "95",  // Can be empty if roundDetails provided
  "roundDetails": {     // Optional
    "rounds": [10, 12, 11, 13, 10, 14, 12, 13]
  }
}
```

**Response:**
```json
{
  "result": {
    "id": "uuid",
    "workoutId": "uuid",
    "athleteName": "Jan Kowalski",
    "gender": "M",
    "resultValue": "95",
    "resultNumeric": "95",
    "roundDetails": {
      "rounds": [10, 12, 11, 13, 10, 14, 12, 13]
    },
    "createdAt": "2026-02-07T..."
  },
  "resultToken": "uuid"
}
```

### PUT /api/results/:id
**Request Body (updated):**
```json
{
  "resultToken": "uuid",
  "athleteName": "Jan Kowalski",
  "gender": "M",
  "roundDetails": {     // Optional - can update rounds
    "rounds": [11, 13, 12, 14, 11, 15, 13, 14]
  }
}
```

### GET /api/results/:workoutId
**Response (unchanged - roundDetails now included):**
```json
{
  "results": [
    {
      "id": "uuid",
      "resultValue": "103",
      "roundDetails": {
        "rounds": [11, 13, 12, 14, 11, 15, 13, 14]
      },
      ...
    },
    {
      "id": "uuid",
      "resultValue": "88",
      "roundDetails": null,  // Simple mode result
      ...
    }
  ]
}
```

## Database Schema

### New Column
```sql
ALTER TABLE results
  ADD COLUMN round_details JSONB;

CREATE INDEX idx_results_round_details ON results USING GIN (round_details);

COMMENT ON COLUMN results.round_details IS
  'JSON array of per-round scores for EMOM/Tabata workouts. Format: {"rounds": [12, 15, 14, ...]}';
```

### Example Data
```sql
-- Result with rounds
INSERT INTO results (workout_id, athlete_name, gender, result_value, result_numeric, round_details)
VALUES (
  'workout-uuid',
  'Jan Kowalski',
  'M',
  '95',
  '95',
  '{"rounds": [10, 12, 11, 13, 10, 14, 12, 13]}'::jsonb
);

-- Result without rounds (simple mode)
INSERT INTO results (workout_id, athlete_name, gender, result_value, result_numeric, round_details)
VALUES (
  'workout-uuid',
  'Anna Nowak',
  'F',
  '88',
  '88',
  NULL
);
```

## Benefits

### For Athletes
- **Detailed tracking:** See performance variation across rounds
- **Pattern recognition:** Identify which rounds were strongest/weakest
- **Progressive analysis:** Compare round-by-round improvement over time
- **Flexible entry:** Choose simple or detailed input based on preference

### For Coaches
- **Performance insights:** Analyze athlete pacing and fatigue patterns
- **Training optimization:** Identify areas needing focus
- **Data-driven decisions:** Use round details for programming adjustments

### For Developers
- **Clean architecture:** JSONB storage keeps schema flexible
- **Backward compatible:** No breaking changes to existing functionality
- **Extensible:** Pattern can be applied to other workout types if needed
- **Well-tested:** Comprehensive integration tests ensure reliability

## Future Enhancements (Not Implemented)

Potential future features that could build on this foundation:

1. **Visual charts:** Graph showing round-by-round performance
2. **Round comparison:** Compare rounds across different workout attempts
3. **Statistical analysis:** Average, median, std deviation of rounds
4. **Pacing recommendations:** Suggest target paces based on past data
5. **Export functionality:** Download round details as CSV
6. **Other workout types:** Extend to AMRAP, Ladder, etc.

## Files Changed Summary

### Backend (6 files)
- ✅ `backend/src/db/migrations/0003_add_round_details.sql`
- ✅ `backend/src/db/migrate.ts`
- ✅ `backend/src/db/schema.ts`
- ✅ `backend/src/utils/resultParser.ts`
- ✅ `backend/src/services/resultService.ts`
- ✅ `backend/src/routes/results.ts`

### Frontend (5 files)
- ✅ `frontend/src/types/index.ts`
- ✅ `frontend/src/services/api.ts`
- ✅ `frontend/src/components/result/AddResultForm.tsx`
- ✅ `frontend/src/components/result/EditResultModal.tsx`
- ✅ `frontend/src/components/result/ResultRow.tsx`

### Documentation (3 files)
- ✅ `CLAUDE.md` (updated)
- ✅ `.claude/memory/MEMORY.md` (updated)
- ✅ `ROUND_TRACKING_FEATURE.md` (this file)

### Testing (1 file)
- ✅ `test-round-tracking.js` (new integration test)

## Deployment Notes

When deploying this feature:

1. **Database Migration:**
   ```bash
   cd backend
   npm run db:run-migrations
   # or manually run: 0003_add_round_details.sql
   ```

2. **Backend:**
   ```bash
   cd backend
   npm run build
   npm start
   ```

3. **Frontend:**
   ```bash
   cd frontend
   npm run build
   # Deploy dist/ folder
   ```

4. **Verification:**
   - Create EMOM or Tabata workout
   - Test both simple and rounds input modes
   - Verify round details display correctly
   - Check that old results still work

## Support

For issues or questions:
- Review integration test: `test-round-tracking.js`
- Check backend logs for validation errors
- Verify database schema with: `npm run db:verify`
- Consult `CLAUDE.md` for architecture details

---

**Implementation completed successfully! 🎉**
