import { useState } from 'react';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import clsx from 'clsx';
import { useCreateResult } from '../../hooks/useResults';
import { useWorkout } from '../../hooks/useWorkouts';
import { useAuth } from '../../context/AuthContext';
import { Input } from '../ui/Input';
import { Button } from '../ui/Button';
import { getWorkoutTypeConfig } from '../../constants/workoutTypes';

interface AddResultFormProps {
  workoutId: string;
}

interface ResultFormData {
  athleteName: string;
  gender: 'M' | 'F';
  resultValue: string;
}

export function AddResultForm({ workoutId }: AddResultFormProps) {
  const { addResult } = useAuth();
  const createResult = useCreateResult();
  const { data: workout } = useWorkout(workoutId);

  const workoutTypeConfig = getWorkoutTypeConfig(workout?.workoutType);

  // Tryb wprowadzania: prosty vs. rundy
  const [inputMode, setInputMode] = useState<'simple' | 'rounds'>('simple');
  const [rounds, setRounds] = useState<number[]>([]);

  // Sprawdź czy workout wspiera śledzenie rund
  const isRoundBasedWorkout = workout?.workoutType === 'emom' || workout?.workoutType === 'tabata';

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<ResultFormData>({
    defaultValues: {
      gender: 'M',
    },
  });

  // Obsługa rund
  const addRound = () => {
    setRounds([...rounds, 0]);
  };

  const updateRound = (index: number, value: number) => {
    const newRounds = [...rounds];
    newRounds[index] = value;
    setRounds(newRounds);
  };

  const removeRound = (index: number) => {
    setRounds(rounds.filter((_, i) => i !== index));
  };

  // Oblicz sumę rund
  const total = rounds.reduce((sum, r) => sum + r, 0);

  const onSubmit = async (data: ResultFormData) => {
    try {
      const payload: any = {
        workoutId,
        athleteName: data.athleteName,
        gender: data.gender,
      };

      if (inputMode === 'rounds' && rounds.length > 0) {
        // Tryb rund - wyślij szczegóły rund
        payload.resultValue = total.toString();
        payload.roundDetails = { rounds };
      } else {
        // Tryb prosty - wyślij wartość wyniku
        payload.resultValue = data.resultValue;
      }

      const response = await createResult.mutateAsync(payload);
      addResult(workoutId, response.result.id, response.resultToken);
      toast.success('Wynik został dodany!');
      reset();
      setRounds([]);
      setInputMode('simple');
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Wystąpił błąd podczas dodawania wyniku');
    }
  };

  return (
    <div className="bg-white rounded border border-slate-200 p-6">
      <h3 className="text-xl font-semibold text-slate-900 mb-6">Dodaj swój wynik</h3>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        <Input
          label="Imię *"
          {...register('athleteName', {
            required: 'Imię jest wymagane',
            minLength: { value: 2, message: 'Imię musi mieć co najmniej 2 znaki' },
          })}
          error={errors.athleteName?.message}
          placeholder="Twoje imię"
        />

        <div>
          <label className="block text-sm font-medium text-slate-900 mb-3">Płeć *</label>
          <div className="flex gap-5">
            <label className="flex items-center cursor-pointer group">
              <input
                type="radio"
                value="M"
                {...register('gender', { required: true })}
                className="mr-2.5 h-4 w-4 text-primary-600 focus:ring-primary-500"
              />
              <span className="text-slate-900 group-hover:text-primary-600 transition-colors duration-200">
                Mężczyzna
              </span>
            </label>
            <label className="flex items-center cursor-pointer group">
              <input
                type="radio"
                value="F"
                {...register('gender', { required: true })}
                className="mr-2.5 h-4 w-4 text-primary-600 focus:ring-primary-500"
              />
              <span className="text-slate-900 group-hover:text-primary-600 transition-colors duration-200">
                Kobieta
              </span>
            </label>
          </div>
        </div>

        {isRoundBasedWorkout && (
          <div className="mb-4">
            <div className="flex gap-2 mb-2">
              <button
                type="button"
                onClick={() => setInputMode('simple')}
                className={clsx(
                  'px-3 py-1 rounded text-sm font-medium transition-colors duration-200',
                  inputMode === 'simple'
                    ? 'bg-primary-600 text-white'
                    : 'bg-slate-200 text-slate-700 hover:bg-slate-300'
                )}
              >
                Wynik końcowy
              </button>
              <button
                type="button"
                onClick={() => setInputMode('rounds')}
                className={clsx(
                  'px-3 py-1 rounded text-sm font-medium transition-colors duration-200',
                  inputMode === 'rounds'
                    ? 'bg-primary-600 text-white'
                    : 'bg-slate-200 text-slate-700 hover:bg-slate-300'
                )}
              >
                Rundy
              </button>
            </div>
          </div>
        )}

        {inputMode === 'simple' ? (
          <div>
            <Input
              label="Wynik *"
              {...register('resultValue', {
                required: inputMode === 'simple' ? 'Wynik jest wymagany' : false,
              })}
              error={errors.resultValue?.message}
              placeholder={workoutTypeConfig.placeholder}
            />
            <p className="mt-2 text-sm text-slate-600">
              {workoutTypeConfig.hint}
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            <label className="block text-sm font-medium text-slate-900">
              Wyniki poszczególnych rund
            </label>

            {rounds.length > 0 && (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                {rounds.map((round, idx) => (
                  <div key={idx} className="relative">
                    <label className="block text-xs text-slate-500 mb-1">R{idx + 1}</label>
                    <div className="flex gap-1">
                      <input
                        type="number"
                        value={round}
                        onChange={(e) => updateRound(idx, parseInt(e.target.value) || 0)}
                        min={0}
                        className="w-full rounded border border-slate-300 px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                      />
                      <button
                        type="button"
                        onClick={() => removeRound(idx)}
                        className="text-red-600 hover:text-red-700 px-1.5 text-sm font-semibold transition-colors duration-200"
                        aria-label="Usuń rundę"
                      >
                        ✕
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            <div className="flex items-center gap-3">
              <Button type="button" onClick={addRound} variant="secondary" size="sm">
                + Dodaj rundę
              </Button>
              {rounds.length > 0 && (
                <div className="px-3 py-1.5 bg-primary-50 border border-primary-200 rounded">
                  <span className="text-sm font-semibold text-primary-900">Suma: {total}</span>
                </div>
              )}
            </div>
          </div>
        )}

        <Button type="submit" loading={createResult.isPending} className="w-full">
          Dodaj wynik
        </Button>
      </form>
    </div>
  );
}
