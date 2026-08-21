"use client";

import Link from "next/link";
import { useState } from "react";

export default function Register() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState("");

  const handleRegister = async (e) => {
    e.preventDefault();

    setError("");
    setSuccess("");
    setLoading(true);

    try {
      const response = await fetch(
        "http://localhost:5000/api/auth/signup",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            name,
            email,
            password,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        setError(data.message || "Registration failed");
        return;
      }

      setSuccess("Account created successfully!");

      setName("");
      setEmail("");
      setPassword("");

      setTimeout(() => {
        window.location.href = "/login";
      }, 1000);

    } catch (error) {
      console.error("Register error:", error);
      setError("Unable to connect to server");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#152238] font-mono text-white">

      <div className="flex min-h-screen items-center justify-center px-6 py-12">

        <div className="w-full max-w-md">

          {/* LOGO */}

          <div className="mb-12">

            <Link
              href="/"
              className="text-xl font-bold"
            >
              split<span className="text-blue-400">.</span>
            </Link>

          </div>

          {/* HEADING */}

          <div className="mb-10">

            <p className="mb-3 text-xs uppercase tracking-[0.2em] text-blue-400">
              get started
            </p>

            <h1 className="text-4xl font-semibold tracking-tight">
              Create account
            </h1>

            <p className="mt-3 text-sm text-slate-500">
              Start splitting expenses with your people.
            </p>

          </div>

          {/* FORM */}

          <form
            onSubmit={handleRegister}
            className="space-y-5"
          >

            {/* NAME */}

            <div>

              <label
                htmlFor="name"
                className="mb-2 block text-sm text-slate-300"
              >
                Name
              </label>

              <input
                id="name"
                type="text"
                placeholder="Your name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="w-full rounded-xl border border-slate-800 bg-[#091626] px-4 py-3.5 text-sm text-white outline-none transition placeholder:text-slate-600 focus:border-blue-400 focus:ring-1 focus:ring-blue-400"
              />

            </div>

            {/* EMAIL */}

            <div>

              <label
                htmlFor="email"
                className="mb-2 block text-sm text-slate-300"
              >
                Email
              </label>

              <input
                id="email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full rounded-xl border border-slate-800 bg-[#091626] px-4 py-3.5 text-sm text-white outline-none transition placeholder:text-slate-600 focus:border-blue-400 focus:ring-1 focus:ring-blue-400"
              />

            </div>

            {/* PASSWORD */}

            <div>

              <label
                htmlFor="password"
                className="mb-2 block text-sm text-slate-300"
              >
                Password
              </label>

              <input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
                className="w-full rounded-xl border border-slate-800 bg-[#091626] px-4 py-3.5 text-sm text-white outline-none transition placeholder:text-slate-600 focus:border-blue-400 focus:ring-1 focus:ring-blue-400"
              />

            </div>

            {/* ERROR */}

            {error && (
              <p className="text-sm text-red-400">
                {error}
              </p>
            )}

            {/* SUCCESS */}

            {success && (
              <p className="text-sm text-green-400">
                {success}
              </p>
            )}

            {/* CREATE BUTTON */}

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-xl bg-white py-3.5 text-sm font-semibold text-[#07111f] transition duration-200 hover:scale-[1.01] hover:bg-slate-200 disabled:opacity-50"
            >
              {loading ? "Creating..." : "Create account"}
            </button>

          </form>

          {/* LOGIN */}

          <p className="mt-7 text-center text-sm text-slate-500">

            Already have an account?{" "}

            <Link
              href="/login"
              className="text-blue-400 transition hover:text-blue-300"
            >
              Log in
            </Link>

          </p>

          {/* BACK */}

          <div className="mt-10 text-center">

            <Link
              href="/"
              className="text-xs text-slate-600 transition hover:text-slate-300"
            >
              ← Back to home
            </Link>

          </div>

        </div>

      </div>

    </main>
  );
}