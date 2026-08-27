"use client";

import { useState } from "react";

const API_URL =
  "https://smart-expense-splitter-paiy.onrender.com/api";

export default function Quest() {
  const [step, setStep] = useState(1);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [receiptData, setReceiptData] = useState(null);
  const [items, setItems] = useState([]);

  const [people, setPeople] = useState([]);
  const [newPerson, setNewPerson] = useState("");

  // =========================
  // UPLOAD RECEIPT
  // =========================

  const handleReceiptUpload = async (event) => {
    const file = event.target.files?.[0];

    if (!file) return;

    setError("");
    setLoading(true);

    try {
      const formData = new FormData();
      formData.append("receipt", file);

      const response = await fetch(
        `${API_URL}/receipts/quest`,
        {
          method: "POST",
          body: formData,
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Failed to scan receipt"
        );
      }

      console.log("Gemini result:", data);

      setReceiptData(data.receipt);

      const extractedItems = (data.items || []).map(
        (item, index) => ({
          id: index + 1,
          name: item.name || "",
          price: Number(item.price) || 0,
          consumers: [],
          paidBy: null,
        })
      );

      setItems(extractedItems);

      setStep(2);
    } catch (err) {
      console.error(err);

      setError(
        err.message ||
          "Something went wrong while scanning the receipt."
      );
    } finally {
      setLoading(false);
    }
  };

  // =========================
  // ADD PERSON
  // =========================

  const addPerson = () => {
    const name = newPerson.trim();

    if (!name) return;

    setPeople((previous) => [
      ...previous,
      {
        id: Date.now(),
        name,
      },
    ]);

    setNewPerson("");
  };

  // =========================
  // REMOVE PERSON
  // =========================

  const removePerson = (personId) => {
    setPeople((previous) =>
      previous.filter(
        (person) => person.id !== personId
      )
    );

    setItems((previous) =>
      previous.map((item) => ({
        ...item,

        consumers: item.consumers.filter(
          (id) => id !== personId
        ),

        paidBy:
          item.paidBy === personId
            ? null
            : item.paidBy,
      }))
    );
  };

  // =========================
  // UPDATE PERSON
  // =========================

  const updatePersonName = (
    personId,
    value
  ) => {
    setPeople((previous) =>
      previous.map((person) =>
        person.id === personId
          ? {
              ...person,
              name: value,
            }
          : person
      )
    );
  };

  // =========================
  // WHO ATE ITEM
  // =========================

  const toggleConsumer = (
    itemId,
    personId
  ) => {
    setItems((previous) =>
      previous.map((item) => {
        if (item.id !== itemId) {
          return item;
        }

        const alreadySelected =
          item.consumers.includes(personId);

        return {
          ...item,

          consumers: alreadySelected
            ? item.consumers.filter(
                (id) => id !== personId
              )
            : [
                ...item.consumers,
                personId,
              ],
        };
      })
    );
  };

  // =========================
  // WHO PAID
  // =========================

  const setItemPayer = (
    itemId,
    personId
  ) => {
    setItems((previous) =>
      previous.map((item) =>
        item.id === itemId
          ? {
              ...item,
              paidBy: personId,
            }
          : item
      )
    );
  };

  // =========================
  // EDIT OCR RESULT
  // =========================

  const updateItem = (
    itemId,
    field,
    value
  ) => {
    setItems((previous) =>
      previous.map((item) =>
        item.id === itemId
          ? {
              ...item,
              [field]:
                field === "price"
                  ? Number(value)
                  : value,
            }
          : item
      )
    );
  };

  // =========================
  // TOTAL
  // =========================

  const total = items.reduce(
    (sum, item) =>
      sum + Number(item.price || 0),
    0
  );

  // =========================
  // BALANCES
  // =========================

  const calculateBalances = () => {
    const balances = {};

    people.forEach((person) => {
      balances[person.id] = 0;
    });

    items.forEach((item) => {
      if (
        item.consumers.length === 0 ||
        !item.paidBy
      ) {
        return;
      }

      const share =
        Number(item.price) /
        item.consumers.length;

      item.consumers.forEach((personId) => {
        balances[personId] -= share;
      });

      balances[item.paidBy] +=
        Number(item.price);
    });

    return balances;
  };

  // =========================
  // WHO OWES WHOM
  // =========================

  const createDebts = () => {
    const balances = calculateBalances();

    const creditors = [];
    const debtors = [];

    people.forEach((person) => {
      const balance =
        balances[person.id] || 0;

      if (balance > 0.01) {
        creditors.push({
          id: person.id,
          name: person.name,
          amount: balance,
        });
      }

      if (balance < -0.01) {
        debtors.push({
          id: person.id,
          name: person.name,
          amount: Math.abs(balance),
        });
      }
    });

    const debts = [];

    let creditorIndex = 0;
    let debtorIndex = 0;

    while (
      creditorIndex < creditors.length &&
      debtorIndex < debtors.length
    ) {
      const creditor =
        creditors[creditorIndex];

      const debtor =
        debtors[debtorIndex];

      const amount = Math.min(
        creditor.amount,
        debtor.amount
      );

      debts.push({
        from: debtor.name,
        to: creditor.name,
        amount,
      });

      creditor.amount -= amount;
      debtor.amount -= amount;

      if (creditor.amount < 0.01) {
        creditorIndex++;
      }

      if (debtor.amount < 0.01) {
        debtorIndex++;
      }
    }

    return debts;
  };

  // =========================
  // CALCULATE RESULT
  // =========================

  const calculateResult = () => {
    const incompleteItem = items.find(
      (item) =>
        item.consumers.length === 0 ||
        !item.paidBy
    );

    if (incompleteItem) {
      setError(
        `Please assign who ate "${incompleteItem.name}" and who paid for it.`
      );

      return;
    }

    setError("");
    setStep(4);
  };

  // =========================
  // NEW QUEST
  // =========================

  const startNewQuest = () => {
    setStep(1);
    setReceiptData(null);
    setItems([]);
    setPeople([]);
    setNewPerson("");
    setError("");
  };

  // =========================
  // UI
  // =========================

  return (
    <main className="min-h-screen overflow-hidden bg-[#0b192b] font-mono text-[#e8edf2]">

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

      <div className="mx-auto w-full max-w-5xl px-5 py-10 md:px-8 md:py-14">

        {/* =========================
            HEADER
        ========================= */}

        <header className="mb-10 flex items-start justify-between gap-6">

          <div>

            <p className="mb-3 rotate-[-1deg] text-[10px] font-bold uppercase tracking-[0.3em] text-[#5fa8d3]">
              QUEST MODE ✦
            </p>

            <h1 className="text-4xl font-black uppercase leading-[0.95] tracking-[-0.07em] text-[#e8edf2] md:text-6xl">
              Split without
              <br />
              the signup.
            </h1>

            <p className="mt-5 text-xs leading-6 text-[#718397] md:text-sm">
              Upload the receipt.
              <br />
              We&apos;ll figure out the rest.
            </p>

          </div>

          <div className="rotate-[2deg] border border-[#40556b] bg-[#101f32] px-4 py-3 text-right text-[9px] font-bold uppercase tracking-[0.18em] text-[#718397] shadow-[4px_4px_0px_rgba(0,0,0,0.25)]">
            NO ACCOUNT
            <br />
            REQUIRED
          </div>

        </header>

        {/* =========================
            PROGRESS
        ========================= */}

        <div className="mb-10 grid grid-cols-4 border-y border-[#30445a]">

          {[
            ["01", "RECEIPT"],
            ["02", "PEOPLE"],
            ["03", "SPLIT"],
            ["04", "RESULT"],
          ].map(([number, label], index) => {

            const active = step >= index + 1;

            return (
              <div
                key={number}
                className={`border-r border-[#30445a] px-3 py-4 last:border-r-0 ${
                  active
                    ? "text-[#5fa8d3]"
                    : "text-[#52657a]"
                }`}
              >
                <span className="mr-2 text-[9px]">
                  {number}
                </span>

                <span className="text-[9px] font-bold tracking-wider">
                  {label}
                </span>
              </div>
            );
          })}

        </div>

        {/* =========================
            STEP CARD
        ========================= */}

        <section className="relative mx-auto max-w-3xl rotate-[0.2deg] border-2 border-[#40556b] bg-[#101f32] p-6 shadow-[8px_9px_0px_rgba(0,0,0,0.35)] md:p-10">

          {/* TAPE */}

          <div className="absolute -top-4 left-1/2 h-8 w-28 -translate-x-1/2 rotate-[1deg] bg-[#526b80] opacity-40" />

          {/* =========================
              STEP 1
          ========================= */}

          {step === 1 && (

            <div>

              <p className="mb-3 text-[10px] font-bold uppercase tracking-[0.25em] text-[#5fa8d3]">
                STEP 01
              </p>

              <h2 className="text-3xl font-black uppercase tracking-[-0.06em] md:text-4xl">
                Bring the receipt.
              </h2>

              <p className="mt-4 max-w-md text-xs leading-6 text-[#718397]">
                Upload a photo and Gemini
                will extract the items
                automatically.
              </p>

              <label
                className={`mt-8 flex min-h-[280px] cursor-pointer flex-col items-center justify-center border-2 border-dashed border-[#40556b] bg-[#0b192b] px-6 text-center transition ${
                  loading
                    ? "cursor-wait"
                    : "hover:border-[#5fa8d3] hover:bg-[#0e2035]"
                }`}
              >

                <input
                  type="file"
                  accept="image/*"
                  onChange={handleReceiptUpload}
                  disabled={loading}
                  className="hidden"
                />

                {loading ? (
                  <>
                    <div className="mb-5 text-4xl font-black text-[#5fa8d3]">
                      ...
                    </div>

                    <strong className="text-sm uppercase tracking-wider">
                      Reading receipt...
                    </strong>

                    <span className="mt-3 text-[10px] text-[#718397]">
                      Gemini is extracting the items
                    </span>
                  </>
                ) : (
                  <>
                    <div className="mb-5 text-5xl font-light text-[#5fa8d3]">
                      +
                    </div>

                    <strong className="text-sm uppercase tracking-wider">
                      Upload receipt
                    </strong>

                    <span className="mt-3 text-[10px] text-[#718397]">
                      JPG, PNG or WEBP
                    </span>
                  </>
                )}

              </label>

              {error && (
                <div className="mt-5 border border-[#7c4e4e] bg-[#291d25] px-4 py-3 text-xs leading-5 text-[#e58b8b]">
                  {error}
                </div>
              )}

              <div className="mt-6 border-l-2 border-[#5fa8d3] bg-[#15263a] px-4 py-3 text-[10px] leading-5 text-[#8da0b1]">
                <span className="mr-2 text-[#5fa8d3]">
                  ✦
                </span>
                No manual expense entry.
                Items and prices come directly
                from your receipt.
              </div>

            </div>
          )}

          {/* =========================
              STEP 2
          ========================= */}

          {step === 2 && (

            <div>

              <p className="mb-3 text-[10px] font-bold uppercase tracking-[0.25em] text-[#5fa8d3]">
                STEP 02
              </p>

              <h2 className="text-3xl font-black uppercase tracking-[-0.06em] md:text-4xl">
                Who&apos;s at the table?
              </h2>

              <p className="mt-4 text-xs leading-6 text-[#718397]">
                Add the people who need
                to split this receipt.
              </p>

              <div className="mt-8 space-y-3">

                {people.map(
                  (person, index) => (

                    <div
                      key={person.id}
                      className="flex items-center gap-3 border border-[#30445a] bg-[#0b192b] p-2"
                    >

                      <span className="w-8 text-center text-[10px] text-[#52657a]">
                        {String(
                          index + 1
                        ).padStart(2, "0")}
                      </span>

                      <input
                        value={person.name}
                        onChange={(e) =>
                          updatePersonName(
                            person.id,
                            e.target.value
                          )
                        }
                        className="min-w-0 flex-1 bg-transparent px-2 py-2 text-sm text-[#e8edf2] outline-none placeholder:text-[#52657a] focus:text-[#5fa8d3]"
                      />

                      <button
                        type="button"
                        onClick={() =>
                          removePerson(
                            person.id
                          )
                        }
                        className="px-3 text-xl text-[#718397] transition hover:text-[#e58b8b]"
                      >
                        ×
                      </button>

                    </div>
                  )
                )}

              </div>

              <div className="mt-4 flex flex-col gap-2 sm:flex-row">

                <input
                  value={newPerson}
                  placeholder="Enter a name..."
                  onChange={(e) =>
                    setNewPerson(
                      e.target.value
                    )
                  }
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      addPerson();
                    }
                  }}
                  className="flex-1 border border-[#30445a] bg-[#0b192b] px-4 py-3 text-sm text-[#e8edf2] outline-none placeholder:text-[#52657a] focus:border-[#5fa8d3]"
                />

                <button
                  type="button"
                  onClick={addPerson}
                  className="border-2 border-[#40556b] bg-[#15263a] px-6 py-3 text-xs font-bold text-[#c2cfda] transition hover:border-[#5fa8d3] hover:text-[#5fa8d3]"
                >
                  + ADD
                </button>

              </div>

              <button
                type="button"
                disabled={people.length < 2}
                onClick={() => setStep(3)}
                className="mt-8 flex w-full items-center justify-between border-2 border-[#52657a] bg-[#5fa8d3] px-5 py-4 text-sm font-bold text-[#07111f] shadow-[5px_5px_0px_#050c15] transition hover:-translate-y-0.5 hover:bg-[#73b7df] disabled:cursor-not-allowed disabled:opacity-40"
              >
                CONTINUE
                <span className="text-lg">
                  →
                </span>
              </button>

            </div>
          )}

          {/* =========================
              STEP 3
          ========================= */}

          {step === 3 && (

            <div>

              <p className="mb-3 text-[10px] font-bold uppercase tracking-[0.25em] text-[#5fa8d3]">
                STEP 03
              </p>

              <h2 className="text-3xl font-black uppercase tracking-[-0.06em] md:text-4xl">
                Who had what?
              </h2>

              <p className="mt-4 text-xs leading-6 text-[#718397]">
                Your receipt is already
                here. Just assign
                the people.
              </p>

              {receiptData && (
                <div className="mt-7 flex items-center justify-between border border-[#30445a] bg-[#0b192b] px-4 py-4">

                  <span className="text-[9px] font-bold tracking-[0.2em] text-[#718397]">
                    GEMINI RECEIPT
                  </span>

                  {receiptData.total && (
                    <strong className="text-lg text-[#5fa8d3]">
                      ₹
                      {Number(
                        receiptData.total
                      ).toFixed(2)}
                    </strong>
                  )}

                </div>
              )}

              <div className="mt-6 space-y-5">

                {items.map((item) => (

                  <div
                    key={item.id}
                    className="border border-[#30445a] bg-[#0b192b] p-5"
                  >

                    {/* ITEM */}

                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">

                      <input
                        className="min-w-0 flex-1 border-b border-[#30445a] bg-transparent py-2 text-sm font-bold uppercase text-[#e8edf2] outline-none focus:border-[#5fa8d3]"
                        value={item.name}
                        onChange={(e) =>
                          updateItem(
                            item.id,
                            "name",
                            e.target.value
                          )
                        }
                      />

                      <div className="flex items-center border-b border-[#30445a] py-2 text-sm font-bold text-[#5fa8d3]">

                        ₹

                        <input
                          type="number"
                          value={item.price}
                          onChange={(e) =>
                            updateItem(
                              item.id,
                              "price",
                              e.target.value
                            )
                          }
                          className="w-24 bg-transparent pl-1 text-right text-[#e8edf2] outline-none"
                        />

                      </div>

                    </div>

                    {/* CONSUMERS */}

                    <p className="mb-3 mt-6 text-[9px] font-bold tracking-[0.2em] text-[#718397]">
                      WHO ATE THIS?
                    </p>

                    <div className="flex flex-wrap gap-2">

                      {people.map(
                        (person) => {

                          const selected =
                            item.consumers.includes(
                              person.id
                            );

                          return (
                            <button
                              type="button"
                              key={person.id}
                              onClick={() =>
                                toggleConsumer(
                                  item.id,
                                  person.id
                                )
                              }
                              className={`border px-3 py-2 text-[10px] font-bold transition ${
                                selected
                                  ? "border-[#5fa8d3] bg-[#5fa8d3] text-[#07111f]"
                                  : "border-[#40556b] bg-[#15263a] text-[#9aabb9] hover:border-[#5fa8d3]"
                              }`}
                            >
                              {selected
                                ? "✓ "
                                : ""}
                              {person.name}
                            </button>
                          );
                        }
                      )}

                    </div>

                    {/* PAYER */}

                    <p className="mb-3 mt-6 text-[9px] font-bold tracking-[0.2em] text-[#718397]">
                      WHO PAID FOR THIS?
                    </p>

                    <div className="flex flex-wrap gap-2">

                      {people.map(
                        (person) => {

                          const selected =
                            item.paidBy ===
                            person.id;

                          return (
                            <button
                              type="button"
                              key={person.id}
                              onClick={() =>
                                setItemPayer(
                                  item.id,
                                  person.id
                                )
                              }
                              className={`border px-3 py-2 text-[10px] font-bold transition ${
                                selected
                                  ? "border-[#5fa8d3] bg-[#5fa8d3] text-[#07111f]"
                                  : "border-[#40556b] bg-[#15263a] text-[#9aabb9] hover:border-[#5fa8d3]"
                              }`}
                            >
                              {selected
                                ? "✓ "
                                : ""}
                              {person.name}
                            </button>
                          );
                        }
                      )}

                    </div>

                  </div>

                ))}

              </div>

              {error && (
                <div className="mt-5 border border-[#7c4e4e] bg-[#291d25] px-4 py-3 text-xs leading-5 text-[#e58b8b]">
                  {error}
                </div>
              )}

              <div className="mt-7 flex items-center justify-between border-t border-[#30445a] pt-6">

                <span className="text-[9px] font-bold tracking-[0.2em] text-[#718397]">
                  RECEIPT TOTAL
                </span>

                <strong className="text-2xl font-black text-[#5fa8d3]">
                  ₹{total.toFixed(2)}
                </strong>

              </div>

              <button
                type="button"
                onClick={calculateResult}
                className="mt-6 flex w-full items-center justify-between border-2 border-[#52657a] bg-[#5fa8d3] px-5 py-4 text-sm font-bold text-[#07111f] shadow-[5px_5px_0px_#050c15] transition hover:-translate-y-0.5 hover:bg-[#73b7df]"
              >
                CALCULATE SPLIT
                <span className="text-lg">
                  →
                </span>
              </button>

            </div>
          )}

          {/* =========================
              STEP 4
          ========================= */}

          {step === 4 && (

            <div>

              <p className="mb-3 text-[10px] font-bold uppercase tracking-[0.25em] text-[#5fa8d3]">
                QUEST COMPLETE ✦
              </p>

              <h2 className="text-3xl font-black uppercase tracking-[-0.06em] md:text-4xl">
                Who owes whom?
              </h2>

              <p className="mt-4 text-xs leading-6 text-[#718397]">
                Here&apos;s the simplest
                way to settle the bill.
              </p>

              {/* TOTAL */}

              <div className="mt-8 flex items-center justify-between border border-[#30445a] bg-[#0b192b] px-5 py-5">

                <span className="text-[9px] font-bold tracking-[0.2em] text-[#718397]">
                  TOTAL BILL
                </span>

                <strong className="text-2xl font-black text-[#5fa8d3]">
                  ₹{total.toFixed(2)}
                </strong>

              </div>

              {/* DEBTS */}

              <div className="mt-6 space-y-3">

                {createDebts().length === 0 ? (

                  <div className="border border-[#40556b] bg-[#15263a] px-5 py-8 text-center text-sm font-bold text-[#5fa8d3]">
                    Everyone is settled ✦
                  </div>

                ) : (

                  createDebts().map(
                    (debt, index) => (

                      <div
                        key={index}
                        className="flex flex-col gap-3 border border-[#30445a] bg-[#0b192b] p-5 sm:flex-row sm:items-center sm:justify-between"
                      >

                        <div className="flex flex-wrap items-center gap-2 text-sm">

                          <strong className="text-[#e8edf2]">
                            {debt.from}
                          </strong>

                          <span className="text-[10px] uppercase tracking-wider text-[#718397]">
                            owes
                          </span>

                          <strong className="text-[#5fa8d3]">
                            {debt.to}
                          </strong>

                        </div>

                        <b className="text-lg text-[#e8edf2]">
                          ₹
                          {debt.amount.toFixed(
                            2
                          )}
                        </b>

                      </div>
                    )
                  )

                )}

              </div>

              {/* ACTIONS */}

              <div className="mt-8 space-y-3">

                <button
                  type="button"
                  onClick={() =>
                    window.print()
                  }
                  className="flex w-full items-center justify-between border-2 border-[#52657a] bg-[#5fa8d3] px-5 py-4 text-sm font-bold text-[#07111f] shadow-[5px_5px_0px_#050c15] transition hover:-translate-y-0.5 hover:bg-[#73b7df]"
                >
                  DOWNLOAD PDF
                  <span className="text-lg">
                    ↓
                  </span>
                </button>

                <button
                  type="button"
                  onClick={startNewQuest}
                  className="w-full border-2 border-[#40556b] bg-[#15263a] px-5 py-4 text-xs font-bold text-[#c2cfda] transition hover:border-[#5fa8d3] hover:text-[#5fa8d3]"
                >
                  START NEW SPLIT
                </button>

              </div>

              <p className="mt-7 text-center text-[9px] leading-5 text-[#52657a]">
                Quest data is not saved
                to an account.
              </p>

            </div>
          )}

        </section>

        {/* FOOTER */}

        <p className="mt-8 text-center text-[9px] uppercase tracking-[0.2em] text-[#52657a]">
          split. / quest mode
        </p>

      </div>

    </main>
  );
}