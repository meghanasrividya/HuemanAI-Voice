// ─── Shared urgency type ────────────────────────────────────────────────────
export type UrgencyLevel =
    | "Critical" | "High" | "Medium" | "Low"
    | "critical" | "high"   | "medium" | "low";

// ─── Executive Summary ───────────────────────────────────────────────────────
export interface ExecutiveSummary {
    criticalFinding: string;
    revenueImpact: string;
    immediateAction: string;
}

// ─── Report Metadata ─────────────────────────────────────────────────────────
export interface ReportMetadata {
    periodStart: string;
    periodEnd: string;
    botName: string;
    restaurantName?: string;
    analysisVersion?: string;
    generatedAt?: string;
    totalCalls?: number;
}

// ─── Statistics ──────────────────────────────────────────────────────────────
export interface UpsellItem {
    name: string;
    count: number;
}

export interface UpsellPerformance {
    items: UpsellItem[];
    totalRevenue: number;
    totalSuccessfulUpsells: number;
}

export interface CallStatistics {
    totalCalls?: number;
    successfulBookings?: number;
    conversionRate?: number;
    transferRate?: number;
    voicemailRate?: number;
    totalCoversBooked?: number;
    abandonedCalls?: number;
    averageDuration?: string;
    transferredCalls?: number;
    upsellPerformance?: UpsellPerformance;
    bookingIntentCalls?: number;
    estimatedCoversLost?: number;
    failedBookings?: number;
}

// ─── Revenue Insights ────────────────────────────────────────────────────────
export interface SignalData {
    description: string;
    callCount?: number;
    examples?: string[];
    timePattern?: string;
}

export interface ImpactData {
    description: string;
    revenueEstimate?: string;
    coversAffected?: number;
    recurringRisk?: boolean;
}

export interface ActionData {
    description: string;
    owner?: string;
    timeline?: string;
}

export interface QuoteEvidence {
    quotes: string[];
    callIds?: number[];
}

export interface RevenueInsightItem {
    id: string;
    insightNumber: number;
    headline: string;
    title?: string;
    urgency: UrgencyLevel;
    priority?: UrgencyLevel;
    category?: string;
    signal?: SignalData;
    impact?: ImpactData;
    reasoning: string;
    action?: ActionData;
    evidence?: QuoteEvidence;
}

// ─── Bot Performance Issues ───────────────────────────────────────────────────
export interface ProblemData {
    description: string;
    examples?: string[];
    frequency?: string;
}

export interface CallerImpactData {
    description: string;
    lostBookings?: number;
    frustratedCallers?: number;
    transfersTriggered?: number;
}

export interface TrainingRecommendationData {
    description: string;
    specificFix: string;
    estimatedEffort?: string;
}

export interface BotPerformanceIssue {
    id: string;
    issueNumber: number;
    // API returns either title or headline
    headline?: string;
    title?: string;
    urgency?: UrgencyLevel;
    priority?: UrgencyLevel;
    category?: string;
    problem?: ProblemData;
    callerImpact?: CallerImpactData;
    trainingRecommendation?: TrainingRecommendationData;
}

// ─── Strategic Recommendations ────────────────────────────────────────────────
export interface OpportunityData {
    description: string;
}

export interface StrategicRecommendation {
    id: string;
    recommendationNumber: number;
    headline: string;
    title?: string;
    urgency?: UrgencyLevel;
    priority?: UrgencyLevel;
    category?: string;
    opportunity?: OpportunityData;
    successMetric: string;
    basedOn?: string[];
}

// ─── Call Patterns ────────────────────────────────────────────────────────────
export interface OutcomePattern {
    outcome: string;
    count: number;
    percentage: number;
}

export interface DayOfWeekPattern {
    day: string;
    count: number;
    bookings: number;
}

export interface HourOfDayPattern {
    // API returns string ranges like "07:00-08:59"
    hour: number | string;
    count: number;
    bookings: number;
}

export interface TopQuestionPattern {
    question: string;
    count: number;
    answered: boolean;
}

export interface PartySizePattern {
    size: string;
    count: number;
}

export interface SpecialRequestPattern {
    request: string;
    count: number;
}

export interface CallPatternData {
    byOutcome?: OutcomePattern[];
    byDayOfWeek: DayOfWeekPattern[];
    byHourOfDay: HourOfDayPattern[];
    topQuestions: TopQuestionPattern[];
    byPartySize: PartySizePattern[];
    topSpecialRequests?: SpecialRequestPattern[];
}

// ─── Raw Data Summary ─────────────────────────────────────────────────────────
export interface RawDataSummary {
    callsAnalyzed: number;
    missingFields?: string[];
    dataQualityScore?: string;
}

// ─── Full Report Data ─────────────────────────────────────────────────────────
export interface InsightReportData {
    executiveSummary: ExecutiveSummary;
    metadata: ReportMetadata;
    statistics: CallStatistics;
    revenueInsights: RevenueInsightItem[];
    botPerformanceIssues: BotPerformanceIssue[];
    strategicRecommendations: StrategicRecommendation[];
    callPatterns: CallPatternData;
    rawDataSummary?: RawDataSummary;
}

// ─── Call Report (API wrapper) ────────────────────────────────────────────────
export interface CallReport {
    id: string;
    // status may be absent — treat as completed if report_data is present
    status?: "completed" | "failed" | "pending";
    user_id?: string;
    agent_id: string;
    period_start: string;
    period_end: string;
    total_calls?: number;
    report_data: InsightReportData;
    created_at?: string;
    updated_at?: string;
}
