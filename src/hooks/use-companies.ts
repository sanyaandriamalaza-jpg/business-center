import { useState, useEffect } from 'react';
import { Company } from '../lib/type';

export default function useCompanies() {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCompanies = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch('/api/company');
      const result = await response.json();
      
      if (result.success) {
        setCompanies(result.data);
      } else {
        setError(result.message || 'Erreur lors du chargement des entreprises');
      }
    } catch (err) {
      setError('Erreur de connexion au serveur');
      console.error('Erreur fetchCompanies:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCompanies();
  }, []);

  return { companies, loading, error, refetch: fetchCompanies };
}