import Link from "next/link";

export default function Dashboard() {
  return (
    <main className="min-h-screen bg-[#152238] font-mono text-white">

      {/* NAVBAR */}
      <nav className="flex items-center justify-between border-b border-white/10 px-6 py-5 md:px-10">

        <Link
          href="/"
          className="text-xl font-bold tracking-tight"
        >
          split<span className="text-blue-400">.</span>
        </Link>

        <div className="flex items-center gap-6">

          <div className="hidden text-right sm:block">
            <p className="text-xs text-slate-500">
              signed in as
            </p>

            <p className="text-sm text-slate-300">
              you
            </p>
          </div>

          <Link
            href="/"
            className="text-xs uppercase tracking-wider text-slate-500 transition hover:text-white"
          >
            Log out
          </Link>

        </div>

      </nav>


      {/* MAIN */}
      <section className="mx-auto max-w-6xl px-6 py-12 md:px-10">

        {/* HEADER */}
        <div className="flex flex-col justify-between gap-6 md:flex-row md:items-end">

          <div>

            <p className="text-xs uppercase tracking-[0.25em] text-blue-400">
              Dashboard
            </p>

            <h1 className="mt-4 text-4xl font-semibold tracking-tight md:text-5xl">
              What are we
              <br />
              splitting?
            </h1>

            <p className="mt-5 max-w-md text-sm leading-6 text-slate-400">
              Keep the math out of the conversation.
              <br />
              We&apos;ll handle it.
            </p>

          </div>

          <div className="text-xs text-slate-600">
            01 / HOME
          </div>

        </div>


        {/* ACTIONS */}
        <div className="mt-12 grid gap-5 md:grid-cols-2">


          {/* NEW EXPENSE */}
          <Link
            href="/receipt"
            className="group relative min-h-[270px] overflow-hidden rounded-2xl border border-white/10 bg-[#102038] p-7 transition duration-300 hover:-translate-y-1 hover:border-blue-400/40"
          >

            {/* Number */}
            <span className="absolute right-6 top-6 text-xs text-slate-700">
              01
            </span>

            {/* Icon */}
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white text-2xl font-light text-[#152238] transition group-hover:rotate-90">
              +
            </div>

            <div className="absolute bottom-7 left-7 right-7">

              <h2 className="text-xl font-medium">
                New expense
              </h2>

              <p className="mt-3 max-w-sm text-sm leading-6 text-slate-400">
                Upload a receipt, add the people involved,
                and split the bill.
              </p>

              <div className="mt-6 text-xs text-blue-400 opacity-0 transition group-hover:opacity-100">
                START → 
              </div>

            </div>

          </Link>


          {/* GROUPS */}
          <Link
            href="/group"
            className="group relative min-h-[270px] overflow-hidden rounded-2xl border border-white/10 bg-[#102038] p-7 transition duration-300 hover:-translate-y-1 hover:border-blue-400/40"
          >

            {/* Number */}
            <span className="absolute right-6 top-6 text-xs text-slate-700">
              02
            </span>

            {/* Icon */}
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#1a304d] text-xl text-blue-400 transition group-hover:bg-blue-400 group-hover:text-[#152238]">
              #
            </div>

            <div className="absolute bottom-7 left-7 right-7">

              <h2 className="text-xl font-medium">
                My groups
              </h2>

              <p className="mt-3 max-w-sm text-sm leading-6 text-slate-400">
                Trips, dinners, roommates —
                keep shared expenses together.
              </p>

              <div className="mt-6 text-xs text-blue-400 opacity-0 transition group-hover:opacity-100">
                VIEW GROUPS →
              </div>

            </div>

          </Link>

        </div>


        {/* RECENT EXPENSES */}
        <div className="mt-16">

          <div className="flex items-end justify-between border-b border-white/10 pb-4">

            <div>

              <p className="text-xs uppercase tracking-[0.2em] text-slate-600">
                Activity
              </p>

              <h2 className="mt-2 text-lg font-medium">
                Recent expenses
              </h2>

            </div>

            <span className="text-xs text-slate-600">
              0 EXPENSES
            </span>

          </div>


          {/* EMPTY STATE */}
          <div className="flex min-h-[220px] flex-col items-center justify-center rounded-b-2xl border-x border-b border-white/10 bg-[#102038]/40">

            <div className="flex h-14 w-14 items-center justify-center rounded-full border border-white/10 text-lg text-slate-600">
              ₹
            </div>

            <p className="mt-5 text-sm text-slate-500">
              Nothing here yet.
            </p>

            <Link
              href="/receipt"
              className="mt-4 text-xs uppercase tracking-wider text-blue-400 transition hover:text-blue-300"
            >
              Create your first expense →
            </Link>

          </div>

        </div>


        {/* FOOTER */}
        <div className="mt-12 flex items-center justify-between text-[10px] uppercase tracking-[0.2em] text-slate-700">

          <span>
            split.
          </span>

          <span>
            trips · dinners · roommates
          </span>

        </div>

      </section>

    </main>
  );
}