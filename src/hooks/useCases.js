import { useState } from 'react';

export default function useCases() {
  const [cases, setCases] = useState([]);

  const addCase = (caseData) => {
    setCases((prev) => [
      ...prev,
      {
        id: Date.now(),
        ...caseData,
        status: 'active',
        date: new Date().toLocaleDateString('es-CO'),
      },
    ]);
  };

  const clearCases = () => setCases([]);

  return { cases, setCases, addCase, clearCases };
}
