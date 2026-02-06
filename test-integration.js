// Integration Test Script for Wod Result API
// Tests: Creating workout, adding results, sorting, filtering, authorization

const API_BASE = 'http://localhost:3001/api';

let testResults = {
  passed: 0,
  failed: 0,
  tests: []
};

// Helper functions
async function request(method, endpoint, body = null, headers = {}) {
  const options = {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...headers
    }
  };

  if (body) {
    options.body = JSON.stringify(body);
  }

  const response = await fetch(`${API_BASE}${endpoint}`, options);
  const data = response.status !== 204 ? await response.json() : null;
  return { status: response.status, data };
}

function assert(condition, testName, message) {
  if (condition) {
    console.log(`✓ ${testName}: ${message}`);
    testResults.passed++;
    testResults.tests.push({ name: testName, status: 'PASSED', message });
  } else {
    console.error(`✗ ${testName}: ${message}`);
    testResults.failed++;
    testResults.tests.push({ name: testName, status: 'FAILED', message });
  }
}

async function runTests() {
  console.log('🧪 Starting Integration Tests...\n');

  let workoutId, ownerToken, result1Id, result1Token, result2Id, result2Token;

  // ========================================
  // TEST 1: Create Workout
  // ========================================
  console.log('📝 Test 1: Creating Workout');
  try {
    const { status, data } = await request('POST', '/workouts', {
      description: 'For Time: 21-15-9 Thrusters (43kg) + Pull-ups',
      workoutDate: '2026-02-06',
      sortDirection: 'asc' // lower time is better
    });

    assert(status === 201, 'Create Workout', 'Status code is 201');
    assert(data.workout !== undefined, 'Create Workout', 'Workout object returned');
    assert(data.ownerToken !== undefined, 'Create Workout', 'Owner token returned');
    assert(data.workout.description.includes('Thrusters'), 'Create Workout', 'Description saved correctly');

    workoutId = data.workout.id;
    ownerToken = data.ownerToken;
    console.log(`   Workout ID: ${workoutId}`);
  } catch (error) {
    console.error('✗ Create Workout failed:', error.message);
    testResults.failed++;
  }

  console.log('');

  // ========================================
  // TEST 2: Add Results
  // ========================================
  console.log('📊 Test 2: Adding Results');
  try {
    // Add result 1 - Male athlete with time
    const { status: s1, data: d1 } = await request('POST', '/results', {
      workoutId,
      athleteName: 'Jan Kowalski',
      gender: 'M',
      resultValue: '12:45'
    });

    assert(s1 === 201, 'Add Result 1', 'Status code is 201');
    assert(d1.result !== undefined, 'Add Result 1', 'Result object returned');
    assert(d1.resultToken !== undefined, 'Add Result 1', 'Result token returned');
    result1Id = d1.result.id;
    result1Token = d1.resultToken;

    // Add result 2 - Female athlete with better time
    const { status: s2, data: d2 } = await request('POST', '/results', {
      workoutId,
      athleteName: 'Anna Nowak',
      gender: 'F',
      resultValue: '10:30'
    });

    assert(s2 === 201, 'Add Result 2', 'Status code is 201');
    result2Id = d2.result.id;
    result2Token = d2.resultToken;

    // Add result 3 - Male athlete with slower time
    const { status: s3, data: d3 } = await request('POST', '/results', {
      workoutId,
      athleteName: 'Piotr Wiśniewski',
      gender: 'M',
      resultValue: '15:20'
    });

    assert(s3 === 201, 'Add Result 3', 'Status code is 201');

    // Add result 4 - Non-numeric result (DNF)
    const { status: s4, data: d4 } = await request('POST', '/results', {
      workoutId,
      athleteName: 'Maria Kowalczyk',
      gender: 'F',
      resultValue: 'DNF'
    });

    assert(s4 === 201, 'Add Result 4 (DNF)', 'Status code is 201');

    console.log(`   Added 4 results to workout`);
  } catch (error) {
    console.error('✗ Add Results failed:', error.message);
    testResults.failed++;
  }

  console.log('');

  // ========================================
  // TEST 3: Get Results and Verify Sorting
  // ========================================
  console.log('🔢 Test 3: Sorting Results');
  try {
    const { status, data } = await request('GET', `/results/${workoutId}`);

    assert(status === 200, 'Get Results', 'Status code is 200');
    assert(data.results.length === 4, 'Get Results', 'All 4 results returned');

    const results = data.results;

    // Verify ascending sort (best time first)
    assert(results[0].athleteName === 'Anna Nowak', 'Sort Order', 'Best time (10:30) is first');
    assert(results[1].athleteName === 'Jan Kowalski', 'Sort Order', 'Second time (12:45) is second');
    assert(results[2].athleteName === 'Piotr Wiśniewski', 'Sort Order', 'Third time (15:20) is third');
    assert(results[3].athleteName === 'Maria Kowalczyk', 'Sort Order', 'Non-numeric (DNF) is last');

    console.log('   Ranking:');
    results.forEach((r, idx) => {
      console.log(`   ${idx + 1}. ${r.athleteName} - ${r.resultValue} (${r.gender})`);
    });
  } catch (error) {
    console.error('✗ Sorting test failed:', error.message);
    testResults.failed++;
  }

  console.log('');

  // ========================================
  // TEST 4: Filter Workouts by Date
  // ========================================
  console.log('📅 Test 4: Filtering Workouts by Date');
  try {
    // Filter by today
    const { status: s1, data: d1 } = await request('GET', '/workouts?dateFilter=today');
    assert(s1 === 200, 'Filter Today', 'Status code is 200');
    assert(d1.workouts.length >= 1, 'Filter Today', 'At least 1 workout found for today');

    // Filter by 7 days
    const { status: s2, data: d2 } = await request('GET', '/workouts?dateFilter=7days');
    assert(s2 === 200, 'Filter 7 Days', 'Status code is 200');

    // Filter all
    const { status: s3, data: d3 } = await request('GET', '/workouts');
    assert(s3 === 200, 'Filter All', 'Status code is 200');

    console.log(`   Today: ${d1.workouts.length} workouts`);
    console.log(`   7 days: ${d2.workouts.length} workouts`);
    console.log(`   All: ${d3.workouts.length} workouts`);
  } catch (error) {
    console.error('✗ Filtering test failed:', error.message);
    testResults.failed++;
  }

  console.log('');

  // ========================================
  // TEST 5: Update Result (Authorization)
  // ========================================
  console.log('🔐 Test 5: Update Result with Authorization');
  try {
    // Update with correct token
    const { status: s1, data: d1 } = await request('PUT', `/results/${result1Id}`, {
      resultToken: result1Token,
      resultValue: '11:30'
    });

    assert(s1 === 200, 'Update with Token', 'Status code is 200');
    assert(d1.result.resultValue === '11:30', 'Update with Token', 'Result value updated');

    // Try update with wrong token (should fail)
    const { status: s2 } = await request('PUT', `/results/${result1Id}`, {
      resultToken: 'wrong-token-123',
      resultValue: '09:00'
    });

    assert(s2 === 403, 'Update without Token', 'Status code is 403 (Forbidden)');

    console.log(`   Result updated successfully with valid token`);
    console.log(`   Update rejected with invalid token ✓`);
  } catch (error) {
    console.error('✗ Authorization test failed:', error.message);
    testResults.failed++;
  }

  console.log('');

  // ========================================
  // TEST 6: Delete Result (Authorization)
  // ========================================
  console.log('🗑️  Test 6: Delete Result with Authorization');
  try {
    // Try delete with wrong token (should fail)
    const { status: s1 } = await request('DELETE', `/results/${result2Id}`, {
      resultToken: 'wrong-token-456'
    });

    assert(s1 === 403, 'Delete without Token', 'Status code is 403 (Forbidden)');

    // Delete with correct token
    const { status: s2 } = await request('DELETE', `/results/${result2Id}`, {
      resultToken: result2Token
    });

    assert(s2 === 204, 'Delete with Token', 'Status code is 204 (No Content)');

    // Verify result was deleted
    const { data } = await request('GET', `/results/${workoutId}`);
    assert(data.results.length === 3, 'Verify Deletion', 'Result count decreased by 1');

    console.log(`   Result deletion with correct token successful ✓`);
  } catch (error) {
    console.error('✗ Delete test failed:', error.message);
    testResults.failed++;
  }

  console.log('');

  // ========================================
  // TEST 7: Delete Workout (Cascade)
  // ========================================
  console.log('🗑️  Test 7: Delete Workout and Cascade');
  try {
    // Delete workout with owner token
    const { status } = await request('DELETE', `/workouts/${workoutId}`, {
      ownerToken
    });

    assert(status === 204, 'Delete Workout', 'Status code is 204');

    // Verify workout is gone
    const { status: s2 } = await request('GET', `/workouts/${workoutId}`);
    assert(s2 === 404, 'Verify Workout Deleted', 'Workout returns 404');

    // Verify results are also gone (cascade)
    const { data } = await request('GET', `/results/${workoutId}`);
    assert(data.error !== undefined, 'Verify Cascade Delete', 'Results endpoint returns error');

    console.log(`   Workout and all results deleted successfully ✓`);
  } catch (error) {
    console.error('✗ Delete workout test failed:', error.message);
    testResults.failed++;
  }

  console.log('');

  // ========================================
  // SUMMARY
  // ========================================
  console.log('=' .repeat(60));
  console.log('📊 TEST SUMMARY');
  console.log('=' .repeat(60));
  console.log(`Total Tests: ${testResults.passed + testResults.failed}`);
  console.log(`✓ Passed: ${testResults.passed}`);
  console.log(`✗ Failed: ${testResults.failed}`);
  console.log('=' .repeat(60));

  if (testResults.failed === 0) {
    console.log('🎉 All integration tests passed!');
    console.log('✅ Faza 7.2: Testowanie integracji - COMPLETED');
  } else {
    console.log('❌ Some tests failed. Please review the output above.');
    process.exit(1);
  }
}

// Run tests
runTests().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});
