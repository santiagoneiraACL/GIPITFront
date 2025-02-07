"use client";
import { useState, useEffect } from 'react';
import "./searchBar.css";
import { useSearchParams, usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import { fetchListCompanies } from '@/app/actions/fetchCompanies';
import { fetchManagements } from '@/app/actions/fetchManagements';


interface Management {
  id: number;
  name: string;
}

interface Client {
  name: string;
  value: number;
}

interface StatusOption {
  value: string;
  label: string;
}

interface SearchBarProps {
  buttonLink?: string;
  buttonText?: string;
  statusOptions?: StatusOption[];
  defaultStatus?: string;
  yearOptions?: StatusOption[];
  defaultYear?: string;
  noSearch?: boolean;
  companyFilter?: boolean;
  managementFilter?: boolean;
  roleOptions?: StatusOption[];
  defaultRole?: string;
  onSearch?: (term: string) => void;
}

export default function SearchBar({ 
  buttonLink, 
  buttonText, 
  statusOptions, 
  defaultStatus,
  yearOptions,
  defaultYear,
  companyFilter = false,
  roleOptions,
  defaultRole,
  onSearch
}: SearchBarProps) {
  const [clients, setClients] = useState<Client[]>([]);
  const [managements, setManagements] = useState<Management[]>([]);
  const [selectedCompany, setSelectedCompany] = useState<number | null>(null);
  const [selectedManagement, setSelectedManagement] = useState<number | null>(null);
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const loadClients = async () => {
      try {
        const clientsList = await fetchListCompanies();
        const formattedClients = clientsList.map(client => ({
          name: client.name,
          value: client.id
        }));
        setClients(formattedClients);
      } catch (error) {
        console.error("Error al cargar los clientes:", error);
      }
    };

    loadClients();
  }, []);


  useEffect(() => {
    const loadManagements = async () => {
      if (selectedCompany) {
        const managementList = await fetchManagements(selectedCompany);
        setManagements(managementList);
      } else {
        setManagements([]);
      }
    };
    loadManagements();
  }, [selectedCompany]);


  const handleStatusChange = (status: string) => {
    const params = new URLSearchParams(searchParams);
    if (status) {
      params.set('status', status);
      console.log("Actualizando URL con parámetros:", params.toString());
    } else {
      params.delete('status');
    }
    router.replace(`${pathname}?${params.toString()}`);
  };

  const handleSearch = (term: string) => {
    const params = new URLSearchParams(searchParams);
    if (term) {
        params.set('query', term);
    } else {
        params.delete('query');
    }
    router.replace(`${pathname}?${params.toString()}`);
    if (onSearch) onSearch(term);
  };



  const handleCompanyChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const companyId = event.target.value;
  
    // Actualizar el estado
    setSelectedCompany(companyId ? parseInt(companyId) : null);
  
    // Actualizar los parámetros de búsqueda
    const params = new URLSearchParams(searchParams);
    if (companyId) {
      params.set("companyId", companyId);
      console.log("Actualizando URL con parámetros:", params.toString());
    } else {
      params.delete("companyId");
    }
  
    router.replace(`${pathname}?${params.toString()}`);
  };


  const handleManagementChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const managementId = event.target.value;
  
    // Actualizar el estado
    setSelectedManagement(managementId ? parseInt(managementId) : null);
  
    // Actualizar los parámetros de búsqueda
    const params = new URLSearchParams(searchParams);
    if (managementId) {
      params.set("managementId", managementId);
      console.log("Actualizando URL con parámetros:", params.toString());
    } else {
      params.delete("managementId");
    }
  
    router.replace(`${pathname}?${params.toString()}`);
  };

  const handleYearChange = (year: string) => {
    const params = new URLSearchParams(searchParams);
    if (year) {
      params.set('year', year);
    } else {
      params.delete('year');
    }
    router.replace(`${pathname}?${params.toString()}`);
  };

  const handleRoleChange = (role: string) => {
    const params = new URLSearchParams(searchParams);
    if (role) {
      params.set('role', role);
    } else {
      params.delete('role');
    }
    router.replace(`${pathname}?${params.toString()}`);
  };


  return (
    <div className="search-and-filter-container">
      <div className="search-filters-group">
        <input
          type="text"
          placeholder="Buscar..."
          onChange={(e) => handleSearch(e.target.value)}
          defaultValue={searchParams.get('query')?.toString()}
          className="search-input"
        />
        {statusOptions && (
          <select
            onChange={(e) => handleStatusChange(e.target.value)}
            defaultValue={searchParams.get('status')?.toString() || defaultStatus}
            className="status-select"
          >
            {statusOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        )}

        {companyFilter && (
          <select
          value={selectedCompany || ""}
          onChange={e =>handleCompanyChange(e)}
          defaultValue={searchParams.get('companyId')?.toString()}
          className="status-select"
        >
          <option value="">Todas las compañias</option>
          {clients.map((client) => (
            <option key={client.value} value={client.value}>
              {client.name}
            </option>
          ))}
        </select>
        )}


      {managements.length > 0 && (
              <select value={selectedManagement || ""} onChange={handleManagementChange} className="status-select">
                <option value="">Todas las jefaturas</option>
                {managements.map((management) => (
                  <option key={management.id} value={management.id}>
                    {management.name}
                  </option>
                ))}
              </select>
        )}


        {yearOptions && (
          <select
            onChange={(e) => handleYearChange(e.target.value)}
            defaultValue={searchParams.get('year')?.toString() || defaultYear}
            className="status-select"
          >
            {yearOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        )}

        {roleOptions && (
          <select
            onChange={(e) => handleRoleChange(e.target.value)}
            defaultValue={searchParams.get('role')?.toString() || defaultRole}
            className="status-select"
          >
            {roleOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        )}
      </div>
      {buttonLink && buttonText && (
        <Link href={buttonLink} className="new-invoice-button">
          {buttonText}
        </Link>
      )}
    </div>
  );
}
