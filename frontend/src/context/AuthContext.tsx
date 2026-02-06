import { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import type { WorkoutOwnership, ResultOwnership } from '../types';
import * as storage from '../utils/localStorage';

interface AuthContextType {
  myWorkouts: WorkoutOwnership[];
  myResults: ResultOwnership[];
  addWorkout: (workoutId: string, ownerToken: string | null) => void;
  addResult: (workoutId: string, resultId: string, resultToken: string) => void;
  isWorkoutOwner: (workoutId: string) => boolean;
  getWorkoutOwnerToken: (workoutId: string) => string | null;
  isResultOwner: (resultId: string) => boolean;
  getResultToken: (resultId: string) => string | null;
  removeWorkout: (workoutId: string) => void;
  removeResult: (resultId: string) => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [myWorkouts, setMyWorkouts] = useState<WorkoutOwnership[]>([]);
  const [myResults, setMyResults] = useState<ResultOwnership[]>([]);

  useEffect(() => {
    setMyWorkouts(storage.getMyWorkouts());
    setMyResults(storage.getMyResults());
  }, []);

  const addWorkout = (workoutId: string, ownerToken: string | null) => {
    storage.addMyWorkout(workoutId, ownerToken);
    setMyWorkouts(storage.getMyWorkouts());
  };

  const addResult = (workoutId: string, resultId: string, resultToken: string) => {
    storage.addMyResult(resultId, resultToken);
    storage.setWorkoutParticipated(workoutId);
    setMyResults(storage.getMyResults());
    setMyWorkouts(storage.getMyWorkouts());
  };

  const isWorkoutOwner = (workoutId: string) => {
    return myWorkouts.some(w => w.workoutId === workoutId && w.ownerToken);
  };

  const getWorkoutOwnerToken = (workoutId: string) => {
    return storage.getWorkoutOwnerToken(workoutId);
  };

  const isResultOwner = (resultId: string) => {
    return myResults.some(r => r.resultId === resultId);
  };

  const getResultToken = (resultId: string) => {
    return storage.getResultToken(resultId);
  };

  const removeWorkout = (workoutId: string) => {
    storage.removeMyWorkout(workoutId);
    setMyWorkouts(storage.getMyWorkouts());
  };

  const removeResult = (resultId: string) => {
    storage.removeMyResult(resultId);
    setMyResults(storage.getMyResults());
  };

  return (
    <AuthContext.Provider
      value={{
        myWorkouts,
        myResults,
        addWorkout,
        addResult,
        isWorkoutOwner,
        getWorkoutOwnerToken,
        isResultOwner,
        getResultToken,
        removeWorkout,
        removeResult,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}
