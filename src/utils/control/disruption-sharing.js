import moment from 'moment';
import { find } from 'lodash-es';
import {
    DATE_FORMAT,
    DATE_TIME_FORMAT,
    LABEL_AFFECTED_ROUTES,
    LABEL_CAUSE, LABEL_CREATED_AT, LABEL_CUSTOMER_IMPACT, LABEL_DESCRIPTION, LABEL_END_DATE, LABEL_END_TIME,
    LABEL_HEADER, LABEL_LAST_UPDATED_AT, LABEL_SEVERITY,
    LABEL_MODE, LABEL_START_DATE, LABEL_START_TIME,
    LABEL_STATUS, LABEL_URL, TIME_FORMAT, LABEL_AFFECTED_STOPS, LABEL_WORKAROUNDS, LABEL_DISRUPTION_NOTES,
    LABEL_NOTE,
    LABEL_DURATION,
    LABEL_START_TIME_DATE,
    LABEL_END_TIME_DATE,
    NOTE_DISCLAIMER,
} from '../../constants/disruptions';
import { DISRUPTIONS_MESSAGE_TYPE, SEVERITIES, STATUSES } from '../../types/disruptions-types';
import { CAUSES, IMPACTS, OLD_CAUSES, OLD_IMPACTS } from '../../types/disruption-cause-and-effect';
import { getWorkaroundsAsText } from './disruption-workarounds';
import { formatCreatedUpdatedTime, getDeduplcatedAffectedRoutes, getDeduplcatedAffectedStops } from './disruptions';
import SEARCH_RESULT_TYPE from '../../types/search-result-types';

const { ROUTE } = SEARCH_RESULT_TYPE;

async function getFileBase64(url) {
    const response = await fetch(url);
    const blob = await response.blob();
    return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onload = () => {
            resolve({ content: reader.result, contentType: response.headers.get('content-type') });
        };
        reader.readAsDataURL(blob);
    });
}

/**
 * We use the inline style is because many email clients doesn't support a css file, please don't move the styles to a css or scss file.
 */
function generateHtmlNotes(notes) {
    if (notes?.length > 0) {
        return `<table style="display: table; border-spacing: 2px; border-color: grey;">
            <tbody>
                ${[...notes].reverse().map(note => (`<tr>
                <td style="vertical-align: top; width: 40%;">${formatCreatedUpdatedTime(note.createdTime)}</td>
                <td style="vertical-align: top; width: 100%;">
                    <pre style="font-family: inherit;">${note.description}</pre>
                </td>
                </tr>`)).join('')}
            </tbody>
        </table>`;
    }
    return `<span>${DISRUPTIONS_MESSAGE_TYPE.noNotesMessage}</span>`;
}

function createHtmlLine(label, value) {
    if (!value) {
        return '';
    }
    let valueToRender = value;
    if (label === LABEL_WORKAROUNDS) {
        valueToRender = value.length === 0 ? DISRUPTIONS_MESSAGE_TYPE.noWorkaroundsMessage : getWorkaroundsAsText(value, '; <br>');
    }
    if (label === LABEL_DISRUPTION_NOTES) {
        valueToRender = generateHtmlNotes(value);
    }
    return `<tr style="display: flex; flex-wrap: wrap; margin-right: -15px; margin-left: -15px;">
        <td style="flex: 0 0 33%; width: 33%; padding: 15px; vertical-align: top; border-top: 1px solid #dee2e6;" valign="top">
            ${label}
        </td>
        <td style="flex-basis: 0; flex-grow: 1; width: 100%; padding: 15px; vertical-align: top;
            border-top: 1px solid #dee2e6; word-break: break-word; word-wrap: break-word;" valign="top">
            ${valueToRender}
        </td>
    </tr>`;
}

function generateHtmlEmailBodyLegacy(disruption) {
    const endDateTimeMoment = moment(disruption.endTime);
    const MERGED_CAUSES = [...CAUSES, ...OLD_CAUSES];
    const MERGED_IMPACTS = [...IMPACTS, ...OLD_IMPACTS];
    const htmlBody = `
    <div style="display: flex;width: 100% !important;font-weight: 400;font-size: 1rem;line-height: 1.5;">
        <h3 class="modal-title mx-auto font-weight-normal">Summary for Disruption ${disruption.incidentNo}</h3>
    </div>
    <table style="display: table; border-collapse: separate; box-sizing: border-box; text-indent: initial; border-spacing: 2px; border-color: grey; width: 100%;
        margin-bottom: 1rem; color: #212529; table-layout: fixed;" width="100%">
        <tbody>
            ${createHtmlLine(LABEL_HEADER, disruption.header)}
            ${createHtmlLine(LABEL_SEVERITY, find(SEVERITIES, { value: disruption.severity }).label)}
            ${createHtmlLine(LABEL_STATUS, disruption.status)}
            ${createHtmlLine(LABEL_MODE, disruption.mode)}
            ${createHtmlLine(LABEL_AFFECTED_ROUTES, getDeduplcatedAffectedRoutes(disruption.affectedEntities).join(', '))}
            ${createHtmlLine(LABEL_AFFECTED_STOPS, getDeduplcatedAffectedStops(disruption.affectedEntities).join(', '))}
            ${createHtmlLine(LABEL_CUSTOMER_IMPACT, find(MERGED_IMPACTS, { value: disruption.impact }).label)}
            ${createHtmlLine(LABEL_CAUSE, find(MERGED_CAUSES, { value: disruption.cause }).label)}
            ${createHtmlLine(LABEL_DESCRIPTION, disruption.description)}
            ${createHtmlLine(LABEL_START_DATE, moment(disruption.startTime).format(DATE_FORMAT))}
            ${createHtmlLine(LABEL_START_TIME, moment(disruption.startTime).format(TIME_FORMAT))}
            ${createHtmlLine(LABEL_END_DATE, disruption.endTime && endDateTimeMoment.isValid() ? endDateTimeMoment.format(DATE_FORMAT) : '')}
            ${createHtmlLine(LABEL_END_TIME, disruption.endTime && endDateTimeMoment.isValid() ? endDateTimeMoment.format(TIME_FORMAT) : '')}
            ${createHtmlLine(LABEL_URL, disruption.url)}
            ${createHtmlLine(LABEL_CREATED_AT, formatCreatedUpdatedTime(disruption.createdTime))}
            ${createHtmlLine(LABEL_LAST_UPDATED_AT, formatCreatedUpdatedTime(disruption.lastUpdatedTime))}
            ${createHtmlLine(LABEL_DISRUPTION_NOTES, disruption.notes)}
            ${createHtmlLine(LABEL_WORKAROUNDS, disruption.workarounds)}
        </tbody>
    </table>
    `;
    return encodeURIComponent(`<html><head></head><body>${htmlBody}</body></html>`);
}

function generateHeaderSection(disruption) {
    return `<div style="margin-bottom: 20px;">
        <p><strong>${disruption.incidentNo}: ${disruption.header}</strong></p>
        <p><strong>${LABEL_LAST_UPDATED_AT}:</strong> ${formatCreatedUpdatedTime(disruption.lastUpdatedTime)}</p>
    </div>`;
}

function createHtmlField(mapFieldValue, label) {
    const value = mapFieldValue[label] || '-';

    const nonBreakingLabel = label.replace(/ /g, '&nbsp;');
    const nonBreakingValue = [LABEL_AFFECTED_ROUTES, LABEL_AFFECTED_STOPS].includes(label)
        ? value
        : value.replace(/ /g, '&nbsp;');

    return `<th style="font-weight: bold; padding: 0px 15px 15px 5px; text-align: left;">${nonBreakingLabel}</th>
        <td style="padding: 0px 15px 15px 5px;">${nonBreakingValue}</td>`;
}

function getDuration(disruption) {
    const startTime = moment(disruption.startTime);
    const endTime = moment(disruption.endTime);
    const now = moment();
    let cutoff = now;
    let duration;

    if (now <= startTime) {
        return '-';
    }

    if (disruption.status === STATUSES.RESOLVED || endTime <= now) {
        cutoff = endTime;
    }

    if (!disruption.recurrent) {
        duration = cutoff.diff(startTime, 'seconds');
    }

    if (disruption.recurrent) {
        const cutoffEpoch = cutoff.unix();
        duration = disruption.activePeriods
            .filter(activePeriod => activePeriod.startTime < cutoffEpoch)
            .map(activePeriod => ({
                startTime: activePeriod.startTime,
                endTime: Math.min(activePeriod.endTime, cutoffEpoch),
            }))
            .reduce((sum, activePeriod) => sum + (activePeriod.endTime - activePeriod.startTime), 0);
    }

    const hours = Math.floor(duration / 3600);
    const minutes = Math.floor((duration % 3600) / 60);
    const seconds = duration % 60;

    return `${hours} hours, ${minutes} minutes, and ${seconds} seconds`;
}

function getMapFieldValue(disruption) {
    const endDateTimeMoment = moment(disruption.endTime);
    const MERGED_CAUSES = [...CAUSES, ...OLD_CAUSES];
    const MERGED_IMPACTS = [...IMPACTS, ...OLD_IMPACTS];

    return {
        [LABEL_CREATED_AT]: formatCreatedUpdatedTime(disruption.createdTime),
        [LABEL_STATUS]: disruption.status,
        [LABEL_MODE]: disruption.mode,
        [LABEL_AFFECTED_ROUTES]: getDeduplcatedAffectedRoutes(disruption.affectedEntities).join(', '),
        [LABEL_AFFECTED_STOPS]: getDeduplcatedAffectedStops(disruption.affectedEntities).join(', '),
        [LABEL_CAUSE]: find(MERGED_CAUSES, { value: disruption.cause }).label,
        [LABEL_SEVERITY]: find(SEVERITIES, { value: disruption.severity }).label,
        [LABEL_CUSTOMER_IMPACT]: find(MERGED_IMPACTS, { value: disruption.impact }).label,
        [LABEL_DURATION]: getDuration(disruption),
        [LABEL_START_TIME_DATE]: moment(disruption.startTime).format(DATE_TIME_FORMAT),
        [LABEL_END_TIME_DATE]: disruption.endTime && endDateTimeMoment.isValid() ? endDateTimeMoment.format(DATE_TIME_FORMAT) : '',
    };
}

function generateHtmlDetailsTable(disruption) {
    const mapFieldValue = getMapFieldValue(disruption);
    const isRouteBased = disruption.affectedEntities?.[0].type === ROUTE.type;

    return `<table border="1" style="font-family: Arial; font-size: 16px; border-collapse: collapse; text-align: left; width: 100%; max-width: 800px;">
        <tr>
            ${createHtmlField(mapFieldValue, LABEL_CREATED_AT)}
            ${createHtmlField(mapFieldValue, LABEL_STATUS)}
        </tr>
        <tr>
            ${createHtmlField(mapFieldValue, LABEL_MODE)}
            ${createHtmlField(mapFieldValue, isRouteBased ? LABEL_AFFECTED_ROUTES : LABEL_AFFECTED_STOPS)}
        </tr>
        <tr>
            ${createHtmlField(mapFieldValue, LABEL_CAUSE)}
            ${createHtmlField(mapFieldValue, LABEL_SEVERITY)}
        </tr>
        <tr>
            ${createHtmlField(mapFieldValue, LABEL_CUSTOMER_IMPACT)}
            ${createHtmlField(mapFieldValue, LABEL_DURATION)}
        </tr>
        <tr>
            ${createHtmlField(mapFieldValue, LABEL_START_TIME_DATE)}
            ${createHtmlField(mapFieldValue, LABEL_END_TIME_DATE)}
        </tr>
    </table>
    <br>`;
}

function generateHtmlNotesTable(disruption) {
    if (!disruption.notes?.length) {
        return '';
    }

    const notesHtml = [...disruption.notes].reverse().map((note) => {
        const createdTime = formatCreatedUpdatedTime(note.createdTime);
        const nonBreakingCreatedTime = createdTime.replace(/ /g, '&nbsp;');

        return `<tr>
            <td style="padding: 0px 15px 15px 5px;">${nonBreakingCreatedTime}</td>
            <td style="padding: 0px 15px 15px 5px;">
                <pre style="font-family: Arial; font-size: 16px; margin: 0">${note.description}</pre>
            </td>
            </tr>`;
    }).join('');

    return `<br><table border="1" style="font-family: Arial; font-size: 16px; border-collapse: collapse; text-align: left; width: 100%; max-width: 800px;">
        <tr>
            <th colspan="2" style="padding: 0px 15px 15px 5px; font-weight: bold; text-align: left;">${disruption.incidentNo}&nbsp;Timeline</th>
        </tr>
        <tr>
            <th style="font-weight: bold; width: 20%; padding: 0px 15px 15px 5px; text-align: left;">Date&nbsp;&&nbsp;Time</th>
            <th style="font-weight: bold; padding: 0px 15px 15px 5px; text-align: left;">Disruption&nbsp;/&nbsp;Activity&nbsp;Details</th>
        </tr>
        ${notesHtml}
    </table><br>`;
}

function generateFooterSection() {
    return `<table style="max-width: 800px; width: 100%; border-collapse: collapse;">
        <tr>
            <td>
                <b>${LABEL_NOTE}: </b>
                <i>${NOTE_DISCLAIMER} </i>
            </td>
        </tr>
    </table>`;
}

function generateHtmlEmailBody(disruption) {
    const htmlBody = `
    <div style="font-family: Arial; font-size: 16px;">
        ${generateHeaderSection(disruption)}
        <div style="display: table; text-align: left; max-width: 800px; font-family: Arial; font-size: 16px;">
            ${generateHtmlDetailsTable(disruption)}
            ${generateHtmlNotesTable(disruption)}
            ${generateFooterSection()}
        </div>
    </div>
    `;
    return encodeURIComponent(`<html><head></head><body>${htmlBody}</body></html>`);
}

async function generateAttachment(uploadFile, getAttachmentFileAsync = undefined) {
    const base64File = getAttachmentFileAsync ? await getAttachmentFileAsync() : await getFileBase64(uploadFile.storageUrl);
    if (!base64File?.content?.includes(',')) {
        return '';
    }
    const contentType = `Content-Type: ${base64File.contentType}; name="${uploadFile.fileName}"\n`;
    const attachment = `${contentType
    }Content-Transfer-Encoding: base64\n`
        + 'Content-Disposition: attachment\n'
        + `\n${base64File.content.split(',')[1]} \n`;
    return attachment;
}

function getSubjectMode(mode) {
    if (mode.includes('Bus') && mode.includes('Train') && mode.includes('Ferry')) {
        return 'Multi-Modal';
    }
    if (mode.includes('Bus') && mode.includes('Train')) {
        return 'Bus & Train';
    }
    if (mode.includes('Bus') && mode.includes('Ferry')) {
        return 'Bus & Ferry';
    }
    if (mode.includes('Train') && mode.includes('Ferry')) {
        return 'Ferry & Train';
    }

    return mode;
}

export async function shareToEmailLegacy(disruption, getAttachmentFileAsync = undefined) {
    const mode = disruption.mode ? `${getSubjectMode(disruption.mode)} ` : '';
    const subject = `Re: ${disruption.status === STATUSES.RESOLVED ? 'RESOLVED - ' : ''}${mode}Disruption Notification - ${disruption.header} - ${disruption.incidentNo}`;
    const boundary = '--disruption_email_boundary_string';
    const { REACT_APP_DISRUPTION_SHARING_EMAIL_FROM, REACT_APP_DISRUPTION_SHARING_EMAIL_CC } = process.env;
    let emailFile = 'data:message/rfc822 eml;charset=utf-8,'
        + `From: ${REACT_APP_DISRUPTION_SHARING_EMAIL_FROM || ''} \n`
        + `cc: ${REACT_APP_DISRUPTION_SHARING_EMAIL_CC || ''} \n`
        + 'X-Unsent: 1 \n'
        + `Subject: ${subject} \n`
        + `Content-Type: multipart/mixed; boundary=${boundary} \n`
        + `\n--${boundary}\n`
        + 'Content-Type: text/html; charset=UTF-8\n'
        + `\n${generateHtmlEmailBodyLegacy(disruption)}\n`;
    if (disruption.uploadedFiles?.length) {
        emailFile += `\n--${boundary}\n${await generateAttachment(disruption.uploadedFiles[0], getAttachmentFileAsync)}`;
    }
    const link = document.createElement('a');
    link.href = emailFile;
    link.download = `${subject}.eml`;
    link.click();
}

export async function shareToEmail(disruption, getAttachmentFileAsync = undefined) {
    const mode = disruption.mode ? `${getSubjectMode(disruption.mode)} ` : '';
    const subject = `Re: ${disruption.status === STATUSES.RESOLVED ? 'RESOLVED - ' : ''}${mode}Disruption Notification - ${disruption.header} - ${disruption.incidentNo}`;
    const boundary = '--disruption_email_boundary_string';
    const { REACT_APP_DISRUPTION_SHARING_EMAIL_FROM, REACT_APP_DISRUPTION_SHARING_EMAIL_CC } = process.env;
    let emailFile = 'data:message/rfc822 eml;charset=utf-8,'
        + `From: ${REACT_APP_DISRUPTION_SHARING_EMAIL_FROM || ''} \n`
        + `cc: ${REACT_APP_DISRUPTION_SHARING_EMAIL_CC || ''} \n`
        + 'X-Unsent: 1 \n'
        + `Subject: ${subject} \n`
        + `Content-Type: multipart/mixed; boundary=${boundary} \n`
        + `\n--${boundary}\n`
        + 'Content-Type: text/html; charset=UTF-8\n'
        + `\n${generateHtmlEmailBody(disruption)}\n`;
    if (disruption.uploadedFiles?.length) {
        emailFile += `\n--${boundary}\n${await generateAttachment(disruption.uploadedFiles[0], getAttachmentFileAsync)}`;
    }
    const link = document.createElement('a');
    link.href = emailFile;
    link.download = `${subject}.eml`;
    link.click();
}
