import { AiOutlineQuestionCircle } from "react-icons/ai";

export default function Header({
  quota,
  userEmail,
  onLogout,
}: {
  quota: { used: number; limit: number; remaining: number; plan: string };
  userEmail: string | null;
  onLogout: () => void;
}) {
  return (
    <header className="flex justify-between items-center px-6 py-4 bg-white shadow">
      <h1 className="text-xl font-bold">Transcriber</h1>
      <div className="flex items-center space-x-6">
        {/* Badge de cotas */}
        <div className="relative group cursor-pointer">
          <span className="bg-gray-200 text-gray-800 px-3 py-1 rounded-full text-sm">
            Plano {quota.plan} <AiOutlineQuestionCircle className="inline mb-1" size={16} />
          </span>
          <div className="absolute right-0 mt-2 w-56 text-sm bg-white border rounded-lg shadow-lg px-4 py-2 hidden group-hover:block">
            <p><strong>Limite diário:</strong> {quota.limit}</p>
            <p><strong>Minutos usados:</strong> {quota.used}</p>
            <p><strong>Minutos restantes:</strong> {quota.remaining}</p>
          </div>
        </div>

        {/* Email + logout */}
        <div className="flex items-center space-x-3">
          <span className="text-sm">{userEmail}</span>
          <button
            onClick={onLogout}
            className="px-3 py-1 bg-gray-800 text-white rounded hover:bg-gray-900 text-sm cursor-pointer"
          >
            Logout
          </button>
        </div>
      </div>
    </header>
  );
}
