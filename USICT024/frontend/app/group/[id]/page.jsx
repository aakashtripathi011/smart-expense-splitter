"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";

const API_URL = "http://localhost:5000/api";

export default function GroupDetails() {
  const params = useParams();
  const groupId = params.id;

  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (groupId) {
      fetchMembers();
    }
  }, [groupId]);

  async function fetchMembers() {
    try {
      setLoading(true);
      setError("");

      const token = localStorage.getItem("token");

      const response = await fetch(
        `${API_URL}/groups/${groupId}/members`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to fetch members");
      }

      setMembers(data.members);
    } catch (error) {
      console.error("Fetch members error:", error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-[#152238] font-mono text-white">

      {/* NAVBAR */}
      <nav className="flex items-center justify-between border-b border-white/10 px-6 py-5 md:px-10">

        <Link
          href="/group"
          className="text-xl font-bold"
        >
          split<span className="text-blue-400">.</span>
        </Link>

        <Link
          href="/group"
          className="text-xs uppercase tracking-wider text-slate-500 transition hover:text-white"
        >
          ← Groups
        </Link>

      </nav>

      {/* MAIN */}
      <section className="mx-auto max-w-4xl px-6 py-12 md:px-10">

        {/* HEADER */}
        <div>

          <p className="text-xs uppercase tracking-[0.25em] text-blue-400">
            Group
          </p>

          <h1 className="mt-4 text-4xl font-semibold tracking-tight md:text-5xl">
            Group Members
          </h1>

          <p className="mt-4 text-sm text-slate-400">
            People in this group.
          </p>

        </div>

        {/* ERROR */}
        {error && (
          <div className="mt-8 rounded-xl border border-red-400/20 bg-red-400/10 px-5 py-4 text-sm text-red-300">
            {error}
          </div>
        )}

        {/* MEMBERS SECTION */}
        <div className="mt-10">

          <div className="flex items-center justify-between">

            <h2 className="text-lg font-medium">
              Members
            </h2>

            <span className="text-[10px] uppercase tracking-[0.2em] text-slate-600">
              {members.length} MEMBERS
            </span>

          </div>

          {/* LOADING */}
          {loading && (
            <div className="mt-5 rounded-2xl border border-white/10 bg-[#102038] p-7 text-sm text-slate-500">
              Loading members...
            </div>
          )}

          {/* MEMBER LIST */}
          {!loading && members.length > 0 && (
            <div className="mt-5 space-y-3">

              {members.map((member) => (

                <div
                  key={member.id}
                  className="flex items-center justify-between rounded-2xl border border-white/10 bg-[#102038] p-5 transition hover:border-white/20"
                >

                  {/* MEMBER INFO */}
                  <div className="flex items-center gap-4">

                    {/* AVATAR */}
                    <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[#1a304d] text-blue-400">
                      {member.name?.charAt(0).toUpperCase()}
                    </div>

                    {/* NAME + EMAIL */}
                    <div>

                      <p className="text-sm font-medium">
                        {member.name}
                      </p>

                      <p className="mt-1 text-xs text-slate-500">
                        {member.email}
                      </p>

                    </div>

                  </div>

                  {/* JOINED DATE */}
                  <p className="text-[10px] text-slate-600">
                    Joined{" "}
                    {new Date(member.joined_at).toLocaleDateString()}
                  </p>

                </div>

              ))}

            </div>
          )}

          {/* EMPTY STATE */}
          {!loading && members.length === 0 && !error && (
            <div className="mt-5 rounded-2xl border border-dashed border-white/10 px-6 py-10 text-center">

              <p className="text-sm text-slate-500">
                No members found.
              </p>

            </div>
          )}

        </div>

      </section>

    </main>
  );
}