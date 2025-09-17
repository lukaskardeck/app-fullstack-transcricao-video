export function getFirebaseErrorMessage(code: string): string {
  switch (code) {
    case "auth/email-already-in-use":
      return "Este e-mail já está em uso. Tente outro ou faça login.";
    case "auth/invalid-credential":
        return "Email e/ou senha inválidos"
    case "auth/invalid-email":
      return "O e-mail informado não é válido.";
    case "auth/user-disabled":
      return "Esta conta foi desativada.";
    case "auth/user-not-found":
      return "Usuário não encontrado. Verifique o e-mail ou cadastre-se.";
    case "auth/wrong-password":
      return "Senha incorreta. Tente novamente.";
    case "auth/weak-password":
      return "A senha é muito fraca. Escolha uma com pelo menos 6 caracteres.";
    case "auth/too-many-requests":
      return "Muitas tentativas de login. Tente novamente mais tarde.";
    case "auth/missing-password":
      return "Digite sua senha.";
    default:
      return "Ocorreu um erro inesperado. Tente novamente.";
  }
}
