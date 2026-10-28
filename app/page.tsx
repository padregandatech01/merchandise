import Link from "next/link";
import { AuthButton } from "@/components/auth-button";

export default function Home() {
  return (
    <main className="min-h-screen">
      <header className="border-b">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-6 py-4">
          <Link href="/" className="font-semibold">LOXADA Merchandise</Link>
          <AuthButton />
        </div>
      </header>
      <section className="mx-auto max-w-6xl space-y-4 px-6 py-16">
        <h1 className="text-3xl font-bold">LOXADA Merchandise</h1>
        <p className="text-muted-foreground">Application starter. Business features have not been implemented.</p>
        <Link href="/protected" className="inline-block underline">Open workspace</Link>
      </section>
    </main>
  );
}
