import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { useCreateWorkout } from '../hooks/useWorkouts';
import { useAuth } from '../context/AuthContext';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';

interface WorkoutFormData {
  description: string;
  workoutDate: string;
  sortDirection: 'asc' | 'desc';
}

export default function CreateWorkoutPage() {
  const navigate = useNavigate();
  const { addWorkout } = useAuth();
  const createWorkout = useCreateWorkout();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<WorkoutFormData>({
    defaultValues: {
      workoutDate: new Date().toISOString().split('T')[0],
      sortDirection: 'desc',
    },
  });

  const onSubmit = async (data: WorkoutFormData) => {
    try {
      const response = await createWorkout.mutateAsync(data);
      addWorkout(response.workout.id, response.ownerToken);
      toast.success('Workout został utworzony!');
      navigate(`/workout/${response.workout.id}`);
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Wystąpił błąd podczas tworzenia workoutu');
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Nowy workout</h1>
        <p className="text-gray-600 mt-2">
          Utwórz workout i udostępnij link znajomym, aby porównać wyniki
        </p>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
              Opis workoutu *
            </label>
            <textarea
              id="description"
              {...register('description', {
                required: 'Opis workoutu jest wymagany',
                minLength: { value: 5, message: 'Opis musi mieć co najmniej 5 znaków' },
              })}
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              placeholder="np. For Time: 21-15-9 Thrusters (42.5/30kg) Pull-ups"
            />
            {errors.description && (
              <p className="mt-1 text-sm text-red-600" role="alert">
                {errors.description.message}
              </p>
            )}
          </div>

          <Input
            label="Data workoutu"
            type="date"
            {...register('workoutDate')}
            max={new Date().toISOString().split('T')[0]}
          />

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Kierunek sortowania *
            </label>
            <div className="space-y-2">
              <label className="flex items-center p-3 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50">
                <input
                  type="radio"
                  value="desc"
                  {...register('sortDirection')}
                  className="mr-3 h-4 w-4 text-primary-600 focus:ring-primary-500"
                />
                <div>
                  <div className="font-medium">Od najwyższej (DESC)</div>
                  <div className="text-sm text-gray-500">
                    Dla workoutów gdzie wyższy wynik = lepszy (np. liczba powtórzeń, ciężar)
                  </div>
                </div>
              </label>

              <label className="flex items-center p-3 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50">
                <input
                  type="radio"
                  value="asc"
                  {...register('sortDirection')}
                  className="mr-3 h-4 w-4 text-primary-600 focus:ring-primary-500"
                />
                <div>
                  <div className="font-medium">Od najniższej (ASC)</div>
                  <div className="text-sm text-gray-500">
                    Dla workoutów czasowych gdzie niższy czas = lepszy (np. For Time)
                  </div>
                </div>
              </label>
            </div>
          </div>

          <div className="flex gap-3 pt-4">
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

      <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h3 className="font-medium text-blue-900 mb-2">💡 Wskazówka</h3>
        <p className="text-sm text-blue-800">
          Po utworzeniu workoutu otrzymasz unikalny link, który możesz udostępnić innym osobom.
          Będziesz mógł usunąć workout tylko jeśli zachowasz dostęp do tej przeglądarki.
        </p>
      </div>
    </div>
  );
}
