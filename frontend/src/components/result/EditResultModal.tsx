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

interface EditResultModalProps {
  result: Result | null;
  isOpen: boolean;
  onClose: () => void;
}

interface ResultFormData {
  athleteName: string;
  gender: 'M' | 'F';
  resultValue: string;
}

export function EditResultModal({ result, isOpen, onClose }: EditResultModalProps) {
  const { getResultToken } = useAuth();
  const updateResult = useUpdateResult();
  const { data: workout } = useWorkout(result?.workoutId || '');

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
  } = useForm<ResultFormData>();

  useEffect(() => {
    if (result) {
      reset({
        athleteName: result.athleteName,
        gender: result.gender,
        resultValue: result.resultValue,
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
  }, [result, reset]);

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
      };

      if (inputMode === 'rounds' && rounds.length > 0) {
        // Tryb rund - wyślij szczegóły rund
        updateData.roundDetails = { rounds };
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
          <Input
            label="Wynik *"
            {...register('resultValue', {
              required: inputMode === 'simple' ? 'Wynik jest wymagany' : false,
            })}
            error={errors.resultValue?.message}
          />
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
