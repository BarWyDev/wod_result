import { Link } from 'react-router-dom';

export default function NotFoundPage() {
  return (
    <div className="text-center py-12">
      <h1 className="text-4xl font-bold text-gray-900 mb-4">404</h1>
      <p className="text-gray-600 mb-8">
        Strona nie została znaleziona
      </p>
      <Link
        to="/"
        className="text-primary-600 hover:text-primary-700 font-medium"
      >
        Wróć do strony głównej
      </Link>
    </div>
  );
}
