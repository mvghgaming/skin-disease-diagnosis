import Link from "next/link";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-8">
      <div className="max-w-4xl w-full space-y-8">
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold tracking-tight">
            Medical Expert System
          </h1>
          <p className="text-xl text-muted-foreground">
            Rule-Based Disease Diagnosis
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6 mt-12">
          <Link
            href="/diagnosis"
            className="group block p-8 border-2 border-border rounded-lg hover:border-primary hover:shadow-lg transition-all"
          >
            <h2 className="text-2xl font-semibold mb-2 group-hover:text-primary">
              Get Diagnosis →
            </h2>
            <p className="text-muted-foreground">
              Enter your symptoms to receive a preliminary diagnosis and treatment recommendations
            </p>
          </Link>

          <Link
            href="/admin"
            className="group block p-8 border-2 border-border rounded-lg hover:border-primary hover:shadow-lg transition-all"
          >
            <h2 className="text-2xl font-semibold mb-2 group-hover:text-primary">
              Manage Rules →
            </h2>
            <p className="text-muted-foreground">
              Knowledge engineer interface for adding and updating diagnostic rules
            </p>
          </Link>
        </div>

        <div className="mt-12 p-6 bg-muted rounded-lg">
          <h3 className="font-semibold mb-2">About This System</h3>
          <p className="text-sm text-muted-foreground">
            This expert system uses forward-chaining inference to diagnose diseases based on symptoms.
            Currently supports diagnosis for Chốc (Impetigo) with 10 clinical rules.
          </p>
        </div>
      </div>
    </main>
  );
}
