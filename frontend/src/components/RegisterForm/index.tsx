"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { auth } from "../../../lib/firebase";
import { AiOutlineMail, AiOutlineLock, AiOutlineUser } from "react-icons/ai";

interface RegisterFormProps {
    onSwitch: () => void;
    onSuccess: (message: string, subMessage?: string) => void;
}

export default function RegisterForm({ onSwitch, onSuccess }: RegisterFormProps) {
    const router = useRouter();
    const [nome, setNome] = useState("");
    const [email, setEmail] = useState("");
    const [senha, setSenha] = useState("");
    const [confirmSenha, setConfirmSenha] = useState("");
    const [msg, setMsg] = useState("");
    const [loading, setLoading] = useState(false);

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!email.includes("@")) {
            setMsg("Insira um e-mail válido");
            return;
        }
        if (senha.length < 8) {
            setMsg("A senha deve ter pelo menos 8 caracteres");
            return;
        }
        if (senha !== confirmSenha) {
            setMsg("As senhas não conferem");
            return;
        }

        try {
            setLoading(true);
            const userCred = await createUserWithEmailAndPassword(auth, email, senha);
            const token = await userCred.user.getIdToken();

            await fetch("http://localhost:8080/api/user/register", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({ email, name: nome }),
            });

            onSuccess("Conta criada com sucesso!", "Redirecionando...");
            setTimeout(() => router.push("/"), 1500);
        } catch (err: any) {
            setMsg("Erro: " + err.message);
        } finally {
            setLoading(false);
        }
    };


    return (
        <>
            <h2 className="text-2xl font-bold mb-2">Olá!</h2>
            <p className="text-gray-600 mb-6">Crie sua conta para começar</p>

            <form onSubmit={handleRegister} className="flex flex-col gap-4">
                <div className="flex items-center border rounded-lg px-3 py-2 bg-gray-100">
                    <AiOutlineUser className="text-gray-500 mr-2" />
                    <input
                        type="text"
                        placeholder="Nome completo"
                        className="bg-transparent w-full focus:outline-none"
                        value={nome}
                        onChange={(e) => setNome(e.target.value)}
                    />
                </div>

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

                <div className="flex items-center border rounded-lg px-3 py-2 bg-gray-100">
                    <AiOutlineLock className="text-gray-500 mr-2" />
                    <input
                        type="password"
                        placeholder="Confirmar senha"
                        className="bg-transparent w-full focus:outline-none"
                        value={confirmSenha}
                        onChange={(e) => setConfirmSenha(e.target.value)}
                    />
                </div>

                <button
                    disabled={loading}
                    className="bg-black text-white rounded-lg py-2 hover:bg-gray-800 transition duration-300 disabled:bg-gray-500 cursor-pointer "
                >
                    {loading ? "Criando conta..." : "Cadastrar"}
                </button>
            </form>

            {msg && <p className="mt-4 text-center text-red-500">{msg}</p>}

            <p className="mt-6 text-center text-gray-600">
                Já tem conta?{" "}
                <button
                    type="button"
                    className="text-black font-semibold cursor-pointer hover:underline"
                    onClick={onSwitch}
                >
                    Entrar
                </button>
            </p>
        </>
    );
}
