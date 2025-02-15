"use client";
import { useEffect, useState } from "react";
import EmptyState from "@/components/molecules/EmptyState";
import { IconNews } from "@tabler/icons-react";

interface NewsItem {
  id: number; // o string, dependiendo de tu implementación
  title: string;
  content: string;
}

export default function Page() {
  const [news, setNews] = useState<NewsItem[]>([]);

  useEffect(() => {
    // Simulación de una llamada a la API para obtener noticias
    const fetchNews = async () => {
      // Aquí deberías hacer la llamada a tu API
      const response = await fetch("/api/news");
      const data = await response.json();
      setNews(data);
    };

    fetchNews();
  }, []);

  if (news.length === 0) {
    return (
      <EmptyState
        icon={<IconNews />}
        title="No hay noticias disponibles"
        subheading="Vuelve más tarde para ver las últimas actualizaciones."
      />
    );
  }

  return (
    <div>
      <h1>Noticias</h1>
      {/* Aquí renderiza la lista de noticias */}
      {news.map((item) => (
        <div key={item.id}>
          <h2>{item.title}</h2>
          <p>{item.content}</p>
        </div>
      ))}
    </div>
  );
}
