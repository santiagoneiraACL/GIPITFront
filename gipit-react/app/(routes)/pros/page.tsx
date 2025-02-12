import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/authOptions";
import { fetchCandidates } from "@/app/actions/fetchCandidates";
import DataGrid from "@/components/molecules/DataGrid";
import SearchBar from "@/components/molecules/SearchBar";
import StatusButton from "@/components/molecules/StatusButton";
import "./pros.css";


interface CandidateDetails {
  id: number;
  name: string;
  phone?: string;
  email?: string;
  address?: string;
  role?: string;
  company?: string; // Renombrado de 'client' a 'company'
  start?: string;
  end?: string;
  rate?: string;
  status?: string | React.ReactNode;
  management: string;
}

interface Column<T> {
  name: string;
  key: keyof T;
  width: number;
  render?: (value: T[keyof T]) => React.ReactNode;
}

interface ResponseData<T> {
  total: number;
  columns: Column<T>[]; 
  batch: T[];
}

const statusOptions = [
  { value: "", label: "Todos los estados" },
  { value: "activo", label: "Activo" },
  { value: "desvinculado", label: "Desvinculado" },
];

export default async function CandidatesPage({
  searchParams
}: {
  searchParams?: {
    query?: string;
    page?: string;
    status?: string;
    companyId?: string;
    managementId?: string;
  };
}) {
  // Obtener la sesión del servidor
  const session = await getServerSession(authOptions);
  const userRole = session?.user?.role;
  const companyId = searchParams?.companyId ? parseInt(searchParams.companyId) : undefined;
  const managementId = searchParams?.managementId ? parseInt(searchParams.managementId) : undefined;
  const page = searchParams?.page ? parseInt(searchParams.page) : 1;
  const query = searchParams?.query?.toLowerCase() || "";
  const status = searchParams?.status || "";
  if (!session) throw new Error('No se pudo obtener la sesión del servidor');

  let showCompanyFilter = true;
  if (session.user.role === 'client' || session.user.role === 'Cliente-Gerente') {
    showCompanyFilter = false;
  }

  // Fetch de candidatos
  const response = await fetchCandidates({ 
    page, 
    query, 
    status,
    userRole,
    companyId,
    managementId
  });

  if (!response || !response.batch) {
    return (
      <div className="inner-page-container">
        <div className="candidates-page-header">
          <SearchBar
            statusOptions={statusOptions}
            companyFilter={true}
          />
        </div>
        <p>No se encontraron candidatos que coincidan con los criterios de búsqueda.</p>
      </div>
    );
  }

  const candidatesList = response.batch.map((candidate: CandidateDetails) => ({
    ...candidate,
    start: candidate.start ?? undefined,
    end: candidate.end ?? undefined,
    status: <StatusButton status={String(candidate.status)} />,
  }));

  const columns: Column<CandidateDetails>[] = [
    { name: "Nombre", key: "name", width: 1.5 },
    { name: "Cliente", key: "company", width: 1.5 },
    { name: "Jefatura", key: "management", width: 1.5 },
    { name: "Fecha Inicio", key: "start", width: 1.2 },
    { name: "Fecha Término", key: "end", width: 1.2 },
    { name: "Valor HH", key: "rate", width: 1.5 },
    { 
      name: "Estado", 
      key: "status", 
      width: 1.2,
      render: (value: string | React.ReactNode) => {
        if (typeof value === 'string') {
          return <StatusButton status={value} />;
        }
        return value;
      }
    },
  ];

  const data: ResponseData<CandidateDetails> = {
    total: response.total,
    columns,
    batch: candidatesList,
  };

  return (
    <div className="inner-page-container">
      <div className="candidates-page-header">
        <SearchBar
          statusOptions={statusOptions}
          companyFilter={showCompanyFilter}
          buttonLink="/pros/new-profesional"
          buttonText="Nuevo Profesional"
        />
      </div>
      <div className="candidates-table-container">
        <div className="candidates-table">
          <DataGrid data={data} baseUrl="/pros" />
        </div>
      </div>
    </div>
  );
}