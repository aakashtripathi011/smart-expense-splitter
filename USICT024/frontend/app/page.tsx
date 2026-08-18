import Link from "next/link";
export default function Home() {
  return (
    <main className="min-h-screen bg-[#152238] text-white">

      {/* Navbar */}
      <nav className="mx-auto flex max-w-7xl items-center justify-between px-6 py-6 md:px-10">

        <Link
          href="/"
          className="font-mono text-xl font-bold tracking-tight"
        >
          split<span className="text-blue-400">.</span>
        </Link>

        <div className="flex items-center gap-3">
          <Link
            href="/login"
            className="rounded-lg px-4 py-2 text-sm text-slate-400 transition hover:text-white"
          >
            Log in
          </Link>

          <Link
            href="/dashboard"
            className="rounded-lg bg-white px-5 py-2.5 text-sm font-semibold text-[#07111f] transition duration-200 hover:bg-slate-200 hover:scale-105"
          >
            Get started
          </Link>
        </div>

      </nav>


      {/* Hero */}
      <section className="mx-auto flex min-h-[calc(100vh-88px)] max-w-7xl flex-col items-center justify-center px-6 pb-20 text-center">

        {/* Label */}
        <div className="mb-8 flex items-center gap-2 rounded-full border border-slate-800 bg-[#0b192b] px-4 py-2 font-mono text-xs text-slate-400">
          <span className="h-1.5 w-1.5 rounded-full bg-blue-400" />
          smart expense splitting
        </div>


        {/* Heading */}
        <h1 className="max-w-5xl text-5xl font-semibold tracking-[-0.04em] md:text-7xl lg:text-8xl ">

          Split the bill.

          <br />

          <span className="text-slate-500">
            Not the friendship.
          </span>

        </h1>


        {/* Description */}
        <p className="mt-7 max-w-xl text-base leading-7 text-slate-400 md:text-lg">
          Upload your receipt, assign what everyone had,
          and let us handle the math.
        </p>


        {/* CTA */}
        <div className="mt-10 flex flex-col items-center gap-3 sm:flex-row">

          <a
            href="/dashboard"
            className="group flex items-center gap-2 rounded-xl bg-white px-7 py-3.5 text-sm font-semibold text-[#07111f] transition duration-200 hover:bg-slate-200"
          >
            Start splitting

            <span className="transition-transform duration-200 group-hover:translate-x-1">
              →
            </span>
          </a>

          <a
            href="/group"
            className="rounded-xl border border-slate-800 px-7 py-3.5 text-sm text-slate-300 transition duration-200 hover:border-slate-600 hover:bg-[#0b192b] hover:text-white"
          >
            Create a group
          </a>

        </div>


        {/* Features */}
        <div className="mt-24 grid w-full max-w-4xl gap-3 md:grid-cols-3">

          <Feature
            number="01"
            title="Upload a receipt"
            description="Drop your bill and let OCR extract the items automatically."
          />

          <Feature
            number="02"
            title="Assign items"
            description="Choose who had what and we'll calculate everyone's share."
          />

          <Feature
            number="03"
            title="Settle up"
            description="See exactly who owes whom and how much."
          />

        </div>


        {/* Bottom text */}
        <p className="mt-12 font-mono text-[11px] uppercase tracking-[0.2em] text-slate-700">
          dinners · trips · roommates · groups
        </p>

      </section>

    </main>
  );
}


/* Feature Card */

function Feature({
  number,
  title,
  description,
}: {
  number: string;
  title: string;
  description: string;
}) {
  return (
    <div className="group rounded-2xl border border-slate-800/70 bg-[#091626] p-6 text-left transition duration-300 hover:-translate-y-1 hover:border-slate-600">

      <div className="mb-12 flex items-center justify-between">

        <span className="font-mono text-xs text-slate-600">
          {number}
        </span>

        <span className="text-slate-700 transition duration-300 group-hover:text-blue-400">
          ↗
        </span>

      </div>


      <h3 className="text-base font-medium text-white">
        {title}
      </h3>


      <p className="mt-2 text-sm leading-6 text-slate-400">
        {description}
      </p>

    </div>
  );
}