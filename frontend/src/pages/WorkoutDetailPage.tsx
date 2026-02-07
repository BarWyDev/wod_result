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
import { ConfirmModal } from '../components/ui/ConfirmModal';
import { Button } from '../components/ui/Button';
import { ShareIcon, TrashIcon, ArrowLeftIcon } from '@heroicons/react/24/outline';
import { getWorkoutTypeLabel } from '../constants/workoutTypes';

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
  const [deleteWorkoutModalOpen, setDeleteWorkoutModalOpen] = useState(false);
  const [deleteResultTarget, setDeleteResultTarget] = useState<Result | null>(null);

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

  const handleDeleteWorkout = () => {
    setDeleteWorkoutModalOpen(true);
  };

  const confirmDeleteWorkout = async () => {
    if (!id) return;

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

  const handleDeleteResult = (result: Result) => {
    setDeleteResultTarget(result);
  };

  const confirmDeleteResult = async () => {
    if (!id || !deleteResultTarget) return;

    const resultToken = getResultToken(deleteResultTarget.id);
    if (!resultToken) {
      toast.error('Nie masz uprawnień do usunięcia tego wyniku');
      return;
    }

    try {
      await deleteResult.mutateAsync({
        id: deleteResultTarget.id,
        resultToken,
        workoutId: id,
      });
      removeResult(deleteResultTarget.id);
      toast.success('Wynik został usunięty');
      setDeleteResultTarget(null);
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
      <div className="text-center py-16">
        <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary-600 border-r-transparent"></div>
        <p className="mt-6 text-slate-700">Ładowanie workoutu...</p>
      </div>
    );
  }

  if (workoutError || !workout) {
    return (
      <div className="text-center py-20">
        <div className="text-7xl mb-6">😕</div>
        <h2 className="text-3xl font-semibold text-slate-900 mb-3">
          Workout nie został znaleziony
        </h2>
        <p className="text-slate-700 text-lg mb-8">
          Ten workout nie istnieje lub został usunięty.
        </p>
        <Button onClick={() => navigate('/')}>Wróć do strony głównej</Button>
      </div>
    );
  }

  return (
    <div>
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

      {/* Header */}
      <div className="bg-white rounded border border-slate-200 p-4 sm:p-8 mb-4 sm:mb-8">
        <div className="flex items-start justify-between mb-6">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <p className="text-sm text-slate-700 font-medium">
                {formatDate(workout.workoutDate)}
              </p>
              <span className="text-sm bg-primary-100 text-primary-800 px-3 py-1 rounded-full font-medium">
                {getWorkoutTypeLabel(workout.workoutType)}
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-semibold text-slate-900 mb-3 leading-tight">
              {workout.description}
            </h1>
            <div className="flex items-center gap-5 text-sm text-slate-700">
              <span>
                Sortowanie:{' '}
                <span className="font-medium text-slate-900">
                  {workout.sortDirection === 'asc' ? 'Od najniższej' : 'Od najwyższej'}
                </span>
              </span>
              {isOwner && (
                <span className="text-primary-600 font-medium bg-primary-50 px-2 py-1 rounded">
                  ✓ Twój workout
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="flex gap-3">
          <button
            onClick={handleShare}
            className="inline-flex items-center px-4 py-2 text-sm font-medium rounded bg-slate-100 text-slate-900 border border-slate-200 hover:bg-slate-200 transition-all duration-200"
          >
            <ShareIcon className="h-4 w-4 mr-2" />
            Udostępnij
          </button>
          {isOwner && (
            <Button
              variant="danger"
              onClick={handleDeleteWorkout}
              size="sm"
              loading={deleteWorkout.isPending}
            >
              <span className="inline-flex items-center">
                <TrashIcon className="h-4 w-4 mr-2" />
                Usuń workout
              </span>
            </Button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-8">
        {/* Results List */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded border border-slate-200">
            <div className="p-4 sm:p-6 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <h2 className="text-xl font-semibold text-slate-900 whitespace-nowrap">
                Ranking ({filteredResults.length})
              </h2>
              <GenderFilter value={genderFilter} onChange={setGenderFilter} />
            </div>

            {resultsLoading && (
              <div className="p-12 text-center">
                <div className="inline-block h-6 w-6 animate-spin rounded-full border-4 border-solid border-primary-600 border-r-transparent"></div>
              </div>
            )}

            {!resultsLoading && filteredResults.length === 0 && (
              <div className="p-12 text-center">
                <div className="text-5xl mb-3">🏁</div>
                <p className="text-slate-700 text-lg">
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

      {/* Delete Workout Confirmation Modal */}
      <ConfirmModal
        isOpen={deleteWorkoutModalOpen}
        onClose={() => setDeleteWorkoutModalOpen(false)}
        onConfirm={confirmDeleteWorkout}
        title="Usunąć workout?"
        message="Wszystkie wyniki zostaną również usunięte. Ta operacja jest nieodwracalna."
        confirmText="Usuń"
        cancelText="Anuluj"
        variant="danger"
      />

      {/* Delete Result Confirmation Modal */}
      <ConfirmModal
        isOpen={!!deleteResultTarget}
        onClose={() => setDeleteResultTarget(null)}
        onConfirm={confirmDeleteResult}
        title="Usunąć wynik?"
        message="Ta operacja jest nieodwracalna."
        confirmText="Usuń"
        cancelText="Anuluj"
        variant="danger"
      />
    </div>
  );
}
