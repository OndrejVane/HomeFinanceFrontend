export interface MovementYearlyStats {
    expense: number; // BigDecimal se na FE obvykle mapuje na number
    revenue: number;
    month: number;   // 1–12
}
