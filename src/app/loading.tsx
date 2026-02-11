import Image from "next/image";

export default function Loading() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-navy-950">
      <div className="flex flex-col items-center gap-4">
        <Image
          src="/logo.png"
          alt="JuliSusu Logo"
          width={120}
          height={40}
          className="h-12 w-auto animate-pulse"
          priority
        />
      </div>
    </div>
  );
}
