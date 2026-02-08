/**
 * Integration test for round-by-round result tracking
 * Tests the new roundDetails feature for EMOM and Tabata workouts
 */

const axios = require('axios');

const API_URL = 'http://localhost:3001/api';

async function runTests() {
  console.log('🧪 Starting Round Tracking Integration Tests\n');

  let workoutId, ownerToken, resultId, resultToken;

  try {
    // Test 1: Create EMOM workout
    console.log('1️⃣  Creating EMOM workout...');
    const workoutResponse = await axios.post(`${API_URL}/workouts`, {
      description: 'EMOM 8 min: 10 Burpees',
      workoutType: 'emom',
      sortDirection: 'desc'
    });
    workoutId = workoutResponse.data.workout.id;
    ownerToken = workoutResponse.data.ownerToken;
    console.log(`   ✓ Workout created: ${workoutId}`);
    console.log(`   ✓ Workout type: ${workoutResponse.data.workout.workoutType}`);
    console.log(`   ✓ Sort direction: ${workoutResponse.data.workout.sortDirection}\n`);

    // Test 2: Add result with round details
    console.log('2️⃣  Adding result with round details...');
    const roundDetails = { rounds: [10, 12, 11, 13, 10, 14, 12, 13] };
    const resultResponse = await axios.post(`${API_URL}/results`, {
      workoutId,
      athleteName: 'Jan Kowalski',
      gender: 'M',
      resultValue: '95', // Sum will be calculated automatically
      roundDetails
    });
    resultId = resultResponse.data.result.id;
    resultToken = resultResponse.data.resultToken;
    console.log(`   ✓ Result created: ${resultId}`);
    console.log(`   ✓ Result value: ${resultResponse.data.result.resultValue}`);
    console.log(`   ✓ Round details stored: ${JSON.stringify(resultResponse.data.result.roundDetails)}`);

    // Verify sum calculation
    const expectedSum = roundDetails.rounds.reduce((a, b) => a + b, 0);
    const actualSum = parseInt(resultResponse.data.result.resultValue);
    if (actualSum === expectedSum) {
      console.log(`   ✓ Sum calculated correctly: ${actualSum}\n`);
    } else {
      throw new Error(`Sum mismatch! Expected ${expectedSum}, got ${actualSum}`);
    }

    // Test 3: Add result without round details (simple mode)
    console.log('3️⃣  Adding result without round details (simple mode)...');
    const simpleResultResponse = await axios.post(`${API_URL}/results`, {
      workoutId,
      athleteName: 'Anna Nowak',
      gender: 'F',
      resultValue: '88'
    });
    console.log(`   ✓ Simple result created: ${simpleResultResponse.data.result.id}`);
    console.log(`   ✓ Result value: ${simpleResultResponse.data.result.resultValue}`);
    console.log(`   ✓ Round details: ${simpleResultResponse.data.result.roundDetails || 'null'}\n`);

    // Test 4: Retrieve results
    console.log('4️⃣  Retrieving all results for workout...');
    const resultsResponse = await axios.get(`${API_URL}/results/${workoutId}`);
    console.log(`   ✓ Retrieved ${resultsResponse.data.results.length} results`);
    resultsResponse.data.results.forEach((result, idx) => {
      console.log(`   ${idx + 1}. ${result.athleteName}: ${result.resultValue} ${result.roundDetails ? '(has rounds)' : '(no rounds)'}`);
    });
    console.log('');

    // Test 5: Update result with round details
    console.log('5️⃣  Updating result with new round details...');
    const newRoundDetails = { rounds: [11, 13, 12, 14, 11, 15, 13, 14] };
    const updateResponse = await axios.put(`${API_URL}/results/${resultId}`, {
      resultToken,
      athleteName: 'Jan Kowalski',
      gender: 'M',
      roundDetails: newRoundDetails
    });
    console.log(`   ✓ Result updated`);
    console.log(`   ✓ New result value: ${updateResponse.data.result.resultValue}`);
    console.log(`   ✓ New round details: ${JSON.stringify(updateResponse.data.result.roundDetails)}`);

    // Verify new sum
    const newExpectedSum = newRoundDetails.rounds.reduce((a, b) => a + b, 0);
    const newActualSum = parseInt(updateResponse.data.result.resultValue);
    if (newActualSum === newExpectedSum) {
      console.log(`   ✓ New sum calculated correctly: ${newActualSum}\n`);
    } else {
      throw new Error(`Sum mismatch! Expected ${newExpectedSum}, got ${newActualSum}`);
    }

    // Test 6: Validate round details structure
    console.log('6️⃣  Testing validation...');
    try {
      await axios.post(`${API_URL}/results`, {
        workoutId,
        athleteName: 'Test User',
        gender: 'M',
        resultValue: '0',
        roundDetails: { rounds: [] } // Empty rounds array
      });
      throw new Error('Should have rejected empty rounds array');
    } catch (error) {
      if (error.response && error.response.status === 400) {
        console.log(`   ✓ Empty rounds array rejected: ${error.response.data.error}`);
      } else {
        throw error;
      }
    }

    try {
      await axios.post(`${API_URL}/results`, {
        workoutId,
        athleteName: 'Test User',
        gender: 'M',
        resultValue: '0',
        roundDetails: { rounds: [-5, 10, 15] } // Negative number
      });
      throw new Error('Should have rejected negative round value');
    } catch (error) {
      if (error.response && error.response.status === 400) {
        console.log(`   ✓ Negative round value rejected: ${error.response.data.error}`);
      } else {
        throw error;
      }
    }
    console.log('');

    // Test 7: Backward compatibility
    console.log('7️⃣  Testing backward compatibility...');
    const tabataWorkout = await axios.post(`${API_URL}/workouts`, {
      description: 'Tabata Air Squats',
      workoutType: 'tabata'
    });
    const oldStyleResult = await axios.post(`${API_URL}/results`, {
      workoutId: tabataWorkout.data.workout.id,
      athleteName: 'Old User',
      gender: 'M',
      resultValue: '120'
      // No roundDetails - old style
    });
    console.log(`   ✓ Old-style result (without rounds) works: ${oldStyleResult.data.result.resultValue}`);
    console.log(`   ✓ Round details is null: ${oldStyleResult.data.result.roundDetails === null}\n`);

    console.log('✅ All tests passed!\n');

    console.log('📊 Summary:');
    console.log('   - Round details can be added to EMOM/Tabata workouts');
    console.log('   - Sum is calculated automatically from rounds');
    console.log('   - Results can be added with or without round details');
    console.log('   - Round details are properly stored and retrieved');
    console.log('   - Validation prevents invalid data');
    console.log('   - Backward compatibility maintained');

  } catch (error) {
    console.error('\n❌ Test failed:');
    if (error.response) {
      console.error(`   Status: ${error.response.status}`);
      console.error(`   Error: ${JSON.stringify(error.response.data, null, 2)}`);
    } else {
      console.error(`   ${error.message}`);
    }
    process.exit(1);
  }
}

console.log('Make sure the backend is running on http://localhost:3001\n');
runTests();
