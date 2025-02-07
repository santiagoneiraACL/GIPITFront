// page.tsx

import { fetchProcess } from "@/app/actions/fetchProcess";
import { authOptions } from "@/app/api/auth/authOptions";
import DataGrid from "@/components/molecules/DataGrid";
import EmptyState from "@/components/molecules/EmptyState";
import SearchBar from "@/components/molecules/SearchBar";
import StatusButton from "@/components/molecules/StatusButton";
import { IconUserSearch } from "@tabler/icons-react";
import { getServerSession } from "next-auth";

type Proceso = {
  id: number;
  name: string;
  startAt: string;
  endAt: string | null;
  preFiltered: number;
  candidates: number;
  status: string;
  candidatesIds: number[];
  jobOffer: string | null;
  stage: string;
  company: string;
  isInternal: boolean;
  management: string
};

interface Column<T> {
  name: string;
  key: keyof T;
  width: number;
}

interface ResponseData<T> {
  total: number;
  columns: Column<T>[];
  batch: T[];
}

export default async function Page(props: {
  searchParams?: Promise<{
    query?: string;
    page?: string;
    status?: string
    companyId?: number;
    managementId?: number;
  }>;
}) {
  const searchParams = await props.searchParams;
  const page = searchParams?.page ? parseInt(searchParams?.page) : 1;
  const query = searchParams?.query || ""; 
  const status = searchParams?.status || "";
  const companyId = searchParams?.companyId || "";
  const managementId = searchParams?.managementId || "";
  const session = await getServerSession(authOptions);
  if (!session) throw new Error('No se pudo obtener la sesión del servidor');

  let showCompanyFilter = true;
  if (session.user.role === 'client' || session.user.role === 'Cliente-Gerente') {
    showCompanyFilter = false;
  }

  const process = await fetchProcess(page, query, status, Number(companyId), Number(managementId), session);

  const data: ResponseData<Proceso> = {
    columns: [
      { name: "Nombre", key: "name", width: 2.0 },
      { name: "Cliente", key: "company", width: 1.5 },
      { name: "Jefatura", key: "management", width: 1.5 },
      { name: "Inicio", key: "startAt", width: 1.2 },
      { name: "Cierre", key: "endAt", width: 1.2 },
      { name: "Etapa", key: "stage", width: 1.2 },
      { name: "Pre Filtrados", key: "preFiltered", width: 1 },
      { name: "Candidatos", key: "candidates", width: 1 },
      { name: "Estado", key: "status", width: 0.6 },
    ],
    total: process.total,
    batch: process.batch.map((process: Proceso) => ({
      ...process,
      status: <StatusButton status={String(process.status)} />
    })),
  };

  const statusOptions = [
    { value: "", label: "Todos los estados" },
    { value: "activo", label: "Activo" },
    { value: "pending", label: "Pendiente" },
    { value: "cerrado", label: "Cerrado" }
  ];

  return (
    <div className="inner-page-container">
      <SearchBar 
        buttonLink="/process/new-process" 
        buttonText="Nuevo Proceso" 
        statusOptions={statusOptions}
        companyFilter={showCompanyFilter}
      />
      {process.total === 0 ? ( 
          <EmptyState
          icon={< IconUserSearch/>}
          title="No se encontraron procesos para mostrar"
          subheading="Podrás ver los procesos, cuando estén disponibles"
        />
      ) : (
        <DataGrid data={data} baseUrl="/process" />
      )}
    </div>
  );
}