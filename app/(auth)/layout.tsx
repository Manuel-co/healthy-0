import Link from "next/link";
import Image from "next/image";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[#fffef8] flex flex-col items-center justify-center px-4 py-12">
      <Link href="/" className="mb-8 flex items-center gap-2">
        <Image src="/logo.png" alt="HealthyZero" width={36} height={36} />
        <span className="font-heading font-extrabold text-lg text-[#071938]">HealthyZero</span>
      </Link>
      <div className="w-full max-w-md">{children}</div>
    </div>
  );
}
