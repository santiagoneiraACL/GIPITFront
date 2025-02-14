'use client'

import Modal from "@/components/molecules/ModalDecimal";
import { FormInputsRow, FormResponse } from "@/app/lib/types";
import { fetchProfessionalDetails } from "@/app/actions/fetchProfessionalDetails";
import { useEffect, useState } from "react";
import { ProfessionalDetails } from '../../../../lib/types';
import { handleEditProfessional } from "@/app/actions/handleEditProfessional";
import Loader from "@/components/atoms/Loader";


export default function Page({ params }: { params: { proId: string } }) {
 
  const { proId } = params;
  const routeToRedirect = `/pros/${proId}`;
	const [detalleProfesional, setDetalleProfesional] = useState<null | ProfessionalDetails>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

	useEffect(() => {
		async function loadData() {
      try {
        setIsLoading(true);
        const details = await fetchProfessionalDetails(proId);
        setDetalleProfesional(details);
      } catch (error) {
        console.error("Error al obtener detalles del profesional:", error);
      } finally {
        setIsLoading(false);
      }
		}

		loadData();

	}, [proId])

	if (isLoading) {
		return <Loader />
	}

  const handleSubmit = async (formData: FormData): Promise<FormResponse> => {
    try {
			
    console.log('Iniciando envío del formulario');
      
    // 🔹 Agregamos el ID del profesional al formData
		formData.append("id", proId);

		// const details = await fetchProfessionalDetails(proId);
		// setDetalleProfesional(details);
		const response = await handleEditProfessional(formData);
      
		console.log('Respuesta de la actualización:', response);

		if (response.statusCode === 200) {
			// Actualizar la vista localmente sin recargar la página
			setDetalleProfesional((prev) => prev ? {
				...prev,
				candidates: { ...prev.candidates, name: formData.get("name") as string },
				rate: formData.get("rate") as string,
			} : null);
		}
		return {
			message: 'Cambio realizado con éxito',
			route: routeToRedirect,
			statusCode: 200
		};
      
    } catch (error) {
      console.error('Error al procesar el cambio de información:', error);
      return {
        message: 'Error al procesar la edición del profesional',
        route: routeToRedirect,
        statusCode: 500
      };
    }
  };

  const fields: FormInputsRow = [
    {
      label: "Nombre de profesional",
			placeholder: "Ingresa el nuevo nombre",
      type: "text",
      name: "name",
      defaultValue: detalleProfesional?.candidates?.name,
    },
		{
      label: "Salario",
			placeholder: "Ingresa el monto",
      type: "text",
      name: "rate",	
      defaultValue: detalleProfesional?.rate,
    },
    [
      { 
        type: "cancel", 
        value: "Cancelar", 
        href: routeToRedirect, 
        name: "cancel_button"
      },
      { 
        type: "submit", 
        value: "Guardar Cambios", 
        name: "submit_button"
      },
    ],
  ];

  return (
    <Modal
      rows={fields}
      onSubmit={handleSubmit}
      title="Editar Profesional"
    />
  );
}
