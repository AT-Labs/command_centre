import { expect } from 'chai';
import moment from 'moment-timezone';
import {
    formatDate,
    checkCarActivation,
    filterCarsByDate,
    getYesterdayTomorrowDates,
} from "./cars";
import { DATE_FORMAT_DDMMYYYY } from "./dateUtils";
import { CARS_ACTIVATION_STATUS } from "../constants/cars";

describe("formatDate", () => {
    it('should return "-" if date is falsy', () => {
        expect(formatDate(null)).to.equal("-");
        expect(formatDate(undefined)).to.equal("-");
        expect(formatDate("")).to.equal("-");
    });

    it("should return formatted date if date is valid", () => {
        const validDate = "2025-03-31";
        const formattedDate = moment(validDate).format(DATE_FORMAT_DDMMYYYY);
        expect(formatDate(validDate)).to.equal(formattedDate);
    });

    it('should return "-" if date is invalid', () => {
        const invalidDate = "invalid-date";
        expect(formatDate(invalidDate)).to.equal("-");
    });
});

describe("checkCarActivation", () => {
    const currentDate = moment.utc();

    it('should return "Deactivated" if both startDate and endDate are falsy', () => {
        expect(checkCarActivation(null, null)).to.equal(CARS_ACTIVATION_STATUS.DEACTIVATED);
    });

    it('should return "Activated" if startDate is in the past and endDate is falsy', () => {
        const pastDate = currentDate.subtract(1, "day").format();
        expect(checkCarActivation(pastDate, null)).to.equal(CARS_ACTIVATION_STATUS.ACTIVATED);
    });

    it('should return "Activated" if current date is between startDate and endDate', () => {
        const startDate = currentDate.clone().subtract(2, "day").toISOString();
        const endDate = currentDate.clone().add(10, "day").toISOString();
        expect(checkCarActivation(startDate, endDate)).to.equal(CARS_ACTIVATION_STATUS.ACTIVATED);
    });

    it('should return "Deactivated" if startDate is in the future', () => {
        const futureDate = currentDate.add(5, "day").toISOString();
        expect(checkCarActivation(futureDate, null)).to.equal(CARS_ACTIVATION_STATUS.DEACTIVATED);
    });

    it('should return "Deactivated" if endDate is in the past', () => {
        const pastDate = currentDate.clone().subtract(5, "day").toISOString();
        expect(checkCarActivation(null, pastDate)).to.equal(CARS_ACTIVATION_STATUS.DEACTIVATED);
    });
});

describe("filterCarsByDate", () => {
    it("should return the same array if no filter is applied", () => {
        const cars = [{ properties: { ProjectStartDate: 1672531200000 } }];
        expect(filterCarsByDate(cars, false)).to.equal(cars);
    });

    it("should filter cars by yesterday, today, or tomorrow", () => {
        const yesterday = moment().subtract(1, "day").unix() * 1000000;
        const tomorrow = moment().add(1, "day").unix() * 1000000;
        const cars = [
            {
                properties: {
                    ProjectStartDate: yesterday,
                    ProjectEndDate: tomorrow,
                },
            },
            {
                properties: {
                    ProjectStartDate: yesterday,
                    ProjectEndDate: null,
                },
            },
            {
                properties: {
                    ProjectStartDate: null,
                    ProjectEndDate: tomorrow,
                },
            },
        ];

        const filteredCars = filterCarsByDate(cars, true);

        expect(filteredCars).to.have.length(2);
    });

    it("should return an empty array if no cars match the filter date", () => {
        const pastDate = moment().subtract(10, "days").unix() * 1000000;
        const futureDate = moment().add(20, "days").unix() * 1000000;
        const cars = [
            {
                properties: {
                    ProjectStartDate: pastDate,
                    ProjectEndDate: pastDate,
                },
            },
            {
                properties: {
                    ProjectStartDate: futureDate,
                    ProjectEndDate: futureDate,
                },
            },
        ];

        expect(filterCarsByDate(cars, true)).to.have.length(1);
    });
});

describe("getYesterdayTomorrowDates", () => {
    it("should return yesterday and tomorrow formatted dates", () => {
        const { dateFrom, dateTo } = getYesterdayTomorrowDates();
        const yesterday = moment().subtract(1, "days").format("YYYY-MM-DD");
        const tomorrow = moment().add(1, "days").format("YYYY-MM-DD");
        expect(dateFrom).to.equal(yesterday);
        expect(dateTo).to.equal(tomorrow);
    });
});
