import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { useCreateResult } from '../../hooks/useResults';
import { useAuth } from '../../context/AuthContext';
import { Input } from '../ui/Input';
import { Button } from '../ui/Button';

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
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Dodaj swój wynik</h3>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
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
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Płeć *
          </label>
          <div className="flex gap-4">
            <label className="flex items-center cursor-pointer">
              <input
                type="radio"
                value="M"
                {...register('gender', { required: true })}
                className="mr-2 h-4 w-4 text-primary-600 focus:ring-primary-500"
              />
              <span>Mężczyzna</span>
            </label>
            <label className="flex items-center cursor-pointer">
              <input
                type="radio"
                value="F"
                {...register('gender', { required: true })}
                className="mr-2 h-4 w-4 text-primary-600 focus:ring-primary-500"
              />
              <span>Kobieta</span>
            </label>
          </div>
        </div>

        <Input
          label="Wynik *"
          {...register('resultValue', {
            required: 'Wynik jest wymagany',
          })}
          error={errors.resultValue?.message}
          placeholder="np. 12:45, 150, DNF"
        />

        <Button type="submit" loading={createResult.isPending} className="w-full">
          Dodaj wynik
        </Button>
      </form>
    </div>
  );
}
