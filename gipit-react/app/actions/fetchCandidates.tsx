interface CandidateResponse {
  id: number;
  name: string;
  role: string;
  company: string;
  start: string | null;
  end: string | null;
  rate: number;
  status: string;
  management: number;
}

export const fetchCandidates = async ({ 
  page, 
  query, 
  status,
  userRole,
  companyId,
  managementId
}: { 
  page: number; 
  query?: string; 
  status?: string;
  userRole?: string;
  companyId?: number;
  managementId?: number;
}) => {
  try {
    const params = new URLSearchParams();
    params.append('page', page.toString());
    if (query) params.append('query', query);
    if (status) params.append('status', status);
    if (userRole) params.append('userRole', userRole);
    if (companyId) params.append('companyId', companyId.toString());
    if (managementId) params.append('managementId', managementId.toString());

    const apiUrl = `${process.env.NEXT_PUBLIC_API_URL}/api/candidate_pros_management?${params.toString()}`;
    
    const response = await fetch(apiUrl, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      cache: 'no-store',
    });
    
    if (!response.ok) {
      throw new Error('Error al obtener los candidatos');
    }
    
    const data = await response.json();
    
    if (!data.batch || !Array.isArray(data.batch)) {
      console.error("Estructura inesperada en la respuesta de la API:", data);
      throw new Error('Se esperaba un array en batch en la respuesta de los candidatos');
    }

    const adaptedCandidates = data.batch.map((candidate: CandidateResponse) => {
      const formatDate = (dateString: string | null) => {
        if (!dateString) return null;
        const date = new Date(dateString);
        return new Date(date.getTime() + date.getTimezoneOffset() * 0).toLocaleDateString('es-ES', {
          year: 'numeric',
          month: '2-digit',
          day: '2-digit'
        });
      };

      return {
        id: candidate.id,
        name: candidate.name,
        role: candidate.role,
        company: candidate.company,
        start: formatDate(candidate.start),
        end: formatDate(candidate.end),
        rate: candidate.rate,
        status: candidate.status,
        management: candidate.management ?? "No Hay Jefatura"
      };
    });

    return {
      total: data.total,
      batch: adaptedCandidates
    };
  } catch (error) {
    console.error("Error al obtener los candidatos:", error);
    throw error;
  }
}