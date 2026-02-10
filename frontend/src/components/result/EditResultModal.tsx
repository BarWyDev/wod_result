import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import clsx from 'clsx';
import { useUpdateResult } from '../../hooks/useResults';
import { useAuth } from '../../context/AuthContext';
import { useWorkout } from '../../hooks/useWorkouts';
import type { Result } from '../../types';
import { Modal } from '../ui/Modal';
import { Input } from '../ui/Input';
import { Button } from '../ui/Button';
import { getWorkoutTypeConfig } from '../../constants/workoutTypes';

interface EditResultModalProps {
  result: Result | null;
  isOpen: boolean;
  onClose: () => void;
}

interface ResultFormData {
  athleteName: string;
  gender: 'M' | 'F';
  resultValue: string;
  minutes: string;
  seconds: string;
  comment: string;
}

export function EditResultModal({ result, isOpen, onClose }: EditResultModalProps) {
  const { getResultToken } = useAuth();
  const updateResult = useUpdateResult();
  const { data: workout } = useWorkout(result?.workoutId || '');

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
  } = useForm<ResultFormData>();

  useEffect(() => {
    if (result) {
      // Parsowanie istniejącego wyniku
      let minutes = '';
      let seconds = '';
      let resultValue = result.resultValue;

      if (result.isDnf) {
        setIsDnf(true);
      } else {
        setIsDnf(false);

        if (isTimeBasedWorkout) {
          // Parsuj mm:ss
          const timeMatch = result.resultValue.match(/^(\d+):(\d{2})$/);
          if (timeMatch) {
            minutes = timeMatch[1];
            seconds = timeMatch[2];
            resultValue = '';
          } else if (result.resultNumeric) {
            // Fallback: użyj resultNumeric
            resultValue = result.resultNumeric;
          }
        } else {
          // Dla typów liczbowych: użyj resultNumeric jeśli dostępne
          if (result.resultNumeric) {
            resultValue = result.resultNumeric;
          }
        }
      }

      reset({
        athleteName: result.athleteName,
        gender: result.gender,
        resultValue,
        minutes,
        seconds,
        comment: result.comment || '',
      });

      // Sprawdź czy wynik ma szczegóły rund
      if (result.roundDetails?.rounds && result.roundDetails.rounds.length > 0) {
        setInputMode('rounds');
        setRounds([...result.roundDetails.rounds]);
      } else {
        setInputMode('simple');
        setRounds([]);
      }
    }
  }, [result, reset, isTimeBasedWorkout]);

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
    if (!result) return;

    const resultToken = getResultToken(result.id);
    if (!resultToken) {
      toast.error('Nie masz uprawnień do edycji tego wyniku');
      return;
    }

    try {
      const updateData: any = {
        athleteName: data.athleteName,
        gender: data.gender,
        comment: data.comment || null,
        isDnf,
      };

      if (isDnf) {
        updateData.resultValue = 'DNF';
        updateData.roundDetails = null;
      } else if (inputMode === 'rounds' && rounds.length > 0) {
        // Tryb rund - wyślij szczegóły rund
        updateData.roundDetails = { rounds };
      } else if (isTimeBasedWorkout) {
        // Tryb czasowy
        const mins = parseInt(data.minutes) || 0;
        const secs = parseInt(data.seconds) || 0;
        if (mins === 0 && secs === 0) {
          toast.error('Wpisz czas większy niż 0');
          return;
        }
        updateData.resultValue = `${mins}:${secs.toString().padStart(2, '0')}`;
        updateData.roundDetails = null;
      } else {
        // Tryb prosty - wyślij wartość wyniku
        updateData.resultValue = data.resultValue;
        updateData.roundDetails = null;
      }

      await updateResult.mutateAsync({
        id: result.id,
        resultToken,
        data: updateData,
      });
      toast.success('Wynik został zaktualizowany!');
      onClose();
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Wystąpił błąd podczas aktualizacji wyniku');
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Edytuj wynik">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        <Input
          label="Imię *"
          {...register('athleteName', {
            required: 'Imię jest wymagane',
            minLength: { value: 2, message: 'Imię musi mieć co najmniej 2 znaki' },
            maxLength: { value: 255, message: 'Imię może mieć maksymalnie 255 znaków' },
          })}
          error={errors.athleteName?.message}
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
                  />
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
          <label htmlFor="edit-comment" className="block text-sm font-medium text-slate-900 mb-2">
            Komentarz (opcjonalny)
          </label>
          <textarea
            id="edit-comment"
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

        <div className="flex gap-4 pt-6">
          <Button type="button" variant="secondary" onClick={onClose} className="flex-1">
            Anuluj
          </Button>
          <Button type="submit" loading={updateResult.isPending} className="flex-1">
            Zapisz zmiany
          </Button>
        </div>
      </form>
    </Modal>
  );
}
