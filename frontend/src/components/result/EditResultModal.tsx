import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { useUpdateResult } from '../../hooks/useResults';
import { useAuth } from '../../context/AuthContext';
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
    }
  }, [result, reset]);

  const onSubmit = async (data: ResultFormData) => {
    if (!result) return;

    const resultToken = getResultToken(result.id);
    if (!resultToken) {
      toast.error('Nie masz uprawnień do edycji tego wyniku');
      return;
    }

    try {
      await updateResult.mutateAsync({
        id: result.id,
        resultToken,
        data,
      });
      toast.success('Wynik został zaktualizowany!');
      onClose();
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Wystąpił błąd podczas aktualizacji wyniku');
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Edytuj wynik">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <Input
          label="Imię *"
          {...register('athleteName', {
            required: 'Imię jest wymagane',
            minLength: { value: 2, message: 'Imię musi mieć co najmniej 2 znaki' },
          })}
          error={errors.athleteName?.message}
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
        />

        <div className="flex gap-3 pt-4">
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
