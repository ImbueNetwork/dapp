export type FilterOption = {
    interiorIndex: number;
    search_for: number[];
    or_max: boolean;
    value: string;
};

export enum BriefFilterOption {
    ExpLevel = 0,
    AmountSubmitted = 1,
    Length = 2,
    HoursPerWeek = 3,
}
