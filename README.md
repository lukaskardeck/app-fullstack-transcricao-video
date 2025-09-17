# Transcriber App.

Uma aplicação web que permite ao usuário realizar upload de arquivos `.mp3` e `.mp4` para **transcrição automática** dos mesmos.  
Este projeto foi desenvolvido como parte de um **desafio para o processo seletivo de estágio em desenvolvimento na [Liven](https://liven.tech/)**.

---

## 🚀 Tecnologias utilizadas

- **Frontend:** [Next.js](https://nextjs.org/) + [React](https://react.dev/)
- **Backend:** [Node.js](https://nodejs.org/) + [Express](https://expressjs.com/)
- **Autenticação:** [Firebase Authentication](https://firebase.google.com/docs/auth)
- **Armazenamento:** [Firestore](https://firebase.google.com/docs/firestore)
- **Transcrição:** [OpenAI API](https://platform.openai.com/docs/guides/speech-to-text)
- **Estilização:** [TailwindCSS](https://tailwindcss.com/)
- **Gerenciamento de dependências:** [Yarn](https://yarnpkg.com/)

---

## ✨ Funcionalidades principais

- 🔐 **Login e Registro** de usuários via Firebase  
- 📂 **Upload de arquivos** nos formatos `.mp3` e `.mp4`  
- 📏 **Validações automáticas**:  
  - Tamanho máximo de 200 MB  
  - Apenas arquivos MP3/MP4 aceitos  
  - Duração do arquivo não pode ultrapassar a cota diária disponível  
- ⏳ **Controle de cota diária** (limitada conforme plano do usuário)  
- ⚡ **Transcrição assíncrona** utilizando a API da OpenAI  
- 🖥️ Interface responsiva e intuitiva, com feedback visual para erros e progresso  

---

## 🖼️ Demonstração

### Tela de Registro
> ![tela-registro](/assets/tela-registro.png)

### Tela Inicial / Upload
> ![tela-home](/assets//tela-home.png)

---

## 📦 Como executar o projeto

### Pré-requisitos
- [Node.js](https://nodejs.org/) >= 18  
- [Yarn](https://yarnpkg.com/) instalado globalmente  

### Clone o repositório:

```bash
git clone https://github.com/lukaskardeck/app-fullstack-transcricao-video.git
cd app-fullstack-transcricao-video
```

### 2. Instale as dependências

Execute em cada pasta (`backend/` e `frontend/`):

```bash
yarn install
```

### 3. Configure as variáveis de ambiente

- **Backend**: Crie um arquivo `.env` com credenciais Firebase, OpenAI e configurações do servidor
- **Frontend**: Crie um arquivo `.env.local` com configurações do Firebase e endpoint da API

### 4. Execute o backend

```bash
cd backend
yarn dev
```

### 5. Execute o frontend

```bash
cd frontend
yarn dev
```

### 6. Acesse no navegador

👉 [http://localhost:3000](http://localhost:3000)

## 👤 Feito por Lukas Kardeck

- 💼 [LinkedIn](https://www.linkedin.com/in/lukaskardeck/)
- 💻 [GitHub](https://github.com/lukaskardeck)