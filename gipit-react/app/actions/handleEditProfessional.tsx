"use server";

export async function handleEditProfessional(
  formData: FormData
): Promise<{ message: string; statusCode: number }> {
  const professionalId = formData.get("id") as string;
  const name = formData.get("name") as string;
  const rate = formData.get("rate") as string;

  console.log("Datos a enviar en la solicitud PUT:", { professionalId, name, rate });


  if (!professionalId) {
    return {
      message: "ID de profesional faltante",
      statusCode: 400,
    };
  }

  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/api/candidate_pros_management/${professionalId}`,
      {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, rate }),
      }
    );

    if (!response.ok) {
      throw new Error("Error al actualizar profesional");
    }

    return {
      message: "Profesional actualizado con éxito",
      statusCode: 200,
    };
  } catch (error) {
    console.error("Error inesperado al actualizar:", error);
    return {
      message: "Error inesperado al actualizar",
      statusCode: 500,
    };
  }
}