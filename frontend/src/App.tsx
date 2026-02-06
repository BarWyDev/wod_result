import { Routes, Route } from 'react-router-dom';
import { Suspense, lazy } from 'react';
import Layout from './components/Layout';

const HomePage = lazy(() => import('./pages/HomePage'));
const CreateWorkoutPage = lazy(() => import('./pages/CreateWorkoutPage'));
const WorkoutDetailPage = lazy(() => import('./pages/WorkoutDetailPage'));
const NotFoundPage = lazy(() => import('./pages/NotFoundPage'));

function App() {
  return (
    <Layout>
      <Suspense fallback={<div className="flex justify-center p-8">Ładowanie...</div>}>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/workout/create" element={<CreateWorkoutPage />} />
          <Route path="/workout/:id" element={<WorkoutDetailPage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </Suspense>
    </Layout>
  );
}

export default App;
