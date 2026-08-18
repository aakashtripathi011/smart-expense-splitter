"use client";

import Link from "next/link";
import { useState } from "react";

export default function Receipt() {
  const [fileName, setFileName] = useState("");

  function handleFile(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];

    if (file) {
      setFileName(file.name);
    }
  }

  return (
    <main className="min-h-screen bg-[#152238] font-mono text-white">

      {/* NAVBAR */}
      <nav className="flex items-center justify-between border-b border-white/10 px-6 py-5 md:px-10">

        <Link
          href="/dashboard"
          className="text-xl font-bold tracking-tight"
        >
          split<span className="text-blue-400">.</span>
        </Link>

        <Link
          href="/dashboard"
          className="text-xs uppercase tracking-wider text-slate-500 transition hover:text-white"
        >
          ← Dashboard
        </Link>

      </nav>


      {/* MAIN */}
      <section className="mx-auto max-w-4xl px-6 py-12 md:px-10">

        {/* HEADER */}
        <div>

          <p className="text-xs uppercase tracking-[0.25em] text-blue-400">
            New expense
          </p>

          <h1 className="mt-4 text-4xl font-semibold tracking-tight md:text-5xl">
            Add a receipt.
          </h1>

          <p className="mt-5 max-w-lg text-sm leading-6 text-slate-400">
            Upload a photo of your receipt and we&apos;ll
            turn it into an expense.
          </p>

        </div>


        {/* UPLOAD BOX */}
        <div className="mt-12">

          <label
            htmlFor="receipt"
            className="group flex min-h-[360px] cursor-pointer flex-col items-center justify-center rounded-3xl border border-dashed border-white/15 bg-[#102038] px-6 text-center transition duration-300 hover:border-blue-400/50 hover:bg-[#11233d]"
          >

            {/* ICON */}
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-[#1a304d] text-2xl text-blue-400 transition duration-300 group-hover:scale-105 group-hover:bg-blue-400 group-hover:text-[#152238]">
              ↑
            </div>


            {/* TEXT */}
            <h2 className="mt-7 text-lg font-medium">
              {fileName ? fileName : "Upload your receipt"}
            </h2>

            <p className="mt-3 text-xs leading-6 text-slate-500">
              {fileName
                ? "Receipt selected."
                : "Click anywhere here to choose an image"}
            </p>


            {/* FILE TYPES */}
            {!fileName && (
              <p className="mt-6 text-[10px] uppercase tracking-[0.2em] text-slate-700">
                JPG · PNG · WEBP
              </p>
            )}

            <input
              id="receipt"
              type="file"
              accept="image/png,image/jpeg,image/webp"
              className="hidden"
              onChange={handleFile}
            />

          </label>

        </div>


        {/* CONTINUE */}
        <div className="mt-6 flex justify-end">

          <Link
            href="/split"
            className={`rounded-xl px-7 py-3.5 text-xs  text-white font-semibold uppercase tracking-wider transition ${
              fileName
                ? "bg-white text-[#152238] hover:bg-slate-200"
                : "pointer-events-none bg-[#1a304d] text-slate-600"
            }`}
          >
            Continue →
          </Link>

        </div>


        {/* INFO */}
        <div className="mt-16 grid gap-6 border-t border-white/10 pt-8 md:grid-cols-3">

          <div>
            <p className="text-xs text-white">
              01
            </p>

            <p className="mt-2 text-xs text-white">
              Upload
            </p>
          </div>

          <div>
            <p className="text-xs text-white">
              02
            </p>

            <p className="mt-2 text-xs text-white">
              Extract
            </p>
          </div>

          <div>
            <p className="text-xs text-white">
              03
            </p>

            <p className="mt-2 text-xs text-white">
              Split
            </p>
          </div>

        </div>

      </section>

    </main>
  );
}