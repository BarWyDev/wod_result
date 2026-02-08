/**
 * Parsuje wartość wyniku i zwraca wartość numeryczną do sortowania
 * @param value - oryginalna wartość tekstowa wyniku
 * @returns wartość numeryczna lub null dla wartości nieliczbowych
 */
export function parseResultNumeric(value: string): number | null {
  const trimmed = value.trim();

  // 1. Format czasu hh:mm:ss lub mm:ss
  const timeRegex = /^(\d{1,2}):(\d{2})(?::(\d{2}))?$/;
  const timeMatch = trimmed.match(timeRegex);

  if (timeMatch) {
    const [, first, second, third] = timeMatch;
    if (third !== undefined && first && second) {
      // Format hh:mm:ss
      const hours = parseInt(first, 10);
      const minutes = parseInt(second, 10);
      const seconds = parseInt(third, 10);
      return hours * 3600 + minutes * 60 + seconds;
    } else if (first && second) {
      // Format mm:ss
      const minutes = parseInt(first, 10);
      const seconds = parseInt(second, 10);
      return minutes * 60 + seconds;
    }
  }

  // 2. Format liczbowy (pierwsza liczba z tekstu)
  const numberRegex = /^(\d+\.?\d*)/;
  const numberMatch = trimmed.match(numberRegex);

  if (numberMatch && numberMatch[1]) {
    return parseFloat(numberMatch[1]);
  }

  // 3. Wartości nieliczbowe
  return null;
}

/**
 * Oblicza sumę wyników z poszczególnych rund
 * @param roundDetails - Obiekt zawierający tablicę wyników z poszczególnych rund
 * @returns Suma wszystkich rund lub null jeśli dane są nieprawidłowe
 */
export function calculateRoundSum(roundDetails: { rounds: number[] } | null): number | null {
  if (!roundDetails?.rounds || !Array.isArray(roundDetails.rounds)) {
    return null;
  }

  if (roundDetails.rounds.length === 0) {
    return null;
  }

  // Walidacja - wszystkie rundy muszą być nieujemnymi liczbami
  const allValid = roundDetails.rounds.every(r =>
    typeof r === 'number' && !isNaN(r) && r >= 0 && Number.isFinite(r)
  );

  if (!allValid) {
    return null;
  }

  return roundDetails.rounds.reduce((sum, round) => sum + round, 0);
}
