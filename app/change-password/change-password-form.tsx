"use client";

import { useState, useEffect } from "react";
import { changePassword } from "./actions";

interface Props {
  userEmail: string;
}

export default function ChangePasswordForm({ userEmail }: Props) {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const regNo = userEmail.split("@")[0].toUpperCase();

  // Password rules validation
  const hasMinLength = password.length >= 8;
  const hasUppercase = /[A-Z]/.test(password);
  const hasLowercase = /[a-z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  const hasSpecialChar = /[^A-Za-z0-9]/.test(password);
  const isNotRegNo = password.toUpperCase() !== regNo;
  const passwordsMatch = password === confirmPassword && password !== "";

  const isFormValid =
    hasMinLength &&
    hasUppercase &&
    hasLowercase &&
    hasNumber &&
    hasSpecialChar &&
    isNotRegNo &&
    passwordsMatch;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isFormValid) {
      setError("Please satisfy all password security requirements.");
      return;
    }

    setError(null);
    setLoading(true);

    try {
      const formData = new FormData();
      formData.append("password", password);
      formData.append("confirmPassword", confirmPassword);

      const result = await changePassword(formData);
      if (result?.error) {
        setError(result.error);
      }
    } catch (err: any) {
      setError(err?.message || "An unexpected error occurred.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div 
          role="alert" 
          className="p-3 text-sm text-danger bg-danger/10 border border-danger/20 rounded-md"
        >
          {error}
        </div>
      )}

      <div>
        <label 
          htmlFor="new-password" 
          className="block text-sm font-semibold text-primary mb-2"
        >
          New Password
        </label>
        <input
          id="new-password"
          type="password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full px-4 py-3 rounded-lg border border-border bg-surface text-primary focus:outline-none focus:ring-2 focus:ring-secondary/50 focus:border-secondary transition-all"
        />
      </div>

      <div>
        <label 
          htmlFor="confirm-password" 
          className="block text-sm font-semibold text-primary mb-2"
        >
          Confirm New Password
        </label>
        <input
          id="confirm-password"
          type="password"
          required
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          className="w-full px-4 py-3 rounded-lg border border-border bg-surface text-primary focus:outline-none focus:ring-2 focus:ring-secondary/50 focus:border-secondary transition-all"
        />
      </div>

      {/* Password Requirements Checklist */}
      <div className="p-4 bg-bg rounded-xl border border-border space-y-2">
        <p className="text-xs font-semibold text-primary/60 mb-3">
          Password Requirements:
        </p>
        <ul className="text-xs space-y-1.5">
          <li className={`flex items-center gap-2 ${hasMinLength ? "text-success" : "text-primary/40"}`}>
            <span className="h-1.5 w-1.5 rounded-full bg-current" />
            At least 8 characters long
          </li>
          <li className={`flex items-center gap-2 ${hasUppercase && hasLowercase ? "text-success" : "text-primary/40"}`}>
            <span className="h-1.5 w-1.5 rounded-full bg-current" />
            Contains both uppercase and lowercase letters
          </li>
          <li className={`flex items-center gap-2 ${hasNumber ? "text-success" : "text-primary/40"}`}>
            <span className="h-1.5 w-1.5 rounded-full bg-current" />
            Contains at least one number
          </li>
          <li className={`flex items-center gap-2 ${hasSpecialChar ? "text-success" : "text-primary/40"}`}>
            <span className="h-1.5 w-1.5 rounded-full bg-current" />
            Contains at least one special character
          </li>
          <li className={`flex items-center gap-2 ${isNotRegNo ? "text-success" : "text-primary/40"}`}>
            <span className="h-1.5 w-1.5 rounded-full bg-current" />
            Must not equal your registration number ({regNo})
          </li>
          <li className={`flex items-center gap-2 ${passwordsMatch ? "text-success" : "text-primary/40"}`}>
            <span className="h-1.5 w-1.5 rounded-full bg-current" />
            Passwords match
          </li>
        </ul>
      </div>

      <button
        type="submit"
        disabled={loading || !isFormValid}
        className="w-full py-3 bg-primary hover:bg-primary/95 text-white font-semibold rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-secondary/50 disabled:opacity-50 transition-all cursor-pointer"
      >
        {loading ? "Updating Password..." : "Update Password"}
      </button>
    </form>
  );
}
