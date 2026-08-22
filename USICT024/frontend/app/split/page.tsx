"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

const API_URL = "http://localhost:5000/api";

type Person = {
  id: number;
  name: string;
  selected: boolean;
};

type ReceiptItem = {
  name: string;
  price: number;
  userId?: number;
};

type GroupMember = {
  id?: number;
  user_id?: number;
  name: string;
};

type MembersResponse = {
  members?: GroupMember[];
  message?: string;
};

type ReceiptData = {
  receipt?: {
    total?: number;
  };
  total?: number;
  items?: {
    name: string;
    price: number;
  }[];
};

type ApiErrorResponse = {
  message?: string;
  error?: string;
};

function getErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }

  return "Something went wrong";
}

export default function Split() {
  const searchParams = useSearchParams();

  const groupIdParam = searchParams.get("groupId");

  const groupId = groupIdParam
    ? Number(groupIdParam)
    : null;

  const [people, setPeople] = useState<Person[]>([]);
  const [items, setItems] = useState<ReceiptItem[]>([]);
  const [amount, setAmount] = useState<number>(0);
  const [expenseName, setExpenseName] = useState<string>("");
  const [splitType, setSplitType] =
    useState<"equal" | "item">("equal");

  const [loading, setLoading] = useState<boolean>(true);
  const [creating, setCreating] = useState<boolean>(false);
  const [error, setError] = useState<string>("");

  // =================================================
  // LOAD RECEIPT
  // =================================================

  function loadReceipt(): void {
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

      const receipt: ReceiptData =
        JSON.parse(storedReceipt);

      console.log(
        "PARSED RECEIPT:",
        receipt
      );

      // -------------------------
      // Total
      // -------------------------

      if (receipt.receipt?.total != null) {
        setAmount(
          Number(receipt.receipt.total)
        );
      } else if (receipt.total != null) {
        setAmount(Number(receipt.total));
      }

      // -------------------------
      // Items
      // -------------------------

      if (Array.isArray(receipt.items)) {
        const formattedItems: ReceiptItem[] =
          receipt.items.map((item) => ({
            name: item.name,
            price: Number(item.price),
          }));

        setItems(formattedItems);
      }
    } catch (error: unknown) {
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
  // FETCH GROUP MEMBERS
  // =================================================

  async function fetchMembers(
    currentGroupId: number
  ): Promise<void> {
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
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data: MembersResponse =
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

      const members = Array.isArray(
        data.members
      )
        ? data.members
        : [];

      const formattedPeople: Person[] =
        members
          .map((member) => {
            const memberId =
              member.user_id ?? member.id;

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
            (member): member is Person =>
              member !== null
          );

      console.log(
        "FORMATTED PEOPLE:",
        formattedPeople
      );

      setPeople(formattedPeople);
    } catch (error: unknown) {
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
  // TOGGLE PERSON
  // =================================================

  function togglePerson(id: number): void {
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
  // ASSIGN ITEM
  // =================================================

  function assignItem(
    itemIndex: number,
    userId: number
  ): void {
    setItems((current) =>
      current.map((item, index) =>
        index === itemIndex
          ? {
              ...item,
              userId,
            }
          : item
      )
    );
  }

  // =================================================
  // CREATE EXPENSE
  // =================================================

  async function createExpense(): Promise<void> {
    try {
      setError("");

      if (
        groupId === null ||
        Number.isNaN(groupId)
      ) {
        setError("No group selected.");
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

      const selectedPeople =
        people.filter(
          (person) => person.selected
        );

      if (selectedPeople.length === 0) {
        setError(
          "Please select at least one person."
        );
        return;
      }

      // -------------------------
      // Item validation
      // -------------------------

      if (splitType === "item") {
        const unassigned = items.some(
          (item) => item.userId === undefined
        );

        if (unassigned) {
          setError(
            "Please assign every item to a member."
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

      // -------------------------
      // Request body
      // -------------------------

      const body: {
        groupId: number;
        description: string;
        amount: number;
        splitType: "equal" | "item";
        users?: number[];
        items?: {
          name: string;
          price: number;
          userId: number;
        }[];
      } = {
        groupId,
        description:
          expenseName.trim(),
        amount: Number(amount),
        splitType,
      };

      // -------------------------
      // Equal split
      // -------------------------

      if (splitType === "equal") {
        body.users =
          selectedPeople.map(
            (person) => person.id
          );
      }

      // -------------------------
      // Item split
      // -------------------------

      if (splitType === "item") {
        body.items = items.map(
          (item) => ({
            name: item.name,
            price: Number(item.price),
            userId: Number(
              item.userId
            ),
          })
        );
      }

      console.log(
        "CREATE EXPENSE BODY:",
        body
      );

      // -------------------------
      // API request
      // -------------------------

      const response = await fetch(
        `${API_URL}/expenses`,
        {
          method: "POST",
          headers: {
            "Content-Type":
              "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(body),
        }
      );

      const data: ApiErrorResponse =
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

      // -------------------------
      // Success
      // -------------------------

      localStorage.removeItem(
        "receiptData"
      );

      window.location.href =
        `/group/${groupId}`;
    } catch (error: unknown) {
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
  // CALCULATIONS
  // =================================================

  const selectedPeople =
    people.filter(
      (person) => person.selected
    );

  const share =
    selectedPeople.length > 0
      ? amount / selectedPeople.length
      : 0;

  const assignedItems =
    items.filter(
      (item) =>
        item.userId !== undefined
    ).length;

  // =================================================
  // NO GROUP
  // =================================================

  if (
    groupId === null ||
    Number.isNaN(groupId)
  ) {
    return (
      <main className="min-h-screen bg-[#0b192b] font-mono text-white">

        <nav className="border-b border-white/10 px-6 py-5 md:px-10">

          <div className="flex items-center justify-between">

            <Link
              href="/dashboard"
              className="text-xl font-bold tracking-tight text-white"
            >
              split
              <span className="text-blue-400">
                .
              </span>
            </Link>

            <Link
              href="/dashboard"
              className="text-xs uppercase tracking-wider text-slate-500 transition hover:text-white"
            >
              ← Dashboard
            </Link>

          </div>

        </nav>

        <section className="mx-auto max-w-4xl px-6 py-16 md:px-10">

          <div className="rounded-2xl border border-red-400/20 bg-[#101f32] p-8">

            <p className="text-xs uppercase tracking-[0.2em] text-red-400">
              Error
            </p>

            <h1 className="mt-3 text-3xl font-semibold">
              No group selected
            </h1>

            <p className="mt-4 text-sm text-slate-400">
              Open this page with
              ?groupId=1
            </p>

            <Link
              href="/group"
              className="mt-8 inline-block rounded-xl bg-white px-6 py-3 text-xs font-semibold uppercase tracking-wider text-[#0b192b] transition hover:bg-slate-200"
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
            className="text-xl font-bold tracking-tight text-white"
          >
            split
            <span className="text-blue-400">
              .
            </span>
          </Link>

          <Link
            href={`/group/${groupId}`}
            className="text-xs uppercase tracking-wider text-slate-500 transition hover:text-white"
          >
            ← Group
          </Link>

        </div>

      </nav>

      {/* MAIN */}

      <section className="mx-auto max-w-4xl px-6 py-12 md:px-10 md:py-16">

        {/* HEADER */}

        <div>

          <p className="text-xs uppercase tracking-[0.25em] text-blue-400">
            Split expense
          </p>

          <h1 className="mt-4 text-4xl font-semibold tracking-tight md:text-5xl">
            Who&apos;s paying?
          </h1>

          <p className="mt-5 max-w-lg text-sm leading-6 text-slate-400">
            Choose the people involved
            and decide how the receipt
            should be split.
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
          <div className="mt-10 rounded-2xl border border-white/10 bg-[#101f32] p-6 md:p-7">

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

                    <span className="text-white">
                      ₹
                      {Number(
                        item.price
                      ).toFixed(2)}
                    </span>

                  </div>
                )
              )}

            </div>

          </div>
        )}

        {/* EXPENSE */}

        <div className="mt-10 rounded-2xl border border-white/10 bg-[#101f32] p-6 md:p-7">

          <div className="mb-7">

            <p className="text-xs uppercase tracking-[0.2em] text-slate-600">
              Expense
            </p>

          </div>

          {/* DESCRIPTION */}

          <div>

            <label className="mb-2 block text-sm text-slate-300">
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
              className="w-full rounded-xl border border-white/10 bg-[#101f32] px-4 py-3.5 text-sm text-white outline-none transition placeholder:text-slate-600 focus:border-blue-400 focus:ring-1 focus:ring-blue-400"
            />

          </div>

          {/* AMOUNT */}

          <div className="mt-6">

            <label className="mb-2 block text-sm text-slate-300">
              Total amount
            </label>

            <div className="flex items-center rounded-xl border border-white/10 bg-[#101f32]">

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

          {/* SPLIT METHOD */}

          <div className="mt-8">

            <label className="mb-3 block text-sm text-slate-300">
              Split method
            </label>

            <div className="grid gap-3 md:grid-cols-2">

              <button
                type="button"
                onClick={() =>
                  setSplitType(
                    "equal"
                  )
                }
                className={`rounded-xl border p-4 text-left transition ${
                  splitType ===
                  "equal"
                    ? "border-blue-400/40 bg-[#132a47]"
                    : "border-white/10 bg-[#101f32] hover:border-white/20"
                }`}
              >

                <p className="text-sm font-medium">
                  Equal split
                </p>

                <p className="mt-1 text-xs text-slate-500">
                  Divide the bill
                  equally
                </p>

              </button>

              <button
                type="button"
                onClick={() =>
                  setSplitType(
                    "item"
                  )
                }
                className={`rounded-xl border p-4 text-left transition ${
                  splitType ===
                  "item"
                    ? "border-blue-400/40 bg-[#132a47]"
                    : "border-white/10 bg-[#101f32] hover:border-white/20"
                }`}
              >

                <p className="text-sm font-medium">
                  Item-wise
                </p>

                <p className="mt-1 text-xs text-slate-500">
                  Assign individual
                  items
                </p>

              </button>

            </div>

          </div>

        </div>

        {/* PEOPLE */}

        <div className="mt-8 rounded-2xl border border-white/10 bg-[#101f32] p-6 md:p-7">

          <div className="flex items-end justify-between">

            <div>

              <p className="text-xs uppercase tracking-[0.2em] text-slate-600">
                People
              </p>

              <h2 className="mt-2 text-lg font-medium">
                Who should be included?
              </h2>

            </div>

            <span className="text-xs text-blue-400">
              {selectedPeople.length}{" "}
              selected
            </span>

          </div>

          <div className="mt-5 space-y-2">

            {loading ? (

              <div className="rounded-xl border border-white/10 bg-[#101f32] p-5 text-sm text-slate-500">
                Loading group members...
              </div>

            ) : people.length ===
              0 ? (

              <div className="rounded-xl border border-red-400/20 bg-red-400/10 p-5 text-sm text-red-300">
                You are not a
                member of this group.
              </div>

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
                    className={`flex w-full items-center justify-between rounded-xl border px-4 py-4 text-left transition ${
                      person.selected
                        ? "border-blue-400/30 bg-[#132a47]"
                        : "border-white/10 bg-[#101f32] hover:border-white/20"
                    }`}
                  >

                    <div className="flex items-center gap-3">

                      <div
                        className={`flex h-9 w-9 items-center justify-center rounded-full text-xs ${
                          person.selected
                            ? "bg-blue-400 text-[#0b192b]"
                            : "bg-[#1a304d] text-slate-500"
                        }`}
                      >
                        {person.name
                          .charAt(0)
                          .toUpperCase()}
                      </div>

                      <span className="text-sm">
                        {person.name}
                      </span>

                    </div>

                    <span
                      className={
                        person.selected
                          ? "text-blue-400"
                          : "text-slate-700"
                      }
                    >
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

        {/* ITEM ASSIGNMENT */}

        {splitType ===
          "item" &&
          items.length > 0 && (

            <div className="mt-8 rounded-2xl border border-white/10 bg-[#101f32] p-6 md:p-7">

              <p className="text-xs uppercase tracking-[0.2em] text-slate-600">
                Assign items
              </p>

              <h2 className="mt-2 text-lg font-medium">
                Choose who is responsible
                for each item.
              </h2>

              <div className="mt-5 space-y-3">

                {items.map(
                  (item, index) => (

                    <div
                      key={index}
                      className="flex items-center justify-between rounded-xl border border-white/10 bg-[#101f32] p-4"
                    >

                      <div>

                        <p className="text-sm text-slate-300">
                          {item.name}
                        </p>

                        <p className="mt-1 text-xs text-slate-600">
                          ₹
                          {Number(
                            item.price
                          ).toFixed(2)}
                        </p>

                      </div>

                      <select
                        value={
                          item.userId ??
                          ""
                        }
                        onChange={(e) =>
                          assignItem(
                            index,
                            Number(
                              e.target.value
                            )
                          )
                        }
                        className="rounded-lg border border-white/10 bg-[#0b192b] px-3 py-2 text-xs text-white outline-none focus:border-blue-400"
                      >

                        <option value="">
                          Select member
                        </option>

                        {people
                          .filter(
                            (
                              person
                            ) =>
                              person.selected
                          )
                          .map(
                            (
                              person
                            ) => (

                              <option
                                key={
                                  person.id
                                }
                                value={
                                  person.id
                                }
                              >
                                {
                                  person.name
                                }
                              </option>

                            )
                          )}

                      </select>

                    </div>

                  )
                )}

              </div>

            </div>

          )}

        {/* SUMMARY */}

        <div className="mt-8 rounded-2xl border border-blue-400/20 bg-[#102038] p-6 md:p-7">

          <div className="flex items-center justify-between border-b border-white/10 pb-5">

            <div>

              <p className="text-[10px] uppercase tracking-[0.2em] text-blue-400">
                Summary
              </p>

              <p className="mt-2 text-sm">
                {splitType ===
                "equal"
                  ? "Equal split"
                  : "Item split"}
              </p>

            </div>

            <div className="text-right">

              <p className="text-[10px] uppercase tracking-wider text-slate-600">
                Total
              </p>

              <p className="mt-1 text-lg font-semibold">
                ₹
                {amount.toFixed(
                  2
                )}
              </p>

            </div>

          </div>

          {splitType ===
          "equal" ? (

            <div className="mt-5">

              <div className="flex items-center justify-between">

                <span className="text-xs text-slate-500">
                  Each person pays
                </span>

                <span className="text-lg font-medium text-blue-400">
                  ₹
                  {share.toFixed(
                    2
                  )}
                </span>

              </div>

              <div className="mt-5 space-y-3">

                {selectedPeople.map(
                  (person) => (

                    <div
                      key={
                        person.id
                      }
                      className="flex items-center justify-between text-sm"
                    >

                      <span className="text-slate-300">
                        {
                          person.name
                        }
                      </span>

                      <span>
                        ₹
                        {share.toFixed(
                          2
                        )}
                      </span>

                    </div>

                  )
                )}

              </div>

            </div>

          ) : (

            <div className="mt-5 flex items-center justify-between">

              <span className="text-xs text-slate-500">
                Items assigned
              </span>

              <span className="text-sm text-blue-400">
                {
                  assignedItems
                }{" "}
                /{" "}
                {items.length}
              </span>

            </div>

          )}

          <button
            type="button"
            onClick={
              createExpense
            }
            disabled={creating}
            className="mt-8 block w-full rounded-xl bg-white py-3.5 text-center text-xs font-semibold uppercase tracking-wider text-[#0b192b] transition hover:bg-slate-200 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {creating
              ? "Creating..."
              : "Create expense →"}
          </button>

        </div>

        {/* STEPS */}

        <div className="mt-12 flex gap-5 border-t border-white/10 pt-6 text-[10px] uppercase tracking-[0.2em]">

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