"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";

const API_URL =
  "https://smart-expense-splitter-paiy.onrender.com/api";

console.log("🔥 GROUP DETAILS API_URL:", API_URL);

export default function GroupDetails() {
  const params = useParams();
  const groupId = params.id;

  const [members, setMembers] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [balances, setBalances] = useState({});
  const [settlements, setSettlements] = useState([]);

  useEffect(() => {
    if (!groupId) return;

    console.log("🚀 useEffect triggered");
    console.log("🚀 GROUP ID:", groupId);
    console.log("🚀 API_URL:", API_URL);

    fetchGroupData();
  }, [groupId]);

  async function fetchGroupData() {
    console.log("========== GROUP DATA START ==========");
    console.log("GROUP ID:", groupId);
    console.log("API URL:", API_URL);

    setLoading(true);
    setError("");

    const token = localStorage.getItem("token");

    console.log("🔑 TOKEN EXISTS:", !!token);

    if (!token) {
      console.error("❌ NO TOKEN FOUND");

      setError("Please login again. Authentication token not found.");
      setLoading(false);
      return;
    }

    try {
      console.log("📡 Starting all API requests...");

      await Promise.all([
        fetchMembers(token),
        fetchExpenses(token),
        fetchBalances(token),
        fetchSettlements(token),
      ]);

      console.log("✅ All API requests finished");
    } catch (error) {
      console.error("❌ Group data error:", error);
    } finally {
      setLoading(false);
      console.log("========== GROUP DATA END ==========");
    }
  }

  async function fetchMembers(token) {
    const url = `${API_URL}/groups/${groupId}/members`;

    console.log("========== MEMBERS FETCH ==========");
    console.log("API_URL:", API_URL);
    console.log("GROUP ID:", groupId);
    console.log("FINAL MEMBERS URL:", url);
    console.log("TOKEN EXISTS:", !!token);

    try {
      const response = await fetch(url, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      console.log("MEMBERS RESPONSE STATUS:", response.status);
      console.log("MEMBERS RESPONSE OK:", response.ok);

      const data = await response.json();

      console.log("MEMBERS RESPONSE DATA:", data);

      if (!response.ok) {
        throw new Error(
          data.message || "Failed to fetch members"
        );
      }

      setMembers(data.members || []);

      console.log(
        "✅ MEMBERS SET:",
        data.members || []
      );
    } catch (error) {
      console.error("❌ FETCH MEMBERS ERROR:", error);

      setError(
        error instanceof Error
          ? error.message
          : "Failed to fetch members"
      );
    }
  }

  async function fetchExpenses(token) {
    const url = `${API_URL}/expenses/group/${groupId}`;

    console.log("========== EXPENSES FETCH ==========");
    console.log("API_URL:", API_URL);
    console.log("GROUP ID:", groupId);
    console.log("FINAL EXPENSES URL:", url);
    console.log("TOKEN EXISTS:", !!token);

    try {
      const response = await fetch(url, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      console.log("EXPENSES RESPONSE STATUS:", response.status);
      console.log("EXPENSES RESPONSE OK:", response.ok);

      const data = await response.json();

      console.log("EXPENSES RESPONSE DATA:", data);

      if (!response.ok) {
        throw new Error(
          data.message || "Failed to fetch expenses"
        );
      }

      setExpenses(data.expenses || []);

      console.log(
        "✅ EXPENSES SET:",
        data.expenses || []
      );
    } catch (error) {
      console.error("❌ FETCH EXPENSES ERROR:", error);

      setError(
        error instanceof Error
          ? error.message
          : "Failed to fetch expenses"
      );
    }
  }

  async function fetchBalances(token) {
    const url = `${API_URL}/expenses/group/${groupId}/balances`;

    console.log("========== BALANCES FETCH ==========");
    console.log("API_URL:", API_URL);
    console.log("GROUP ID:", groupId);
    console.log("FINAL BALANCES URL:", url);
    console.log("TOKEN EXISTS:", !!token);

    try {
      const response = await fetch(url, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      console.log("BALANCES RESPONSE STATUS:", response.status);
      console.log("BALANCES RESPONSE OK:", response.ok);

      const data = await response.json();

      console.log("BALANCES RESPONSE DATA:", data);

      if (!response.ok) {
        throw new Error(
          data.message || "Failed to fetch balances"
        );
      }

      setBalances(data.balances || {});

      console.log(
        "✅ BALANCES SET:",
        data.balances || {}
      );
    } catch (error) {
      console.error("❌ FETCH BALANCES ERROR:", error);

      setError(
        error instanceof Error
          ? error.message
          : "Failed to fetch balances"
      );
    }
  }

  async function fetchSettlements(token) {
    const url = `${API_URL}/settlements/${groupId}`;

    console.log("========== SETTLEMENTS FETCH ==========");
    console.log("API_URL:", API_URL);
    console.log("GROUP ID:", groupId);
    console.log("FINAL SETTLEMENTS URL:", url);
    console.log("TOKEN EXISTS:", !!token);

    try {
      const response = await fetch(url, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      console.log(
        "SETTLEMENTS RESPONSE STATUS:",
        response.status
      );

      console.log(
        "SETTLEMENTS RESPONSE OK:",
        response.ok
      );

      const data = await response.json();

      console.log(
        "SETTLEMENTS RESPONSE DATA:",
        data
      );

      if (!response.ok) {
        throw new Error(
          data.message || "Failed to fetch settlements"
        );
      }

      setSettlements(data.settlements || []);

      console.log(
        "✅ SETTLEMENTS SET:",
        data.settlements || []
      );
    } catch (error) {
      console.error(
        "❌ FETCH SETTLEMENTS ERROR:",
        error
      );

      setError(
        error instanceof Error
          ? error.message
          : "Failed to fetch settlements"
      );
    }
  }

  function getMemberName(userId) {
    const member = members.find(
      (member) =>
        String(member.id) === String(userId)
    );

    return member
      ? member.name
      : `Member ${userId}`;
  }

  const totalExpenses = expenses.reduce(
    (sum, expense) =>
      sum + Number(expense.total || 0),
    0
  );

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#0b192b] font-mono text-[#e8edf2]">

      {/* PAPER TEXTURE */}
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

      {/* NAVBAR */}
      <nav className="relative z-10 border-b border-[#30445a] bg-[#0d1d31]/90">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-6 md:px-10">

          <Link
            href="/group"
            className="text-2xl font-black tracking-[-0.08em]"
          >
            split<span className="text-[#5fa8d3]">.</span>
          </Link>

          <Link
            href="/group"
            className="
              rotate-[1deg]
              border
              border-[#40556b]
              bg-[#101f32]
              px-4
              py-2
              text-[10px]
              uppercase
              tracking-[0.2em]
              text-[#718397]
              transition
              hover:border-[#5fa8d3]
              hover:text-[#aab8c5]
            "
          >
            ← groups
          </Link>

        </div>
      </nav>

      {/* MAIN */}
      <section className="relative mx-auto max-w-6xl px-6 py-10 md:px-10 md:py-14">

        {/* HEADER */}
        <div className="relative rotate-[-0.4deg] border-2 border-[#40556b] bg-[#101f32] p-7 shadow-[8px_9px_0px_rgba(0,0,0,0.35)] md:p-10">

          <div className="absolute -top-4 left-[18%] h-8 w-28 rotate-[-3deg] bg-[#526b80] opacity-50" />

          <div className="absolute -right-4 top-8 h-24 w-2 rotate-[2deg] bg-[#5fa8d3] opacity-30" />

          <div className="relative">

            <div className="flex flex-wrap items-center gap-4">

              <p className="rotate-[-2deg] text-[10px] font-bold uppercase tracking-[0.25em] text-[#5fa8d3]">
                group / {groupId}
              </p>

              <span className="text-[9px] text-[#52657a]">
                •
              </span>

              <span className="text-[9px] uppercase tracking-widest text-[#627487]">
                shared expenses
              </span>

            </div>

            <h1 className="mt-6 max-w-3xl text-4xl font-black uppercase tracking-[-0.07em] text-[#e8edf2] md:text-6xl">
              The Group.
            </h1>

            <p className="mt-4 max-w-xl text-xs leading-6 text-[#718397]">
              People, expenses, questionable financial decisions.
              <br />
              Everything in one place.
            </p>

            {/* QUICK STATS */}
            <div className="mt-8 flex flex-wrap gap-3">

              <div className="rotate-[-1deg] border border-[#40556b] bg-[#15263a] px-5 py-4">
                <p className="text-[9px] uppercase tracking-[0.2em] text-[#627487]">
                  people
                </p>

                <p className="mt-2 text-2xl font-black">
                  {members.length}
                </p>
              </div>

              <div className="rotate-[1deg] border border-[#40556b] bg-[#15263a] px-5 py-4">
                <p className="text-[9px] uppercase tracking-[0.2em] text-[#627487]">
                  expenses
                </p>

                <p className="mt-2 text-2xl font-black">
                  {expenses.length}
                </p>
              </div>

              <div className="rotate-[-0.5deg] border border-[#40556b] bg-[#15263a] px-5 py-4">
                <p className="text-[9px] uppercase tracking-[0.2em] text-[#627487]">
                  spent
                </p>

                <p className="mt-2 text-2xl font-black text-[#5fa8d3]">
                  ₹{totalExpenses.toFixed(2)}
                </p>
              </div>

            </div>

            {/* NEW EXPENSE */}
            <div className="mt-8">

              <Link
                href={`/receipt?groupId=${groupId}`}
                className="
                  inline-flex
                  rotate-[-1deg]
                  border-2
                  border-[#52657a]
                  bg-[#5fa8d3]
                  px-5
                  py-3
                  text-[10px]
                  font-bold
                  uppercase
                  tracking-[0.15em]
                  text-[#07111f]
                  shadow-[4px_4px_0px_#050c15]
                  transition
                  hover:-translate-y-0.5
                  hover:rotate-[0deg]
                  hover:bg-[#73b7df]
                "
              >
                + new expense →
              </Link>

            </div>

          </div>
        </div>

        {/* ERROR */}
        {error && (
          <div className="mt-7 rotate-[0.4deg] border-2 border-[#7c4e4e] bg-[#291d25] px-5 py-4 text-xs text-[#e58b8b] shadow-[4px_4px_0px_rgba(0,0,0,0.25)]">

            <span className="mr-2 font-bold">
              !
            </span>

            {error}

          </div>
        )}

        {/* MEMBERS */}
        <div className="mt-16">

          <div className="flex items-end justify-between border-b-2 border-[#30445a] pb-4">

            <div>
              <p className="rotate-[-1deg] text-[10px] font-bold uppercase tracking-[0.25em] text-[#5fa8d3]">
                page 01 / people
              </p>

              <h2 className="mt-3 text-2xl font-black uppercase tracking-[-0.05em]">
                Members.
              </h2>
            </div>

            <span className="hidden text-[9px] uppercase tracking-widest text-[#52657a] sm:block">
              {members.length} people
            </span>

          </div>

          {loading ? (

            <div className="mt-6 border-2 border-[#40556b] bg-[#101f32] p-8 text-center text-xs text-[#718397]">
              Loading people...
            </div>

          ) : members.length > 0 ? (

            <div className="mt-6 grid gap-5 md:grid-cols-2">

              {members.map((member, index) => (

                <div
                  key={member.id}
                  className={`
                    relative
                    border-2
                    border-[#40556b]
                    bg-[#101f32]
                    p-5
                    shadow-[5px_5px_0px_rgba(0,0,0,0.25)]
                    transition
                    hover:-translate-y-1
                    hover:border-[#5fa8d3]
                    ${
                      index % 2 === 0
                        ? "rotate-[-0.7deg]"
                        : "rotate-[0.7deg]"
                    }
                  `}
                >

                  <div
                    className={`
                      absolute
                      -top-3
                      h-7
                      w-20
                      bg-[#526b80]
                      opacity-45
                      ${
                        index % 2 === 0
                          ? "right-8 rotate-[3deg]"
                          : "left-8 rotate-[-3deg]"
                      }
                    `}
                  />

                  <div className="flex items-center justify-between gap-4">

                    <div className="flex min-w-0 items-center gap-4">

                      <div className="flex h-12 w-12 shrink-0 items-center justify-center border-2 border-[#40556b] bg-[#15263a] text-lg font-black text-[#5fa8d3]">
                        {member.name?.charAt(0).toUpperCase()}
                      </div>

                      <div className="min-w-0">

                        <p className="truncate text-sm font-bold uppercase">
                          {member.name}
                        </p>

                        <p className="mt-1 truncate text-[10px] text-[#627487]">
                          {member.email}
                        </p>

                      </div>

                    </div>

                    <p className="shrink-0 text-[9px] text-[#52657a]">
                      {member.joined_at
                        ? new Date(
                            member.joined_at
                          ).toLocaleDateString()
                        : ""}
                    </p>

                  </div>

                </div>

              ))}

            </div>

          ) : (

            <div className="mt-6 border-2 border-dashed border-[#40556b] px-6 py-10 text-center text-xs text-[#718397]">
              No members found.
            </div>

          )}

        </div>

        {/* BALANCES */}
        <div className="mt-16">

          <div className="flex items-end justify-between border-b-2 border-[#30445a] pb-4">

            <div>

              <p className="rotate-[1deg] text-[10px] font-bold uppercase tracking-[0.25em] text-[#5fa8d3]">
                page 02 / money
              </p>

              <h2 className="mt-3 text-2xl font-black uppercase tracking-[-0.05em]">
                Balances.
              </h2>

            </div>

            <span className="hidden text-[9px] uppercase tracking-widest text-[#52657a] sm:block">
              current status
            </span>

          </div>

          {Object.keys(balances).length > 0 ? (

            <div className="mt-6 grid gap-5 md:grid-cols-2">

              {Object.entries(balances).map(
                ([userId, balance], index) => {

                  const amount = Number(balance);

                  return (
                    <div
                      key={userId}
                      className={`
                        relative
                        border-2
                        border-[#40556b]
                        bg-[#101f32]
                        p-6
                        shadow-[5px_5px_0px_rgba(0,0,0,0.25)]
                        ${
                          index % 2 === 0
                            ? "rotate-[0.6deg]"
                            : "rotate-[-0.6deg]"
                        }
                      `}
                    >

                      <div className="absolute right-0 top-0 h-0 w-0 border-l-[28px] border-t-[28px] border-l-transparent border-t-[#1b3048]" />

                      <div className="flex items-center justify-between gap-4">

                        <p className="text-sm font-bold">
                          {getMemberName(userId)}
                        </p>

                        <span
                          className={`
                            border
                            px-2.5
                            py-1
                            text-[8px]
                            uppercase
                            tracking-wider
                            ${
                              amount > 0
                                ? "border-[#557c69] bg-[#1c332d] text-[#78c7a4]"
                                : amount < 0
                                ? "border-[#7c4e4e] bg-[#291d25] text-[#e58b8b]"
                                : "border-[#40556b] bg-[#15263a] text-[#718397]"
                            }
                          `}
                        >
                          {amount > 0
                            ? "gets back"
                            : amount < 0
                            ? "owes"
                            : "settled"}
                        </span>

                      </div>

                      <p
                        className={`
                          mt-6
                          text-3xl
                          font-black
                          ${
                            amount > 0
                              ? "text-[#78c7a4]"
                              : amount < 0
                              ? "text-[#e58b8b]"
                              : "text-[#718397]"
                          }
                        `}
                      >
                        {amount > 0 ? "+" : ""}
                        ₹{amount.toFixed(2)}
                      </p>

                      <p className="mt-2 text-[9px] uppercase tracking-widest text-[#52657a]">
                        balance
                      </p>

                    </div>
                  );
                }
              )}

            </div>

          ) : (

            <div className="mt-6 border-2 border-dashed border-[#40556b] bg-[#101f32] px-6 py-10 text-center text-xs text-[#718397]">
              No balance data available.
            </div>

          )}

        </div>

        {/* WHO OWES WHOM */}
        <div className="mt-16">

          <div className="flex flex-wrap items-end justify-between gap-5 border-b-2 border-[#30445a] pb-4">

            <div>

              <p className="rotate-[-1deg] text-[10px] font-bold uppercase tracking-[0.25em] text-[#5fa8d3]">
                page 03 / settlement
              </p>

              <h2 className="mt-3 text-2xl font-black uppercase tracking-[-0.05em]">
                Who owes whom?
              </h2>

            </div>

            <div className="flex items-center gap-4">

              <span className="text-[9px] uppercase tracking-wider text-[#52657a]">
                {settlements.length} pending
              </span>

              <Link
                href={`/settlement?groupId=${groupId}`}
                className="
                  rotate-[1deg]
                  border
                  border-[#40556b]
                  bg-[#15263a]
                  px-4
                  py-2
                  text-[9px]
                  font-bold
                  uppercase
                  tracking-wider
                  text-[#5fa8d3]
                  transition
                  hover:border-[#5fa8d3]
                  hover:bg-[#1b3048]
                "
              >
                View settlement →
              </Link>

            </div>

          </div>

          {settlements.length > 0 ? (

            <div className="mt-6 space-y-5">

              {settlements.map(
                (settlement, index) => (

                  <div
                    key={
                      settlement.id ??
                      index
                    }
                    className={`
                      relative
                      flex
                      items-center
                      justify-between
                      gap-5
                      border-2
                      border-[#40556b]
                      bg-[#101f32]
                      p-5
                      shadow-[5px_5px_0px_rgba(0,0,0,0.25)]
                      ${
                        index % 2 === 0
                          ? "rotate-[-0.5deg]"
                          : "rotate-[0.5deg]"
                      }
                    `}
                  >

                    <div className="flex items-center gap-4">

                      <div className="flex h-11 w-11 shrink-0 items-center justify-center border-2 border-[#40556b] bg-[#15263a] text-[#5fa8d3]">
                        →
                      </div>

                      <div>

                        <p className="text-sm font-bold">

                          {getMemberName(
                            settlement.from
                          )}

                          <span className="mx-2 text-[#52657a]">
                            →
                          </span>

                          {getMemberName(
                            settlement.to
                          )}

                        </p>

                        <p className="mt-1 text-[10px] uppercase tracking-wider text-[#627487]">
                          needs to pay
                        </p>

                      </div>

                    </div>

                    <p className="shrink-0 text-xl font-black text-[#5fa8d3]">
                      ₹
                      {Number(
                        settlement.amount
                      ).toFixed(2)}
                    </p>

                  </div>

                )
              )}

            </div>

          ) : (

            <div className="relative mt-6 rotate-[-0.4deg] border-2 border-dashed border-[#40556b] bg-[#101f32] px-6 py-12 text-center">

              <div className="mx-auto flex h-12 w-12 items-center justify-center border-2 border-[#557c69] bg-[#1c332d] text-[#78c7a4]">
                ✓
              </div>

              <p className="mt-5 text-sm font-bold uppercase">
                Everyone is settled.
              </p>

              <p className="mt-2 text-[10px] text-[#627487]">
                Nothing left to chase.
              </p>

            </div>

          )}

        </div>

        {/* EXPENSES */}
        <div className="mt-16">

          <div className="flex items-end justify-between border-b-2 border-[#30445a] pb-4">

            <div>

              <p className="rotate-[1deg] text-[10px] font-bold uppercase tracking-[0.25em] text-[#5fa8d3]">
                page 04 / activity
              </p>

              <h2 className="mt-3 text-2xl font-black uppercase tracking-[-0.05em]">
                Expenses.
              </h2>

            </div>

            <span className="hidden border border-[#40556b] bg-[#101f32] px-3 py-1 text-[9px] uppercase tracking-wider text-[#627487] sm:block">
              {expenses.length} total
            </span>

          </div>

          {expenses.length > 0 ? (

            <div className="mt-6 space-y-5">

              {expenses.map(
                (expense, index) => (

                  <div
                    key={expense.id}
                    className={`
                      border-2
                      border-[#40556b]
                      bg-[#101f32]
                      p-5
                      shadow-[5px_5px_0px_rgba(0,0,0,0.25)]
                      transition
                      hover:-translate-y-1
                      hover:border-[#5fa8d3]
                      ${
                        index % 2 === 0
                          ? "rotate-[0.4deg]"
                          : "rotate-[-0.4deg]"
                      }
                    `}
                  >

                    <div className="flex items-center justify-between gap-5">

                      <div className="flex min-w-0 items-center gap-4">

                        <div className="flex h-12 w-12 shrink-0 items-center justify-center border-2 border-[#40556b] bg-[#15263a] text-lg text-[#5fa8d3]">
                          ₹
                        </div>

                        <div className="min-w-0">

                          <p className="truncate text-sm font-bold uppercase">
                            {expense.description}
                          </p>

                          <p className="mt-1 text-[10px] text-[#627487]">
                            Paid by{" "}
                            <span className="text-[#aab8c5]">
                              {expense.created_by_name ||
                                `User ${expense.created_by}`}
                            </span>
                          </p>

                        </div>

                      </div>

                      <div className="shrink-0 text-right">

                        <p className="text-xl font-black">
                          ₹
                          {Number(
                            expense.total || 0
                          ).toFixed(2)}
                        </p>

                        <p className="mt-1 text-[9px] uppercase tracking-wider text-[#52657a]">
                          {expense.created_at
                            ? new Date(
                                expense.created_at
                              ).toLocaleDateString()
                            : ""}
                        </p>

                      </div>

                    </div>

                  </div>

                )
              )}

            </div>

          ) : (

            <div className="mt-6 rotate-[0.3deg] border-2 border-dashed border-[#40556b] bg-[#101f32] px-6 py-12 text-center">

              <div className="mx-auto flex h-12 w-12 items-center justify-center border-2 border-[#40556b] bg-[#15263a] text-slate-600">
                ₹
              </div>

              <p className="mt-5 text-sm font-bold uppercase">
                No expenses yet.
              </p>

              <p className="mt-2 text-[10px] text-[#52657a]">
                The financial chaos starts here.
              </p>

              <Link
                href={`/receipt?groupId=${groupId}`}
                className="mt-6 inline-block text-[10px] font-bold uppercase tracking-[0.2em] text-[#5fa8d3] transition hover:text-[#83c3e8] hover:underline"
              >
                Add first expense →
              </Link>

            </div>

          )}

        </div>

        {/* FOOTER */}
        <div className="relative mt-16 flex items-center justify-between border-t border-[#30445a] pt-7">

          <p className="rotate-[-2deg] text-[9px] uppercase tracking-[0.2em] text-[#52657a]">
            keep the receipts.
          </p>

          <p className="rotate-[2deg] text-[9px] text-[#5fa8d3]">
            one group. one mess. ✓
          </p>

        </div>

        <div className="h-10" />

      </section>

    </main>
  );
}