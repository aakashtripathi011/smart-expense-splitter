"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

const API_URL = "http://localhost:5000/api";

export default function Group() {
const [groups, setGroups] = useState([]);
const [showCreate, setShowCreate] = useState(false);
const [showJoin, setShowJoin] = useState(false);
const [groupName, setGroupName] = useState("");
const [groupCode, setGroupCode] = useState("");
const [loading, setLoading] = useState(true);
const [creating, setCreating] = useState(false);
const [joining, setJoining] = useState(false);
const [error, setError] = useState("");

  // Fetch groups when page loads
  useEffect(() => {
    fetchGroups();
  }, []);

  async function fetchGroups() {
    try {
      setLoading(true);
      setError("");

      const token = localStorage.getItem("token");

      const response = await fetch(`${API_URL}/groups`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to fetch groups");
      }

      setGroups(data.groups);
    } catch (error) {
      console.error("Fetch groups error:", error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  }

  // Create group using backend API
  async function createGroup() {
    if (!groupName.trim()) return;

    try {
      setCreating(true);
      setError("");

      const token = localStorage.getItem("token");

      const response = await fetch(`${API_URL}/groups`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: groupName,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to create group");
      }

      setGroups((current) => [
        ...current,
        data.group,
      ]);

      setGroupName("");
      setShowCreate(false);

    } catch (error) {
      console.error("Create group error:", error);
      setError(error.message);
    } finally {
      setCreating(false);
    }
  }


  async function joinGroup() {
  if (!groupCode.trim()) return;

  try {
    setJoining(true);
    setError("");

    const token = localStorage.getItem("token");

    const response = await fetch(`${API_URL}/groups/join`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        code: groupCode.trim().toUpperCase(),
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Failed to join group");
    }

    await fetchGroups();

    setGroupCode("");
    setShowJoin(false);

  } catch (error) {
    console.error("Join group error:", error);
    setError(error.message);
  } finally {
    setJoining(false);
  }
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

          <div className="flex flex-col gap-3 sm:flex-row">

  <button
    onClick={() => {
      setShowJoin(true);
      setShowCreate(false);
    }}
    className="rounded-xl border border-white/10 px-6 py-3.5 text-xs font-semibold uppercase tracking-wider text-white transition hover:border-white/20 hover:bg-white/5"
  >
    Join group
  </button>

  <button
    onClick={() => {
      setShowCreate(true);
      setShowJoin(false);
    }}
    className="rounded-xl bg-white px-6 py-3.5 text-xs font-semibold uppercase tracking-wider text-[#152238] transition hover:bg-slate-200"
  >
    + New group
  </button>

</div>

        </div>

        {/* ERROR */}
        {error && (
          <div className="mt-6 rounded-xl border border-red-400/20 bg-red-400/10 px-5 py-4 text-sm text-red-300">
            {error}
          </div>
        )}

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
                disabled={creating}
                className="rounded-xl bg-blue-400 px-6 py-3.5 text-xs font-semibold text-[#152238] transition hover:bg-blue-300 disabled:opacity-50"
              >
                {creating ? "Creating..." : "Create"}
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

        {/* JOIN GROUP */}
{showJoin && (
  <div className="mt-6 rounded-2xl border border-blue-400/20 bg-[#102038] p-7">

    <p className="text-xs uppercase tracking-[0.2em] text-blue-400">
      Join group
    </p>

    <p className="mt-3 text-sm text-slate-400">
      Enter the group code shared by the group owner.
    </p>

    <div className="mt-5 flex flex-col gap-3 sm:flex-row">

      <input
        autoFocus
        value={groupCode}
        onChange={(e) => setGroupCode(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            joinGroup();
          }
        }}
        placeholder="e.g. ABC123"
        maxLength={6}
        className="flex-1 rounded-xl border border-white/10 bg-[#091626] px-4 py-3.5 text-sm uppercase outline-none placeholder:text-slate-600 focus:border-blue-400"
      />

      <button
        onClick={joinGroup}
        disabled={joining}
        className="rounded-xl bg-blue-400 px-6 py-3.5 text-xs font-semibold text-[#152238] transition hover:bg-blue-300 disabled:opacity-50"
      >
        {joining ? "Joining..." : "Join"}
      </button>

      <button
        onClick={() => {
          setShowJoin(false);
          setGroupCode("");
        }}
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

          {/* LOADING */}
          {loading && (
            <div className="mt-5 rounded-2xl border border-white/10 bg-[#102038] p-7 text-sm text-slate-500">
              Loading groups...
            </div>
          )}

          {/* GROUP CARDS */}
          {!loading && groups.length > 0 && (
            <div className="mt-5 grid gap-4 md:grid-cols-2">

              {groups.map((group) => (

                <Link
                  key={group.id}
                  href={`/group/${group.id}`}
                  className="group block rounded-2xl border border-white/10 bg-[#102038] p-7 transition duration-300 hover:-translate-y-1 hover:border-white/20"
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

                  {/* CODE */}
                  <p className="mt-2 text-xs text-blue-400">
                    Code: {group.code}
                  </p>

                  {/* META */}
                  <div className="mt-3 flex gap-5 text-xs text-slate-500">

                    <span>
                      {group.member_count || 1} members
                    </span>

                    <span>
                      0 expenses
                    </span>

                  </div>

                  {/* AMOUNT */}
                  <div className="mt-7 border-t border-white/10 pt-5">

                    <p className="text-[10px] uppercase tracking-wider text-slate-600">
                      Total expenses
                    </p>

                    <p className="mt-2 text-lg">
                      ₹0
                    </p>

                  </div>

                </Link>

              ))}

            </div>
          )}

          {/* NO GROUPS */}
          {!loading && groups.length === 0 && (
            <div className="mt-5 rounded-2xl border border-dashed border-white/10 px-6 py-10 text-center">

              <p className="text-sm text-slate-400">
                You haven't joined any groups yet.
              </p>

              <button
                onClick={() => setShowCreate(true)}
                className="mt-3 text-xs text-blue-400 transition hover:text-blue-300"
              >
                Create your first group →
              </button>

            </div>
          )}

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