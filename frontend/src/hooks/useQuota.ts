import { useState } from "react";
import { User } from "firebase/auth";
import toast from "react-hot-toast";

interface Quota {
  used: number;
  limit: number;
  remaining: number;
  plan: string;
}

export function useQuota(user: User | null) {
  const [quota, setQuota] = useState<Quota>({ 
    used: 0, 
    limit: 0, 
    remaining: 0, 
    plan: "Free" 
  });

  const fetchQuota = async () => {
    if (!user) return;
    
    try {
      const token = await user.getIdToken();
      const res = await fetch("http://localhost:8080/api/user/quota", {
        headers: { Authorization: `Bearer ${token}` },
      });
      
      if (!res.ok) throw new Error("Falha ao buscar cota");
      
      const data = await res.json();
      setQuota(data);
    } catch (err: any) {
      toast.error("Erro ao buscar cota: " + err.message);
    }
  };

  return {
    quota,
    fetchQuota
  };
}