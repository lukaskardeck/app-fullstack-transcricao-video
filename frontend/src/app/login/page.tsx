"use client";

import LoadingScreen from "@/components/LoadingScreen";
import LoginForm from "@/components/LoginForm";
import RegisterForm from "@/components/RegisterForm";
import { useState } from "react";

export default function AuthPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [successfulRegistration, setSuccessfulRegistration] = useState<null | { message: string; subMessage?: string }>(null);

  if (successfulRegistration) {
    return (
      <LoadingScreen
        message={successfulRegistration.message}
        subMessage={successfulRegistration.subMessage}
      />
    );
  }

  return (
    <div className="flex min-h-screen">
      {/* Lado esquerdo (branding) */}
      <div className="w-1/2 bg-gradient-to-b from-gray-900 to-black flex items-center justify-center">
        <h1 className="text-3xl font-bold text-white">TRANSCRIBER APP.</h1>
      </div>

      {/* Lado direito (form) */}
      <div className="w-1/2 flex items-center justify-center">
        <div className="w-full max-w-md px-8">
          {isLogin ? (
            <LoginForm
              onSwitch={() => setIsLogin(false)}
              onSuccess={(message, subMessage) => {
                setSuccessfulRegistration({ message, subMessage });
              }}
            />
          ) : (
            <RegisterForm
              onSwitch={() => setIsLogin(true)}
              onSuccess={(message, subMessage) => {
                setSuccessfulRegistration({ message, subMessage });
              }}
            />
          )}
        </div>
      </div>
    </div>
  );
}
