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
    <main className="relative min-h-screen overflow-hidden bg-[#0b192b] font-mono text-[#e8edf2]">

      {/* ================================================= */}
      {/* SUBTLE BACKGROUND DOODLES */}
      {/* ================================================= */}

      <div className="pointer-events-none absolute inset-0 overflow-hidden">


        {/* Top left circle */}

        <div
          className="
            absolute
            left-[8%]
            top-[16%]
            h-24
            w-24
            rotate-[-12deg]
            rounded-full
            border-2
            border-[#40556b]
            opacity-40
          "
        />


        {/* Top right ₹ */}

        <span
          className="
            absolute
            right-[12%]
            top-[13%]
            rotate-[12deg]
            text-5xl
            font-bold
            text-[#30445a]
          "
        >
          ₹
        </span>


        {/* Small plus */}

        <span
          className="
            absolute
            left-[16%]
            top-[37%]
            rotate-[10deg]
            text-3xl
            text-[#52657a]
            opacity-50
          "
        >
          +
        </span>


        {/* Arrow */}

        <div className="absolute right-[11%] top-[38%] rotate-[8deg] opacity-45">

          <svg
            width="110"
            height="70"
            viewBox="0 0 110 70"
            fill="none"
          >

            <path
              d="M8 55 C35 15 70 12 98 22"
              stroke="#5fa8d3"
              strokeWidth="2"
              strokeLinecap="round"
            />

            <path
              d="M86 14 L100 22 L87 31"
              stroke="#5fa8d3"
              strokeWidth="2"
              strokeLinecap="round"
            />

          </svg>

        </div>


        {/* Bottom left scribble */}

        <div className="absolute bottom-[16%] left-[10%] rotate-[-8deg] opacity-40">

          <svg
            width="100"
            height="80"
            viewBox="0 0 100 80"
            fill="none"
          >

            <path
              d="M10 55 C25 15 75 15 90 50"
              stroke="#52657a"
              strokeWidth="2"
              strokeLinecap="round"
            />

            <path
              d="M20 60 C35 30 65 30 80 60"
              stroke="#40556b"
              strokeWidth="2"
              strokeLinecap="round"
            />

          </svg>

        </div>


        {/* Bottom right handwritten text */}

        <div
          className="
            absolute
            bottom-[18%]
            right-[9%]
            rotate-[-7deg]
            text-[11px]
            leading-5
            text-[#52657a]
          "
        >
          <span className="text-[#5fa8d3]">
            friends
          </span>
          {" + "}
          <span>
            food
          </span>
          <br />
          <span>
            = chaos
          </span>
        </div>


        {/* Tiny dots */}

        <span className="absolute left-[25%] top-[20%] h-2 w-2 rounded-full bg-[#5fa8d3] opacity-50" />
        <span className="absolute right-[25%] bottom-[25%] h-1.5 w-1.5 rounded-full bg-[#52657a]" />

      </div>


      {/* ================================================= */}
      {/* MAIN */}
      {/* ================================================= */}

      <div className="relative z-10 flex min-h-screen items-center justify-center px-6 py-12">

        <div className="w-full max-w-md">


          {/* LOGO */}

          <div className="mb-10">

            <Link
              href="/"
              className="
                text-2xl
                font-black
                tracking-[-0.08em]
              "
            >
              split<span className="text-[#5fa8d3]">.</span>
            </Link>

          </div>


          {/* ================================================= */}
          {/* FORM CARD */}
          {/* ================================================= */}

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


            {/* Tape */}

            <div
              className="
                absolute
                -top-4
                left-16
                h-8
                w-24
                rotate-[-3deg]
                bg-[#526b80]
                opacity-45
              "
            />


            {/* Small doodle */}

            <span
              className="
                absolute
                right-7
                top-7
                rotate-[10deg]
                text-2xl
                text-[#52657a]
              "
            >
              +
            </span>


            {/* ================================================= */}
            {/* HEADING */}
            {/* ================================================= */}

            <div className="mb-9">

              <p className="mb-3 inline-block rotate-[-2deg] text-[10px] uppercase tracking-[0.25em] text-[#5fa8d3]">
                get started
              </p>


              <h1 className="text-4xl font-black uppercase tracking-[-0.06em]">
                Create account.
              </h1>


              <p className="mt-4 text-xs leading-6 text-[#718397]">
                Start splitting expenses
                <br />
                with your people.
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
                  className="
                    mb-2
                    block
                    text-[10px]
                    font-bold
                    uppercase
                    tracking-[0.15em]
                    text-[#c2cfda]
                  "
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
                    focus:ring-[#5fa8d3]/20
                  "
                />

              </div>


              {/* EMAIL */}

              <div>

                <label
                  htmlFor="email"
                  className="
                    mb-2
                    block
                    text-[10px]
                    font-bold
                    uppercase
                    tracking-[0.15em]
                    text-[#c2cfda]
                  "
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
                    focus:ring-[#5fa8d3]/20
                  "
                />

              </div>


              {/* PASSWORD */}

              <div>

                <label
                  htmlFor="password"
                  className="
                    mb-2
                    block
                    text-[10px]
                    font-bold
                    uppercase
                    tracking-[0.15em]
                    text-[#c2cfda]
                  "
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
                    focus:ring-[#5fa8d3]/20
                  "
                />

              </div>


              {/* ERROR */}

              {error && (
                <p className="border border-[#704b52] bg-[#291d25] px-3 py-2 text-xs text-[#e58b8b]">
                  {error}
                </p>
              )}


              {/* SUCCESS */}

              {success && (
                <p className="border border-[#405f5a] bg-[#182d2d] px-3 py-2 text-xs text-[#75c7b5]">
                  {success}
                </p>
              )}


              {/* CREATE BUTTON */}

              <button
                type="submit"
                disabled={loading}
                className="
                  mt-2
                  w-full
                  rotate-[-1deg]
                  border-2
                  border-[#52657a]
                  bg-[#5fa8d3]
                  py-3.5
                  text-sm
                  font-bold
                  uppercase
                  tracking-[0.08em]
                  text-[#07111f]
                  shadow-[5px_5px_0px_#050c15]
                  transition
                  duration-200
                  hover:translate-y-[-1px]
                  hover:rotate-0
                  hover:bg-[#73b7df]
                  disabled:cursor-not-allowed
                  disabled:opacity-50
                "
              >
                {loading ? "Creating..." : "Create account →"}
              </button>

            </form>


            {/* ================================================= */}
            {/* LOGIN */}
            {/* ================================================= */}

            <p className="mt-7 text-center text-xs text-[#627487]">

              Already have an account?{" "}

              <Link
                href="/login"
                className="
                  font-bold
                  text-[#5fa8d3]
                  transition
                  hover:text-[#83c3e8]
                  hover:underline
                "
              >
                Log in
              </Link>

            </p>


            {/* ================================================= */}
            {/* BACK */}
            {/* ================================================= */}

            <div className="mt-8 border-t border-[#30445a] pt-6 text-center">

              <Link
                href="/"
                className="
                  text-[10px]
                  uppercase
                  tracking-[0.2em]
                  text-[#52657a]
                  transition
                  hover:text-[#aab8c5]
                "
              >
                ← Back to home
              </Link>

            </div>


            {/* Tiny note */}

            <div className="absolute -bottom-11 right-2 rotate-[-4deg] text-[9px] text-[#5fa8d3]">
              more people,
              <br />
              less math.
            </div>

          </div>

        </div>

      </div>

    </main>
  );
}