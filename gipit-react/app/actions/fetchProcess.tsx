"use server";

import { Session } from "next-auth";

type Proceso = {
  id: number;
  name: string;
  startAt: string | null;
  endAt: string | null;
  preFiltered: number;
  candidates: number;
  status: string;
  candidatesIds: number[];
  jobOffer: string | null;
  stage: string;
  company: string;
  management?: string;
};

export const fetchProcess = async (page: number, query?: string, status?: string, companyId?: number, session?: Session) => {
  try {
    
    if (page < 1) {
      throw new Error("El número de página debe ser mayor que 0.");
    }


    // Construir la URL con el parámetro `query` opcional
    const url = new URL(`${process.env.NEXT_PUBLIC_API_URL}/api/process`);
    url.searchParams.set("page", page.toString());
    if (query) {
      url.searchParams.set("query", query);
    }
    if (status) {
      url.searchParams.set("status", status);
    }
    if (companyId) {
      url.searchParams.set("companyId", companyId.toString());
    }
    if (session?.user?.role) {
      url.searchParams.set("userRole", session.user.role);
    }
    if (session?.user?.managements?.[0]?.company?.id) {
      url.searchParams.set("userCompanyId", session.user.managements[0].company.id.toString());
    }

    const response = await fetch(url.toString(), {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      cache: "no-store",
    });


    

    if (!response.ok) {
      throw new Error(
        `Error al obtener los procesos: ${response.status} ${response.statusText}`
      );
    }

    const data = await response.json();
    // console.log("DATA FETCHPROCESS--> :", data.batch)
    console.log("Datos recibidos desde la API:", data);

    console.log(
      "URL utilizada para la API:",
      `${process.env.NEXT_PUBLIC_API_URL}/api/process?page=${page}`
    );
    return {
      total: data.total,
      batch: data.batch.map((process: Proceso) => {
        return{
        id: process.id,
        name: process.name,
        startAt: process.startAt ?? "No hay inicio",
        endAt: process.endAt ?? "No hay cierre",
        preFiltered: process.preFiltered ?? 0,
        candidates: process.candidates ?? 0,
        status: process.status ? process.status.charAt(0).toUpperCase() + process.status.slice(1) : "Desconocido",
        stage: process.stage ?? "Entrevistas",
        company: process.company ?? "No hay empresa",
        management: process.management ?? "No hay jefatura",
      }}),
    };
  } catch (error) {
    console.error("Error detallado:", error);
    throw new Error(
      `Error al obtener los procesos: ${
        error instanceof Error ? error.message : "Error desconocido"
      }`
    );
  }
};

export const fetchProcessDetails = async (
  id: number
): Promise<Proceso | null> => {
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/api/process/${id}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
        cache: "no-store",
      }
    );

    if (!response.ok) {
      throw new Error("Error al obtener los detalles del proceso");
    }

    const proceso = await response.json();

    const candidateProcess = Array.isArray(proceso.candidate_process)
      ? proceso.candidate_process
      : [];

    const candidatesIds = candidateProcess.map(
      (candidate: { id: number }) => candidate.id
    );

    return {
      id: proceso.processId,
      name: proceso.jobOffer,
      startAt: proceso.openedAt
        ? new Date(proceso.openedAt).toLocaleDateString()
        : "",
      endAt: proceso.closedAt
        ? new Date(proceso.closedAt).toLocaleDateString()
        : null,
      preFiltered: proceso.preFiltered ? 1 : 0,
      candidates: candidateProcess.length || 0,
      status: proceso.status ?? "",
      candidatesIds: candidatesIds,
      jobOffer: proceso.jobOfferDescription ?? "",
      stage: proceso.stage ?? "Desconocido",
      company: proceso.company ?? "Desconocido",
    };
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(
        `Error al obtener los detalles del proceso: ${
          error.message || "Error desconocido"
        }`
      );
    } else {
      throw new Error("Error desconocido al obtener los detalles del proceso");
    }
  }
};

export const fetchProcessCandidates = async (
  processId: number
): Promise<
  | {
      id: number;
      name: string;
      email: string;
      phone: string;
      address: string;
      jsongptText: string;
    }[]
  | null
> => {
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/api/process/${processId}`
    );

    if (!response.ok) {
      throw new Error(
        `Error al obtener los detalles del proceso: ${response.statusText}`
      );
    }

    const proceso = await response.json();

    if (!proceso.candidate_process || proceso.candidate_process.length === 0) {
      return [];
    }

    return proceso.candidate_process.map(
      (cp: {
        candidates: {
          id: number;
          name: string;
          email: string;
          phone: string;
          address: string;
          jsongpt_text: string;
        };
      }) => ({
        id: cp.candidates.id,
        name: cp.candidates.name,
        email: cp.candidates.email,
        phone: cp.candidates.phone,
        address: cp.candidates.address,
        jsongptText:
          cp.candidates.jsongpt_text || "No hay comentarios adicionales",
      })
    );
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(
        `Error al obtener los candidatos del proceso: ${
          error.message || "Error desconocido"
        }`
      );
    } else {
      throw new Error(
        "Error desconocido al obtener los candidatos del proceso"
      );
    }
  }
};
