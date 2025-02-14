
import Button from "@/components/atoms/Button"; // Botones para acciones
import DashboardCard from "@/components/molecules/DashboardCard"; // Componentes de tarjetas de evaluación
import {
  IconAward,
  IconCircleDashedCheck,
  IconFlame,
  IconMessage2Share,
  IconStack3,
} from "@tabler/icons-react"; // Iconos para cada sección
import DataGrid from "@/components/molecules/DataGrid"; // Tabla de datos para evaluaciones
import { fetchProfessionalDetails } from "@/app/actions/fetchProfessionalDetails"; // Acción para obtener detalles profesionales


// Definición de la interfaz CandidateDetails
interface CandidateDetails {
  id: number;
  candidate_management_id: number;
  candidates: {
    name: string;
    email: string;
    avatar?: string;
  };
  position: string;
  rate?: string;
  post_sales_activities: Array<{
    date: string;
    eval_stack: number;
    eval_comunicacion: number;
    eval_motivacion: number;
    eval_cumplimiento: number;
  }>;
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
interface EvaluationItem {
  date: string;
  eval_stack: number;
  eval_comunicacion: number;
  eval_motivacion: number;
  eval_cumplimiento: number;
}

type DashboardData = Record<
  string,
  {
    title: string;
    hasChart: boolean;
    chartData: {
      labels?: string[];
      values: number[];
      diferencia?: string | null;
    };
    icon: JSX.Element;
  }
>;

const dashboardData: DashboardData = {
  card1: {
    title: "Promedio de evaluación",
    hasChart: true,
    chartData: {
      labels: ["Enero", "Febrero", "Marzo", "Abril", "Mayo"],
      values: [],
      diferencia: null
    },
    icon: <IconAward />,
  },
  card2: {
    title: "Dominio del stack tecnológico",
    hasChart: false,
    chartData: { values: [] },
    icon: <IconStack3 />,
  },
  card3: {
    title: "Habilidades de comunicación",
    hasChart: false,
    chartData: { values: [] },
    icon: <IconMessage2Share />,
  },
  card4: {
    title: "Responsabilidad y cumplimiento",
    hasChart: false,
    chartData: { values: [] },
    icon: <IconCircleDashedCheck />,
  },
  card5: {
    title: "Proactividad y motivación",
    hasChart: false,
    chartData: { values: [] },
    icon: <IconFlame />,
  },
};

interface Column<T> {
  name: string;
  key: keyof T;
  width: number;
}

// Interfaz genérica para datos de DataGrid
// eslint-disable-next-line @typescript-eslint/no-explicit-any
interface DataGridData<T = any> {
  columns: Column<T>[];
  total: number;
  batch: T[];
}

export default async function Page(props: {
  searchParams?: Promise<{ query?: string; page?: string }>;
  params: { proId: string };
}) {
  const { proId } = props.params;

  if (!proId) return <p>Error: El ID del profesional no está disponible.</p>;

  let professionalDetails: CandidateDetails;
  try {
    professionalDetails = await fetchProfessionalDetails(proId);
  } catch (error) {
    console.error("Error detallado:", error);
    return <div className="max-container">
      <p>Error cargando los detalles del profesional.</p>
      <p>Detalles: {error instanceof Error ? error.message : 'Error desconocido'}</p>
    </div>;
  }


  // Obtenemos los datos de evaluación y los ordenamos por fecha
  const evaluationData = [...professionalDetails.post_sales_activities].sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
  );

  // Calculamos los promedios
  const eval_motivacionPromedio = evaluationData.length > 0
    ? (evaluationData.reduce((sum, item) => sum + item.eval_motivacion, 0) / evaluationData.length).toFixed(1)
    : 0;

  const eval_comunicacionPromedio = evaluationData.length > 0
    ? (evaluationData.reduce((sum, item) => sum + item.eval_comunicacion, 0) / evaluationData.length).toFixed(1)
    : 0;

  const eval_cumplimientoPromedio = evaluationData.length > 0
    ? (evaluationData.reduce((sum, item) => sum + item.eval_cumplimiento, 0) / evaluationData.length).toFixed(1)
    : 0;

  const eval_stackPromedio = evaluationData.length > 0
    ? (evaluationData.reduce((sum, item) => sum + item.eval_stack, 0) / evaluationData.length).toFixed(1)
    : 0;

  // Asignamos los promedios a las tarjetas
  dashboardData.card2.chartData = {
    values: evaluationData.map(item => item.eval_stack),
    diferencia: eval_stackPromedio.toString()
  };

  dashboardData.card3.chartData = {
    values: evaluationData.map(item => item.eval_comunicacion),
    diferencia: eval_comunicacionPromedio.toString()
  };

  dashboardData.card4.chartData = {
    values: evaluationData.map(item => item.eval_cumplimiento),
    diferencia: eval_cumplimientoPromedio.toString()
  };

  dashboardData.card5.chartData = {
    values: evaluationData.map(item => item.eval_motivacion),
    diferencia: eval_motivacionPromedio.toString()
  };

  // Calculamos el promedio general para cada evaluación
  if (evaluationData.length > 0) {
    dashboardData.card1.chartData = {
      labels: evaluationData.map(item => 
        new Date(item.date).toLocaleDateString("es-ES", {
          day: "2-digit",
          month: "2-digit",
          year: "numeric",
        })
      ),
      values: evaluationData.map(item => 
        parseFloat(((item.eval_stack + 
          item.eval_comunicacion + 
          item.eval_cumplimiento + 
          item.eval_motivacion) / 4).toFixed(1))
      )
    };
  }

  // Datos para la tabla
  const dataGridData: DataGridData = {
    columns: [
      { name: "Fecha", key: "date", width: 1.1 },
      { name: "Stack", key: "stack", width: 1 },
      { name: "Comunicación", key: "comunicacion", width: 1 },
      { name: "Motivación", key: "motivacion", width: 1 },
      { name: "Cumplimiento", key: "cumplimiento", width: 1 },
      { name: "Promedio", key: "promedio", width: 1 },
      { name: "Acciones", key: "acciones", width: 1 },
    ],
    total: evaluationData.length,
    batch: evaluationData.map((item) => ({
      date: new Date(item.date).toLocaleDateString("es-ES", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      }),
      stack: item.eval_stack,
      comunicacion: item.eval_comunicacion,
      motivacion: item.eval_motivacion,
      cumplimiento: item.eval_cumplimiento,
      promedio: (
        (item.eval_comunicacion + item.eval_motivacion + item.eval_cumplimiento + item.eval_stack) / 4
      ).toFixed(1),
      acciones: <Button text="Editar" href={`/pros/${proId}/edit-evaluation/${item.date}`} type="secondary" />, // Cambié la ruta aquí
    })),
  };

  return (
    <div className="max-container">
      <div className="pro-details-container">
        <div className="pro-header">
          <div>
            <h4>{professionalDetails?.candidates.name || "Nombre no disponible"}</h4>
            <p>{professionalDetails?.candidates.email || "(correo@ejemplo.com)"}</p>
            <p>{professionalDetails?.position || "Posición no disponible"}</p>

            {/* Editar Profesional */}
            <div className="pro-buttons-container">
            <Button text="Editar Profesional" href={`/pros/${proId}/edit-profesional`} type="primary" />
            </div>


          </div>
        </div>
        <p className="section-title text-14">Evaluación profesional</p>
        <div className="pro-rates-dashboard">
          {Object.keys(dashboardData).map((key) => (
            <DashboardCard key={key} datos={dashboardData[key]} />
          ))}
        </div>
        
        <div className="pro-buttons-container pro-header">
          <div className="">
            <p className="section-title text-14">Historial de evaluaciones</p>
          </div>
          <div className="pro-buttons-container">
            <Button text="Nueva Evaluación" href={`/pros/${proId}/new-evaluation`} type="primary" />
          </div>
        </div>
        <DataGrid data={dataGridData} baseUrl={`/pros/${proId}`} />
      </div>
    </div>
  );
}