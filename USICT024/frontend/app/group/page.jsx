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
  const [deleting, setDeleting] = useState(null);

  const [error, setError] = useState("");

  // =====================================
  // FETCH GROUPS
  // =====================================

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

  // =====================================
  // CREATE GROUP
  // =====================================

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

      await fetchGroups();

      setGroupName("");
      setShowCreate(false);
    } catch (error) {
      console.error("Create group error:", error);
      setError(error.message);
    } finally {
      setCreating(false);
    }
  }

  // =====================================
  // JOIN GROUP
  // =====================================

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

  // =====================================
  // DELETE GROUP
  // =====================================

  async function deleteGroup(groupId) {
    const confirmed = window.confirm(
      "Are you sure you want to delete this group?\n\n" +
        "This will permanently delete the group, " +
        "members, expenses and expense splits."
    );

    if (!confirmed) return;

    try {
      setDeleting(groupId);
      setError("");

      const token = localStorage.getItem("token");

      const response = await fetch(`${API_URL}/groups/${groupId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to delete group");
      }

      setGroups((current) =>
        current.filter(
          (group) => String(group.id) !== String(groupId)
        )
      );
    } catch (error) {
      console.error("Delete group error:", error);
      setError(error.message);
    } finally {
      setDeleting(null);
    }
  }

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#0b192b] font-mono text-[#e8edf2]">

      {/* ================= PAPER TEXTURE ================= */}

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

      {/* ================= NAVBAR ================= */}

      <nav className="relative z-10 mx-auto flex max-w-6xl items-center justify-between border-b border-[#30445a] px-6 py-7 md:px-10">

        <Link
          href="/dashboard"
          className="text-2xl font-black tracking-[-0.08em]"
        >
          split<span className="text-[#5fa8d3]">.</span>
        </Link>

        <Link
          href="/dashboard"
          className="
            rotate-[1deg]
            border
            border-[#40556b]
            bg-[#101f32]
            px-3
            py-1.5
            text-[10px]
            uppercase
            tracking-[0.2em]
            text-[#718397]
            transition
            hover:text-[#e8edf2]
          "
        >
          ← Dashboard
        </Link>

      </nav>


      {/* ================= MAIN ================= */}

      <section className="relative z-10 mx-auto max-w-6xl px-6 py-12 md:px-10">

        {/* ================= HEADER ================= */}

        <div className="flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">

          <div className="relative">

            {/* little handwritten mark */}

            <div className="absolute -left-8 -top-5 hidden rotate-[-12deg] text-[#5fa8d3] lg:block">
              ✦
            </div>

            <p className="mb-3 rotate-[-1deg] text-[10px] font-bold uppercase tracking-[0.25em] text-[#5fa8d3]">
              shared memories / groups
            </p>

            <h1 className="text-5xl font-black uppercase tracking-[-0.07em] text-[#e8edf2] md:text-6xl">
              YOUR PEOPLE.
            </h1>

            <p className="mt-5 max-w-lg text-xs leading-6 text-[#718397]">
              Keep shared expenses organized in one place.
              <br />
              Trips, dinners, roommates, chaos.
            </p>

          </div>


          {/* ACTIONS */}

          <div className="flex flex-col gap-3 sm:flex-row">

            <button
              onClick={() => {
                setShowJoin(true);
                setShowCreate(false);
              }}
              className="
                rotate-[1deg]
                border-2
                border-[#40556b]
                bg-[#15263a]
                px-6
                py-3.5
                text-xs
                font-bold
                uppercase
                tracking-wider
                text-[#c2cfda]
                shadow-[4px_4px_0px_#050c15]
                transition-all
                hover:-translate-y-0.5
                hover:rotate-0
                hover:border-[#5b7085]
                hover:text-white
              "
            >
              Join group
            </button>


            <button
              onClick={() => {
                setShowCreate(true);
                setShowJoin(false);
              }}
              className="
                rotate-[-1deg]
                border-2
                border-[#52657a]
                bg-[#5fa8d3]
                px-6
                py-3.5
                text-xs
                font-bold
                uppercase
                tracking-wider
                text-[#07111f]
                shadow-[5px_5px_0px_#050c15]
                transition-all
                hover:-translate-y-0.5
                hover:rotate-0
                hover:bg-[#73b7df]
              "
            >
              + New group
            </button>

          </div>

        </div>


        {/* ================= ERROR ================= */}

        {error && (
          <div className="mt-8 rotate-[-0.5deg] border-2 border-[#7c4e4e] bg-[#291d25] px-5 py-4 text-xs text-[#e58b8b] shadow-[4px_4px_0px_#050c15]">
            {error}
          </div>
        )}


        {/* ================= CREATE GROUP ================= */}

        {showCreate && (
          <div className="relative mt-10 rotate-[0.5deg] border-2 border-[#40556b] bg-[#101f32] p-7 shadow-[7px_7px_0px_#050c15] md:p-8">

            {/* tape */}

            <div className="absolute -top-4 left-12 h-8 w-28 rotate-[-2deg] bg-[#526b80] opacity-50" />

            <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-[#5fa8d3]">
              New page / new group
            </p>

            <p className="mt-3 text-xs text-[#718397]">
              Give your little corner of chaos a name.
            </p>

            <div className="mt-6 flex flex-col gap-3 sm:flex-row">

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
                className="
                  flex-1
                  border-2
                  border-[#30445a]
                  bg-[#0b192b]
                  px-4
                  py-3.5
                  text-sm
                  text-[#e8edf2]
                  outline-none
                  placeholder:text-[#52657a]
                  focus:border-[#5fa8d3]
                "
              />

              <button
                onClick={createGroup}
                disabled={creating}
                className="
                  border-2
                  border-[#52657a]
                  bg-[#5fa8d3]
                  px-6
                  py-3.5
                  text-xs
                  font-bold
                  text-[#07111f]
                  transition
                  hover:bg-[#73b7df]
                  disabled:opacity-50
                "
              >
                {creating ? "Creating..." : "Create"}
              </button>

              <button
                onClick={() => setShowCreate(false)}
                className="
                  border-2
                  border-[#40556b]
                  px-6
                  py-3.5
                  text-xs
                  text-[#718397]
                  transition
                  hover:text-white
                "
              >
                Cancel
              </button>

            </div>

          </div>
        )}


        {/* ================= JOIN GROUP ================= */}

        {showJoin && (
          <div className="relative mt-7 rotate-[-0.5deg] border-2 border-[#40556b] bg-[#101f32] p-7 shadow-[7px_7px_0px_#050c15] md:p-8">

            {/* tape */}

            <div className="absolute -top-4 right-20 h-8 w-24 rotate-[3deg] bg-[#526b80] opacity-50" />

            <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-[#5fa8d3]">
              Join a page
            </p>

            <p className="mt-3 text-xs leading-5 text-[#718397]">
              Enter the group code shared by the group owner.
            </p>

            <div className="mt-6 flex flex-col gap-3 sm:flex-row">

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
                className="
                  flex-1
                  border-2
                  border-[#30445a]
                  bg-[#0b192b]
                  px-4
                  py-3.5
                  text-sm
                  uppercase
                  text-[#e8edf2]
                  outline-none
                  placeholder:text-[#52657a]
                  focus:border-[#5fa8d3]
                "
              />

              <button
                onClick={joinGroup}
                disabled={joining}
                className="
                  border-2
                  border-[#52657a]
                  bg-[#5fa8d3]
                  px-6
                  py-3.5
                  text-xs
                  font-bold
                  text-[#07111f]
                  transition
                  hover:bg-[#73b7df]
                  disabled:opacity-50
                "
              >
                {joining ? "Joining..." : "Join"}
              </button>

              <button
                onClick={() => {
                  setShowJoin(false);
                  setGroupCode("");
                }}
                className="
                  border-2
                  border-[#40556b]
                  px-6
                  py-3.5
                  text-xs
                  text-[#718397]
                  transition
                  hover:text-white
                "
              >
                Cancel
              </button>

            </div>

          </div>
        )}


        {/* ================= GROUPS ================= */}

        <div className="mt-14">

          <div className="flex items-end justify-between border-b border-[#30445a] pb-4">

            <div>
              <p className="text-[10px] uppercase tracking-[0.25em] text-[#52657a]">
                scrapbook index
              </p>

              <h2 className="mt-2 text-xl font-black uppercase tracking-[-0.04em]">
                My groups
              </h2>
            </div>

            <span className="rotate-[2deg] border border-[#40556b] px-3 py-1.5 text-[9px] uppercase tracking-[0.2em] text-[#718397]">
              {groups.length} GROUPS
            </span>

          </div>


          {/* ================= LOADING ================= */}

          {loading && (
            <div className="mt-6 rotate-[-0.5deg] border-2 border-[#30445a] bg-[#101f32] p-8 text-xs text-[#718397] shadow-[5px_5px_0px_#050c15]">
              Loading groups...
            </div>
          )}


          {/* ================= GROUP CARDS ================= */}

          {!loading && groups.length > 0 && (
            <div className="mt-7 grid gap-7 md:grid-cols-2">

              {groups.map((group, index) => (

                <div
                  key={group.id}
                  className={`
                    group
                    relative
                    border-2
                    border-[#40556b]
                    bg-[#101f32]
                    p-7
                    shadow-[6px_7px_0px_#050c15]
                    transition-all
                    duration-300
                    hover:-translate-y-1
                    hover:shadow-[8px_10px_0px_#050c15]
                    ${
                      index % 2 === 0
                        ? "rotate-[-0.7deg]"
                        : "rotate-[0.7deg]"
                    }
                  `}
                >

                  {/* TAPE */}

                  <div
                    className={`
                      absolute
                      -top-4
                      h-8
                      w-24
                      bg-[#526b80]
                      opacity-50
                      ${
                        index % 2 === 0
                          ? "left-10 rotate-[-2deg]"
                          : "right-10 rotate-[3deg]"
                      }
                    `}
                  />


                  {/* TOP */}

                  <div className="flex items-start justify-between">

                    <Link
                      href={`/group/${group.id}`}
                      className="
                        flex
                        h-12
                        w-12
                        rotate-[-4deg]
                        items-center
                        justify-center
                        border-2
                        border-[#40556b]
                        bg-[#15263a]
                        text-lg
                        font-black
                        text-[#5fa8d3]
                        transition
                        group-hover:rotate-0
                      "
                    >
                      #
                    </Link>


                    <div className="flex items-center gap-3">

                      <Link
                        href={`/group/${group.id}`}
                        className="text-[#52657a] transition hover:text-[#5fa8d3]"
                      >
                        ↗
                      </Link>


                      <button
                        onClick={() => deleteGroup(group.id)}
                        disabled={deleting === group.id}
                        className="
                          border
                          border-[#7c4e4e]
                          px-3
                          py-2
                          text-[9px]
                          uppercase
                          tracking-wider
                          text-[#d47777]
                          transition
                          hover:bg-[#291d25]
                          disabled:opacity-50
                        "
                      >
                        {deleting === group.id
                          ? "Deleting..."
                          : "Delete"}
                      </button>

                    </div>

                  </div>


                  {/* CONTENT */}

                  <Link
                    href={`/group/${group.id}`}
                    className="block"
                  >

                    <p className="mt-7 text-[9px] uppercase tracking-[0.25em] text-[#52657a]">
                      memory / {String(index + 1).padStart(2, "0")}
                    </p>


                    <h3 className="mt-2 text-2xl font-black uppercase tracking-[-0.05em] text-[#e8edf2]">
                      {group.name}
                    </h3>


                    <p className="mt-3 inline-block rotate-[-1deg] border-b border-[#5fa8d3] pb-1 text-xs text-[#5fa8d3]">
                      Code: {group.code}
                    </p>


                    <div className="mt-5 flex gap-6 text-[10px] uppercase tracking-wider text-[#718397]">

                      <span>
                        {group.member_count || 1} members
                      </span>

                      <span>
                        0 expenses
                      </span>

                    </div>


                    {/* AMOUNT */}

                    <div className="mt-7 border-t border-dashed border-[#40556b] pt-5">

                      <p className="text-[9px] uppercase tracking-[0.2em] text-[#52657a]">
                        Total expenses
                      </p>

                      <p className="mt-2 text-2xl font-black text-[#e8edf2]">
                        ₹0
                      </p>

                    </div>

                  </Link>


                  {/* HANDWRITTEN CORNER */}

                  <div className="absolute bottom-5 right-6 rotate-[-4deg] text-[9px] text-[#5fa8d3] opacity-70">
                    let&apos;s split ↓
                  </div>

                </div>

              ))}

            </div>
          )}


          {/* ================= NO GROUPS ================= */}

          {!loading && groups.length === 0 && (

            <div className="relative mt-7 rotate-[0.5deg] border-2 border-dashed border-[#40556b] bg-[#101f32] px-6 py-14 text-center shadow-[5px_5px_0px_#050c15]">

              <div className="mx-auto mb-5 flex h-14 w-14 rotate-[-5deg] items-center justify-center border-2 border-[#40556b] text-xl text-[#5fa8d3]">
                +
              </div>

              <p className="text-sm text-[#aab8c5]">
                You haven&apos;t joined any groups yet.
              </p>

              <p className="mt-2 text-[10px] text-[#52657a]">
                This page is looking suspiciously empty.
              </p>

              <button
                onClick={() => setShowCreate(true)}
                className="mt-5 rotate-[-1deg] text-xs font-bold text-[#5fa8d3] transition hover:text-[#83c3e8] hover:underline"
              >
                Create your first group →
              </button>

            </div>

          )}

        </div>


        {/* ================= FOOTER ================= */}

        <div className="mt-16 flex flex-wrap items-center gap-4 border-t border-[#30445a] pt-6 text-[9px] uppercase tracking-[0.2em]">

          <span className="rotate-[-1deg] text-[#5fa8d3]">
            Groups
          </span>

          <span className="text-[#40556b]">·</span>

          <span className="text-[#52657a]">
            Trips
          </span>

          <span className="text-[#40556b]">·</span>

          <span className="text-[#52657a]">
            Dinners
          </span>

          <span className="text-[#40556b]">·</span>

          <span className="text-[#52657a]">
            Roommates
          </span>

          <span className="ml-auto rotate-[2deg] text-[#5fa8d3]">
            memories / expenses / people
          </span>

        </div>

      </section>

    </main>
  );
}