"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense, useEffect, useMemo, useState } from "react";
function SettlementContent() {
  const searchParams = useSearchParams();
  const groupId = searchParams.get("groupId");

const [settlements, setSettlements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [settlingExpenseId, setSettlingExpenseId] =
    useState(null);

  // =================================================
  // FETCH SETTLEMENTS
  // =================================================

  useEffect(() => {
    if (!groupId) {
      setLoading(false);
      setError("No group selected.");
      return;
    }

    fetchSettlements();
  }, [groupId]);

  async function fetchSettlements() {
    try {
      setLoading(true);
      setError("");

      const token = localStorage.getItem("token");

      if (!token) {
        throw new Error("You are not logged in.");
      }

      const response = await fetch(
        `http://localhost:5000/api/settlements/${groupId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      console.log(
  "SETTLEMENT RESPONSE:",
  JSON.stringify(data, null, 2)
);

      if (!response.ok) {
        throw new Error(
          data.message || "Failed to fetch settlements"
        );
      }

      setSettlements(
        (data.settlements || []).map((payment) => ({
          expenseId: Number(payment.expenseId),

          expenseDescription:
            payment.expenseDescription || "Expense",

          expenseTotal:
            Number(payment.expenseTotal) || 0,

          from: Number(payment.from),

          to: Number(payment.to),

          fromName:
            payment.fromName ||
            `User ${payment.from}`,

          toName:
            payment.toName ||
            `User ${payment.to}`,

          amount: Number(payment.amount),
        }))
      );
    } catch (err) {
      console.error(
        "FETCH SETTLEMENTS ERROR:",
        err
      );

      setError(
        err instanceof Error
          ? err.message
          : "Failed to load settlements"
      );
    } finally {
      setLoading(false);
    }
  }

  // =================================================
  // GROUP PAYMENTS BY EXPENSE
  // =================================================

  const expenses = useMemo(() => {
    const grouped = {};

    for (const payment of settlements) {
      if (!grouped[payment.expenseId]) {
        grouped[payment.expenseId] = {
          expenseId: payment.expenseId,
          expenseDescription:
            payment.expenseDescription,
          expenseTotal: payment.expenseTotal,
          payments: [],
        };
      }

      grouped[payment.expenseId].payments.push(
        payment
      );
    }

    return Object.values(grouped);
  }, [settlements]);

  // =================================================
  // TOTAL OUTSTANDING
  // =================================================

  const total = settlements.reduce(
    (sum, payment) =>
      sum + Number(payment.amount),
    0
  );

  // =================================================
  // MARK ONE EXPENSE AS SETTLED
  // =================================================

  async function markAsSettled(expenseId) {
    try {
      setSettlingExpenseId(expenseId);
      setError("");

      const token = localStorage.getItem("token");

      if (!token) {
        throw new Error("You are not logged in.");
      }

      console.log(
        "MARKING EXPENSE AS SETTLED:",
        expenseId
      );

      const response = await fetch(
        `http://localhost:5000/api/settlements/${groupId}/expenses/${expenseId}/settle`,
        {
          method: "PATCH",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      console.log(
        "MARK EXPENSE SETTLED RESPONSE:",
        data
      );

      if (!response.ok) {
        throw new Error(
          data.message ||
            "Failed to mark expense as settled"
        );
      }

      await fetchSettlements();

    } catch (err) {
      console.error(
        "MARK SETTLED ERROR:",
        err
      );

      setError(
        err instanceof Error
          ? err.message
          : "Failed to mark expense as settled"
      );
    } finally {
      setSettlingExpenseId(null);
    }
  }

  // =================================================
  // NO GROUP
  // =================================================

  if (!groupId) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#152238] px-6 font-mono text-white">

        <div className="w-full max-w-xl rounded-2xl border border-red-400/20 bg-[#102038] p-8">

          <p className="text-xs uppercase tracking-[0.2em] text-red-400">
            Error
          </p>

          <h1 className="mt-4 text-3xl font-semibold">
            No group selected
          </h1>

          <p className="mt-4 text-sm text-slate-400">
            Please open the settlement page from a group.
          </p>

          <Link
            href="/group"
            className="mt-8 inline-block rounded-xl bg-white px-6 py-3 text-xs font-semibold uppercase tracking-wider text-[#152238] transition hover:bg-slate-200"
          >
            ← Back to Groups
          </Link>

        </div>

      </main>
    );
  }

  // =================================================
  // LOADING
  // =================================================

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#152238] font-mono text-white">

        <p className="text-sm text-slate-400">
          Loading settlements...
        </p>

      </main>
    );
  }

  // =================================================
  // ERROR
  // =================================================

  if (error) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#152238] px-6 font-mono text-white">

        <div className="w-full max-w-xl rounded-2xl border border-red-400/20 bg-[#102038] p-8">

          <p className="text-xs uppercase tracking-[0.2em] text-red-400">
            Error
          </p>

          <h1 className="mt-4 text-3xl font-semibold">
            Settlement error
          </h1>

          <p className="mt-4 text-sm text-red-300">
            {error}
          </p>

          <Link
            href={`/group/${groupId}`}
            className="mt-8 inline-block rounded-xl bg-white px-6 py-3 text-xs font-semibold uppercase tracking-wider text-[#152238] transition hover:bg-slate-200"
          >
            ← Back to Group
          </Link>

        </div>

      </main>
    );
  }

  // =================================================
  // MAIN PAGE
  // =================================================

  return (
    <main className="min-h-screen bg-[#152238] font-mono text-white">

      {/* NAVBAR */}

      <nav className="flex items-center justify-between border-b border-white/10 px-6 py-5 md:px-10">

        <Link
          href={`/group/${groupId}`}
          className="text-xl font-bold"
        >
          split<span className="text-blue-400">.</span>
        </Link>

        <Link
          href={`/split?groupId=${groupId}`}
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
            Settle expenses.
          </h1>

          <p className="mt-5 max-w-lg text-sm leading-6 text-slate-400">
            Here&apos;s who needs to pay whom for each expense.
          </p>

          <p className="mt-3 text-xs text-slate-600">
            Group #{groupId}
          </p>

        </div>

        {/* SUMMARY */}

        <div className="mt-12 grid gap-4 md:grid-cols-3">

          <div className="rounded-2xl border border-white/10 bg-[#102038] p-6">

            <p className="text-xs uppercase tracking-wider text-slate-600">
              Expenses
            </p>

            <p className="mt-3 text-lg">
              {expenses.length}
            </p>

          </div>

          <div className="rounded-2xl border border-white/10 bg-[#102038] p-6">

            <p className="text-xs uppercase tracking-wider text-slate-600">
              Payments
            </p>

            <p className="mt-3 text-lg">
              {settlements.length}
            </p>

          </div>

          <div className="rounded-2xl border border-white/10 bg-[#102038] p-6">

            <p className="text-xs uppercase tracking-wider text-slate-600">
              Outstanding
            </p>

            <p className="mt-3 text-lg text-blue-400">
              ₹{total.toFixed(2)}
            </p>

          </div>

        </div>

        {/* EXPENSES */}

        <div className="mt-10">

          <div className="flex items-center justify-between">

            <h2 className="text-lg font-medium">
              Expenses
            </h2>

            <span className="text-[10px] uppercase tracking-[0.2em] text-slate-600">
              {expenses.length} EXPENSES
            </span>

          </div>

          <div className="mt-4 space-y-4">

            {expenses.length === 0 ? (

              <div className="rounded-2xl border border-blue-400/20 bg-[#102038] p-8">

                <p className="text-sm text-blue-400">
                  All expenses are settled.
                </p>

                <p className="mt-2 text-xs text-slate-500">
                  There are no outstanding payments for this group.
                </p>

              </div>

            ) : (

              expenses.map((expense) => (

                <div
                  key={expense.expenseId}
                  className="rounded-2xl border border-white/10 bg-[#102038] p-6 transition hover:border-white/20"
                >

                  {/* EXPENSE HEADER */}

                  <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

                    <div>

                      <p className="text-[10px] uppercase tracking-[0.2em] text-blue-400">
                        Expense #{expense.expenseId}
                      </p>

                      <p className="mt-2 text-base font-medium">
                        {expense.expenseDescription}
                      </p>

                      {expense.expenseTotal > 0 && (
                        <p className="mt-1 text-xs text-slate-600">
                          Expense total: ₹
                          {expense.expenseTotal.toFixed(2)}
                        </p>
                      )}

                    </div>

                    <p className="text-lg font-medium text-blue-400">
                      ₹
                      {expense.payments
                        .reduce(
                          (sum, payment) =>
                            sum + payment.amount,
                          0
                        )
                        .toFixed(2)}
                    </p>

                  </div>

                  {/* PAYMENTS */}

                  <div className="mt-6 space-y-3 border-t border-white/10 pt-5">

                    {expense.payments.map(
                      (payment, index) => (

                        <div
                          key={`${payment.from}-${payment.to}-${index}`}
                          className="flex flex-col gap-4 rounded-xl bg-[#0d1b2d] p-4 sm:flex-row sm:items-center sm:justify-between"
                        >

                          <div className="flex items-center gap-4">

                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#1a304d] text-sm text-blue-400">
                              {String(
                                payment.fromName
                              )
                                .charAt(0)
                                .toUpperCase()}
                            </div>

                            <div>

                              <p className="text-sm">
                                {payment.fromName}
                              </p>

                              <p className="mt-1 text-xs text-slate-600">
                                owes{" "}
                                <span className="text-slate-400">
                                  {payment.toName}
                                </span>
                              </p>

                            </div>

                          </div>

                          <p className="text-lg font-medium text-blue-400">
                            ₹{payment.amount.toFixed(2)}
                          </p>

                        </div>

                      )
                    )}

                  </div>

                  {/* SETTLE EXPENSE */}

                  <div className="mt-5 flex justify-end border-t border-white/10 pt-5">

                    <button
                      type="button"
                      onClick={() =>
                        markAsSettled(
                          expense.expenseId
                        )
                      }
                      disabled={
                        settlingExpenseId ===
                        expense.expenseId
                      }
                      className="rounded-xl bg-white px-6 py-3 text-xs font-semibold uppercase tracking-wider text-[#152238] transition hover:bg-slate-200 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      {settlingExpenseId ===
                      expense.expenseId
                        ? "Settling..."
                        : "Mark expense as settled"}
                    </button>

                  </div>

                </div>

              ))

            )}

          </div>

        </div>

        {/* INFO */}

        <div className="mt-10 rounded-2xl border border-blue-400/20 bg-[#102038] p-7">

          <p className="text-sm">
            Expense-level settlement
          </p>

          <p className="mt-2 text-xs leading-6 text-slate-500">
            Settling one expense only clears that
            expense. Other expenses remain pending
            until they are settled separately.
          </p>

        </div>

        {/* BACK TO GROUP */}

        <div className="mt-10 text-center">

          <Link
            href={`/group/${groupId}`}
            className="text-xs text-slate-600 transition hover:text-white"
          >
            ← Back to Group #{groupId}
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

export default function Settlement() {
  return (
    <Suspense
      fallback={
        <main className="flex min-h-screen items-center justify-center bg-[#152238] font-mono text-white">
          <p className="text-sm text-slate-400">
            Loading settlements...
          </p>
        </main>
      }
    >
      <SettlementContent />
    </Suspense>
  );
}