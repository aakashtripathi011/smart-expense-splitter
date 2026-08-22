


"use client";

import Link from "next/link";
import { useState } from "react";

const API_URL = "http://localhost:5000/api";

export default function Dashboard() {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleting, setDeleting] = useState(false);

  // =================================================
  // LOGOUT
  // =================================================

  function logout() {
    localStorage.removeItem("token");
    window.location.href = "/";
  }

  // =================================================
  // DELETE ACCOUNT
  // =================================================

  async function deleteAccount() {
    try {
      setDeleting(true);

      const token = localStorage.getItem("token");

      if (!token) {
        alert("You are not logged in.");
        return;
      }

      const response = await fetch(
        `${API_URL}/auth/delete-account`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Failed to delete account"
        );
      }

      localStorage.removeItem("token");

      window.location.href = "/";
    } catch (error) {
      console.error("Delete account error:", error);

      alert(
        error?.message ||
          "Something went wrong while deleting your account."
      );

      setDeleting(false);
      setShowDeleteConfirm(false);
    }
  }

  return (
    <main className="min-h-screen overflow-hidden bg-[#0b192b] font-mono text-[#e8edf2]">

      {/* ================================================= */}
      {/* SUBTLE PAPER TEXTURE */}
      {/* ================================================= */}

      <div className="pointer-events-none fixed inset-0 z-50 opacity-[0.045]">
        <div
          className="h-full w-full"
          style={{
            backgroundImage:
              "radial-gradient(#b8c7d6 0.6px, transparent 0.6px)",
            backgroundSize: "7px 7px",
          }}
        />
      </div>

      {/* ================================================= */}
      {/* NAVBAR */}
      {/* ================================================= */}

      <nav className="relative z-10 border-b border-[#30445a] bg-[#0b192b]">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-6 md:px-10">

          <Link
            href="/"
            className="text-2xl font-black tracking-[-0.08em]"
          >
            split<span className="text-[#5fa8d3]">.</span>
          </Link>

          <div className="flex items-center gap-6">

            <div className="hidden text-right sm:block">
              <p className="font-mono text-[9px] uppercase tracking-[0.2em] text-[#52657a]">
                signed in as
              </p>

              <p className="mt-1 text-xs text-[#aab8c5]">
                you
              </p>
            </div>

            <button
              onClick={logout}
              className="
                rotate-[1deg]
                border
                border-[#40556b]
                bg-[#101f32]
                px-3
                py-2
                font-mono
                text-[10px]
                uppercase
                tracking-wider
                text-[#8191a1]
                transition
                hover:border-[#5fa8d3]
                hover:text-[#dce5ed]
              "
            >
              Log out
            </button>

          </div>
        </div>
      </nav>

      {/* ================================================= */}
      {/* MAIN */}
      {/* ================================================= */}

      <section className="relative mx-auto max-w-6xl px-6 py-12 md:px-10 md:py-16">

        {/* HEADER */}

        <div className="relative flex flex-col justify-between gap-8 md:flex-row md:items-end">

          <div>

            <p className="mb-4 inline-block rotate-[-2deg] border border-[#40556b] bg-[#15263a] px-3 py-1 font-mono text-[9px] uppercase tracking-[0.25em] text-[#5fa8d3]">
              dashboard / home
            </p>

            <h1 className="font-mono text-5xl font-black uppercase leading-[0.9] tracking-[-0.07em] text-[#e8edf2] md:text-7xl">
              WHAT ARE WE

              <br />

              <span className="text-[#8798a8]">
                SPLITTING?
              </span>
            </h1>

            <p className="mt-6 max-w-md font-mono text-xs leading-6 text-[#718397]">
              Keep the math out of the conversation.

              <br />

              <span className="text-[#5fa8d3]">
                We&apos;ll handle it.
              </span>
            </p>

          </div>

          <div className="rotate-[3deg] font-mono text-[10px] uppercase tracking-[0.25em] text-[#52657a]">
            01 / HOME
          </div>

        </div>

        {/* ================================================= */}
        {/* GROUP CARD */}
        {/* ================================================= */}

        <div className="mt-14">

          <Link
            href="/group"
            className="
              group
              relative
              block
              min-h-[285px]
              rotate-[1deg]
              border-2
              border-[#40556b]
              bg-[#15263a]
              p-7
              shadow-[7px_8px_0px_rgba(0,0,0,0.35)]
              transition
              duration-200
              hover:-translate-y-1
              hover:rotate-[0deg]
              hover:border-[#5fa8d3]
              hover:shadow-[9px_10px_0px_rgba(0,0,0,0.4)]
            "
          >

            <div
              className="
                absolute
                -top-4
                right-12
                h-8
                w-24
                rotate-[3deg]
                bg-[#526b80]
                opacity-50
              "
            />

            <span className="absolute right-7 top-6 font-mono text-[10px] text-[#52657a]">
              01
            </span>

            <div
              className="
                flex
                h-12
                w-12
                rotate-[2deg]
                items-center
                justify-center
                border-2
                border-[#52657a]
                bg-[#101f32]
                text-xl
                text-[#5fa8d3]
                transition
                group-hover:border-[#5fa8d3]
                group-hover:bg-[#1b334b]
              "
            >
              #
            </div>

            <div className="absolute bottom-7 left-7 right-7">

              <h2 className="font-mono text-2xl font-black uppercase tracking-[-0.04em] text-[#e8edf2]">
                MY GROUPS
              </h2>

              <p className="mt-3 max-w-sm font-mono text-xs leading-5 text-[#718397]">
                Trips, dinners, roommates —
                keep shared expenses together.
              </p>

              <div className="mt-5 font-mono text-[10px] uppercase tracking-[0.2em] text-[#5fa8d3] opacity-0 transition group-hover:opacity-100">
                VIEW GROUPS →
              </div>

            </div>

          </Link>

        </div>

        {/* ================================================= */}
        {/* RECENT EXPENSES */}
        {/* ================================================= */}

        <div className="mt-20">

          <div className="flex items-end justify-between border-b-2 border-[#30445a] pb-4">

            <div>

              <p className="font-mono text-[9px] uppercase tracking-[0.25em] text-[#52657a]">
                activity
              </p>

              <h2 className="mt-2 font-mono text-xl font-black uppercase tracking-[-0.03em] text-[#dce5ed]">
                Recent expenses
              </h2>

            </div>

            <span className="font-mono text-[9px] uppercase tracking-widest text-[#52657a]">
              0 expenses
            </span>

          </div>

          <div
            className="
              relative
              flex
              min-h-[250px]
              flex-col
              items-center
              justify-center
              border-x-2
              border-b-2
              border-[#30445a]
              bg-[#101f32]
            "
          >

            <div
              className="
                absolute
                -top-3
                left-1/2
                h-6
                w-20
                -translate-x-1/2
                rotate-[-2deg]
                bg-[#526b80]
                opacity-35
              "
            />

            <div
              className="
                flex
                h-14
                w-14
                rotate-[-3deg]
                items-center
                justify-center
                border-2
                border-[#40556b]
                bg-[#15263a]
                font-mono
                text-lg
                text-[#5fa8d3]
              "
            >
              ₹
            </div>

            <p className="mt-5 font-mono text-xs text-[#718397]">
              Nothing here yet.
            </p>

            <span className="mt-4 font-mono text-[10px] uppercase tracking-[0.2em] text-[#52657a]">
              Expenses will appear here.
            </span>

            <span className="absolute bottom-5 right-6 rotate-[-3deg] font-mono text-[9px] text-[#52657a]">
              let&apos;s fix that.
            </span>

          </div>

        </div>

        {/* ================================================= */}
        {/* DANGER ZONE */}
        {/* ================================================= */}

        <div className="mt-16 border-t-2 border-[#30445a] pt-8">

          <p className="font-mono text-[9px] uppercase tracking-[0.25em] text-red-400">
            danger zone
          </p>

          <h2 className="mt-2 font-mono text-xl font-black uppercase tracking-[-0.03em]">
            Delete account
          </h2>

          <p className="mt-3 max-w-lg font-mono text-xs leading-6 text-[#718397]">
            Permanently delete your account and its associated
            groups, expenses and expense data.
          </p>

          <button
            onClick={() => setShowDeleteConfirm(true)}
            className="
              mt-5
              border
              border-red-400/30
              bg-red-400/5
              px-5
              py-3
              font-mono
              text-[10px]
              uppercase
              tracking-wider
              text-red-400
              transition
              hover:border-red-400
              hover:bg-red-400/10
            "
          >
            Delete Account
          </button>

        </div>

        {/* ================================================= */}
        {/* FOOTER */}
        {/* ================================================= */}

        <div className="mt-12 flex flex-col gap-3 border-t border-[#30445a] pt-6 text-[9px] uppercase tracking-[0.2em] text-[#52657a] sm:flex-row sm:items-center sm:justify-between">

          <span>
            split.
          </span>

          <span>
            trips · dinners · roommates
          </span>

        </div>

      </section>

      {/* ================================================= */}
      {/* DELETE CONFIRMATION MODAL */}
      {/* ================================================= */}

      {showDeleteConfirm && (

        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/75 px-6">

          <div className="w-full max-w-md border-2 border-red-400/30 bg-[#101f32] p-7 shadow-[8px_8px_0px_rgba(0,0,0,0.5)]">

            <p className="font-mono text-[9px] uppercase tracking-[0.25em] text-red-400">
              warning
            </p>

            <h2 className="mt-4 font-mono text-2xl font-black uppercase tracking-[-0.04em]">
              Delete account?
            </h2>

            <p className="mt-4 font-mono text-xs leading-6 text-[#718397]">
              This will permanently delete your account,
              groups, expenses and associated data.
              This action cannot be undone.
            </p>

            <div className="mt-7 flex flex-col gap-3 sm:flex-row">

              <button
                onClick={deleteAccount}
                disabled={deleting}
                className="
                  flex-1
                  bg-red-400
                  px-5
                  py-3
                  font-mono
                  text-[10px]
                  font-bold
                  uppercase
                  tracking-wider
                  text-[#0b192b]
                  transition
                  hover:bg-red-300
                  disabled:cursor-not-allowed
                  disabled:opacity-50
                "
              >
                {deleting ? "Deleting..." : "Yes, Delete"}
              </button>

              <button
                onClick={() => setShowDeleteConfirm(false)}
                disabled={deleting}
                className="
                  flex-1
                  border
                  border-[#40556b]
                  px-5
                  py-3
                  font-mono
                  text-[10px]
                  uppercase
                  tracking-wider
                  text-[#aab8c5]
                  transition
                  hover:border-[#5fa8d3]
                  hover:text-white
                  disabled:opacity-50
                "
              >
                Cancel
              </button>

            </div>

          </div>

        </div>

      )}

    </main>
  );
}

