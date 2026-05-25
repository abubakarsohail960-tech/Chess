import { AuthForm } from "@/components/AuthForm";
import { Navbar } from "@/components/Navbar";

export default function RegisterPage() {
  return (
    <>
      <Navbar />
      <main className="flex min-h-[calc(100vh-60px)] items-center justify-center px-4 py-12">
        <AuthForm mode="register" />
      </main>
    </>
  );
}
