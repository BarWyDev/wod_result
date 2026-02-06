import { useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useWorkout, useDeleteWorkout } from '../hooks/useWorkouts';
import { useResults, useDeleteResult } from '../hooks/useResults';
import { useAuth } from '../context/AuthContext';
import type { GenderFilter as GenderFilterType, Result } from '../types';
import { GenderFilter } from '../components/result/GenderFilter';
import { ResultRow } from '../components/result/ResultRow';
import { AddResultForm } from '../components/result/AddResultForm';
import { EditResultModal } from '../components/result/EditResultModal';
import { Button } from '../components/ui/Button';
import { ShareIcon, TrashIcon } from '@heroicons/react/24/outline';

export default function WorkoutDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: workout, isLoading: workoutLoading, error: workoutError } = useWorkout(id!);
  const { data: results, isLoading: resultsLoading } = useResults(id!);
  const { isWorkoutOwner, getWorkoutOwnerToken, getResultToken, removeWorkout, removeResult } = useAuth();
  const deleteWorkout = useDeleteWorkout();
  const deleteResult = useDeleteResult();

  const [genderFilter, setGenderFilter] = useState<GenderFilterType>('all');
  const [editingResult, setEditingResult] = useState<Result | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  const isOwner = id ? isWorkoutOwner(id) : false;

  const filteredResults = useMemo(() => {
    if (!results) return [];
    if (genderFilter === 'all') return results;
    return results.filter((r) => r.gender === genderFilter);
  }, [results, genderFilter]);

  const handleShare = async () => {
    const url = window.location.href;
    try {
      await navigator.clipboard.writeText(url);
      toast.success('Link został skopiowany do schowka!');
    } catch {
      toast.error('Nie udało się skopiować linku');
    }
  };

  const handleDeleteWorkout = async () => {
    if (!id) return;

    const confirmed = window.confirm(
      'Czy na pewno chcesz usunąć ten workout? Wszystkie wyniki zostaną również usunięte. Ta operacja jest nieodwracalna.'
    );

    if (!confirmed) return;

    const ownerToken = getWorkoutOwnerToken(id);
    if (!ownerToken) {
      toast.error('Nie masz uprawnień do usunięcia tego workoutu');
      return;
    }

    try {
      await deleteWorkout.mutateAsync({ id, ownerToken });
      removeWorkout(id);
      toast.success('Workout został usunięty');
      navigate('/');
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Wystąpił błąd podczas usuwania workoutu');
    }
  };

  const handleEditResult = (result: Result) => {
    setEditingResult(result);
    setIsEditModalOpen(true);
  };

  const handleDeleteResult = async (result: Result) => {
    if (!id) return;

    const confirmed = window.confirm('Czy na pewno chcesz usunąć ten wynik?');
    if (!confirmed) return;

    const resultToken = getResultToken(result.id);
    if (!resultToken) {
      toast.error('Nie masz uprawnień do usunięcia tego wyniku');
      return;
    }

    try {
      await deleteResult.mutateAsync({
        id: result.id,
        resultToken,
        workoutId: id,
      });
      removeResult(result.id);
      toast.success('Wynik został usunięty');
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Wystąpił błąd podczas usuwania wyniku');
    }
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('pl-PL', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  };

  if (workoutLoading) {
    return (
      <div className="text-center py-12">
        <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary-600 border-r-transparent"></div>
        <p className="mt-4 text-gray-600">Ładowanie workoutu...</p>
      </div>
    );
  }

  if (workoutError || !workout) {
    return (
      <div className="text-center py-12">
        <div className="text-6xl mb-4">😕</div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Workout nie został znaleziony</h2>
        <p className="text-gray-600 mb-6">Ten workout nie istnieje lub został usunięty.</p>
        <Button onClick={() => navigate('/')}>Wróć do strony głównej</Button>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <p className="text-sm text-gray-500 mb-1">{formatDate(workout.workoutDate)}</p>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">{workout.description}</h1>
            <div className="flex items-center gap-4 text-sm text-gray-600">
              <span>
                Sortowanie:{' '}
                <span className="font-medium">
                  {workout.sortDirection === 'asc' ? 'Od najniższej' : 'Od najwyższej'}
                </span>
              </span>
              {isOwner && (
                <span className="text-primary-600 font-medium">✓ Twój workout</span>
              )}
            </div>
          </div>
        </div>

        <div className="flex gap-2">
          <Button variant="secondary" onClick={handleShare} size="sm">
            <ShareIcon className="h-4 w-4 mr-1.5" />
            Udostępnij
          </Button>
          {isOwner && (
            <Button
              variant="danger"
              onClick={handleDeleteWorkout}
              size="sm"
              loading={deleteWorkout.isPending}
            >
              <TrashIcon className="h-4 w-4 mr-1.5" />
              Usuń workout
            </Button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Results List */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="p-4 border-b border-gray-200 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900">
                Ranking ({filteredResults.length})
              </h2>
              <GenderFilter value={genderFilter} onChange={setGenderFilter} />
            </div>

            {resultsLoading && (
              <div className="p-8 text-center">
                <div className="inline-block h-6 w-6 animate-spin rounded-full border-4 border-solid border-primary-600 border-r-transparent"></div>
              </div>
            )}

            {!resultsLoading && filteredResults.length === 0 && (
              <div className="p-8 text-center">
                <div className="text-4xl mb-2">🏁</div>
                <p className="text-gray-600">
                  {genderFilter === 'all'
                    ? 'Brak wyników. Bądź pierwszy!'
                    : 'Brak wyników dla wybranej płci'}
                </p>
              </div>
            )}

            {!resultsLoading && filteredResults.length > 0 && (
              <div>
                {filteredResults.map((result, index) => (
                  <ResultRow
                    key={result.id}
                    result={result}
                    position={index + 1}
                    onEdit={handleEditResult}
                    onDelete={handleDeleteResult}
                  />
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Add Result Form */}
        <div className="lg:col-span-1">
          <AddResultForm workoutId={id!} />
        </div>
      </div>

      {/* Edit Result Modal */}
      <EditResultModal
        result={editingResult}
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setEditingResult(null);
        }}
      />
    </div>
  );
}
