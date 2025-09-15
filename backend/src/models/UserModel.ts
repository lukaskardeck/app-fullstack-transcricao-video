import { db } from "../config/firebase";

export interface User {
  id: string;
  email: string;
  name?: string;
  plan: "Free" | "Pro";
  dailyLimitMinutes: number; // ex: free = 30, pro = 300
  createdAt: Date;
}

const collectionRef = db.collection("users");

// Obtém usuário pelo ID
export const getUserById = async (id: string): Promise<User | null> => {
  const doc = await collectionRef.doc(id).get();
  if (!doc.exists) return null;
  return { id: doc.id, ...doc.data() } as User;
};


// Cria usuário no firestore, se não existir
export const createUserIfNotExists = async (id: string, email: string, name?: string): Promise<User> => {
  const user = await getUserById(id);
  if (user) return user;

  const defaultUser: Omit<User, "id"> = {
    email,
    name,
    plan: "Free",
    dailyLimitMinutes: 20,
    createdAt: new Date(),
  };

  await collectionRef.doc(id).set(defaultUser);
  return { id, ...defaultUser };
};

