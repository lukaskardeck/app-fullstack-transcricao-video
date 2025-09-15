interface LoadingScreenProps {
  message: string;
  subMessage?: string;
}

export default function LoadingScreen({ message, subMessage }: LoadingScreenProps) {
  return (
    <div className="flex items-center justify-center h-screen bg-white text-gray-900 flex-col">
      <p className="text-xl font-bold mb-2">{message}</p>
      {subMessage && <p>{subMessage}</p>}
    </div>
  );
}