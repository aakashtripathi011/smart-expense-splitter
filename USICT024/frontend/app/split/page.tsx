"use client";

import Link from "next/link";
import { useState } from "react";

const initialPeople = [
  { id: 1, name: "You", selected: true },
  { id: 2, name: "Alex", selected: true },
  { id: 3, name: "Sam", selected: true },
  { id: 4, name: "Jordan", selected: false },
];

export default function Split() {
  const [amount, setAmount] = useState("");
  const [expenseName, setExpenseName] = useState("");
  const [people, setPeople] = useState(initialPeople);

  const selectedPeople = people.filter((person) => person.selected);

  const total = Number(amount) || 0;

  const share =
    selectedPeople.length > 0
      ? total / selectedPeople.length
      : 0;

  function togglePerson(id: number) {
    setPeople((current) =>
      current.map((person) =>
        person.id === id
          ? { ...person, selected: !person.selected }
          : person
      )
    );
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
          href="/receipt"
          className="text-xs uppercase tracking-wider text-slate-500 transition hover:text-white"
        >
          ← Receipt
        </Link>

      </nav>


      {/* MAIN */}
      <section className="mx-auto max-w-5xl px-6 py-12 md:px-10">

        {/* HEADER */}
        <div>

          <p className="text-xs uppercase tracking-[0.25em] text-blue-400">
            Split expense
          </p>

          <h1 className="mt-4 text-4xl font-semibold tracking-tight md:text-5xl">
            Who&apos;s paying?
          </h1>

          <p className="mt-5 text-sm leading-6 text-slate-400">
            Add the total and choose everyone who should
            be part of this expense.
          </p>

        </div>


        {/* CONTENT */}
        <div className="mt-12 grid gap-6 md:grid-cols-5">


          {/* LEFT */}
          <div className="space-y-6 md:col-span-3">

            {/* EXPENSE DETAILS */}
            <div className="rounded-2xl border border-white/10 bg-[#102038] p-7">

              <p className="text-xs uppercase tracking-[0.2em] text-slate-600">
                Expense
              </p>

              <div className="mt-6 space-y-5">

                <div>

                  <label className="mb-2 block text-xs text-slate-400">
                    What was it?
                  </label>

                  <input
                    value={expenseName}
                    onChange={(e) => setExpenseName(e.target.value)}
                    placeholder="Dinner, groceries..."
                    className="w-full rounded-xl border border-white/10 bg-[#091626] px-4 py-3.5 text-sm text-white outline-none placeholder:text-slate-600 focus:border-blue-400"
                  />

                </div>


                <div>

                  <label className="mb-2 block text-xs text-slate-400">
                    Total amount
                  </label>

                  <div className="flex items-center rounded-xl border border-white/10 bg-[#091626]">

                    <span className="px-4 text-slate-500">
                      ₹
                    </span>

                    <input
                      type="number"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      placeholder="0"
                      className="w-full bg-transparent py-3.5 pr-4 text-lg outline-none placeholder:text-slate-700"
                    />

                  </div>

                </div>

              </div>

            </div>


            {/* PEOPLE */}
            <div className="rounded-2xl border border-white/10 bg-[#102038] p-7">

              <div className="flex items-center justify-between">

                <div>

                  <p className="text-xs uppercase tracking-[0.2em] text-slate-600">
                    People
                  </p>

                  <p className="mt-2 text-sm text-slate-400">
                    Who should pay?
                  </p>

                </div>

                <span className="text-xs text-blue-400">
                  {selectedPeople.length} selected
                </span>

              </div>


              <div className="mt-6 space-y-2">

                {people.map((person) => (

                  <button
                    key={person.id}
                    onClick={() => togglePerson(person.id)}
                    className={`flex w-full items-center justify-between rounded-xl border px-4 py-4 text-left transition ${
                      person.selected
                        ? "border-blue-400/30 bg-[#132a47]"
                        : "border-white/5 bg-[#091626] hover:border-white/10"
                    }`}
                  >

                    <div className="flex items-center gap-3">

                      <div
                        className={`flex h-9 w-9 items-center justify-center rounded-full text-xs ${
                          person.selected
                            ? "bg-blue-400 text-[#152238]"
                            : "bg-[#1a304d] text-slate-500"
                        }`}
                      >
                        {person.name.charAt(0)}
                      </div>

                      <span className="text-sm">
                        {person.name}
                      </span>

                    </div>

                    <span
                      className={`text-xs ${
                        person.selected
                          ? "text-blue-400"
                          : "text-slate-700"
                      }`}
                    >
                      {person.selected ? "✓" : "+"}
                    </span>

                  </button>

                ))}

              </div>

            </div>

          </div>


          {/* RIGHT SUMMARY */}
          <div className="md:col-span-2">

            <div className="sticky top-6 rounded-2xl border border-white/10 bg-[#102038] p-7">

              <p className="text-xs uppercase tracking-[0.2em] text-slate-600">
                Equal split
              </p>


              <div className="mt-8">

                <p className="text-xs text-slate-500">
                  Total
                </p>

                <p className="mt-2 text-4xl font-semibold">
                  ₹{total.toFixed(2)}
                </p>

              </div>


              <div className="my-8 h-px bg-white/10" />


              <div>

                <p className="text-xs text-slate-500">
                  Each person pays
                </p>

                <p className="mt-2 text-2xl text-blue-400">
                  ₹{share.toFixed(2)}
                </p>

              </div>


              <div className="mt-8 space-y-3">

                {selectedPeople.map((person) => (

                  <div
                    key={person.id}
                    className="flex items-center justify-between text-sm"
                  >

                    <span className="text-slate-400">
                      {person.name}
                    </span>

                    <span>
                      ₹{share.toFixed(2)}
                    </span>

                  </div>

                ))}

              </div>


              <Link
                href="/settlement"
                className="mt-8 block w-full rounded-xl bg-white py-3.5 text-center text-xs font-semibold uppercase tracking-wider text-[#152238] transition hover:bg-slate-200"
              >
                Continue →
              </Link>

            </div>

          </div>

        </div>


        {/* STEP INDICATOR */}
        <div className="mt-14 flex items-center gap-3 text-[10px] uppercase tracking-[0.2em]">

          <span className="text-slate-600">
            01 Upload
          </span>

          <span className="text-blue-400">
            02 Split
          </span>

          <span className="text-slate-600">
            03 Settle
          </span>

        </div>

      </section>

    </main>
  );
}