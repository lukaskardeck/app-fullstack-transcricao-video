export type Filter = "all" | "pending" | "done" | "error";

export default function FilterBar({
  filter,
  setFilter,
}: {
  filter: Filter;
  setFilter: (f: Filter) => void;
}) {
  const filters = [
    { 
      key: "all", 
      label: "Todos",
      activeClass: "bg-gray-900 text-white",
      inactiveClass: "bg-gray-200 text-gray-700 hover:bg-gray-300"
    },
    { 
      key: "pending", 
      label: "Em processamento",
      activeClass: "bg-yellow-600 text-white",
      inactiveClass: "bg-gray-200 text-gray-700 hover:bg-yellow-100 hover:text-yellow-700"
    },
    { 
      key: "done", 
      label: "Concluídos",
      activeClass: "bg-green-600 text-white",
      inactiveClass: "bg-gray-200 text-gray-700 hover:bg-green-100 hover:text-green-700"
    },
    { 
      key: "error", 
      label: "Erros",
      activeClass: "bg-red-600 text-white",
      inactiveClass: "bg-gray-200 text-gray-700 hover:bg-red-100 hover:text-red-700"
    },
  ];

  return (
    <div className="flex space-x-2 mb-4">
      {filters.map((f) => (
        <button
          key={f.key}
          onClick={() => setFilter(f.key as Filter)}
          className={`px-3 py-1 rounded-full text-xs cursor-pointer transition-colors duration-200 ${
            filter === f.key ? f.activeClass : f.inactiveClass
          }`}
        >
          {f.label}
        </button>
      ))}
    </div>
  );
}
