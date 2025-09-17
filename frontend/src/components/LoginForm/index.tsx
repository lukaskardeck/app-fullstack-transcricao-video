"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../../../lib/firebase";
import { AiOutlineMail, AiOutlineLock } from "react-icons/ai";
import { getFirebaseErrorMessage } from "../../../lib/firebaseError";

interface LoginFormProps {
    onSwitch: () => void;
    onSuccess: (message: string, subMessage?: string) => void;
}

export default function LoginForm({ onSwitch, onSuccess }: LoginFormProps) {
    const router = useRouter();
    const [email, setEmail] = useState("");
    const [senha, setSenha] = useState("");
    const [msg, setMsg] = useState("");
    const [loading, setLoading] = useState(false);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!email.includes("@")) {
            setMsg("Insira um e-mail válido");
            return;
        }

        if (senha.length < 8) {
            setMsg("A senha deve ter pelo menos 8 caracteres");
            return;
        }

        try {
            setLoading(true);
            await signInWithEmailAndPassword(auth, email, senha);
            onSuccess("Login realizado com sucesso!", "Redirecionando...");
            router.push("/");
        } catch (err: any) {
            const code = err.code || "unknown";
            setMsg(getFirebaseErrorMessage(code));
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <h2 className="text-2xl font-bold mb-2">Bem-vindo de volta!</h2>
            <p className="text-gray-600 mb-6">Entre para continuar</p>

            <form onSubmit={handleLogin} className="flex flex-col gap-4">
                <div className="flex items-center border rounded-lg px-3 py-2 bg-gray-100">
                    <AiOutlineMail className="text-gray-500 mr-2" />
                    <input
                        type="email"
                        placeholder="E-mail"
                        className="bg-transparent w-full focus:outline-none"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                    />
                </div>

                <div className="flex items-center border rounded-lg px-3 py-2 bg-gray-100">
                    <AiOutlineLock className="text-gray-500 mr-2" />
                    <input
                        type="password"
                        placeholder="Senha"
                        className="bg-transparent w-full focus:outline-none"
                        value={senha}
                        onChange={(e) => setSenha(e.target.value)}
                    />
                </div>

                <button
                    disabled={loading}
                    className="bg-black text-white rounded-lg py-2 hover:bg-gray-800 transition duration-300 disabled:bg-gray-500 cursor-pointer"
                >
                    {loading ? "Entrando..." : "Entrar"}
                </button>
            </form>

            {msg && <p className="mt-4 text-center text-red-500">{msg}</p>}

            <p className="mt-6 text-center text-gray-600">
                Não tem conta?{" "}
                <button
                    type="button"
                    className="text-black font-semibold cursor-pointer hover:underline"
                    onClick={onSwitch}
                >
                    Cadastre-se
                </button>
            </p>
        </>
    );
}
