import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { useCreateWorkout } from '../hooks/useWorkouts';
import { useAuth } from '../context/AuthContext';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';
import type { WorkoutType } from '../types';
import { WORKOUT_TYPE_OPTIONS, getSortDirectionLabel } from '../constants/workoutTypes';

interface WorkoutFormData {
  description: string;
  workoutDate: string;
  workoutType: WorkoutType;
}

export default function CreateWorkoutPage() {
  const navigate = useNavigate();
  const { addWorkout } = useAuth();
  const createWorkout = useCreateWorkout();
  const [selectedType, setSelectedType] = useState<WorkoutType>('for_time');

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<WorkoutFormData>({
    defaultValues: {
      workoutDate: new Date().toISOString().split('T')[0],
      workoutType: 'for_time',
    },
  });

  const onSubmit = async (data: WorkoutFormData) => {
    try {
      const response = await createWorkout.mutateAsync({
        ...data,
        workoutType: selectedType,
      });
      addWorkout(response.workout.id, response.ownerToken);
      toast.success('Workout został utworzony!');
      navigate(`/workout/${response.workout.id}`);
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Wystąpił błąd podczas tworzenia workoutu');
    }
  };

  const selectedConfig = WORKOUT_TYPE_OPTIONS.find(opt => opt.value === selectedType)!;

  return (
    <div className="max-w-2xl mx-auto">
      {/* Back Button */}
      <div className="mb-4">
        <Button
          variant="primary"
          onClick={() => navigate('/')}
          size="sm"
        >
          <span className="inline-flex items-center">
            <ArrowLeftIcon className="h-3.5 w-3.5 mr-1.5" />
            Wróć do workoutów
          </span>
        </Button>
      </div>

      <div className="mb-10">
        <h1 className="text-4xl font-semibold text-slate-900 tracking-tight">Nowy workout</h1>
        <p className="text-slate-700 mt-3 text-lg">
          Utwórz workout i udostępnij link znajomym, aby porównać wyniki
        </p>
      </div>

      <div className="bg-white rounded border border-slate-200 p-8">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
          <div>
            <label
              htmlFor="description"
              className="block text-sm font-medium text-slate-900 mb-2"
            >
              Opis workoutu *
            </label>
            <textarea
              id="description"
              {...register('description', {
                required: 'Opis workoutu jest wymagany',
                minLength: { value: 5, message: 'Opis musi mieć co najmniej 5 znaków' },
                maxLength: { value: 5000, message: 'Opis może mieć maksymalnie 5000 znaków' },
              })}
              rows={4}
              className="w-full px-4 py-3 border border-slate-300 rounded bg-white focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all duration-200 hover:border-slate-400"
              placeholder="np. For Time: 21-15-9 Thrusters (42.5/30kg) Pull-ups"
            />
            {errors.description && (
              <p className="mt-2 text-sm text-red-600" role="alert">
                {errors.description.message}
              </p>
            )}
          </div>

          <Input
            label="Data workoutu"
            type="date"
            {...register('workoutDate', {
              validate: {
                notTooFarInFuture: (value) => {
                  const selectedDate = new Date(value);
                  const oneYearFromNow = new Date();
                  oneYearFromNow.setFullYear(oneYearFromNow.getFullYear() + 1);
                  return selectedDate <= oneYearFromNow || 'Data nie może być późniejsza niż 1 rok w przyszłość';
                }
              }
            })}
            error={errors.workoutDate?.message}
          />

          <div>
            <label className="block text-sm font-medium text-slate-900 mb-3">
              Typ workoutu *
            </label>
            <div className="grid grid-cols-2 gap-3">
              {WORKOUT_TYPE_OPTIONS.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => setSelectedType(option.value)}
                  className={`p-3 sm:p-4 border-2 rounded-lg text-left transition-all duration-200 ${
                    selectedType === option.value
                      ? 'border-primary-600 bg-primary-50'
                      : 'border-slate-300 bg-white hover:border-slate-400 hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-start gap-2 mb-1">
                    <span className="text-xl sm:text-2xl flex-shrink-0">{option.emoji}</span>
                    <span className="font-semibold text-sm sm:text-base text-slate-900 leading-tight break-words">{option.label}</span>
                  </div>
                  <div className="text-xs sm:text-sm text-slate-700 leading-tight">{option.description}</div>
                </button>
              ))}
            </div>
            <div className="mt-3 p-3 bg-slate-50 border border-slate-200 rounded">
              <span className="text-sm text-slate-700">
                💡 Sortowanie: <span className="font-medium">{getSortDirectionLabel(selectedConfig.sortDirection)}</span>
              </span>
            </div>
          </div>

          <div className="flex gap-4 pt-6">
            <Button
              type="button"
              variant="secondary"
              onClick={() => navigate('/')}
              className="flex-1"
            >
              Anuluj
            </Button>
            <Button
              type="submit"
              loading={createWorkout.isPending}
              className="flex-1"
            >
              Utwórz workout
            </Button>
          </div>
        </form>
      </div>

      <div className="mt-8 bg-primary-50 border border-primary-200 rounded p-6">
        <h3 className="font-semibold text-slate-900 mb-2">💡 Wskazówka</h3>
        <p className="text-sm text-slate-800 leading-relaxed">
          Po utworzeniu workoutu otrzymasz unikalny link, który możesz udostępnić innym osobom.
          Będziesz mógł usunąć workout tylko jeśli zachowasz dostęp do tej przeglądarki.
        </p>
      </div>
    </div>
  );
}
