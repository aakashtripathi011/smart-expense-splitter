"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import Image from "next/image";

const slides = [
  {
    image: "/carousel/lana.jpg",
  },
  {
    image: "/carousel/office2.jpg",
  },
  {
    image: "/carousel/office3.jpg",
  },
  {
    image: "/carousel/office4.jpg",
  },
  {
    image: "/carousel/office5.jpg",
  },
];

export default function Login() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [email, setEmail] = useState("");
const [password, setPassword] = useState("");
const [error, setError] = useState("");
const [loading, setLoading] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 4500);

    return () => clearInterval(timer);
  }, []);

  const slide = slides[currentSlide];

  const handleLogin = async (e) => {
  e.preventDefault();

  setError("");
  setLoading(true);

  try {
    const response = await fetch("http://localhost:5000/api/auth/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email,
        password,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      setError(data.message || "Login failed");
      return;
    }

    localStorage.setItem("token", data.token);
    localStorage.setItem("user", JSON.stringify(data.user));

    window.location.href = "/dashboard";

  } catch (error) {
    setError("Unable to connect to server");
  } finally {
    setLoading(false);
  }
};

  return (
    <main className="min-h-screen bg-[#152238] font-mono text-white">

      <div className="flex min-h-screen">

        {/* ================= LEFT CAROUSEL ================= */}

        <div className="hidden w-1/2 items-center justify-center p-6 md:flex">

  <div className="relative h-[75vh] w-[90%] overflow-hidden rounded-3xl bg-[#0b192b]">

    <Image
      key={slide.image}
      src={slide.image}
      alt=""
      fill
      priority
      sizes="45vw"
      className="object-cover transition-opacity duration-700"
    />

  </div>

</div>


        {/* ================= RIGHT LOGIN ================= */}

        <div className="flex w-full items-center justify-center px-6 py-12 md:w-1/2">

          <div className="w-full max-w-md">

            {/* MOBILE LOGO */}

            <div className="mb-12 md:hidden">

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
                welcome back
              </p>

              <h2 className="text-4xl font-semibold tracking-tight">
                Log in
              </h2>

              <p className="mt-3 text-sm text-slate-500">
                Continue where you left off.
              </p>

            </div>


            {/* FORM */}

            <form onSubmit={handleLogin} className="space-y-5">

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
                  className="w-full rounded-xl border border-slate-800 bg-[#091626] px-4 py-3.5 text-sm text-white outline-none transition placeholder:text-slate-600 focus:border-blue-400 focus:ring-1 focus:ring-blue-400"
                />

              </div>


              {/* PASSWORD */}

              <div>

                <div className="mb-2 flex items-center justify-between">

                  <label
                    htmlFor="password"
                    className="text-sm text-slate-300"
                  >
                    Password
                  </label>

                  <button
                    type="button"
                    
                    className="text-xs text-blue-400 transition hover:text-blue-300"
                  >
                    Forgot password?
                  </button>

                </div>

                <input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                   value={password}
  onChange={(e) => setPassword(e.target.value)}
                  className="w-full rounded-xl border border-slate-800 bg-[#091626] px-4 py-3.5 text-sm text-white outline-none transition placeholder:text-slate-600 focus:border-blue-400 focus:ring-1 focus:ring-blue-400"
                />

              </div>

             {error && (
  <p className="text-sm text-red-400">
    {error}
  </p>
)}

              {/* LOGIN */}

              <button
                  type="submit"
                  disabled={loading}
                className="w-full rounded-xl bg-white py-3.5 text-sm font-semibold text-[#07111f] transition duration-200 hover:scale-[1.01] hover:bg-slate-200"
              >
                Log in
              </button>

            </form>


            {/* DIVIDER */}

            <div className="my-8 flex items-center gap-4">

              <div className="h-px flex-1 bg-slate-800" />

              <span className="text-[10px] text-slate-600">
                OR
              </span>

              <div className="h-px flex-1 bg-slate-800" />

            </div>


            {/* GUEST */}

            <Link
              href="/register"
              className="block w-full rounded-xl border border-slate-800 py-3.5 text-center text-sm text-slate-300 transition hover:border-slate-600 hover:bg-[#0b192b] hover:text-white"
            >
              Continue as guest
            </Link>


            {/* SIGN UP */}

            <p className="mt-7 text-center text-sm text-slate-500">

              Don't have an account?{" "}

              <Link
                href="/dashboard"
                className="text-blue-400 transition hover:text-blue-300"
              >
                Create one
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

      </div>

    </main>
  );
}