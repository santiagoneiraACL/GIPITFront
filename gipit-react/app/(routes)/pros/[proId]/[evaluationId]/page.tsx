"use client";

import Modal from "@/components/molecules/ModalDecimal";
import { FormInputsRow, Evaluation, ProfessionalDetails } from "@/app/lib/types";
import { fetchEvaluationById } from "@/app/actions/fetchEvaluationById";
import { fetchProfessionalDetails } from "@/app/actions/fetchProfessionalDetails";
import { handleUpdateEvaluation } from "@/app/actions/handleUpdateEvaluation";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import Loader from "@/components/atoms/Loader";



function Page({ params }: { params: { proId: string; evaluationId: string } }) {
  const { proId, evaluationId } = params;

  console.log("Pro ID:", proId);
  console.log("Evaluación ID:", evaluationId);

  const routeToRedirect = `/pros/${proId}`;

  const [evaluationData, setEvaluationData] = useState<Evaluation | null>(null);
  const [professionalDetails, setProfessionalDetails] = useState<ProfessionalDetails | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSaving, setIsSaving] = useState<boolean>(false);

  const router = useRouter();

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const evalData = await fetchEvaluationById(parseInt(evaluationId));
        setEvaluationData(evalData);

        const proDetails = await fetchProfessionalDetails(proId);
        setProfessionalDetails(proDetails);
      } catch (error) {
        console.error("Error al obtener datos:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [evaluationId, proId]);

  const candidateName = professionalDetails?.candidates.name || "Nombre no disponible";

  const fields: FormInputsRow = [
    {
      label: "Fecha",
      placeholder: "Fecha de evaluación",
      type: "date",
      name: "date",
      defaultValue: evaluationData?.date ? new Date(evaluationData.date).toISOString().split("T")[0] : "",
      required: true,
    },
    [
    {
      label: "Dominio del stack tecnológico",
      placeholder: "Número de 0-7",
      type: "number",
      name: "eval_stack",
      required: true,
      defaultValue: evaluationData?.eval_stack,
      //isEvaluationPage: true,
    },
    {
      label: "Habilidades de comunicación",
      placeholder: "Número de 0-7",
      type: "number",
      name: "comunicacion",
      required: true,
      defaultValue: evaluationData?.eval_comunicacion,
    },
  ],
    [
      {
        label: "Responsabilidad",
        placeholder: "Número de 0-7",
        type: "number",
        name: "cumplimiento",
        required: true,
        min: "0",
        max: "7",
        defaultValue: evaluationData?.eval_cumplimiento,
      },
      {
        label: "Proactividad y motivación",
        placeholder: "Número de 0-7",
        type: "number",
        name: "motivacion",
        required: true,
        min: "0",
        max: "7",
        defaultValue: evaluationData?.eval_motivacion,
      },
    ],
    [
    {
      label: "Comentario de la jefatura",
      placeholder: "Comentario de la jefatura",
      type: "textarea",
      name: "comment",
      required: true,
      minLength: 10,
      defaultValue: evaluationData?.client_comment,
    },
    {
      label: "Acciones ACL",
      placeholder: "Acciones ACL",
      type: "textarea",
      name: "acciones",
      required: true,
      minLength: 10,
      defaultValue: evaluationData?.acciones_acl,
    },
  ],
  [
    {
      label: "Proyección del servicio",
      placeholder: "Proyección del servicio",
      type: "textarea",
      name: "proyecction",
      required: true,
      minLength: 10,
      defaultValue: evaluationData?.proyecction,
    },
    {
      label: "Beneficios",
      placeholder: "Beneficios del profesional",
      type: "textarea",
      name: "benefit",
      required: true,
      minLength: 10,
      defaultValue: evaluationData?.proyecction,
    },
  ],
    [
      { type: "cancel", value: "Cancelar", href: routeToRedirect },
      { type: "submit", value: "Guardar Nota" },
    ],
  ];

  const handleSubmit = async (formData: FormData): Promise<{ message: string; route: string; statusCode: number }> => {
    setIsSaving(true);
    try {
      const evalCumplimiento = parseFloat(formData.get("cumplimiento") as string);
      const evalStack = parseFloat(formData.get("eval_stack") as string);
      const evalComunicacion = parseFloat(formData.get("comunicacion") as string);
      const evalMotivacion = parseFloat(formData.get("motivacion") as string);

      if (isNaN(evalCumplimiento) || isNaN(evalStack) || isNaN(evalComunicacion) || isNaN(evalMotivacion)) {
        toast.error("Por favor, asegúrate de que todos los campos numéricos estén completos y sean válidos.");
        return {
          message: "Error al actualizar la evaluación",
          route: routeToRedirect,
          statusCode: 500,
        };
      }

      const formattedData: {
        date: string | null;
        eval_stack: number | null;
        eval_comunicacion: number | null;
        eval_motivacion: number | null;
        eval_cumplimiento: number | null;
        client_comment: FormDataEntryValue | null;
        acciones_acl: FormDataEntryValue | null;
        proyecction: FormDataEntryValue | null;
      } = {
        date: formData.get("date") ? new Date(formData.get("date") as string).toISOString() : null,
        eval_stack: evalStack,
        eval_comunicacion: evalComunicacion,
        eval_motivacion: evalMotivacion,
        eval_cumplimiento: evalCumplimiento,
        client_comment: formData.get("comment") ?? null,
        acciones_acl: formData.get("acciones") ?? null,
        proyecction: formData.get("proyecction") ?? null,
      };

      console.log("Datos a enviar:", formattedData);

      const response = await handleUpdateEvaluation(evaluationId, formattedData);

      console.log("Respuesta de onSubmit:", response);

      if (response && response.route) {
        router.push(response.route);
      } else {
        console.error("La respuesta no contiene 'route':", response);
      }

      return {
        message: "Evaluación actualizada con éxito",
        route: routeToRedirect,
        statusCode: 200,
      };
    } catch (error) {
      console.error("Error al actualizar:", error);
      return {
        message: "Error al actualizar la evaluación",
        route: routeToRedirect,
        statusCode: 500,
      };
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) return <Loader />;
  if (isSaving) return <Loader />;

  return (
    <Modal
      rows={fields}
      onSubmit={handleSubmit}
      title={`Evaluación de ${candidateName}`}
    />
  );
}

export default Page;