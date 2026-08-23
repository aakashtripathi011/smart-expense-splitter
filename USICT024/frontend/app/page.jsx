import Link from "next/link";

export default function Home() {
  return (
    <main className="min-h-screen overflow-hidden bg-[#0b192b] text-[#e8edf2]">

      {/* Subtle paper texture */}
      <div className="pointer-events-none fixed inset-0 z-50 opacity-[0.05]">
        <div
          className="h-full w-full"
          style={{
            backgroundImage: `
              radial-gradient(#b8c7d6 0.6px, transparent 0.6px)
            `,
            backgroundSize: "7px 7px",
          }}
        />
      </div>


      {/* ================= NAVBAR ================= */}

      <nav className="relative z-10 mx-auto flex max-w-6xl items-center justify-between px-6 py-7 md:px-10">

        <Link
          href="/"
          className="font-mono text-2xl font-black tracking-[-0.08em]"
        >
          split<span className="text-[#5fa8d3]">.</span>
        </Link>

        <Link
          href="/login"
          className="
            rotate-[1deg]
            border-2
            border-[#40556b]
            bg-[#15263a]
            px-5
            py-2
            font-mono
            text-sm
            text-[#dce5ed]
            shadow-[3px_3px_0px_#050c15]
            transition
            hover:-translate-y-0.5
            hover:border-[#60788f]
            hover:shadow-[5px_5px_0px_#050c15]
          "
        >
          log in →
        </Link>

      </nav>


      {/* ================= HERO ================= */}

      <section className="relative mx-auto max-w-6xl px-6 pb-24 pt-8 md:px-10">


        {/* Small handwritten note */}

        <div className="absolute right-[8%] top-0 hidden rotate-[8deg] font-mono text-xs text-[#718397] md:block">

          <span className="block">
            because doing math
          </span>

          <span className="block">
            after dinner is illegal.
          </span>

          <span className="ml-10 text-[#5fa8d3]">
            — probably
          </span>

        </div>


        {/* ================= TITLE ================= */}

        <div className="relative mx-auto max-w-4xl pt-12 text-center">

          <div
            className="
              mb-5
              inline-block
              rotate-[-2deg]
              border
              border-[#40556b]
              bg-[#15263a]
              px-4
              py-1
              font-mono
              text-[10px]
              uppercase
              tracking-[0.25em]
              text-[#9eafbf]
            "
          >
            a little tool for big groups
          </div>


          <h1
            className="
              font-mono
              text-6xl
              font-black
              uppercase
              leading-[0.85]
              tracking-[-0.08em]
              md:text-8xl
              lg:text-[9rem]
            "
          >

            SPLIT

            <span className="text-[#5fa8d3]">
              .
            </span>

            <br />


            <span className="relative inline-block text-[#b8c5d1]">

              THE BILL


              {/* underline doodle */}

              <svg
                className="absolute -bottom-5 left-0 w-full"
                viewBox="0 0 500 30"
                fill="none"
              >

                <path
                  d="M4 19C90 6 170 29 255 15C335 3 420 23 496 9"
                  stroke="#5fa8d3"
                  strokeWidth="5"
                  strokeLinecap="round"
                />

              </svg>

            </span>


            <br />


            <span className="text-[#e8edf2]">
              NOT THE FRIENDSHIP.
            </span>

          </h1>

        </div>


        {/* ================= SCRAPBOOK CENTER ================= */}

        <div className="relative mx-auto mt-20 max-w-5xl">


          {/* LEFT NOTE */}

          <div
            className="
              absolute
              -left-3
              top-12
              hidden
              w-44
              rotate-[-8deg]
              bg-[#172a40]
              p-4
              font-mono
              text-xs
              leading-5
              text-[#d5dfe7]
              shadow-[4px_5px_0px_rgba(0,0,0,0.3)]
              lg:block
            "
          >

            {/* Tape */}

            <div
              className="
                absolute
                -top-3
                left-12
                h-7
                w-20
                rotate-[-3deg]
                bg-[#526b80]
                opacity-50
              "
            />


            <p className="font-bold">
              WHO PAID FOR
              <br />
              WHAT?
            </p>


            <p className="mt-3 text-[#8191a1]">
              honestly...
              <br />
              nobody remembers.
            </p>


            <div className="mt-3 text-right text-[#5fa8d3]">
              ↳ fixed
            </div>

          </div>


          {/* ================= MAIN PAPER ================= */}

          <div
            className="
              relative
              mx-auto
              max-w-3xl
              rotate-[0.5deg]
              border-[3px]
              border-[#40556b]
              bg-[#101f32]
              p-5
              shadow-[10px_12px_0px_rgba(0,0,0,0.4)]
              md:p-8
            "
          >


            {/* Top tape */}

            <div
              className="
                absolute
                -top-5
                left-1/2
                h-10
                w-36
                -translate-x-1/2
                rotate-[-2deg]
                bg-[#526b80]
                opacity-55
              "
            />


            <div className="grid gap-5 md:grid-cols-2">


              {/* ================= RECEIPT ================= */}

              <div className="relative rotate-[-2deg]">

                {/* Tape */}

                <div
                  className="
                    absolute
                    -top-4
                    left-16
                    z-10
                    h-8
                    w-24
                    rotate-[4deg]
                    bg-[#526b80]
                    opacity-50
                  "
                />


                <div
                  className="
                    border
                    border-[#52657a]
                    bg-[#172a40]
                    p-5
                    text-[#dce5ed]
                    shadow-[4px_5px_0px_rgba(0,0,0,0.3)]
                  "
                >

                  <p className="font-mono text-xs text-[#8191a1]">
                    DINNER — FRIDAY
                  </p>


                  <h2 className="mt-2 font-mono text-3xl font-black">
                    ₹2,480
                  </h2>


                  <div className="my-4 h-px bg-[#52657a]" />


                  <div className="space-y-2 font-mono text-xs">

                    <div className="flex justify-between">
                      <span>pizza</span>
                      <span>₹620</span>
                    </div>

                    <div className="flex justify-between">
                      <span>pasta</span>
                      <span>₹480</span>
                    </div>

                    <div className="flex justify-between">
                      <span>drinks × 4</span>
                      <span>₹720</span>
                    </div>

                    <div className="flex justify-between">
                      <span>dessert</span>
                      <span>₹360</span>
                    </div>

                    <div className="flex justify-between">
                      <span>tax + service</span>
                      <span>₹300</span>
                    </div>

                  </div>


                  <div className="my-4 border-t border-dashed border-[#52657a] pt-3">

                    <div className="flex justify-between font-bold">

                      <span>
                        TOTAL
                      </span>

                      <span>
                        ₹2,480
                      </span>

                    </div>

                  </div>


                  <p className="mt-4 text-center text-[10px] uppercase tracking-widest text-[#718397]">
                    thank you for eating
                  </p>

                </div>

              </div>


              {/* ================= ASSIGNMENT ================= */}

              <div className="relative mt-8 rotate-[3deg] md:mt-14">

                {/* Tape */}

                <div
                  className="
                    absolute
                    -top-5
                    right-10
                    z-10
                    h-8
                    w-24
                    rotate-[-5deg]
                    bg-[#526b80]
                    opacity-50
                  "
                />


                <div
                  className="
                    border-2
                    border-[#52657a]
                    bg-[#15263a]
                    p-5
                    text-[#dce5ed]
                    shadow-[5px_6px_0px_rgba(0,0,0,0.3)]
                  "
                >

                  <p className="font-mono text-xs uppercase tracking-widest text-[#8191a1]">
                    who had what?
                  </p>


                  <div className="mt-5 space-y-4 font-mono text-sm">

                    <Person
                      name="you"
                      amount="₹680"
                    />

                    <Person
                      name="alex"
                      amount="₹540"
                    />

                    <Person
                      name="sam"
                      amount="₹620"
                    />

                    <Person
                      name="mira"
                      amount="₹640"
                    />

                  </div>


                  <div
                    className="
                      mt-6
                      rotate-[-2deg]
                      border
                      border-[#5fa8d3]
                      p-3
                      text-center
                      text-xs
                      text-[#5fa8d3]
                    "
                  >
                    ✓ everyone accounted for
                  </div>

                </div>

              </div>

            </div>


            {/* Handwritten annotation */}

            <div className="mt-8 rotate-[-1deg] font-mono text-xs text-[#8798a8] md:text-sm">

              <span className="text-[#5fa8d3]">
                ←
              </span>

              {" "}no spreadsheets.

              <span className="ml-2 text-[#5fa8d3]">
                no calculator fights.
              </span>

            </div>

          </div>


          {/* ================= RIGHT DOODLE ================= */}

          <div
            className="
              absolute
              -bottom-12
              -right-2
              hidden
              rotate-[7deg]
              font-mono
              text-xs
              text-[#5fa8d3]
              md:block
            "
          >

            <svg
              width="120"
              height="70"
              viewBox="0 0 120 70"
            >

              <path
                d="M8 55 C45 5 80 12 110 10"
                stroke="#5fa8d3"
                strokeWidth="3"
                fill="none"
              />

              <path
                d="M98 3 L111 10 L101 20"
                stroke="#5fa8d3"
                strokeWidth="3"
                fill="none"
              />

            </svg>


            <span className="absolute right-0 top-12 whitespace-nowrap">
              easy.
            </span>

          </div>

        </div>


        {/* ================= CTA ================= */}

        <div className="mt-20 flex justify-center">

          <Link
            href="/login"
            className="
              group
              relative
              rotate-[-1deg]
              border-2
              border-[#52657a]
              bg-[#5fa8d3]
              px-9
              py-4
              font-mono
              text-sm
              font-bold
              text-[#07111f]
              shadow-[6px_6px_0px_#050c15]
              transition-all
              hover:-translate-y-1
              hover:rotate-[1deg]
              hover:shadow-[8px_8px_0px_#050c15]
            "
          >

            <span>
              START SPLITTING
            </span>


            <span className="ml-3 transition-transform group-hover:translate-x-1">
              →
            </span>

          </Link>

        </div>


        {/* ================= FEATURES ================= */}

        <div className="mx-auto mt-28 max-w-5xl">


          <div className="mb-8 flex items-end justify-between">

            <h2 className="font-mono text-2xl font-black uppercase text-[#e8edf2] md:text-3xl">
              how it works
            </h2>


            <span className="hidden rotate-[-4deg] font-mono text-xs text-[#718397] md:block">
              three very simple steps.
            </span>

          </div>


          <div className="grid gap-6 md:grid-cols-3">

            <Feature
              number="01"
              title="UPLOAD"
              description="Drop your receipt. We'll read the items so you don't have to."
              rotate="rotate-[-2deg]"
            />


            <Feature
              number="02"
              title="ASSIGN"
              description="Tell us who had what. Pizza thief included."
              rotate="rotate-[1deg]"
            />


            <Feature
              number="03"
              title="SETTLE"
              description="See exactly who owes whom. No awkward group-chat math."
              rotate="rotate-[-1deg]"
            />

          </div>

        </div>


        {/* ================= FOOTER ================= */}

        <div className="mt-24 border-t-2 border-[#30445a] pt-6 text-center">

          <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-[#627487]">
            dinners · trips · roommates · groups
          </p>


          <p className="mt-3 rotate-[-1deg] font-mono text-xs text-[#52657a]">
            made for people who hate splitting bills.
          </p>

        </div>

      </section>

    </main>
  );
}


/* ================= PERSON ================= */

function Person({
  name,
  amount,
}) {
  return (
    <div className="flex items-center justify-between border-b border-[#40556b] pb-2">

      <span className="capitalize">
        {name}
      </span>

      <span className="font-bold text-[#dce5ed]">
        {amount}
      </span>

    </div>
  );
}


/* ================= FEATURE ================= */

function Feature({
  number,
  title,
  description,
  rotate,
}) {
  return (
    <div
      className={`
        ${rotate}
        relative
        border-2
        border-[#40556b]
        bg-[#15263a]
        p-6
        text-[#dce5ed]
        shadow-[5px_6px_0px_rgba(0,0,0,0.3)]
        transition
        duration-200
        hover:rotate-0
        hover:-translate-y-1
      `}
    >

      {/* Tape */}

      <div
        className="
          absolute
          -top-4
          left-1/2
          h-7
          w-20
          -translate-x-1/2
          rotate-[-3deg]
          bg-[#526b80]
          opacity-50
        "
      />


      <div className="flex items-center justify-between">

        <span className="font-mono text-xs text-[#718397]">
          {number}
        </span>


        <span className="font-mono text-xl text-[#5fa8d3]">
          ↗
        </span>

      </div>


      <h3 className="mt-10 font-mono text-xl font-black text-[#e8edf2]">
        {title}
      </h3>


      <p className="mt-3 font-mono text-xs leading-5 text-[#8798a8]">
        {description}
      </p>

    </div>
  );
}