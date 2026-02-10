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
  minutes: string;
  seconds: string;
  comment: string;
}

export function AddResultForm({ workoutId }: AddResultFormProps) {
  const { addResult } = useAuth();
  const createResult = useCreateResult();
  const { data: workout } = useWorkout(workoutId);

  const workoutTypeConfig = getWorkoutTypeConfig(workout?.workoutType);
  const isTimeBasedWorkout = workout?.resultUnit === 'time';

  // Tryb wprowadzania: prosty vs. rundy
  const [inputMode, setInputMode] = useState<'simple' | 'rounds'>('simple');
  const [rounds, setRounds] = useState<number[]>([]);
  const [isDnf, setIsDnf] = useState(false);

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
      minutes: '',
      seconds: '',
      comment: '',
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
        comment: data.comment || null,
        isDnf,
      };

      if (isDnf) {
        payload.resultValue = 'DNF';
      } else if (inputMode === 'rounds' && rounds.length > 0) {
        // Tryb rund - wyślij szczegóły rund
        payload.resultValue = total.toString();
        payload.roundDetails = { rounds };
      } else if (isTimeBasedWorkout) {
        // Tryb czasowy - konstruuj mm:ss
        const mins = parseInt(data.minutes) || 0;
        const secs = parseInt(data.seconds) || 0;
        if (mins === 0 && secs === 0) {
          toast.error('Wpisz czas większy niż 0');
          return;
        }
        payload.resultValue = `${mins}:${secs.toString().padStart(2, '0')}`;
      } else {
        // Tryb liczbowy
        payload.resultValue = data.resultValue;
      }

      const response = await createResult.mutateAsync(payload);
      addResult(workoutId, response.result.id, response.resultToken);
      toast.success('Wynik został dodany!');
      reset();
      setRounds([]);
      setInputMode('simple');
      setIsDnf(false);
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
            maxLength: { value: 255, message: 'Imię może mieć maksymalnie 255 znaków' },
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

        {/* DNF Checkbox */}
        <div>
          <label className="flex items-center cursor-pointer group">
            <input
              type="checkbox"
              checked={isDnf}
              onChange={(e) => setIsDnf(e.target.checked)}
              className="mr-2.5 h-4 w-4 text-red-600 focus:ring-red-500 rounded"
            />
            <span className="text-slate-900 group-hover:text-red-600 transition-colors duration-200 font-medium">
              DNF (nie ukończony)
            </span>
          </label>
        </div>

        {!isDnf && (
          <>
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
                {isTimeBasedWorkout ? (
                  <div>
                    <label className="block text-sm font-medium text-slate-900 mb-2">Czas *</label>
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        min="0"
                        max="59"
                        {...register('minutes', {
                          required: false,
                          min: { value: 0, message: 'Min 0' },
                          max: { value: 59, message: 'Max 59' },
                        })}
                        className="w-20 rounded border border-slate-300 px-3 py-2 text-base focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                        placeholder="min"
                      />
                      <span className="text-xl font-bold text-slate-500">:</span>
                      <input
                        type="number"
                        min="0"
                        max="59"
                        {...register('seconds', {
                          required: false,
                          min: { value: 0, message: 'Min 0' },
                          max: { value: 59, message: 'Max 59' },
                        })}
                        className="w-20 rounded border border-slate-300 px-3 py-2 text-base focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                        placeholder="sek"
                      />
                    </div>
                    <p className="mt-2 text-sm text-slate-600">
                      {workoutTypeConfig.hint}
                    </p>
                  </div>
                ) : (
                  <div>
                    <Input
                      label="Wynik *"
                      type="number"
                      step="any"
                      min="0"
                      {...register('resultValue', {
                        required: 'Wynik jest wymagany',
                        maxLength: { value: 100, message: 'Wynik może mieć maksymalnie 100 znaków' },
                      })}
                      error={errors.resultValue?.message}
                      placeholder={workoutTypeConfig.placeholder}
                    />
                    <p className="mt-2 text-sm text-slate-600">
                      {workoutTypeConfig.hint}
                    </p>
                  </div>
                )}
              </div>
            ) : (
              <div className="space-y-3">
                <label className="block text-sm font-medium text-slate-900">
                  Wyniki poszczególnych rund
                </label>

                <div className="space-y-2">
                  {rounds.map((round, idx) => (
                    <div key={idx} className="flex items-center gap-2">
                      <span className="text-sm font-medium text-slate-600 w-12">R{idx + 1}</span>
                      <input
                        type="number"
                        value={round}
                        onChange={(e) => updateRound(idx, parseInt(e.target.value) || 0)}
                        min={0}
                        className="flex-1 rounded border border-slate-300 px-3 py-2 text-base focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                        placeholder="0"
                      />
                      <button
                        type="button"
                        onClick={() => removeRound(idx)}
                        className="text-red-600 hover:text-red-700 hover:bg-red-50 w-8 h-8 rounded flex items-center justify-center transition-colors duration-200"
                        aria-label="Usuń rundę"
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                </div>

                <div className="flex items-center gap-3 pt-2">
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
          </>
        )}

        {/* Komentarz */}
        <div>
          <label htmlFor="comment" className="block text-sm font-medium text-slate-900 mb-2">
            Komentarz (opcjonalny)
          </label>
          <textarea
            id="comment"
            {...register('comment', {
              maxLength: { value: 500, message: 'Komentarz może mieć maksymalnie 500 znaków' },
            })}
            rows={2}
            className="w-full px-4 py-3 border border-slate-300 rounded bg-white focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all duration-200 hover:border-slate-400 text-sm"
            placeholder="np. Scaled, RX, bez pasa..."
          />
          {errors.comment && (
            <p className="mt-1 text-sm text-red-600">{errors.comment.message}</p>
          )}
        </div>

        <Button type="submit" loading={createResult.isPending} className="w-full">
          Dodaj wynik
        </Button>
      </form>
    </div>
  );
}
