"use server";

import {
  processDocumentAction,
  getText,
  checkJob,
} from "./processDocumentAction";
import { chatGPTCandidateResponse } from "./chatGPTCandidateResponse";

type ProcessResult = {
  success: boolean;
  message: string;
  jsongpt_text: string | null;
};

export const handleCreateNewProfesional = async (
  formData: FormData
): Promise<ProcessResult> => {
  try {
    const file = formData.get("cv") as File;
    if (!file) {
      return {
        success: false,
        message: "Archivo no proporcionado",
        jsongpt_text: null,
      };
    }

    // Convertir el archivo a un formato que pueda ser serializado
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Crear un nuevo File object del buffer
    const newFile = new File([buffer], file.name, { type: file.type });

    const documentResponse = await processDocumentAction(newFile);

    if (!documentResponse || documentResponse.status === "ERROR") {
      return {
        success: false,
        message:
          "Error al procesar el archivo o ID de transcripción no válido.",
        jsongpt_text: null,
      };
    }

    let respuestaJob = documentResponse;
    while (respuestaJob?.status === "PENDING") {
      await new Promise((resolve) => setTimeout(resolve, 40000));
      const jobStatus = await checkJob(documentResponse.id);

      if (!jobStatus) {
        return {
          success: false,
          message: "Error al verificar el estado del documento.",
          jsongpt_text: null,
        };
      }

      if (jobStatus.status === "ERROR") {
        return {
          success: false,
          message: `Error al procesar el documento: ${
            jobStatus.error_message || "Error desconocido"
          }`,
          jsongpt_text: null,
        };
      }

      respuestaJob = jobStatus;
    }

    if (respuestaJob.status === "SUCCESS") {
      const textoHTMLResult = await getText(respuestaJob.id);

      if (!textoHTMLResult?.text) {
        return {
          success: false,
          message: "No se pudo obtener el texto del CV.",
          jsongpt_text: null,
        };
      }

      const estandarizadoResult = await chatGPTCandidateResponse(
        textoHTMLResult.text
      );

      if (typeof estandarizadoResult !== "string") {
        return {
          success: false,
          message: "Error al procesar el texto con ChatGPT.",
          jsongpt_text: null,
        };
      }

      const cleanedHtml = estandarizadoResult
        .replace(/^```html\n/, "")
        .replace(/\n```$/, "");

      return {
        success: true,
        message: "CV procesado exitosamente",
        jsongpt_text: cleanedHtml,
      };
    }

    return {
      success: false,
      message: "Error inesperado al procesar el CV",
      jsongpt_text: null,
    };
  } catch (error) {
    console.error("Error al procesar el CV:", error);
    return {
      success: false,
      message:
        error instanceof Error ? error.message : "Error al procesar el CV",
      jsongpt_text: null,
    };
  }
};
