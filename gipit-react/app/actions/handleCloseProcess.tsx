'use server';

export async function handleCloseProcess(
  formData: FormData,
  actualRoute: string
): Promise<{ message: string; route: string; statusCode: number }> {
  const processId = formData.get("processId");

  if (!processId) {
    console.error("processId está vacío.");
    return {
      message: "ID de proceso faltante.",
      route: actualRoute,
      statusCode: 400,
    };
  }

  try {
    // 1. Cierra el proceso y crea candidate_management para candidatos seleccionados
    const closeProcessResponse = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/api/process/${processId}`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          action: "close",
        }),
      }
    );

    if (!closeProcessResponse.ok) {
      const errorData = await closeProcessResponse.json();
      throw new Error(errorData.error || 'Error al cerrar el proceso');
    }

    const result = await closeProcessResponse.json();

    return {
      message: result.message || "Proceso cerrado exitosamente y candidatos convertidos a profesionales",
      route: actualRoute,
      statusCode: 200,
    };
  } catch (error) {
    console.error("Error al manejar el cierre del proceso:", error);
    return {
      message: error instanceof Error ? error.message : "Error inesperado al cerrar el proceso",
      route: actualRoute,
      statusCode: 500,
    };
  }
}