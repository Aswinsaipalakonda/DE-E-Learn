import LoginForm from "./login-form";

export default function LoginPage() {
  return (
    <main className="min-h-screen flex items-center justify-center bg-bg px-4 py-12">
      <div className="w-full max-w-md bg-surface p-8 rounded-2xl border border-border shadow-sm">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-primary/5 text-secondary mb-4">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 14l9-5-9-5-9 5 9 5z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" />
            </svg>
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
