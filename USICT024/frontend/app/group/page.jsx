"use client";

import Link from "next/link";
import { useState } from "react";

const initialGroups = [
  {
    id: 1,
    name: "Goa Trip",
    members: 5,
    expenses: 8,
    amount: 12450,
  },
  {
    id: 2,
    name: "Roommates",
    members: 3,
    expenses: 14,
    amount: 6840,
  },
];

export default function Group() {
  const [groups, setGroups] = useState(initialGroups);
  const [showCreate, setShowCreate] = useState(false);
  const [groupName, setGroupName] = useState("");

  function createGroup() {
    if (!groupName.trim()) return;

    const newGroup = {
      id: Date.now(),
      name: groupName,
      members: 1,
      expenses: 0,
      amount: 0,
    };

    setGroups((current) => [...current, newGroup]);
    setGroupName("");
    setShowCreate(false);
  }

  return (
    <main className="min-h-screen bg-[#152238] font-mono text-white">

      {/* NAVBAR */}
      <nav className="flex items-center justify-between border-b border-white/10 px-6 py-5 md:px-10">

        <Link
          href="/dashboard"
          className="text-xl font-bold"
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
      <section className="mx-auto max-w-5xl px-6 py-12 md:px-10">

        {/* HEADER */}
        <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">

          <div>

            <p className="text-xs uppercase tracking-[0.25em] text-blue-400">
              Groups
            </p>

            <h1 className="mt-4 text-4xl font-semibold tracking-tight md:text-5xl">
              Your people.
            </h1>

            <p className="mt-5 text-sm leading-6 text-slate-400">
              Keep shared expenses organized in one place.
            </p>

          </div>


          <button
            onClick={() => setShowCreate(true)}
            className="rounded-xl bg-white px-6 py-3.5 text-xs font-semibold uppercase tracking-wider text-[#152238] transition hover:bg-slate-200"
          >
            + New group
          </button>

        </div>


        {/* CREATE GROUP */}
        {showCreate && (
          <div className="mt-10 rounded-2xl border border-blue-400/20 bg-[#102038] p-7">

            <p className="text-xs uppercase tracking-[0.2em] text-blue-400">
              New group
            </p>

            <div className="mt-5 flex flex-col gap-3 sm:flex-row">

              <input
                autoFocus
                value={groupName}
                onChange={(e) => setGroupName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    createGroup();
                  }
                }}
                placeholder="e.g. College trip"
                className="flex-1 rounded-xl border border-white/10 bg-[#091626] px-4 py-3.5 text-sm outline-none placeholder:text-slate-600 focus:border-blue-400"
              />

              <button
                onClick={createGroup}
                className="rounded-xl bg-blue-400 px-6 py-3.5 text-xs font-semibold text-[#152238] transition hover:bg-blue-300"
              >
                Create
              </button>

              <button
                onClick={() => setShowCreate(false)}
                className="rounded-xl border border-white/10 px-6 py-3.5 text-xs text-slate-400 transition hover:border-white/20 hover:text-white"
              >
                Cancel
              </button>

            </div>

          </div>
        )}


        {/* GROUPS */}
        <div className="mt-12">

          <div className="flex items-center justify-between">

            <h2 className="text-lg font-medium">
              My groups
            </h2>

            <span className="text-[10px] uppercase tracking-[0.2em] text-slate-600">
              {groups.length} GROUPS
            </span>

          </div>


          <div className="mt-5 grid gap-4 md:grid-cols-2">

            {groups.map((group) => (

              <div
                key={group.id}
                className="group rounded-2xl border border-white/10 bg-[#102038] p-7 transition duration-300 hover:-translate-y-1 hover:border-white/20"
              >

                {/* TOP */}
                <div className="flex items-start justify-between">

                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#1a304d] text-blue-400">
                    #
                  </div>

                  <span className="text-slate-700 transition group-hover:text-blue-400">
                    ↗
                  </span>

                </div>


                {/* NAME */}
                <h3 className="mt-7 text-xl font-medium">
                  {group.name}
                </h3>


                {/* META */}
                <div className="mt-3 flex gap-5 text-xs text-slate-500">

                  <span>
                    {group.members} members
                  </span>

                  <span>
                    {group.expenses} expenses
                  </span>

                </div>


                {/* AMOUNT */}
                <div className="mt-7 border-t border-white/10 pt-5">

                  <p className="text-[10px] uppercase tracking-wider text-slate-600">
                    Total expenses
                  </p>

                  <p className="mt-2 text-lg">
                    ₹{group.amount.toLocaleString("en-IN")}
                  </p>

                </div>

              </div>

            ))}

          </div>

        </div>


        {/* EMPTY / INFO */}
        <div className="mt-12 rounded-2xl border border-dashed border-white/10 px-6 py-10 text-center">

          <div className="mx-auto flex h-11 w-11 items-center justify-center rounded-full bg-[#102038] text-blue-400">
            +
          </div>

          <p className="mt-4 text-sm text-slate-400">
            Need another group?
          </p>

          <button
            onClick={() => setShowCreate(true)}
            className="mt-3 text-xs text-blue-400 transition hover:text-blue-300"
          >
            Create one →
          </button>

        </div>


        {/* FOOTER */}
        <div className="mt-14 flex gap-4 text-[10px] uppercase tracking-[0.2em]">

          <span className="text-blue-400">
            Groups
          </span>

          <span className="text-slate-700">
            ·
          </span>

          <span className="text-slate-600">
            Trips
          </span>

          <span className="text-slate-600">
            ·
          </span>

          <span className="text-slate-600">
            Dinners
          </span>

          <span className="text-slate-600">
            ·
          </span>

          <span className="text-slate-600">
            Roommates
          </span>

        </div>

      </section>

    </main>
  );
}