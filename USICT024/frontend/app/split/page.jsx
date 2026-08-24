
"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";

const API_URL = "https://smart-expense-splitter-paiy.onrender.com/api";






function getErrorMessage(error) {
  if (error instanceof Error) {
    return error.message;
  }

  return "Something went wrong";
}
function SplitContent() {
  const searchParams = useSearchParams();

  const groupIdParam = searchParams.get("groupId");

  const groupId = groupIdParam
    ? Number(groupIdParam)
    : null;

 const [people, setPeople] = useState([]);
  const [items, setItems] = useState([]);

  const [amount, setAmount] = useState<number>(0);
  const [expenseName, setExpenseName] =
    useState<string>("");

  const [splitType, setSplitType] =
    useState<"equal" | "item">("equal");

  // Who actually paid
  const [payerId, setPayerId] =
    useState<number | null>(null);

  // How much the payer paid
  const [paymentAmount, setPaymentAmount] =
    useState<number>(0);

  const [loading, setLoading] =
    useState<boolean>(true);

  const [creating, setCreating] =
    useState<boolean>(false);

  const [error, setError] =
    useState<string>("");

  // =================================================
  // LOAD RECEIPT
  // =================================================

function loadReceipt() {
    try {
      const storedReceipt =
        localStorage.getItem("receiptData");

      console.log(
        "STORED RECEIPT:",
        storedReceipt
      );

      if (!storedReceipt) {
        return;
      }

      const receipt =
  JSON.parse(storedReceipt);

      console.log(
        "PARSED RECEIPT:",
        receipt
      );

      let receiptTotal = 0;

      if (receipt.receipt?.total != null) {
        receiptTotal =
          Number(receipt.receipt.total);
      } else if (receipt.total != null) {
        receiptTotal =
          Number(receipt.total);
      }

      setAmount(receiptTotal);

      // Default payment = entire bill
      setPaymentAmount(receiptTotal);

      if (Array.isArray(receipt.items)) {
        const formattedItems =
          receipt.items.map((item) => ({
            name: item.name,
            price: Number(item.price),
            userIds: [],
          }));

        setItems(formattedItems);
      }
    } catch (error) {
      console.error(
        "Receipt loading error:",
        error
      );

      setError(
        "Failed to load receipt data."
      );
    }
  }

  // =================================================
  // FETCH MEMBERS
  // =================================================

  async function fetchMembers(currentGroupId) {
 
    try {
      setLoading(true);
      setError("");

      const token =
        localStorage.getItem("token");

      if (!token) {
        throw new Error(
          "You are not logged in."
        );
      }

      const response = await fetch(
        `${API_URL}/groups/${currentGroupId}/members`,
        {
          method: "GET",
          headers: {
            Authorization:
              `Bearer ${token}`,
          },
        }
      );

      const data =
        await response.json();

      console.log(
        "GROUP MEMBERS RESPONSE:",
        data
      );

      if (!response.ok) {
        throw new Error(
          data.message ||
            "Failed to fetch group members"
        );
      }

      const members =
        Array.isArray(data.members)
          ? data.members
          : [];

const formattedPeople =
  members
          .map((member) => {
            const memberId =
              member.user_id ??
              member.id;

            if (
              memberId === undefined ||
              !member.name
            ) {
              return null;
            }

            return {
              id: Number(memberId),
              name: member.name,
              selected: false,
            };
          })
          .filter(
            (
              member
          ) =>
  member !== null
              
          );

      setPeople(formattedPeople);

      // Default payer = first group member
      if (
        formattedPeople.length > 0
      ) {
        setPayerId(
          formattedPeople[0].id
        );
      }

    } catch (error) {
      console.error(
        "Members error:",
        error
      );

      setPeople([]);

      setError(
        getErrorMessage(error)
      );

    } finally {
      setLoading(false);
    }
  }

  // =================================================
  // LOAD DATA
  // =================================================

  useEffect(() => {
    if (
      groupId === null ||
      Number.isNaN(groupId)
    ) {
      setLoading(false);
      return;
    }

    loadReceipt();
    fetchMembers(groupId);
  }, [groupId]);

  // =================================================
  // SELECT / UNSELECT MEMBER
  // =================================================

function togglePerson(id) {
    setPeople((current) =>
      current.map((person) =>
        person.id === id
          ? {
              ...person,
              selected:
                !person.selected,
            }
          : person
      )
    );
  }

  // =================================================
  // SELECT PAYER
  // =================================================

function selectPayer(id) {
  setPayerId(id);
}

  // =================================================
  // ASSIGN ITEM TO USER
  // =================================================

 function toggleItemUser(
  itemIndex,
  userId
) {
    setItems((current) =>
      current.map((item, index) => {
        if (index !== itemIndex) {
          return item;
        }

        const alreadyAssigned =
          item.userIds.includes(userId);

        return {
          ...item,
          userIds: alreadyAssigned
            ? item.userIds.filter(
                (id) => id !== userId
              )
            : [
                ...item.userIds,
                userId,
              ],
        };
      })
    );
  }

  // =================================================
  // SELECTED PEOPLE
  // =================================================

  const selectedPeople =
    people.filter(
      (person) => person.selected
    );

  // =================================================
  // ITEM SHARES
  // =================================================

 function calculateItemTotals() {
  const totals = {};

    for (const item of items) {
      if (item.userIds.length === 0) {
        continue;
      }

      const share =
        item.price /
        item.userIds.length;

      for (const userId of item.userIds) {
        totals[userId] =
          (totals[userId] || 0) +
          share;
      }
    }

    return totals;
  }

  const itemTotals =
    calculateItemTotals();

  // =================================================
  // CREATE EXPENSE
  // =================================================

  async function createExpense() {
    try {
      setError("");

      // =========================
      // BASIC VALIDATION
      // =========================

      if (
        groupId === null ||
        Number.isNaN(groupId)
      ) {
        setError(
          "No group selected."
        );
        return;
      }

      if (!expenseName.trim()) {
        setError(
          "Please enter an expense description."
        );
        return;
      }

      if (amount <= 0) {
        setError(
          "Please enter a valid amount."
        );
        return;
      }

      if (
        selectedPeople.length === 0
      ) {
        setError(
          "Please select at least one person."
        );
        return;
      }

      if (payerId === null) {
        setError(
          "Please select who paid."
        );
        return;
      }

      if (
        paymentAmount <= 0
      ) {
        setError(
          "Please enter how much they paid."
        );
        return;
      }

      if (
        paymentAmount >
        amount
      ) {
        setError(
          "Payment cannot be greater than the total."
        );
        return;
      }

      // =========================
      // ITEM VALIDATION
      // =========================

      if (
        splitType === "item"
      ) {
        const unassigned =
          items.some(
            (item) =>
              item.userIds.length === 0
          );

        if (unassigned) {
          setError(
            "Please assign every item to at least one member."
          );
          return;
        }
      }

      setCreating(true);

      const token =
        localStorage.getItem("token");

      if (!token) {
        throw new Error(
          "You are not logged in."
        );
      }

      // =========================
      // REQUEST BODY
      // =========================

const body = {
        groupId,
        description:
          expenseName.trim(),

        amount:
          Number(amount),

        splitType,

        // Actual payer
        payerId,

        // Amount actually paid
        paymentAmount:
          Number(paymentAmount),
      };

      // =========================
      // EQUAL SPLIT
      // =========================

      if (
        splitType === "equal"
      ) {
        body.users =
          selectedPeople.map(
            (person) =>
              person.id
          );
      }

      // =========================
      // ITEM SPLIT
      // =========================

      if (
        splitType === "item"
      ) {
        body.items =
          items.map(
            (item) => ({
              name: item.name,
              price:
                Number(item.price),
              users:
                item.userIds,
            })
          );
      }

      console.log(
        "CREATE EXPENSE BODY:",
        body
      );

      // =========================
      // API REQUEST
      // =========================

      const response =
        await fetch(
          `${API_URL}/expenses`,
          {
            method: "POST",
            headers: {
              "Content-Type":
                "application/json",
              Authorization:
                `Bearer ${token}`,
            },
            body:
              JSON.stringify(body),
          }
        );

      const data =
  await response.json();

      console.log(
        "CREATE EXPENSE RESPONSE:",
        data
      );

      if (!response.ok) {
        throw new Error(
          data.message ||
            data.error ||
            `Failed to create expense (${response.status})`
        );
      }

      // =========================
      // SUCCESS
      // =========================

      localStorage.removeItem(
        "receiptData"
      );

      window.location.href =
        `/group/${groupId}`;

    } catch (error) {
      console.error(
        "Create expense error:",
        error
      );

      setError(
        getErrorMessage(error)
      );

    } finally {
      setCreating(false);
    }
  }

  // =================================================
  // EQUAL SHARE PREVIEW
  // =================================================

  const equalShare =
    selectedPeople.length > 0
      ? amount /
        selectedPeople.length
      : 0;

  // =================================================
  // ITEM SUBTOTAL
  // =================================================

  const itemSubtotal =
    items.reduce(
      (sum, item) =>
        sum + Number(item.price),
      0
    );

  // =================================================
  // NO GROUP
  // =================================================

  if (
    groupId === null ||
    Number.isNaN(groupId)
  ) {
    return (
      <main className="min-h-screen bg-[#0b192b] font-mono text-white">

        <nav className="border-b border-white/10 px-6 py-5">
          <Link
            href="/dashboard"
            className="text-xl font-bold"
          >
            split<span className="text-blue-400">.</span>
          </Link>
        </nav>

        <section className="mx-auto max-w-4xl px-6 py-16">

          <div className="rounded-2xl border border-red-400/20 bg-[#101f32] p-8">

            <p className="text-xs uppercase tracking-[0.2em] text-red-400">
              Error
            </p>

            <h1 className="mt-3 text-3xl font-semibold">
              No group selected
            </h1>

            <Link
              href="/group"
              className="mt-8 inline-block rounded-xl bg-white px-6 py-3 text-xs font-semibold text-[#0b192b]"
            >
              Go to groups
            </Link>

          </div>

        </section>

      </main>
    );
  }

  // =================================================
  // MAIN PAGE
  // =================================================

  return (
    <main className="min-h-screen bg-[#0b192b] font-mono text-white">

      {/* NAVBAR */}

      <nav className="border-b border-white/10 bg-[#0b192b]">

        <div className="flex items-center justify-between px-6 py-5 md:px-10">

          <Link
            href={`/group/${groupId}`}
            className="text-xl font-bold tracking-tight"
          >
            split
            <span className="text-blue-400">
              .
            </span>
          </Link>

          <Link
            href={`/group/${groupId}`}
            className="text-xs uppercase tracking-wider text-slate-500 hover:text-white"
          >
            ← Group
          </Link>

        </div>

      </nav>

      <section className="mx-auto max-w-5xl px-6 py-12 md:px-10">

        {/* HEADER */}

        <div>

          <p className="text-xs uppercase tracking-[0.25em] text-blue-400">
            Split expense
          </p>

          <h1 className="mt-4 text-4xl font-semibold tracking-tight">
            Split the receipt.
          </h1>

          <p className="mt-5 max-w-lg text-sm leading-6 text-slate-400">
            Decide who was involved,
            what everyone had, and
            who actually paid.
          </p>

        </div>

        {/* ERROR */}

        {error && (
          <div className="mt-8 rounded-xl border border-red-400/20 bg-red-400/10 px-5 py-4 text-sm text-red-300">
            {error}
          </div>
        )}

        {/* RECEIPT */}

        {items.length > 0 && (
          <div className="mt-10 rounded-2xl border border-white/10 bg-[#101f32] p-6">

            <div className="flex items-center justify-between border-b border-white/10 pb-5">

              <div>
                <p className="text-[10px] uppercase tracking-[0.2em] text-blue-400">
                  AI Receipt
                </p>

                <p className="mt-2 text-xs text-slate-500">
                  Extracted from your receipt
                </p>
              </div>

              <p className="text-xl font-semibold">
                ₹{amount.toFixed(2)}
              </p>

            </div>

            <div className="mt-5 space-y-3">

              {items.map(
                (item, index) => (
                  <div
                    key={index}
                    className="flex justify-between border-b border-white/10 pb-3 text-sm last:border-0"
                  >

                    <span className="text-slate-300">
                      {item.name}
                    </span>

                    <span>
                      ₹
                      {item.price.toFixed(2)}
                    </span>

                  </div>
                )
              )}

            </div>

            {Math.abs(
              amount - itemSubtotal
            ) > 0.01 && (
              <div className="mt-5 border-t border-white/10 pt-4">

                <div className="flex justify-between text-xs text-slate-500">
                  <span>
                    Items subtotal
                  </span>

                  <span>
                    ₹
                    {itemSubtotal.toFixed(2)}
                  </span>
                </div>

                <div className="mt-2 flex justify-between text-xs text-slate-500">
                  <span>
                    Tax / charges
                  </span>

                  <span>
                    ₹
                    {(
                      amount -
                      itemSubtotal
                    ).toFixed(2)}
                  </span>
                </div>

                <div className="mt-3 flex justify-between border-t border-white/10 pt-3 font-semibold">
                  <span>
                    Total
                  </span>

                  <span>
                    ₹
                    {amount.toFixed(2)}
                  </span>
                </div>

              </div>
            )}

          </div>
        )}

        {/* EXPENSE */}

        <div className="mt-8 rounded-2xl border border-white/10 bg-[#101f32] p-6">

          <label className="text-sm text-slate-300">
            Description
          </label>

          <input
            value={expenseName}
            onChange={(e) =>
              setExpenseName(
                e.target.value
              )
            }
            placeholder="Dinner, groceries..."
            className="mt-2 w-full rounded-xl border border-white/10 bg-[#0b192b] px-4 py-3.5 text-sm outline-none focus:border-blue-400"
          />

          <label className="mt-6 block text-sm text-slate-300">
            Total amount
          </label>

          <div className="mt-2 flex items-center rounded-xl border border-white/10 bg-[#0b192b]">

            <span className="pl-4 text-slate-500">
              ₹
            </span>

            <input
              type="number"
              value={amount}
              onChange={(e) =>
                setAmount(
                  Number(
                    e.target.value
                  )
                )
              }
              className="w-full bg-transparent py-3.5 pr-4 text-lg outline-none"
            />

          </div>

        </div>

        {/* MEMBERS */}

        <div className="mt-8 rounded-2xl border border-white/10 bg-[#101f32] p-6">

          <div className="flex items-end justify-between">

            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-slate-600">
                Step 01
              </p>

              <h2 className="mt-2 text-lg font-medium">
                Who is included?
              </h2>

              <p className="mt-1 text-xs text-slate-500">
                These people owe a share of
                the expense.
              </p>
            </div>

            <span className="text-xs text-blue-400">
              {selectedPeople.length} selected
            </span>

          </div>

          <div className="mt-5 space-y-2">

            {loading ? (
              <p className="text-sm text-slate-500">
                Loading members...
              </p>
            ) : (
              people.map(
                (person) => (
                  <button
                    type="button"
                    key={person.id}
                    onClick={() =>
                      togglePerson(
                        person.id
                      )
                    }
                    className={`flex w-full items-center justify-between rounded-xl border px-4 py-4 text-left ${
                      person.selected
                        ? "border-blue-400/30 bg-[#132a47]"
                        : "border-white/10 bg-[#0b192b]"
                    }`}
                  >

                    <span>
                      {person.name}
                    </span>

                    <span className="text-blue-400">
                      {person.selected
                        ? "✓"
                        : "+"}
                    </span>

                  </button>
                )
              )
            )}

          </div>

        </div>

        {/* WHO PAID */}

        <div className="mt-8 rounded-2xl border border-white/10 bg-[#101f32] p-6">

          <p className="text-xs uppercase tracking-[0.2em] text-blue-400">
            Step 02
          </p>

          <h2 className="mt-2 text-lg font-medium">
            Who paid?
          </h2>

          <p className="mt-1 text-xs text-slate-500">
            Choose the person who actually paid
            the bill.
          </p>

          <div className="mt-5 space-y-2">

            {people.map(
              (person) => (
                <button
                  type="button"
                  key={person.id}
                  onClick={() =>
                    selectPayer(
                      person.id
                    )
                  }
                  className={`flex w-full items-center justify-between rounded-xl border px-4 py-4 text-left ${
                    payerId === person.id
                      ? "border-blue-400/30 bg-[#132a47]"
                      : "border-white/10 bg-[#0b192b]"
                  }`}
                >

                  <span>
                    {person.name}
                  </span>

                  <span className="text-blue-400">
                    {payerId === person.id
                      ? "✓"
                      : "+"}
                  </span>

                </button>
              )
            )}

          </div>

          <div className="mt-5">

            <label className="mb-2 block text-sm text-slate-300">
              Amount paid
            </label>

            <div className="flex items-center rounded-xl border border-white/10 bg-[#0b192b]">

              <span className="pl-4 text-slate-500">
                ₹
              </span>

              <input
                type="number"
                value={paymentAmount}
                onChange={(e) =>
                  setPaymentAmount(
                    Number(
                      e.target.value
                    )
                  )
                }
                className="w-full bg-transparent py-3.5 pr-4 text-lg outline-none"
              />

            </div>

          </div>

        </div>

        {/* SPLIT TYPE */}

        <div className="mt-8 rounded-2xl border border-white/10 bg-[#101f32] p-6">

          <p className="text-xs uppercase tracking-[0.2em] text-slate-600">
            Step 03
          </p>

          <h2 className="mt-2 text-lg font-medium">
            How should we calculate what
            everyone owes?
          </h2>

          <div className="mt-5 grid gap-3 md:grid-cols-2">

            <button
              type="button"
              onClick={() =>
                setSplitType("equal")
              }
              className={`rounded-xl border p-4 text-left ${
                splitType === "equal"
                  ? "border-blue-400/40 bg-[#132a47]"
                  : "border-white/10"
              }`}
            >
              <p className="text-sm font-medium">
                Equal split
              </p>

              <p className="mt-1 text-xs text-slate-500">
                Everyone shares the total
                equally.
              </p>
            </button>

            <button
              type="button"
              onClick={() =>
                setSplitType("item")
              }
              className={`rounded-xl border p-4 text-left ${
                splitType === "item"
                  ? "border-blue-400/40 bg-[#132a47]"
                  : "border-white/10"
              }`}
            >
              <p className="text-sm font-medium">
                Item-wise
              </p>

              <p className="mt-1 text-xs text-slate-500">
                Assign items to the people
                who had them.
              </p>
            </button>

          </div>

        </div>

        {/* TABLE 1: WHO HAD WHAT */}

        {splitType === "item" && (
          <div className="mt-8 rounded-2xl border border-white/10 bg-[#101f32] p-6">

            <p className="text-xs uppercase tracking-[0.2em] text-blue-400">
              Step 04
            </p>

            <h2 className="mt-2 text-lg font-medium">
              Who had what?
            </h2>

            <p className="mt-1 text-xs text-slate-500">
              Select everyone who shared each
              item.
            </p>

            <div className="mt-6 overflow-x-auto">

              <table className="w-full text-sm">

                <thead>
                  <tr className="border-b border-white/10 text-left text-xs text-slate-500">

                    <th className="pb-3">
                      Item
                    </th>

                    <th className="pb-3">
                      Price
                    </th>

                    {selectedPeople.map(
                      (person) => (
                        <th
                          key={person.id}
                          className="pb-3 text-center"
                        >
                          {person.name}
                        </th>
                      )
                    )}

                  </tr>
                </thead>

                <tbody>

                  {items.map(
                    (item, index) => (
                      <tr
                        key={index}
                        className="border-b border-white/10 last:border-0"
                      >

                        <td className="py-4 text-slate-300">
                          {item.name}
                        </td>

                        <td className="py-4">
                          ₹
                          {item.price.toFixed(2)}
                        </td>

                        {selectedPeople.map(
                          (person) => {

                            const checked =
                              item.userIds.includes(
                                person.id
                              );

                            return (
                              <td
                                key={person.id}
                                className="py-4 text-center"
                              >

                                <button
                                  type="button"
                                  onClick={() =>
                                    toggleItemUser(
                                      index,
                                      person.id
                                    )
                                  }
                                  className={`h-8 w-8 rounded-lg border ${
                                    checked
                                      ? "border-blue-400 bg-blue-400 text-[#0b192b]"
                                      : "border-white/10 text-slate-600"
                                  }`}
                                >
                                  {checked
                                    ? "✓"
                                    : "+"}
                                </button>

                              </td>
                            );
                          }
                        )}

                      </tr>
                    )
                  )}

                </tbody>

              </table>

            </div>

            <div className="mt-6 border-t border-white/10 pt-5">

              <p className="text-xs uppercase tracking-wider text-slate-600">
                Current item totals
              </p>

              <div className="mt-3 space-y-2">

                {selectedPeople.map(
                  (person) => (
                    <div
                      key={person.id}
                      className="flex justify-between text-sm"
                    >

                      <span>
                        {person.name}
                      </span>

                      <span>
                        ₹
                        {(
                          itemTotals[
                            person.id
                          ] || 0
                        ).toFixed(2)}
                      </span>

                    </div>
                  )
                )}

              </div>

            </div>

          </div>
        )}

        {/* EQUAL PREVIEW */}

        {splitType === "equal" && (
          <div className="mt-8 rounded-2xl border border-white/10 bg-[#101f32] p-6">

            <p className="text-xs uppercase tracking-[0.2em] text-blue-400">
              Step 04
            </p>

            <h2 className="mt-2 text-lg font-medium">
              Equal shares
            </h2>

            <div className="mt-5 space-y-3">

              {selectedPeople.map(
                (person) => (
                  <div
                    key={person.id}
                    className="flex justify-between rounded-xl border border-white/10 px-4 py-3"
                  >

                    <span>
                      {person.name}
                    </span>

                    <span className="text-blue-400">
                      ₹
                      {equalShare.toFixed(2)}
                    </span>

                  </div>
                )
              )}

            </div>

          </div>
        )}

        {/* FINAL SUMMARY */}

        <div className="mt-8 rounded-2xl border border-blue-400/20 bg-[#102038] p-6">

          <p className="text-xs uppercase tracking-[0.2em] text-blue-400">
            Final summary
          </p>

          <div className="mt-5 space-y-3">

            <div className="flex justify-between text-sm">
              <span className="text-slate-500">
                Receipt total
              </span>

              <span>
                ₹
                {amount.toFixed(2)}
              </span>
            </div>

            <div className="flex justify-between text-sm">
              <span className="text-slate-500">
                Included people
              </span>

              <span>
                {selectedPeople.length}
              </span>
            </div>

            <div className="flex justify-between text-sm">
              <span className="text-slate-500">
                Paid by
              </span>

              <span>
                {people.find(
                  (person) =>
                    person.id ===
                    payerId
                )?.name ||
                  "Not selected"}
              </span>
            </div>

            <div className="flex justify-between text-sm">
              <span className="text-slate-500">
                Amount paid
              </span>

              <span>
                ₹
                {paymentAmount.toFixed(2)}
              </span>
            </div>

          </div>

          <button
            type="button"
            onClick={
              createExpense
            }
            disabled={creating}
            className="mt-8 block w-full rounded-xl bg-white py-3.5 text-center text-xs font-semibold uppercase tracking-wider text-[#0b192b] hover:bg-slate-200 disabled:opacity-50"
          >
            {creating
              ? "Creating..."
              : "Calculate & create expense →"}
          </button>

        </div>

        {/* STEPS */}

        <div className="mt-12 flex gap-5 border-t border-white/10 pt-6 text-[10px] uppercase tracking-[0.2em]">

          <span className="text-blue-400">
            01 Members
          </span>

          <span className="text-blue-400">
            02 Who paid
          </span>

          <span className="text-blue-400">
            03 Split
          </span>

          <span className="text-slate-600">
            04 Settle
          </span>

        </div>

      </section>

    </main>
  );
}


export default function Split() {
  return (
    <Suspense
      fallback={
        <main className="flex min-h-screen items-center justify-center bg-[#0b192b] font-mono text-white">
          <p className="text-sm text-slate-500">
            Loading split...
          </p>
        </main>
      }
    >
      <SplitContent />
    </Suspense>
  );
}

