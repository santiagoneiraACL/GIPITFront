"use client";
import React, { useState, useEffect } from "react";
import Modal from "@/components/molecules/Modal";
import { FormInputsRow } from "@/app/lib/types";
import { handleCreateProcess } from "@/app/actions/handleCreateProcess";
import { fetchListCompanies, fetchUserCompanies } from "@/app/actions/fetchCompanies";
import { toast } from "react-toastify";
import Loader from "@/components/atoms/Loader";
import { processSchema } from "@/app/lib/validationSchemas";
import { useSession } from 'next-auth/react';

type Client = {
  id: number;
  name: string;
  managements: { id: number; name: string }[]; // Jefaturas del cliente
};

const Page = () => {
  const { data: session } = useSession();
  const [clientsList, setClientsList] = useState<Client[]>([]);
  const [selectedClientId, setSelectedClientId] = useState<number | null>(null);
  const [managements, setManagements] = useState<{ id: number; name: string }[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const getClients = async () => {
      setIsLoading(true);
      try {
        let companies;
        
        if (session?.user?.id && session?.user?.role) {
          if (session.user.role === 'client') {
            // Para usuarios client, usar sus managements del session
            companies = session.user.managements?.map(m => ({
              id: m.company.id,
              name: m.company.name,
              managements: [{
                id: m.id,
                name: m.name
              }]
            })) || [];
          } else if (session.user.role === 'Cliente-Gerente') {
            // Para Cliente-Gerente, obtener su compañía y todas sus jefaturas
            const userCompanies = await fetchUserCompanies(session.user.id, session.user.role);
            companies = userCompanies;
            
            // Obtener todas las jefaturas de la compañía
            if (companies.length > 0) {
              const response = await fetch(
                `${process.env.NEXT_PUBLIC_API_URL}/api/management?company_id=${companies[0].id}`
              );
              const managementsData = await response.json();
              companies[0].managements = managementsData;
            }
          } else {
            // Para otros roles, obtener todas las compañías
            companies = await fetchListCompanies();
          }
          
          setClientsList(companies);
          
          // Seleccionar la primera compañía por defecto
          if (companies.length > 0) {
            setSelectedClientId(companies[0].id);
            setManagements(companies[0].managements || []);
          }
        }
      } catch (error) {
        setError("Error al obtener la lista de compañías: " + (error instanceof Error ? error.message : 'Error desconocido'));
      } finally {
        setIsLoading(false);
      }
    };

    getClients();
  }, [session]);

  // Actualizar las jefaturas al seleccionar un cliente
  useEffect(() => {
    console.log("Cliente seleccionado:", selectedClientId);
    if (selectedClientId) {
      const selectedClient = clientsList.find(
        (client) => client.id === selectedClientId
      );
      console.log("Jefaturas del cliente seleccionado:", selectedClient?.managements);
      setManagements(selectedClient?.managements || []);
    } else {
      setManagements([]);
    }
  }, [selectedClientId, clientsList]);

  if (isLoading) {
    return <div><Loader /></div>;
  }

  if (error) {
    return (
      <div>
        <p style={{ color: "red" }}>{error}</p>
        <a href="/process">Volver</a>
      </div>
    );
  }

  const selectFieldOptions = clientsList.map((client) => ({
    name: client.name,
    value: client.id,
  }));

  const managementFieldOptions = [
    { name: "Selecciona una jefatura", value: "" }, // Opción por defecto
    ...managements.map((management) => ({
      name: management.name,
      value: management.id,
    })),
  ];

  const handleSubmit = async (
    formData: FormData
  ): Promise<{ message: string; route: string; statusCode: number }> => {
    try {
      const result = await handleCreateProcess(formData);

      if (result.message.startsWith("Proceso creado exitosamente")) {
        toast.success(result.message);
      } else {
        toast.success(result.message);
      }

      return { message: result.message, route: "/process", statusCode: 200 };
    } catch {
      toast.error("Error al procesar la solicitud");
      return {
        message: "Error al procesar la solicitud",
        route: "/process",
        statusCode: 500,
      };
    }
  };

  const fields: FormInputsRow = [
    {
      label: "Cliente",
      placeholder: "Seleccionar cliente",
      type: "select",
      name: "client",
      options: selectFieldOptions,
      value: selectedClientId || "",
      onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        if (e.target instanceof HTMLSelectElement) {
          setSelectedClientId(Number(e.target.value)); // Aseguramos que es un <select>
        }
      },
      disabled: session?.user?.role === "cliente", // Desactiva el campo si el usuario es cliente

    },
    {
      label: "Jefatura",
      placeholder: "Seleccionar jefatura",
      type: "select",
      name: "management_id",
      options: managementFieldOptions, // Opciones dinámicas basadas en el cliente seleccionado
      disabled: session?.user?.role === "cliente", // Desactiva el campo si el usuario es cliente
    },
    {
      label: "Perfil buscado",
      placeholder: "Perfil buscado",
      type: "text",
      name: "jobOffer",
    },
    {
      label: "Descripción de la vacante",
      name: "jobOfferDescription",
      placeholder: "Descripción de la vacante",
      type: "textarea",
      height: "40svh",
    },
    [
      { type: "cancel", value: "Cancelar", href: "/process" },
      { type: "submit", value: "Guardar" },
    ],
  ];

  return <Modal rows={fields} onSubmit={handleSubmit} title="Nuevo Proceso" validationSchema={processSchema} />;
};

export default Page;
