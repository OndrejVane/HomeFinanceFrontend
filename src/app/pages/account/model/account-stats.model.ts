export interface AccountStatsResponse {
    accountId: number;

    initialBalance: number;
    currentBalance: number;

    totalExpense: number;
    totalRevenue: number;
    totalInflow: number;
    totalOutflow: number;
    netFlow: number;
    netExpense: number;
    netTotal: number;

    last30DaysTotalExpense: number;
    last30DaysTotalRevenue: number;
    last30DaysTotalInflow: number;
    last30DaysTotalOutflow: number;
    last30DaysNetFlow: number;
    last30DaysNetExpense: number;
    last30DaysNetTotal: number;

    movementsCount: number;
    lastMovementDate: string | null; // LocalDate z BE jako ISO string
}
