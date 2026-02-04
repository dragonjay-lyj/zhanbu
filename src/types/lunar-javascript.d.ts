declare module "lunar-javascript" {
    export class Solar {
        static fromDate(date: Date): Solar
        static fromYmd(year: number, month: number, day: number): Solar
        getLunar(): Lunar
        getYear(): number
        getMonth(): number
        getDay(): number
        getFestivals(): string[]
        toDate(): Date
    }

    export class Lunar {
        getYear(): number
        getMonth(): number
        getDay(): number
        getYearInGanZhi(): string
        getMonthInGanZhi(): string
        getDayInGanZhi(): string
        getYearShengXiao(): string
        getMonthInChinese(): string
        getDayInChinese(): string
        getJieQi(): string | null
        getJieQiTable(): Record<string, any>
        getFestivals(): string[]
        getDayYi(): string[]
        getDayJi(): string[]
        getEightChar(): EightChar
    }

    export class EightChar {
        getYearGan(): string
        getYearZhi(): string
        getMonthGan(): string
        getMonthZhi(): string
        getDayGan(): string
        getDayZhi(): string
        getTimeGan(): string
        getTimeZhi(): string
    }

    export class HolidayUtil {
        static getHoliday(year: number, month: number, day: number): string | null
    }
}
