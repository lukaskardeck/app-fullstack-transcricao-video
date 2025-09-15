export default function StatusBadge({ status }: { status: string }) {
  const map: Record<string, { text: string; bg: string; color: string }> = {
    pending: { text: "Em processamento", bg: "bg-yellow-100", color: "text-yellow-800" },
    done: { text: "Concluído", bg: "bg-green-100", color: "text-green-800" },
    error: { text: "Erro", bg: "bg-red-100", color: "text-red-800" },
  };
  const s = map[status] || { text: status, bg: "bg-gray-200", color: "text-gray-800" };

  return (
    <div className={`${s.bg} ${s.color} w-max px-2 py-1 rounded-full text-sm font-medium`}>
      {s.text}
    </div>
  );
}
