"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Button from "@/components/atoms/Button";
import { fetchUserDetails } from "@/app/actions/fetchUserDetails"; // Asegúrate de tener esta función para obtener los detalles del usuario
import './userid.css'; // Importa el CSS

// Define la interfaz para los datos del usuario
interface UserData {
  id: number;
  name: string;
  email: string;
  position: string;
  is_active: boolean;
  roles: { nombre: string };
  companies: { companyId: number; companyName: string }[];
  managements: {
    managementId: number;
    managementName: string;
    companyId: number;
    companyName: string;
  }[];
}

export default function UserDetailsPage() {
  const { userId } = useParams();
  const router = useRouter();
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadUserData = async () => {
      try {
        const data = await fetchUserDetails(userId as string);
        console.log("Datos del usuario cargados:", {
          nombre: data.name,
          email: data.email,
          cargo: data.position,
          rol: data.roles?.nombre,
          estado: data.is_active,
          compañía: data.companies?.[0]?.company?.name,
          jefatura: data.managements?.[0]?.management?.name
        });
        console.log("users_company:", data.companies);
        setUserData(data );
      } catch (error) {
        console.error("Error al cargar los detalles del usuario:", error);
      } finally {
        setLoading(false);
      }
    };

    loadUserData();
  }, [userId]);


  const handleEditUser = () => {
    router.push(`/admin/${userId}/edit`); // Redirige a la página de edición
  };

  if (loading) {
    return <div>Cargando...</div>;
  }

  if (!userData) {
    return <div>No se encontró el usuario.</div>;
  }

  return (
    <div className="user-details-container-idadmin">
      <h1>Detalles del Usuario</h1>
      <div>
        <p><strong>Nombre:</strong> {userData.name}</p>
        <p><strong>Email:</strong> {userData.email}</p>
        <p><strong>Cargo:</strong> {userData.position}</p>
        <p><strong>Rol:</strong> {userData.roles?.nombre || "Sin rol"}</p>
        <p><strong>Estado:</strong> {userData.is_active ? "Activo" : "Inactivo"}</p>
        
        {/* Mostrar compañía si el rol es Cliente (6) o Cliente-Gerente (2) */}
        {(userData.roles?.nombre === "Cliente-Gerente") && (
          <p><strong>Compañía:</strong> {userData.companies?.[0]?.companyName || "Sin compañía"}</p>
        )}
        
        {/* Mostrar jefatura si el rol es Cliente (6) */}
        {userData.roles?.nombre === "client" && (
          <>
            <p><strong>Compañía:</strong> {userData.managements?.[0]?.companyName || "Sin compañía"}</p> 
            <p><strong>Jefatura:</strong> {userData.managements?.[0]?.managementName || "Sin jefatura"}</p>
          </>
        )}
      </div>
      <div className="button-container-idadmin">
        <Button text="Modificar" type="primary" onClick={handleEditUser} />
      </div>
    </div>
  );
}
