// ```tsx
export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">
          Dashboard
        </h1>

        <p className="mt-1 text-sm text-muted-foreground">
          Welcome to Giant BD ERP.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-xl border bg-background p-5">
          <p className="text-sm text-muted-foreground">
            Total Products
          </p>

          <p className="mt-2 text-2xl font-semibold">
            0
          </p>
        </div>

        <div className="rounded-xl border bg-background p-5">
          <p className="text-sm text-muted-foreground">
            Total Stock
          </p>

          <p className="mt-2 text-2xl font-semibold">
            0
          </p>
        </div>

        <div className="rounded-xl border bg-background p-5">
          <p className="text-sm text-muted-foreground">
            Stock In
          </p>

          <p className="mt-2 text-2xl font-semibold">
            0
          </p>
        </div>

        <div className="rounded-xl border bg-background p-5">
          <p className="text-sm text-muted-foreground">
            Stock Out
          </p>

          <p className="mt-2 text-2xl font-semibold">
            0
          </p>
        </div>
      </div>
    </div>
  );
}
// ```
