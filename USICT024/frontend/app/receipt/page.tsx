"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useState } from "react";

const API_URL = "http://localhost:5000/api";

export default function Receipt() {
  const searchParams = useSearchParams();

  const groupIdParam = searchParams.get("groupId");

  const groupId = groupIdParam
    ? Number(groupIdParam)
    : null;

  const [file, setFile] = useState<File | null>(null);
  const [fileName, setFileName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [receiptData, setReceiptData] = useState<any>(null);

  function handleFile(
    event: React.ChangeEvent<HTMLInputElement>
  ) {
    const selectedFile = event.target.files?.[0];

    if (selectedFile) {
      setFile(selectedFile);
      setFileName(selectedFile.name);
      setError("");
      setReceiptData(null);
    }
  }

  async function processReceipt() {
    if (!file) {
      setError("Please select a receipt first.");
      return;
    }

    try {
      setLoading(true);
      setError("");

      const token = localStorage.getItem("token");

      if (!token) {
        throw new Error("You are not logged in.");
      }

      const formData = new FormData();
      formData.append("receipt", file);

      const response = await fetch(
        `${API_URL}/receipts`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: formData,
        }
      );

      const data = await response.json();

      console.log("Receipt API response:", data);

      if (!response.ok) {
        throw new Error(
          data.message || "Failed to process receipt"
        );
      }

      setReceiptData(data);
    } catch (error: unknown) {
      console.error(
        "Receipt processing error:",
        error
      );

      setError(
        error instanceof Error
          ? error.message
          : "Something went wrong"
      );
    } finally {
      setLoading(false);
    }
  }

  function continueToSplit() {
     console.log("GROUP ID ON RECEIPT:", groupId);
  console.log("CURRENT URL:", window.location.href);
    if (!receiptData) return;

    if (
      groupId === null ||
      Number.isNaN(groupId)
    ) {
      setError(
        "No group selected. Please open receipt from a group."
      );
      return;
    }

    localStorage.setItem(
      "receiptData",
      JSON.stringify(receiptData)
    );

    window.location.href =
      `/split?groupId=${groupId}`;
  }

  return (
    <main className="min-h-screen overflow-hidden bg-[#0b192b] font-mono text-[#e8edf2]">

      {/* NAVBAR */}

      <nav className="border-b border-[#30445a] bg-[#0b192b]">

        <div className="flex items-center justify-between px-6 py-6 md:px-10">

          <Link
            href={
              groupId !== null
                ? `/group/${groupId}`
                : "/dashboard"
            }
            className="text-2xl font-black tracking-[-0.08em]"
          >
            split<span className="text-[#5fa8d3]">.</span>
          </Link>

          <Link
            href={
              groupId !== null
                ? `/group/${groupId}`
                : "/dashboard"
            }
            className="
              rotate-[1deg]
              border
              border-[#40556b]
              bg-[#101f32]
              px-3
              py-2
              text-[10px]
              uppercase
              tracking-[0.15em]
              text-[#718397]
              transition
              hover:border-[#5fa8d3]
              hover:text-[#e8edf2]
            "
          >
            ←{" "}
            {groupId !== null
              ? "Group"
              : "Dashboard"}
          </Link>

        </div>

      </nav>


      {/* MAIN */}

      <section className="mx-auto max-w-4xl px-6 py-12 md:px-10 md:py-16">

        {/* HEADER */}

        <div>

          <p className="mb-4 inline-block rotate-[-2deg] border border-[#40556b] bg-[#15263a] px-3 py-1 text-[9px] uppercase tracking-[0.25em] text-[#5fa8d3]">
            new expense / 01
          </p>

          <h1 className="text-5xl font-black uppercase leading-none tracking-[-0.07em] md:text-7xl">
            Add a receipt.
          </h1>

          <p className="mt-6 max-w-lg text-xs leading-6 text-[#718397]">
            Upload a receipt and let AI
            extract the items automatically.
          </p>

        </div>


        {/* NO GROUP WARNING */}

        {(
          groupId === null ||
          Number.isNaN(groupId)
        ) && (

          <div className="mt-8 border border-[#704b52] bg-[#291d25] px-5 py-4 text-xs text-[#e58b8b]">
            No group selected. Please open
            this page from a group.
          </div>

        )}


        {/* UPLOAD */}

        <div className="mt-12">

          <label
            htmlFor="receipt"
            className="
              group
              relative
              flex
              min-h-[320px]
              cursor-pointer
              flex-col
              items-center
              justify-center
              border-2
              border-dashed
              border-[#40556b]
              bg-[#101f32]
              px-6
              text-center
              transition
              duration-300
              hover:border-[#5fa8d3]
              hover:bg-[#12243a]
            "
          >

            {/* Tape */}

            <div
              className="
                absolute
                -top-4
                left-1/2
                h-8
                w-28
                -translate-x-1/2
                rotate-[2deg]
                bg-[#526b80]
                opacity-45
              "
            />

            {/* Upload icon */}

            <div
              className="
                flex
                h-16
                w-16
                rotate-[-2deg]
                items-center
                justify-center
                border-2
                border-[#52657a]
                bg-[#15263a]
                text-2xl
                text-[#5fa8d3]
                transition
                duration-300
                group-hover:rotate-0
                group-hover:border-[#5fa8d3]
              "
            >
              ↑
            </div>

            <h2 className="mt-7 text-lg font-bold text-[#e8edf2]">
              {fileName ||
                "Upload your receipt"}
            </h2>

            <p className="mt-3 text-xs leading-6 text-[#718397]">
              {fileName
                ? "Receipt selected."
                : "Click anywhere here to choose an image"}
            </p>

            {!fileName && (
              <p className="mt-6 text-[9px] uppercase tracking-[0.25em] text-[#52657a]">
                JPG · PNG · WEBP
              </p>
            )}

            <input
              id="receipt"
              type="file"
              accept="image/png,image/jpeg,image/webp"
              className="hidden"
              onChange={handleFile}
            />

          </label>

        </div>


        {/* ERROR */}

        {error && (
          <div className="mt-5 border border-[#704b52] bg-[#291d25] px-5 py-4 text-xs text-[#e58b8b]">
            {error}
          </div>
        )}


        {/* PROCESS BUTTON */}

        {file && !receiptData && (

          <div className="mt-6 flex justify-end">

            <button
              onClick={processReceipt}
              disabled={loading}
              className="
                rotate-[-1deg]
                border-2
                border-[#52657a]
                bg-[#5fa8d3]
                px-7
                py-3.5
                text-xs
                font-bold
                uppercase
                tracking-[0.15em]
                text-[#07111f]
                shadow-[5px_5px_0px_#050c15]
                transition
                hover:translate-y-[-1px]
                hover:rotate-0
                hover:bg-[#73b7df]
                disabled:cursor-not-allowed
                disabled:opacity-50
              "
            >
              {loading
                ? "Processing with AI..."
                : "Extract receipt →"}
            </button>

          </div>

        )}


        {/* RESULT */}

        {receiptData && (

          <div className="mt-8 border-2 border-[#40556b] bg-[#101f32] p-6 shadow-[6px_7px_0px_rgba(0,0,0,0.3)] md:p-7">

            {/* RESULT HEADER */}

            <div className="flex items-center justify-between border-b border-[#30445a] pb-5">

              <div>

                <p className="text-[9px] uppercase tracking-[0.25em] text-[#5fa8d3]">
                  AI extracted
                </p>

                <h2 className="mt-2 text-lg font-bold uppercase tracking-[-0.02em]">
                  Receipt details
                </h2>

              </div>

              <div className="text-right">

                <p className="text-[9px] uppercase tracking-wider text-[#52657a]">
                  Total
                </p>

                <p className="mt-1 text-xl font-bold text-[#e8edf2]">
                  ₹
                  {Number(
                    receiptData.receipt?.total ??
                    receiptData.total ??
                    0
                  ).toFixed(2)}
                </p>

              </div>

            </div>


            {/* ITEMS */}

            <div className="mt-5 space-y-2">

              {receiptData.items?.map(
                (
                  item: {
                    name: string;
                    price: number;
                  },
                  index: number
                ) => (

                  <div
                    key={index}
                    className="
                      flex
                      items-center
                      justify-between
                      border
                      border-[#30445a]
                      bg-[#0b192b]
                      px-4
                      py-3
                      transition
                      hover:border-[#40556b]
                    "
                  >

                    <p className="text-sm text-[#aab8c5]">
                      {item.name}
                    </p>

                    <p className="text-sm font-bold text-[#e8edf2]">
                      ₹
                      {Number(
                        item.price
                      ).toFixed(2)}
                    </p>

                  </div>

                )
              )}

            </div>


            {/* CONTINUE */}

            <div className="mt-6 flex justify-end">

              <button
                onClick={continueToSplit}
                disabled={
                  groupId === null ||
                  Number.isNaN(groupId)
                }
                className="
                  rotate-[1deg]
                  border-2
                  border-[#52657a]
                  bg-[#5fa8d3]
                  px-7
                  py-3.5
                  text-xs
                  font-bold
                  uppercase
                  tracking-[0.15em]
                  text-[#07111f]
                  shadow-[5px_5px_0px_#050c15]
                  transition
                  hover:translate-y-[-1px]
                  hover:rotate-0
                  hover:bg-[#73b7df]
                  disabled:cursor-not-allowed
                  disabled:opacity-50
                "
              >
                Continue to split →
              </button>

            </div>

          </div>

        )}


        {/* INFO */}

        <div className="mt-16 grid gap-6 border-t border-[#30445a] pt-8 md:grid-cols-3">

          <div>

            <p className="text-xs text-[#5fa8d3]">
              01
            </p>

            <p className="mt-2 text-xs font-bold uppercase text-[#c2cfda]">
              Upload
            </p>

          </div>

          <div>

            <p className="text-xs text-[#5fa8d3]">
              02
            </p>

            <p className="mt-2 text-xs font-bold uppercase text-[#c2cfda]">
              AI Extract
            </p>

          </div>

          <div>

            <p className="text-xs text-[#5fa8d3]">
              03
            </p>

            <p className="mt-2 text-xs font-bold uppercase text-[#c2cfda]">
              Split
            </p>

          </div>

        </div>

      </section>

    </main>
  );
}