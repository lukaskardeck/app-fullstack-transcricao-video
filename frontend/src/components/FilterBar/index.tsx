export type Filter = "all" | "pending" | "done" | "error";

export default function FilterBar({
  filter,
  setFilter,
}: {
  filter: Filter;
  setFilter: (f: Filter) => void;
}) {
  const filters = [
    { key: "all", label: "Todos" },
    { key: "pending", label: "Em processamento" },
    { key: "done", label: "Concluídos" },
    { key: "error", label: "Erros" },
  ];

  return (
    <div className="flex space-x-2 mb-4">
      {filters.map((f) => (
        <button
          key={f.key}
          onClick={() => setFilter(f.key as Filter)}
          className={`px-3 py-1 rounded-full text-xs ${
            filter === f.key
              ? "bg-gray-900 text-white"
              : "bg-gray-200 text-gray-700 hover:bg-gray-300"
          }`}
        >
          {f.label}
        </button>
      ))}
    </div>
  );
}
