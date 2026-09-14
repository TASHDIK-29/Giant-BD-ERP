'use client';

import {
  useDashboardHeader,
} from '@/components/dashboard/dashboard-header-context';

import {
  useDashboard,
} from '@/features/dashboard/hooks';

import {
  DashboardSummaryCard,
} from '@/features/dashboard/components/dashboard-summary-card';

import {
  StockMovementChart,
} from '@/features/dashboard/components/stock-movement-chart';

import {
  BatchPeriodChart,
} from '@/features/dashboard/components/batch-period-chart';

import {
  StockInMasterChart,
} from '@/features/dashboard/components/stock-in-master-chart';

import { StockAgingChart } from '@/features/dashboard/components/stock-aging-chart';

export default function DashboardPage() {
  const {
    refreshKey,
  } = useDashboardHeader();

  const {
    data,
    isLoading,
    isFetching,
  } = useDashboard(
    refreshKey,
  );

  if (isLoading) {
    return (
      <div className="rounded-2xl border bg-background p-6">
        Loading dashboard...
      </div>
    );
  }

  if (!data) {
    return (
      <div className="rounded-2xl border bg-background p-6">
        Unable to load dashboard data.
      </div>
    );
  }

  const movement =
    data.stockMovementLast30Days;

  const dailyIn =
    movement.at(-1)?.stockIn ?? 0;

  const dailyOut =
    movement.at(-1)?.stockOut ?? 0;

  const weeklyIn =
    movement
      .slice(-7)
      .reduce(
        (
          total,
          item,
        ) =>
          total +
          item.stockIn,
        0,
      );

  const weeklyOut =
    movement
      .slice(-7)
      .reduce(
        (
          total,
          item,
        ) =>
          total +
          item.stockOut,
        0,
      );

  const monthlyIn =
    movement.reduce(
      (
        total,
        item,
      ) =>
        total +
        item.stockIn,
      0,
    );

  const monthlyOut =
    movement.reduce(
      (
        total,
        item,
      ) =>
        total +
        item.stockOut,
      0,
    );

  return (
    <div
      className={
        isFetching
          ? 'space-y-5 opacity-70 transition-opacity'
          : 'space-y-5'
      }
    >
      {/* Summary Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
        <DashboardSummaryCard
          title="Daily In"
          quantity={dailyIn}
          bat={0}
          mas={0}
          variant={0}
          direction="in"
        />

        <DashboardSummaryCard
          title="Weekly In"
          quantity={weeklyIn}
          bat={0}
          mas={0}
          variant={0}
          direction="in"
        />

        <DashboardSummaryCard
          title="Monthly In"
          quantity={monthlyIn}
          bat={
            data.batches
              .thisMonth
          }
          mas={
            data.totals
              .masterProducts
          }
          variant={
            data.totals
              .variants
          }
          direction="in"
        />

        <DashboardSummaryCard
          title="Yearly In"
          quantity={0}
          bat={0}
          mas={0}
          variant={0}
          direction="in"
        />

        <DashboardSummaryCard
          title="Total In"
          quantity={0}
          bat={0}
          mas={0}
          variant={0}
          direction="in"
        />

        <DashboardSummaryCard
          title="Daily Out"
          quantity={dailyOut}
          bat={0}
          mas={0}
          variant={0}
          direction="out"
        />

        <DashboardSummaryCard
          title="Weekly Out"
          quantity={weeklyOut}
          bat={0}
          mas={0}
          variant={0}
          direction="out"
        />

        <DashboardSummaryCard
          title="Monthly Out"
          quantity={monthlyOut}
          bat={0}
          mas={0}
          variant={0}
          direction="out"
        />

        <DashboardSummaryCard
          title="Yearly Out"
          quantity={0}
          bat={0}
          mas={0}
          variant={0}
          direction="out"
        />

        <DashboardSummaryCard
          title="Total Out"
          quantity={0}
          bat={0}
          mas={0}
          variant={0}
          direction="out"
        />
      </div>

      {/* Stock Movement */}
      <StockMovementChart
        data={
          data.stockMovementLast30Days
        }
      />

      {/* Charts */}
      <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
        <BatchPeriodChart
          data={data.batches}
        />

        <StockInMasterChart
          data={
            data.stockInByMasterProduct
          }
        />

        {/* Stock Aging - coming from API */}
        {/* <div className="rounded-2xl border bg-background shadow-sm">
          <div className="border-b px-4 py-4">
            <h2 className="text-sm font-semibold">
              Stock Aging
            </h2>
          </div>

          <div className="flex h-64 items-center justify-center p-4">
            <p className="text-sm text-muted-foreground">
              Stock aging data is not available from the dashboard API.
            </p>
          </div>

        </div> */}


        {/* Stock Aging */}
        <div className="rounded-2xl border bg-background shadow-sm">
          <div className="border-b px-4 py-4">
            <h2 className="text-sm font-semibold">
              Stock Aging
            </h2>
          </div>

          <div className="h-64 w-full p-4">
            <StockAgingChart />
          </div>
        </div>


      </div>

      {/* Recent FG Stock In */}
      <div className="rounded-2xl border bg-background shadow-sm">
        <div className="flex items-center justify-between border-b px-4 py-3">
          <span className="rounded-full bg-background px-3 py-1 text-sm font-semibold">
            Recent FG Stock In
          </span>

          <button
            type="button"
            className="rounded-md bg-primary px-3 py-1.5 text-sm font-medium text-primary-foreground"
          >
            + New
          </button>
        </div>

        <div className="flex h-32 items-center justify-center">
          <p className="text-sm text-muted-foreground">
            Recent stock-in data is not available from the dashboard API.
          </p>
        </div>
      </div>
    </div>
  );
}