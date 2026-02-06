import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
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

  const onSubmit = async (data: ResultFormData) => {
    try {
      const response = await createResult.mutateAsync({
        workoutId,
        ...data,
      });
      addResult(workoutId, response.result.id, response.resultToken);
      toast.success('Wynik został dodany!');
      reset();
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

        <div>
          <Input
            label="Wynik *"
            {...register('resultValue', {
              required: 'Wynik jest wymagany',
            })}
            error={errors.resultValue?.message}
            placeholder={workoutTypeConfig.placeholder}
          />
          <p className="mt-2 text-sm text-slate-600">
            {workoutTypeConfig.hint}
          </p>
        </div>

        <Button type="submit" loading={createResult.isPending} className="w-full">
          Dodaj wynik
        </Button>
      </form>
    </div>
  );
}
