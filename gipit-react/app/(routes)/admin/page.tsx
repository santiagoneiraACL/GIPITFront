"use client";
import { useEffect, useState } from "react";
import DataGrid from "@/components/molecules/DataGrid";
import { fetchUsers, fetchRoles } from "@/app/actions/fetchUsers";
import { Column } from "@/app/lib/types";
import './admin.css';
import { useSearchParams } from "next/navigation";
import SearchBar from "@/components/molecules/SearchBar";
import Button from "@/components/atoms/Button";

interface User {
    id: number;
    name: string;
    email: string;
    position: string;
    roleName: string;
    companyName: string;
    managementName: string
}

interface Role {
    id: number;
    nombre: string;
}

function AdminPage() {
    const [users, setUsers] = useState<User[]>([]);
    const [totalUsers, setTotalUsers] = useState(0);
    const [roles, setRoles] = useState<Role[]>([]);
    const searchParams = useSearchParams();
    const page = parseInt(searchParams.get('page') || '1');
    const query = searchParams.get('query') || '';
    const role = searchParams.get('role') || '';
    const companyId = searchParams.get('companyId') || '';
    const managementId = searchParams.get('managementId') || '';  // Nuevo filtro

    useEffect(() => {
        const loadData = async () => {
            try {
                const userData = await fetchUsers(page, query, role, companyId, managementId);
                setUsers(userData.batch);
                setTotalUsers(userData.total);
                const roleData = await fetchRoles();
                setRoles(roleData);
            } catch (error) {
                console.error("Error al cargar datos:", error);
            }
        };

        loadData();
    }, [page, query, role, companyId]);

    const handleSearch = (term: string, selectedCompanyId?: string) => {
        const newSearchParams = new URLSearchParams(searchParams.toString());
        newSearchParams.set('query', term);
        if (selectedCompanyId) {
            newSearchParams.set('companyId', selectedCompanyId);
        }
        newSearchParams.set('page', '1');
        window.history.replaceState({}, '', `${window.location.pathname}?${newSearchParams}`);
    };

    const columns: Column<User>[] = [
        { name: "Nombre", key: "name", width: 2 },
        { name: "Email", key: "email", width: 2 },
        { name: "Cargo", key: "position", width: 1.5 },
        { name: "Rol", key: "roleName", width: 1.5 },
        { name: "Cliente", key: "companyName", width: 1.5 },
        { name: "Jefatura", key: "managementName", width: 1.5 }
    ];

    const roleOptions = [
        { value: "", label: "Todos los roles" },
        ...roles.map(role => ({
            value: role.nombre,
            label: role.nombre
        }))
    ];

    return (
        <div className="admin-container">
            <div className="search-and-button-container">
                <SearchBar 
                    roleOptions={roleOptions}
                    companyFilter={true}
                    defaultRole=""
                    onSearch={handleSearch}
                />
                <Button text="Crear Usuario" href="/admin/create" type="secondary" />
            </div>
            <DataGrid data={{ columns, total: totalUsers, batch: users }} baseUrl="/admin" />
        </div>
    );
}

export default AdminPage;