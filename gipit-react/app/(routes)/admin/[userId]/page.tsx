"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Modal from "@/components/molecules/Modal";
import { fetchUserDetails } from "@/app/actions/fetchUserDetails";
import './userid.css';

interface UserData {
  name: string;
  email: string;
  position: string;
  roles: { nombre: string };
  is_active: boolean;
  companies?: { companyName: string }[];
  managements?: { companyName: string; managementName: string }[];
}

export default function UserDetailsPage() {
  const { userId } = useParams();

  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadUserData = async () => {
      try {
        const data = await fetchUserDetails(userId as string);
        setUserData(data);
      } catch (error) {
        console.error("Error al cargar los detalles del usuario:", error);
      } finally {
        setLoading(false);
      }
    };

    loadUserData();
  }, [userId]);

  if (loading) {
    return <div>Cargando...</div>;
  }

  if (!userData) {
    return <div>No se encontró el usuario.</div>;
  }

  return (
    <Modal
      rows={[
        {
          label: "Nombre",
          type: "text" as const,
          name: "name",
          value: userData.name,
        },
        {
          label: "Email",
          type: "email" as const,
          name: "email",
          value: userData.email,
        },
        {
          label: "Cargo",
          type: "text" as const,
          name: "position",
          value: userData.position,
        },
        {
          label: "Rol",
          type: "text" as const,
          name: "role",
          value: userData.roles?.nombre,
        },
        {
          label: "Estado",
          type: "text" as const,
          name: "is_active",
          value: userData.is_active ? "Activo" : "Inactivo",
        },
        ...(userData.roles?.nombre === "client"
          ? [
              {
                label: "Compañía",
                type: "text" as const,
                name: "company",
                value: userData.managements?.[0]?.companyName || "Sin compañía",
              },
              {
                label: "Jefatura",
                type: "text" as const,
                name: "management",
                value: userData.managements?.[0]?.managementName || "Sin jefatura",
              },
            ]
          : userData.roles?.nombre === "Cliente-Gerente"
          ? [
              {
                label: "Compañía",
                type: "text" as const,
                name: "company",
                value: userData.companies?.[0]?.companyName || "Sin compañía",
              },
            ]
          : []),
        {
          type: "cancel" as const,
          value: "Cancelar",
          href: "/admin",
        },
        {
          type: "cancel" as const,
          value: "Modificar",
          href: `/admin/${userId}/edit`,
        },
      ]}
      onSubmit={async (formData: FormData, actualRoute: string) => {
        return { message: "Success", route: actualRoute, statusCode: 200 };
      }}
    />
  );
}
