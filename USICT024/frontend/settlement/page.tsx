"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

export default function Settlement() {
  const groupId = 1;

  const [settlements, setSettlements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchSettlements = async () => {
      try {
        const token = localStorage.getItem("token");

        const response = await fetch(
          `http://localhost:5000/api/settlements/${groupId}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const data = await response.json();

        console.log("SETTLEMENT API DATA:", data);

        if (!response.ok) {
          throw new Error(
            data.message || "Failed to fetch settlements"
          );
        }

        setSettlements(data.settlements || []);
      } catch (err) {
        console.error("FETCH SETTLEMENTS ERROR:", err);

        setError(
          err instanceof Error
            ? err.message
            : "Failed to load settlements"
        );
      } finally {
        setLoading(false);
      }
    };

    fetchSettlements();
  }, []);

  const total = settlements.reduce(
    (sum, payment) => sum + Number(payment.amount),
    0
  );

  if (loading) {
    return (
      <main className="min-h-screen bg-[#152238] font-mono text-white flex items-center justify-center">
        <p className="text-sm text-slate-400">
          Loading settlements...
        </p>
      </main>
    );
  }

  if (error) {
    return (
      <main className="min-h-screen bg-[#152238] font-mono text-white flex items-center justify-center">
        <p className="text-sm text-red-400">
          {error}
        </p>
      </main>
    );
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
          href="/split"
          className="text-xs uppercase tracking-wider text-slate-500 transition hover:text-white"
        >
          ← Split
        </Link>

      </nav>

      {/* MAIN */}
      <section className="mx-auto max-w-4xl px-6 py-12 md:px-10">

        {/* HEADER */}
        <div>

          <p className="text-xs uppercase tracking-[0.25em] text-blue-400">
            Settlement
          </p>

          <h1 className="mt-4 text-4xl font-semibold tracking-tight md:text-5xl">
            All settled up.
          </h1>

          <p className="mt-5 max-w-lg text-sm leading-6 text-slate-400">
            Here&apos;s who needs to pay whom.
          </p>

        </div>

        {/* SUMMARY */}
        <div className="mt-12 grid gap-4 md:grid-cols-3">

          <div className="rounded-2xl border border-white/10 bg-[#102038] p-6">

            <p className="text-xs uppercase tracking-wider text-slate-600">
              Expense
            </p>

            <p className="mt-3 text-lg">
              Group Expenses
            </p>

          </div>

          <div className="rounded-2xl border border-white/10 bg-[#102038] p-6">

            <p className="text-xs uppercase tracking-wider text-slate-600">
              Total
            </p>

            <p className="mt-3 text-lg">
              ₹{total}
            </p>

          </div>

          <div className="rounded-2xl border border-white/10 bg-[#102038] p-6">

            <p className="text-xs uppercase tracking-wider text-slate-600">
              To settle
            </p>

            <p className="mt-3 text-lg text-blue-400">
              ₹{total}
            </p>

          </div>

        </div>

        {/* SETTLEMENTS */}
        <div className="mt-10">

          <div className="flex items-center justify-between">

            <h2 className="text-lg font-medium">
              Payments
            </h2>

            <span className="text-[10px] uppercase tracking-[0.2em] text-slate-600">
              {settlements.length} PAYMENTS
            </span>

          </div>

          <div className="mt-4 space-y-3">

            {settlements.length === 0 ? (

              <div className="rounded-2xl border border-white/10 bg-[#102038] p-6 text-sm text-slate-500">
                No settlements needed.
              </div>

            ) : (

              settlements.map((payment, index) => (

                <div
                  key={index}
                  className="flex items-center justify-between rounded-2xl border border-white/10 bg-[#102038] p-6 transition hover:border-white/20"
                >

                  <div className="flex items-center gap-4">

                    {/* FROM */}
                    <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[#1a304d] text-sm text-blue-400">
                      {(payment.fromName || `User ${payment.from}`).charAt(0)}
                    </div>

                    <div>

                      <p className="text-sm">
                        {payment.fromName || `User ${payment.from}`}
                      </p>

                      <p className="mt-1 text-xs text-slate-600">
                        owes
                      </p>

                    </div>

                    <span className="text-slate-600">
                      →
                    </span>

                    {/* TO */}
                    <div>

                      <p className="text-sm">
                        {payment.toName || `User ${payment.to}`}
                      </p>

                    </div>

                  </div>

                  {/* AMOUNT */}
                  <p className="text-lg font-medium text-blue-400">
                    ₹{Number(payment.amount)}
                  </p>

                </div>

              ))

            )}

          </div>

        </div>

        {/* DONE */}
        <div className="mt-10 rounded-2xl border border-blue-400/20 bg-[#102038] p-7">

          <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">

            <div>

              <p className="text-sm">
                Ready to settle?
              </p>

              <p className="mt-2 text-xs text-slate-500">
                Mark payments as complete once everyone has paid.
              </p>

            </div>

            <button
              className="rounded-xl bg-white px-7 py-3.5 text-xs font-semibold uppercase tracking-wider text-[#152238] transition hover:bg-slate-200"
            >
              Mark as settled
            </button>

          </div>

        </div>

        {/* BACK TO DASHBOARD */}
        <div className="mt-10 text-center">

          <Link
            href="/dashboard"
            className="text-xs text-slate-600 transition hover:text-white"
          >
            ← Back to dashboard
          </Link>

        </div>

        {/* STEPS */}
        <div className="mt-14 flex gap-4 text-[10px] uppercase tracking-[0.2em]">

          <span className="text-slate-600">
            01 Upload
          </span>

          <span className="text-slate-600">
            02 Split
          </span>

          <span className="text-blue-400">
            03 Settle
          </span>

        </div>

      </section>

    </main>
  );
}