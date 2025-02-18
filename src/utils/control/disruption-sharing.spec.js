import jsdom from 'jsdom';
import { shareToEmail, shareToEmailLegacy } from './disruption-sharing';
import { getAlertCauses, getAlertEffects } from '../transmitters/command-centre-config-api';

const disruption = {
    disruptionId: 1,
    incidentNo: 'DISR0001',
    mode: 'Train',
    affectedEntities: [
        {
            routeId: 'WEST-201',
            routeType: 2,
            routeShortName: 'WEST',
            agencyName: 'AT Metro',
            agencyId: 'AM',
            tokens: [
                'west',
            ],
        },
    ],
    impact: 'REDUCED_SERVICE',
    cause: 'HOLIDAY',
    startTime: '2020-03-17T19:41:13.775Z',
    endTime: '2020-03-18T19:41:13.775Z',
    estimatedResolutionDuration: 4,
    estimatedServiceResumeTime: '2020-03-17T19:42:00.739Z',
    status: 'in-progress',
    lastUpdatedTime: '2020-03-17T19:42:00.739Z',
    lastUpdatedBy: 'michael.weber@propellerhead.co.nz',
    description: 'Test description',
    createdBy: 'michael.weber@propellerhead.co.nz',
    createdTime: '2020-03-17T19:42:00.739Z',
    url: '',
    header: 'Holidays for everyone',
    uploadedFiles: [],
    workarounds: [{
        type: 'all',
        workaround: 'workaround text',
    }],
    notes: [],
    severity: 'UNKNOWN',
};

const recurrencePattern = {
    freq: 2,
    until: '2022-08-31T21:30:00.000Z',
    dtstart: '2022-08-29T20:30:00.000Z',
    byweekday: [0, 1, 2, 3, 4, 5, 6],
};

const disruptionDiversion = [{
    id: 'bc8d0b35-a706-4276-827d-9ccd217f2b39',
    fileName: 'test upload.png',
    storageUrl: 'https://fakerepo.net/disruption-files/DISR00146%2Fbc8d0b35-a706-4276-827d-9ccd217f2b39.png',
    uploadedOn: '2022-05-22T21:34:03.688Z',
    uploadedBy: 'rich.reynolds@propellerhead.co.nz',
}];

const notes = [{
    id: 'note1',
    createdBy: 'author1@propellerhead.co.nz',
    createdTime: '2022-10-05T14:03:58.340Z',
    description: 'test disruption notes 1',
}, {
    id: 'note2',
    createdBy: 'author2@propellerhead.co.nz',
    createdTime: '2022-10-06T14:03:58.340Z',
    description: 'test disruption notes 2',
}];

const activePeriods = [
    {
        startTime: 1661805000,
        endTime: 1661812200,
    },
    {
        startTime: 1661977800,
        endTime: 1661985000,
    },
];

const link = {
    href: '',
    download: '',
    click: jest.fn(),
};

const causes = [{ label: 'Holiday', value: 'HOLIDAY' }];
const effects = [{ label: 'Reduced service', value: 'REDUCED_SERVICE' }];

Object.defineProperty(
    global.document,
    'createElement',
    {
        value: () => link,
        writable: true,
    },
);

jest.mock('../transmitters/command-centre-config-api', () => ({
    getAlertCauses: jest.fn(),
    getAlertEffects: jest.fn(),
}));

describe('shareToEmail', () => {
    let mockLocalStorage = {};

    beforeAll(() => {
        jest.useFakeTimers();

        global.localStorage = {
            getItem: jest.fn(key => mockLocalStorage[key] || null),
            setItem: jest.fn((key, value) => {
                mockLocalStorage[key] = value;
            }),
            removeItem: jest.fn((key) => {
                delete mockLocalStorage[key];
            }),
            clear: jest.fn(() => {
                mockLocalStorage = {};
            }),
        };

        getAlertCauses.mockResolvedValue(causes);
        getAlertEffects.mockResolvedValue(effects);
    });

    afterAll(() => {
        jest.useRealTimers();
    });

    test('should export email by setting the content to the link href', async () => {
        await shareToEmail(disruption);
        expect(link.href.length > 0).toBeTruthy();
        expect(link.href).toContain('data:message/rfc822 eml;charset=utf-8');
    });

    test('should not set from and cc if env not set', async () => {
        delete process.env.REACT_APP_DISRUPTION_SHARING_EMAIL_FROM;
        delete process.env.REACT_APP_DISRUPTION_SHARING_EMAIL_CC;
        await shareToEmail(disruption);
        expect(link.href).toContain('From:  \ncc:  \n');
    });

    test('should set from and cc from process.env', async () => {
        process.env.REACT_APP_DISRUPTION_SHARING_EMAIL_FROM = 'dayof.ops@at.govt.nz';
        process.env.REACT_APP_DISRUPTION_SHARING_EMAIL_CC = 'dayof.ops@at.govt.nz';

        await shareToEmail(disruption);
        expect(link.href).toContain('From: dayof.ops@at.govt.nz');
        expect(link.href).toContain('cc: dayof.ops@at.govt.nz');

        delete process.env.REACT_APP_DISRUPTION_SHARING_EMAIL_FROM;
        delete process.env.REACT_APP_DISRUPTION_SHARING_EMAIL_CC;
    });

    test('should generate subject', async () => {
        await shareToEmail(disruption);
        expect(link.href).toContain('Subject: Re: Unknown - Train Disruption Notification - Holidays for everyone - DISR0001');
    });

    test('should generate subject for multiple modes', async () => {
        await shareToEmail({ ...disruption, mode: 'Bus, Train, Ferry' });
        expect(link.href).toContain('Subject: Re: Unknown - Multi-Modal Disruption Notification - Holidays for everyone - DISR0001');
    });

    test('should generate subject for Bus and Train', async () => {
        await shareToEmail({ ...disruption, mode: 'Bus, Train' });
        expect(link.href).toContain('Subject: Re: Unknown - Bus & Train Disruption Notification - Holidays for everyone - DISR0001');
    });

    test('should generate subject for Bus and Ferry', async () => {
        await shareToEmail({ ...disruption, mode: 'Bus, Ferry' });
        expect(link.href).toContain('Subject: Re: Unknown - Bus & Ferry Disruption Notification - Holidays for everyone - DISR0001');
    });

    test('should generate subject for Ferry and Train', async () => {
        await shareToEmail({ ...disruption, mode: 'Train, Ferry' });
        expect(link.href).toContain('Subject: Re: Unknown - Ferry & Train Disruption Notification - Holidays for everyone - DISR0001');
    });

    test.each([
        ['CATASTROPHIC', 'Subject: Re: Catastrophic - Train Disruption Notification - Holidays for everyone - DISR0001'],
        ['HEADLINE', 'Subject: Re: Headline - Train Disruption Notification - Holidays for everyone - DISR0001'],
        ['MINOR', 'Subject: Re: Minor - Train Disruption Notification - Holidays for everyone - DISR0001'],
        ['', 'Subject: Re: Train Disruption Notification - Holidays for everyone - DISR0001'],
        [null, 'Subject: Re: Train Disruption Notification - Holidays for everyone - DISR0001'],
        [undefined, 'Subject: Re: Train Disruption Notification - Holidays for everyone - DISR0001'],
    ])('should generate correct subject for severity: %s', async (severity, expected) => {
        await shareToEmail({ ...disruption, severity });

        expect(link.href).toContain(expected);
        expect(link.href.startsWith('data:message/rfc822')).toBe(true);
        expect(link.download).toBeDefined();
        expect(link.href).not.toContain(' -  - ');
    });

    test.each([
        ['resolved', 'Subject: Re: RESOLVED - Train Disruption Notification - Holidays for everyone - DISR0001'],
        ['resolved', 'Subject: Re: RESOLVED - Minor - Train Disruption Notification - Holidays for everyone - DISR0001', 'MINOR'],
        [null, 'Subject: Re: Train Disruption Notification - Holidays for everyone - DISR0001'],
        [undefined, 'Subject: Re: Train Disruption Notification - Holidays for everyone - DISR0001'],
        [false, 'Subject: Re: Train Disruption Notification - Holidays for everyone - DISR0001'],
        [0, 'Subject: Re: Train Disruption Notification - Holidays for everyone - DISR0001'],
    ])('should generate correct subject for status: %s with severity: %s', async (status, expected, severity = '') => {
        await shareToEmail({ ...disruption, status, severity });

        expect(link.href).toContain(expected);
        expect(link.href.startsWith('data:message/rfc822')).toBe(true);
        expect(link.download).toBeDefined();
        expect(link.href).not.toContain(' -  - ');
    });

    test('should handle empty mode', async () => {
        await shareToEmail({ ...disruption, mode: '' });

        const href = decodeURIComponent(link.href);
        expect(href).toContain('Subject: Re: Unknown - Disruption Notification - Holidays for everyone - DISR0001');

        const htmlMatch = /<html[\s\S]*<\/html>/.exec(href);
        expect(htmlMatch).not.toBeNull();

        const htmlContent = htmlMatch[0];
        const { defaultView: { document } } = jsdom.jsdom(htmlContent);

        const mode = Array.from(document.querySelectorAll('th')).find(
            th => th.textContent.trim() === 'Mode',
        );
        expect(mode).not.toBeNull();

        const siblingTd = mode.nextElementSibling;
        expect(siblingTd).not.toBeNull();
        expect(siblingTd.textContent.trim()).toBe('-');
    });

    test('should handle empty end time', async () => {
        await shareToEmail({ ...disruption, endTime: null });

        const href = decodeURIComponent(link.href);

        const htmlMatch = /<html[\s\S]*<\/html>/.exec(href);
        expect(htmlMatch).not.toBeNull();

        const htmlContent = htmlMatch[0];
        const { defaultView: { document } } = jsdom.jsdom(htmlContent);

        const endTime = Array.from(document.querySelectorAll('th')).find(
            th => th.textContent.trim() === 'End\u00A0Time/Date',
        );
        expect(endTime).not.toBeNull();

        const siblingTd = endTime.nextElementSibling;
        expect(siblingTd).not.toBeNull();
        expect(siblingTd.textContent.trim()).toBe('-');
    });

    test('should include affected routes', async () => {
        await shareToEmail({
            ...disruption,
            affectedEntities: [{
                routeId: 'TMK-202',
                routeShortName: 'TMK',
                routeType: 3,
                type: 'route',
            }],
        });

        const href = decodeURIComponent(link.href);

        const htmlMatch = /<html[\s\S]*<\/html>/.exec(href);
        expect(htmlMatch).not.toBeNull();

        const htmlContent = htmlMatch[0];
        const { defaultView: { document } } = jsdom.jsdom(htmlContent);

        const affectedRoutes = Array.from(document.querySelectorAll('th')).find(
            th => th.textContent.trim() === 'Affected\u00A0Routes',
        );
        expect(affectedRoutes).not.toBeNull();

        const siblingTd = affectedRoutes.nextElementSibling;
        expect(siblingTd).not.toBeNull();
        expect(siblingTd.textContent.trim()).toBe('TMK');
    });

    test('should include affected stops', async () => {
        await shareToEmail({
            ...disruption,
            affectedEntities: [{
                stopId: '9100-2034265b',
                stopName: 'Newmarket Train Station 1',
                stopCode: '9100',
                locationType: 0,
                stopLat: -36.86972,
                stopLon: 174.77883,
                parentStation: '115-96c3c7be',
                platformCode: '1',
                routeType: 2,
                text: '9100 - Newmarket Train Station 1',
                category: {
                    type: 'stop',
                    icon: 'stop',
                    label: 'Stops',
                },
                icon: 'stop',
                valueKey: 'stopCode',
                labelKey: 'stopCode',
                type: 'stop',
            }],
        });

        const href = decodeURIComponent(link.href);

        const htmlMatch = /<html[\s\S]*<\/html>/.exec(href);
        expect(htmlMatch).not.toBeNull();

        const htmlContent = htmlMatch[0];
        const { defaultView: { document } } = jsdom.jsdom(htmlContent);

        const affectedStops = Array.from(document.querySelectorAll('th')).find(
            th => th.textContent.trim() === 'Affected\u00A0Stops',
        );
        expect(affectedStops).not.toBeNull();

        const siblingTd = affectedStops.nextElementSibling;
        expect(siblingTd).not.toBeNull();
        expect(siblingTd.textContent.trim()).toBe('9100');
    });

    test('should include duration for non recurrent when not started', async () => {
        const startTime = '2020-03-17T19:41:13.775Z';
        const now = '2020-03-01T19:41:13.775Z';
        jest.setSystemTime(new Date(now));

        await shareToEmail({ ...disruption, recurrent: false, startTime });

        const href = decodeURIComponent(link.href);

        const htmlMatch = /<html[\s\S]*<\/html>/.exec(href);
        expect(htmlMatch).not.toBeNull();

        const htmlContent = htmlMatch[0];
        const { defaultView: { document } } = jsdom.jsdom(htmlContent);

        const duration = Array.from(document.querySelectorAll('th')).find(
            th => th.textContent.trim() === 'Duration',
        );
        expect(duration).not.toBeNull();

        const siblingTd = duration.nextElementSibling;
        expect(siblingTd).not.toBeNull();
        expect(siblingTd.textContent.trim()).toBe('-');
    });

    test('should include duration for non recurrent when in progress', async () => {
        const startTime = '2020-03-17T19:41:13.775Z';
        const now = '2020-03-18T10:00:00.000Z';
        const endTime = '2020-03-18T19:41:13.775Z';
        const expectedDuration = '14 hours, 18 minutes, and 46 seconds';
        jest.setSystemTime(new Date(now));

        await shareToEmail({ ...disruption, recurrent: false, startTime, endTime });

        const href = decodeURIComponent(link.href);

        const htmlMatch = /<html[\s\S]*<\/html>/.exec(href);
        expect(htmlMatch).not.toBeNull();

        const htmlContent = htmlMatch[0];
        const { defaultView: { document } } = jsdom.jsdom(htmlContent);

        const duration = Array.from(document.querySelectorAll('th')).find(
            th => th.textContent.trim() === 'Duration',
        );
        expect(duration).not.toBeNull();

        const siblingTd = duration.nextElementSibling;
        expect(siblingTd).not.toBeNull();
        expect(siblingTd.textContent.trim()).toBe(expectedDuration.replace(/ /g, '\u00A0'));
    });

    test('should include duration for non recurrent when resolved', async () => {
        const startTime = '2020-03-17T19:41:13.775Z';
        const now = '2020-03-21T10:00:00.000Z';
        const endTime = '2020-03-18T19:41:13.775Z';
        const expectedDuration = '24 hours, 0 minutes, and 0 seconds';
        jest.setSystemTime(new Date(now));

        await shareToEmail({ ...disruption, recurrent: false, startTime, endTime, status: 'resolved' });

        const href = decodeURIComponent(link.href);

        const htmlMatch = /<html[\s\S]*<\/html>/.exec(href);
        expect(htmlMatch).not.toBeNull();

        const htmlContent = htmlMatch[0];
        const { defaultView: { document } } = jsdom.jsdom(htmlContent);

        const duration = Array.from(document.querySelectorAll('th')).find(
            th => th.textContent.trim() === 'Duration',
        );
        expect(duration).not.toBeNull();

        const siblingTd = duration.nextElementSibling;
        expect(siblingTd).not.toBeNull();
        expect(siblingTd.textContent.trim()).toBe(expectedDuration.replace(/ /g, '\u00A0'));
    });

    test('should include duration for non recurrent when end date/time is in the past', async () => {
        const startTime = '2020-03-17T19:41:13.775Z';
        const now = '2020-03-21T10:00:00.000Z';
        const endTime = '2020-03-18T19:41:13.775Z';
        const expectedDuration = '24 hours, 0 minutes, and 0 seconds';
        jest.setSystemTime(new Date(now));

        await shareToEmail({ ...disruption, recurrent: false, startTime, endTime });

        const href = decodeURIComponent(link.href);

        const htmlMatch = /<html[\s\S]*<\/html>/.exec(href);
        expect(htmlMatch).not.toBeNull();

        const htmlContent = htmlMatch[0];
        const { defaultView: { document } } = jsdom.jsdom(htmlContent);

        const duration = Array.from(document.querySelectorAll('th')).find(
            th => th.textContent.trim() === 'Duration',
        );
        expect(duration).not.toBeNull();

        const siblingTd = duration.nextElementSibling;
        expect(siblingTd).not.toBeNull();
        expect(siblingTd.textContent.trim()).toBe(expectedDuration.replace(/ /g, '\u00A0'));
    });

    test('should include duration for recurrent when not started', async () => {
        const startTime = '2022-08-29T20:30:00.000Z';
        const now = '2022-08-29T20:00:00.000Z';
        const endTime = '2022-08-31T22:30:00.000Z';
        jest.setSystemTime(new Date(now));

        await shareToEmail({ ...disruption, recurrent: true, startTime, endTime, activePeriods, recurrencePattern });

        const href = decodeURIComponent(link.href);

        const htmlMatch = /<html[\s\S]*<\/html>/.exec(href);
        expect(htmlMatch).not.toBeNull();

        const htmlContent = htmlMatch[0];
        const { defaultView: { document } } = jsdom.jsdom(htmlContent);

        const duration = Array.from(document.querySelectorAll('th')).find(
            th => th.textContent.trim() === 'Duration',
        );
        expect(duration).not.toBeNull();

        const siblingTd = duration.nextElementSibling;
        expect(siblingTd).not.toBeNull();
        expect(siblingTd.textContent.trim()).toBe('-');
    });

    test('should include scheduled period for recurring disruption', async () => {
        const expectedScheduledPeriod = 'M, Tu, W, Th, F, Sa, Su 8:30pm-10:30pm';
        const duration = 2;
        await shareToEmail({ ...disruption, duration, recurrent: true, activePeriods, recurrencePattern });

        const href = decodeURIComponent(link.href);

        const htmlMatch = /<html[\s\S]*<\/html>/.exec(href);
        expect(htmlMatch).not.toBeNull();

        const htmlContent = htmlMatch[0];
        const { defaultView: { document } } = jsdom.jsdom(htmlContent);

        const isScheduled = Array.from(document.querySelectorAll('th')).find(
            th => th.textContent.trim() === 'Scheduled?',
        );
        const scheduledPeriod = Array.from(document.querySelectorAll('th')).find(
            th => th.textContent.trim() === 'Scheduled\u00A0Period',
        );

        expect(isScheduled.nextElementSibling.textContent).toBe('Yes');
        expect(scheduledPeriod.nextElementSibling.textContent).toBe(expectedScheduledPeriod.replace(/ /g, '\u00A0'));
    });

    test('should not include scheduled period for recurring disruption', async () => {
        const expectedScheduledPeriod = '-';
        await shareToEmail({ ...disruption, recurrent: false, activePeriods });

        const href = decodeURIComponent(link.href);

        const htmlMatch = /<html[\s\S]*<\/html>/.exec(href);
        expect(htmlMatch).not.toBeNull();

        const htmlContent = htmlMatch[0];
        const { defaultView: { document } } = jsdom.jsdom(htmlContent);

        const isScheduled = Array.from(document.querySelectorAll('th')).find(
            th => th.textContent.trim() === 'Scheduled?',
        );
        const scheduledPeriod = Array.from(document.querySelectorAll('th')).find(
            th => th.textContent.trim() === 'Scheduled\u00A0Period',
        );

        expect(isScheduled.nextElementSibling.textContent).toBe('No');
        expect(scheduledPeriod.nextElementSibling.textContent).toBe(expectedScheduledPeriod);
    });

    test('should include duration for recurrent when in progress', async () => {
        const startTime = '2022-08-29T20:30:00.000Z';
        const now = '2022-08-31T22:00:00.000Z';
        const endTime = '2022-08-31T22:30:00.000Z';
        const expectedDuration = '3 hours, 30 minutes, and 0 seconds';
        jest.setSystemTime(new Date(now));

        await shareToEmail({ ...disruption, recurrent: true, startTime, endTime, activePeriods, recurrencePattern });

        const href = decodeURIComponent(link.href);

        const htmlMatch = /<html[\s\S]*<\/html>/.exec(href);
        expect(htmlMatch).not.toBeNull();

        const htmlContent = htmlMatch[0];
        const { defaultView: { document } } = jsdom.jsdom(htmlContent);

        const duration = Array.from(document.querySelectorAll('th')).find(
            th => th.textContent.trim() === 'Duration',
        );
        expect(duration).not.toBeNull();

        const siblingTd = duration.nextElementSibling;
        expect(siblingTd).not.toBeNull();
        expect(siblingTd.textContent.trim()).toBe(expectedDuration.replace(/ /g, '\u00A0'));
    });

    test('should include duration for recurrent when resolved', async () => {
        const startTime = '2022-08-29T20:30:00.000Z';
        const now = '2022-09-01T20:00:00.000Z';
        const endTime = '2022-08-31T21:30:00.000Z';
        const expectedDuration = '3 hours, 0 minutes, and 0 seconds';
        jest.setSystemTime(new Date(now));

        await shareToEmail({ ...disruption, recurrent: true, startTime, endTime, activePeriods, status: 'resolved', recurrencePattern });

        const href = decodeURIComponent(link.href);

        const htmlMatch = /<html[\s\S]*<\/html>/.exec(href);
        expect(htmlMatch).not.toBeNull();

        const htmlContent = htmlMatch[0];
        const { defaultView: { document } } = jsdom.jsdom(htmlContent);

        const duration = Array.from(document.querySelectorAll('th')).find(
            th => th.textContent.trim() === 'Duration',
        );
        expect(duration).not.toBeNull();

        const siblingTd = duration.nextElementSibling;
        expect(siblingTd).not.toBeNull();
        expect(siblingTd.textContent.trim()).toBe(expectedDuration.replace(/ /g, '\u00A0'));
    });

    test('should include duration for recurrent when end date/time is in the past', async () => {
        const startTime = '2022-08-29T20:30:00.000Z';
        const now = '2022-09-01T20:00:00.000Z';
        const endTime = '2022-08-31T21:30:00.000Z';
        const expectedDuration = '3 hours, 0 minutes, and 0 seconds';
        jest.setSystemTime(new Date(now));

        await shareToEmail({ ...disruption, recurrent: true, startTime, endTime, activePeriods, recurrencePattern });

        const href = decodeURIComponent(link.href);

        const htmlMatch = /<html[\s\S]*<\/html>/.exec(href);
        expect(htmlMatch).not.toBeNull();

        const htmlContent = htmlMatch[0];
        const { defaultView: { document } } = jsdom.jsdom(htmlContent);

        const duration = Array.from(document.querySelectorAll('th')).find(
            th => th.textContent.trim() === 'Duration',
        );
        expect(duration).not.toBeNull();

        const siblingTd = duration.nextElementSibling;
        expect(siblingTd).not.toBeNull();
        expect(siblingTd.textContent.trim()).toBe(expectedDuration.replace(/ /g, '\u00A0'));
    });

    test('should generate notes and order by update time desc', async () => {
        await shareToEmail({ ...disruption, notes });
        const mailContent = decodeURIComponent(link.href);
        const note1Index = mailContent.indexOf('test disruption notes 1');
        const note2Index = mailContent.indexOf('test disruption notes 2');
        expect(note1Index > 0).toBeTruthy();
        expect(note2Index > 0).toBeTruthy();
        expect(note1Index > note2Index).toBeTruthy();
    });

    test('should generate attachment if there is a diversion', async () => {
        const file = {
            content: ',mock image url to base64 code',
            contentType: 'image/png',
        };

        await shareToEmail({ ...disruption, uploadedFiles: disruptionDiversion }, jest.fn().mockResolvedValue(file));
        const boundary = '----disruption_email_boundary_string';
        const parts = link.href.split(boundary);
        expect(parts.length).toEqual(3);
        expect(parts[2]).toContain(`Content-Type: ${file.contentType}; name="test upload.png"`);
        expect(parts[2]).toContain('Content-Transfer-Encoding: base64');
        expect(parts[2]).toContain('Content-Disposition: attachment');
        expect(parts[2]).toContain(file.content.substring(1));
    });

    test('should not generate attachment if there is something wrong during the file download process', async () => {
        await shareToEmail({ ...disruption, uploadedFiles: disruptionDiversion }, jest.fn().mockResolvedValue(''));
        expect(link.href).not.toContain('Content-Disposition: attachment');
    });

    test('should generate subject for resolved disruption', async () => {
        await shareToEmail({ ...disruption, status: 'resolved' });
        expect(link.href).toContain('Subject: Re: RESOLVED - Unknown - Train Disruption Notification - Holidays for everyone - DISR0001');
    });

    test('should generate disclaimer', async () => {
        await shareToEmail({ ...disruption, mode: 'Bus' });
        const href = decodeURIComponent(link.href);
        expect(href).toContain('This notification is a communication tool');
    });

    test('should generate disclaimer even if mode is empty', async () => {
        await shareToEmail({ ...disruption, mode: '' });
        const href = decodeURIComponent(link.href);
        expect(href).toContain('This notification is a communication tool');
    });
});

describe('shareToEmailLegacy', () => {
    test('should export email by setting the content to the link href', async () => {
        await shareToEmailLegacy(disruption);
        expect(link.href.length > 0).toBeTruthy();
        expect(link.href).toContain('data:message/rfc822 eml;charset=utf-8');
    });

    test('should not set from and cc if env not set', async () => {
        delete process.env.REACT_APP_DISRUPTION_SHARING_EMAIL_FROM;
        delete process.env.REACT_APP_DISRUPTION_SHARING_EMAIL_CC;
        await shareToEmailLegacy(disruption);
        expect(link.href).toContain('From:  \ncc:  \n');
    });

    test('should set from and cc from process.env', async () => {
        process.env.REACT_APP_DISRUPTION_SHARING_EMAIL_FROM = 'dayof.ops@at.govt.nz';
        process.env.REACT_APP_DISRUPTION_SHARING_EMAIL_CC = 'dayof.ops@at.govt.nz';

        await shareToEmailLegacy(disruption);
        expect(link.href).toContain('From: dayof.ops@at.govt.nz');
        expect(link.href).toContain('cc: dayof.ops@at.govt.nz');

        delete process.env.REACT_APP_DISRUPTION_SHARING_EMAIL_FROM;
        delete process.env.REACT_APP_DISRUPTION_SHARING_EMAIL_CC;
    });

    test('should generate subject', async () => {
        await shareToEmailLegacy(disruption);
        expect(link.href).toContain('Subject: Re: Unknown - Train Disruption Notification - Holidays for everyone - DISR0001');
    });

    test('should handle empty mode', async () => {
        await shareToEmailLegacy({ ...disruption, mode: null });
        expect(link.href).toContain('Subject: Re: Unknown - Disruption Notification - Holidays for everyone - DISR0001');
    });

    test('should generate subject for multiple modes', async () => {
        await shareToEmailLegacy({ ...disruption, mode: 'Bus, Train, Ferry' });
        expect(link.href).toContain('Subject: Re: Unknown - Multi-Modal Disruption Notification - Holidays for everyone - DISR0001');
    });

    test('should generate subject for Bus and Train', async () => {
        await shareToEmailLegacy({ ...disruption, mode: 'Bus, Train' });
        expect(link.href).toContain('Subject: Re: Unknown - Bus & Train Disruption Notification - Holidays for everyone - DISR0001');
    });

    test('should generate subject for Bus and Ferry', async () => {
        await shareToEmailLegacy({ ...disruption, mode: 'Bus, Ferry' });
        expect(link.href).toContain('Subject: Re: Unknown - Bus & Ferry Disruption Notification - Holidays for everyone - DISR0001');
    });

    test('should generate subject for Ferry and Train', async () => {
        await shareToEmailLegacy({ ...disruption, mode: 'Train, Ferry' });
        expect(link.href).toContain('Subject: Re: Unknown - Ferry & Train Disruption Notification - Holidays for everyone - DISR0001');
    });

    test('should handle empty workaround', async () => {
        await shareToEmailLegacy({ ...disruption, workarounds: [] });
        expect(decodeURIComponent(link.href)).toContain('No workarounds added for this disruption.');
    });

    test('should handle empty end time', async () => {
        await shareToEmailLegacy({ ...disruption, endTime: null });
        expect(decodeURIComponent(link.href)).not.toContain('End Date');
        expect(decodeURIComponent(link.href)).not.toContain('End Time');
    });

    test('should generate notes and order by update time desc', async () => {
        await shareToEmailLegacy({ ...disruption, notes });
        const mailContent = decodeURIComponent(link.href);
        const note1Index = mailContent.indexOf('test disruption notes 1');
        const note2Index = mailContent.indexOf('test disruption notes 2');
        expect(note1Index > 0).toBeTruthy();
        expect(note2Index > 0).toBeTruthy();
        expect(note1Index > note2Index).toBeTruthy();
    });

    test('should generate attachment if there is a diversion', async () => {
        const file = {
            content: ',mock image url to base64 code',
            contentType: 'image/png',
        };

        await shareToEmailLegacy({ ...disruption, uploadedFiles: disruptionDiversion }, jest.fn().mockResolvedValue(file));
        const boundary = '----disruption_email_boundary_string';
        const parts = link.href.split(boundary);
        expect(parts.length).toEqual(3);
        expect(parts[2]).toContain(`Content-Type: ${file.contentType}; name="test upload.png"`);
        expect(parts[2]).toContain('Content-Transfer-Encoding: base64');
        expect(parts[2]).toContain('Content-Disposition: attachment');
        expect(parts[2]).toContain(file.content.substring(1));
    });

    test('should not generate attachment if there is something wrong during the file download process', async () => {
        await shareToEmailLegacy({ ...disruption, uploadedFiles: disruptionDiversion }, jest.fn().mockResolvedValue(''));
        expect(link.href).not.toContain('Content-Disposition: attachment');
    });

    test('should generate subject for resolved disruption', async () => {
        await shareToEmailLegacy({ ...disruption, status: 'resolved' });
        expect(link.href).toContain('Subject: Re: RESOLVED - Unknown - Train Disruption Notification - Holidays for everyone - DISR0001');
    });

    test('should not generate disclaimer', async () => {
        await shareToEmailLegacy({ ...disruption, mode: 'Bus' });
        const href = decodeURIComponent(link.href);
        expect(href).not.toContain('This notification is a communication tool');
    });

    test.each([
        ['CATASTROPHIC', 'Subject: Re: Catastrophic - Train Disruption Notification - Holidays for everyone - DISR0001'],
        ['HEADLINE', 'Subject: Re: Headline - Train Disruption Notification - Holidays for everyone - DISR0001'],
        ['MINOR', 'Subject: Re: Minor - Train Disruption Notification - Holidays for everyone - DISR0001'],
        ['', 'Subject: Re: Train Disruption Notification - Holidays for everyone - DISR0001'],
        [null, 'Subject: Re: Train Disruption Notification - Holidays for everyone - DISR0001'],
        [undefined, 'Subject: Re: Train Disruption Notification - Holidays for everyone - DISR0001'],
    ])('should generate correct subject for severity: %s', async (severity, expected) => {
        await shareToEmailLegacy({ ...disruption, severity });

        expect(link.href).toContain(expected);
        expect(link.href.startsWith('data:message/rfc822')).toBe(true);
        expect(link.download).toBeDefined();
        expect(link.href).not.toContain(' -  - ');
    });

    test.each([
        ['resolved', 'Subject: Re: RESOLVED - Train Disruption Notification - Holidays for everyone - DISR0001'],
        ['resolved', 'Subject: Re: RESOLVED - Minor - Train Disruption Notification - Holidays for everyone - DISR0001', 'MINOR'],
        [null, 'Subject: Re: Train Disruption Notification - Holidays for everyone - DISR0001'],
        [undefined, 'Subject: Re: Train Disruption Notification - Holidays for everyone - DISR0001'],
        [false, 'Subject: Re: Train Disruption Notification - Holidays for everyone - DISR0001'],
        [0, 'Subject: Re: Train Disruption Notification - Holidays for everyone - DISR0001'],
    ])('should generate correct subject for status: %s with severity: %s', async (status, expected, severity = '') => {
        await shareToEmailLegacy({ ...disruption, status, severity });

        expect(link.href).toContain(expected);
        expect(link.href.startsWith('data:message/rfc822')).toBe(true);
        expect(link.download).toBeDefined();
        expect(link.href).not.toContain(' -  - ');
    });
});

describe('shareToEmail indirectly testing getFileBase64', () => {
    let mockBlobData;
    const storageUrl = 'test-url/testImage.png';
    const uploadedFiles = [
        { storageUrl, fileName: 'testImage.png' },
    ];
    const fileReaderInstance = {
        onload: null,
        readAsDataURL(blob) {
            this.result = `data:${blob.type};base64,ZmFrZUJhc2U2NA==`;
            setTimeout(() => this.onload?.(), 0);
        },
    };

    beforeEach(() => {
        jest.clearAllMocks();
        mockBlobData = new Blob([new Uint8Array([72, 101, 108, 108, 111])], { type: 'image/png' });
    });

    beforeAll(() => {
        global.fetch = jest.fn();
        global.FileReader = jest.fn().mockImplementation(() => fileReaderInstance);
        global.Blob = jest.fn().mockImplementation((chunks, options) => ({
            chunks,
            type: options?.type || '',
            text: jest.fn().mockResolvedValue(chunks.join('')),
        }));
    });

    afterAll(() => {
        delete global.fetch;
        delete global.Blob;
        delete global.FileReader;
    });

    test('should call fetch to get file and include it in email attachment', async () => {
        fetch.mockResolvedValue({
            blob: jest.fn().mockResolvedValue(mockBlobData),
            headers: new Map([['content-type', 'image/png']]),
        });

        document.createElement = jest.fn(() => ({ click: jest.fn() }));
        await shareToEmail({ ...disruption, uploadedFiles, activePeriods });

        expect(fetch).toHaveBeenCalledWith(storageUrl);
    });

    test('should handle missing content-type header', async () => {
        fetch.mockResolvedValue({
            blob: jest.fn().mockResolvedValue(mockBlobData),
            headers: new Map(),
        });

        document.createElement = jest.fn(() => ({ click: jest.fn() }));
        await shareToEmail({ ...disruption, uploadedFiles, activePeriods });

        expect(fetch).toHaveBeenCalledWith(storageUrl);
    });
});
