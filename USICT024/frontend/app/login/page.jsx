"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

const slides = [
  {
    title: "DINNER WITH FRIENDS.",
    text: "Someone paid the bill.",
    highlight: "Someone still owes money.",
  },
  {
    title: "WEEKEND TRIP.",
    text: "Hotels, food, cabs.",
    highlight: "Split everything fairly.",
  },
  {
    title: "ROOMMATES.",
    text: "Rent. Groceries. Utilities.",
    highlight: "No more awkward calculations.",
  },
  {
    title: "GROUP PROJECT.",
    text: "One person bought everything.",
    highlight: "Everyone pays their share.",
  },
  {
    title: "JUST SPLIT IT.",
    text: "Track who paid.",
    highlight: "Know who owes what.",
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
    const response = await fetch(
      "http://localhost:5000/api/auth/login",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          password,
        }),
      }
    );

    const data = await response.json();

    if (!response.ok) {
      setError(data.message || "Login failed");
      return;
    }

    localStorage.setItem("token", data.token);
    localStorage.setItem("user", JSON.stringify(data.user));

    document.cookie = `token=${data.token}; path=/; max-age=604800; SameSite=Lax`;

    window.location.href = "/dashboard";
  } catch (error) {
    setError("Unable to connect to server");
  } finally {
    setLoading(false);
  }
};

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#0b192b] font-mono text-[#e8edf2]">

      {/* PAPER TEXTURE */}

      <div className="pointer-events-none fixed inset-0 z-50 opacity-[0.035]">
        <div
          className="h-full w-full"
          style={{
            backgroundImage:
              "radial-gradient(#d9e5ef 0.7px, transparent 0.7px)",
            backgroundSize: "6px 6px",
          }}
        />
      </div>

      {/* NAVBAR */}

      <nav className="relative z-10 mx-auto flex max-w-6xl items-center justify-between px-6 py-7 md:px-10">

        <Link
          href="/"
          className="text-2xl font-black tracking-[-0.08em]"
        >
          split<span className="text-[#5fa8d3]">.</span>
        </Link>

        <div className="rotate-[1deg] border border-[#30445a] bg-[#101f32] px-3 py-1.5 text-[10px] uppercase tracking-[0.2em] text-[#718397]">
          page 02 / login
        </div>

      </nav>

      {/* MAIN */}

      <div className="relative mx-auto flex min-h-[calc(100vh-90px)] max-w-6xl items-center px-6 pb-16 md:px-10">

        <div className="grid w-full items-center gap-16 lg:grid-cols-[1.05fr_0.95fr]">

          {/* LEFT — TEXT CAROUSEL */}

          <div className="relative hidden min-h-[600px] lg:block">

            {/* LABEL */}

            <div className="absolute left-4 top-5 z-20 rotate-[-2deg]">

              <p className="text-[10px] uppercase tracking-[0.25em] text-[#718397]">
                memories / 01
              </p>

            </div>

            {/* TEXT CARD */}

            <div
              className="
                absolute
                left-[8%]
                top-[13%]
                flex
                h-[420px]
                w-[430px]
                rotate-[-2deg]
                flex-col
                justify-center
                border-[9px]
                border-[#172a40]
                bg-[#172a40]
                p-10
                shadow-[7px_9px_0px_rgba(0,0,0,0.35)]
              "
            >

              {/* TAPE */}

              <div
                className="
                  absolute
                  -top-5
                  left-1/2
                  z-20
                  h-9
                  w-28
                  -translate-x-1/2
                  rotate-[2deg]
                  bg-[#526b80]
                  opacity-55
                "
              />

              {/* CAROUSEL CONTENT */}

              <div className="transition-opacity duration-700">

                <p className="mb-6 text-[10px] uppercase tracking-[0.3em] text-[#5fa8d3]">
                  split. / {String(currentSlide + 1).padStart(2, "0")}
                </p>

                <h2 className="max-w-sm text-4xl font-black uppercase leading-[0.95] tracking-[-0.07em] text-[#e8edf2]">
                  {slide.title}
                </h2>

                <p className="mt-8 text-sm leading-6 text-[#aab8c5]">
                  {slide.text}
                </p>

                <p className="mt-2 text-sm leading-6 text-[#5fa8d3]">
                  {slide.highlight}
                </p>

              </div>

              {/* SMALL HANDWRITTEN LINE */}

              <div className="absolute bottom-7 left-10 rotate-[-2deg] text-[9px] text-[#627487]">
                no awkward math required.
              </div>

            </div>

            {/* CAPTION */}

            <div className="absolute bottom-[10%] left-[12%] rotate-[-1deg] text-xs leading-5 text-[#718397]">

              <span className="text-[#aab8c5]">
                dinner with friends.
              </span>

              <br />

              <span className="text-[#5fa8d3]">
                somehow someone still owes money.
              </span>

            </div>

            {/* SLIDE COUNTER */}

            <div className="absolute bottom-[10%] right-[12%] text-[10px] tracking-widest text-[#627487]">

              {String(currentSlide + 1).padStart(2, "0")}
              {" / "}
              {String(slides.length).padStart(2, "0")}

            </div>

            {/* HAND-DRAWN ARROW */}

            <div className="absolute right-[4%] top-[14%] rotate-[8deg]">

              <svg
                width="100"
                height="70"
                viewBox="0 0 100 70"
                fill="none"
              >

                <path
                  d="M5 55 C30 15 60 12 90 20"
                  stroke="#5fa8d3"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                />

                <path
                  d="M78 12 L92 20 L80 29"
                  stroke="#5fa8d3"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                />

              </svg>

            </div>

          </div>

          {/* RIGHT — LOGIN */}

          <div className="w-full max-w-md lg:justify-self-end">

            <div
              className="
                relative
                rotate-[0.5deg]
                border-2
                border-[#40556b]
                bg-[#101f32]
                p-8
                shadow-[8px_9px_0px_rgba(0,0,0,0.35)]
                md:p-10
              "
            >

              {/* TAPE */}

              <div
                className="
                  absolute
                  -top-4
                  right-16
                  h-8
                  w-24
                  rotate-[-2deg]
                  bg-[#526b80]
                  opacity-50
                "
              />

              {/* MOBILE LOGO */}

              <div className="mb-10 md:hidden">

                <Link
                  href="/"
                  className="text-xl font-black tracking-[-0.06em]"
                >
                  split<span className="text-[#5fa8d3]">.</span>
                </Link>

              </div>

              {/* HEADING */}

              <div className="mb-9">

                <p className="mb-3 rotate-[-1deg] text-[10px] font-bold uppercase tracking-[0.25em] text-[#5fa8d3]">
                  welcome back
                </p>

                <h1 className="text-5xl font-black uppercase tracking-[-0.07em] text-[#e8edf2]">
                  LOG IN.
                </h1>

                <p className="mt-4 max-w-xs text-xs leading-5 text-[#718397]">
                  Continue where you left off.
                  <br />
                  Your group is waiting.
                </p>

              </div>

              {/* FORM */}

              <form
                onSubmit={handleLogin}
                className="space-y-6"
              >

                {/* EMAIL */}

                <div>

                  <label
                    htmlFor="email"
                    className="mb-2 block text-[11px] font-bold uppercase tracking-wider text-[#c2cfda]"
                  >
                    Email
                  </label>

                  <input
                    id="email"
                    type="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="
                      w-full
                      border
                      border-[#30445a]
                      bg-[#0b192b]
                      px-4
                      py-3.5
                      text-sm
                      text-[#e8edf2]
                      outline-none
                      transition
                      placeholder:text-[#52657a]
                      focus:border-[#5fa8d3]
                      focus:ring-1
                      focus:ring-[#5fa8d3]/30
                    "
                  />

                </div>

                {/* PASSWORD */}

                <div>

                  <div className="mb-2 flex items-center justify-between">

                    <label
                      htmlFor="password"
                      className="text-[11px] font-bold uppercase tracking-wider text-[#c2cfda]"
                    >
                      Password
                    </label>

                    <button
                      type="button"
                      className="text-[10px] text-[#5fa8d3] transition hover:text-[#83c3e8] hover:underline"
                    >
                      forgot?
                    </button>

                  </div>

                  <input
                    id="password"
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="
                      w-full
                      border
                      border-[#30445a]
                      bg-[#0b192b]
                      px-4
                      py-3.5
                      text-sm
                      text-[#e8edf2]
                      outline-none
                      transition
                      placeholder:text-[#52657a]
                      focus:border-[#5fa8d3]
                      focus:ring-1
                      focus:ring-[#5fa8d3]/30
                    "
                  />

                </div>

                {/* ERROR */}

                {error && (
                  <div className="border border-[#7c4e4e] bg-[#291d25] px-3 py-2 text-xs text-[#e58b8b]">
                    {error}
                  </div>
                )}

                {/* LOGIN BUTTON */}

                <button
                  type="submit"
                  disabled={loading}
                  className="
                    group
                    w-full
                    rotate-[-1deg]
                    border-2
                    border-[#52657a]
                    bg-[#5fa8d3]
                    py-3.5
                    text-sm
                    font-bold
                    text-[#07111f]
                    shadow-[5px_5px_0px_#050c15]
                    transition-all
                    hover:-translate-y-0.5
                    hover:rotate-[0deg]
                    hover:bg-[#73b7df]
                    hover:shadow-[7px_7px_0px_#050c15]
                    disabled:cursor-not-allowed
                    disabled:opacity-60
                  "
                >
                  {loading ? "CHECKING..." : "LOG IN →"}
                </button>

              </form>

              {/* DIVIDER */}

              <div className="my-8 flex items-center gap-4">

                <div className="h-px flex-1 bg-[#30445a]" />

                <span className="text-[9px] text-[#52657a]">
                  OR
                </span>

                <div className="h-px flex-1 bg-[#30445a]" />

              </div>

              {/* GUEST */}

              <Link
                href="/"
                className="
                  block
                  w-full
                  border-2
                  border-[#40556b]
                  bg-[#15263a]
                  py-3.5
                  text-center
                  text-xs
                  font-bold
                  text-[#c2cfda]
                  transition
                  hover:border-[#5b7085]
                  hover:bg-[#1a2d43]
                  hover:text-white
                "
              >
                CONTINUE AS GUEST
              </Link>

              {/* SIGN UP */}

              <p className="mt-7 text-center text-[11px] text-[#627487]">

                Dont have an account?{" "}

                <Link
                  href="/register"
                  className="font-bold text-[#5fa8d3] transition hover:text-[#83c3e8] hover:underline"
                >
                  Create one
                </Link>

              </p>

              {/* BACK */}

              <div className="mt-8 border-t border-[#30445a] pt-6 text-center">

                <Link
                  href="/"
                  className="text-[10px] uppercase tracking-widest text-[#627487] transition hover:text-[#aab8c5]"
                >
                  ← Back to home
                </Link>

              </div>

              {/* HANDWRITTEN NOTE */}

              <div className="absolute -bottom-12 right-0 rotate-[-4deg] text-[9px] text-[#5fa8d3]">

                <span className="block">
                  okay, lets settle
                </span>

                <span className="block text-right">
                  this thing.
                </span>

              </div>

            </div>

          </div>

        </div>

      </div>

    </main>
  );
}