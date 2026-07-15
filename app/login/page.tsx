import Image from "next/image";
import LoginForm from "./login-form";

export default function LoginPage() {
  return (
    <main className="min-h-screen flex items-center justify-center bg-bg px-4 py-12">
      <div className="w-full max-w-md bg-surface p-8 rounded-2xl border border-border shadow-sm">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full overflow-hidden border border-border shadow-xs mb-4">
            <Image
              src="/De_logo.jpg"
              alt="Department of Data Engineering Logo"
              width={64}
              height={64}
              priority
              className="object-cover"
            />
          </div>
          <h1 className="text-2xl font-bold text-primary tracking-tight">
            Data Engineering Portal
          </h1>
          <p className="text-sm text-primary/60 mt-1">
            Department of Data Engineering, MVGR College
          </p>
        </div>

        <LoginForm />

        <div className="mt-8 pt-6 border-t border-border text-center">
          <p className="text-xs text-primary/40">
            For students: Your initial password is your registration number.
          </p>
        </div>
      </div>
    </main>
  );
}
