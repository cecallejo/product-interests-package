import { LightningElement, api, wire } from 'lwc';
import { getRecord } from 'lightning/uiRecordApi';

const DEFAULT_FIELD_API_NAME = 'AI_Product_Interests__c';
const MESSAGING_SESSION_CASE_FIELDS = ['MessagingSession.CaseId'];
const VOICE_CALL_CASE_FIELDS = ['VoiceCall.RelatedRecordId'];
const CASE_CONTACT_FIELDS = ['Case.ContactId'];

function fieldValue(record, apiName) {
    const f = record?.fields?.[apiName];
    if (!f) {
        return '';
    }
    const v = f.displayValue ?? f.value;
    return v == null ? '' : String(v).trim();
}

function parseTags(raw) {
    if (!raw) {
        return [];
    }
    return raw
        .split(/[,;|\n/]+/g)
        .map((s) => s.trim())
        .filter(Boolean);
}

export default class ProductInterestsPanel extends LightningElement {
    @api recordId;
    @api objectApiName;
    @api contactFieldApiName = DEFAULT_FIELD_API_NAME;

    _msWireFinished = false;
    _msWireError;
    _caseIdFromMessagingSession;
    _vcWireFinished = false;
    _vcWireError;
    _caseIdFromVoiceCall;
    _caseWireFinished = false;
    _caseWireError;
    _contactIdFromCase;
    _contactWireError;
    wiredContactRecord;

    get normalizedContactFieldApiName() {
        const raw = String(this.contactFieldApiName || DEFAULT_FIELD_API_NAME).trim();
        const apiName = raw.includes('.') ? raw.split('.').pop() : raw;
        return apiName || DEFAULT_FIELD_API_NAME;
    }

    get contactFieldPath() {
        return `Contact.${this.normalizedContactFieldApiName}`;
    }

    get contactFieldKey() {
        return this.normalizedContactFieldApiName;
    }

    get msLookupWireRecordId() {
        return this.objectApiName === 'MessagingSession' && this.recordId ? this.recordId : undefined;
    }

    get msLookupWireFields() {
        return this.msLookupWireRecordId ? MESSAGING_SESSION_CASE_FIELDS : undefined;
    }

    get vcLookupWireRecordId() {
        return this.objectApiName === 'VoiceCall' && this.recordId ? this.recordId : undefined;
    }

    get vcLookupWireFields() {
        return this.vcLookupWireRecordId ? VOICE_CALL_CASE_FIELDS : undefined;
    }

    @wire(getRecord, { recordId: '$msLookupWireRecordId', fields: '$msLookupWireFields' })
    wiredMessagingSession({ data, error }) {
        if (!this.msLookupWireRecordId) {
            this._msWireFinished = false;
            this._msWireError = undefined;
            this._caseIdFromMessagingSession = undefined;
            return;
        }
        this._msWireFinished = true;
        if (error) {
            this._msWireError = error;
            this._caseIdFromMessagingSession = undefined;
            return;
        }
        this._msWireError = undefined;
        this._caseIdFromMessagingSession = fieldValue(data, 'CaseId') || undefined;
    }

    @wire(getRecord, { recordId: '$vcLookupWireRecordId', fields: '$vcLookupWireFields' })
    wiredVoiceCall({ data, error }) {
        if (!this.vcLookupWireRecordId) {
            this._vcWireFinished = false;
            this._vcWireError = undefined;
            this._caseIdFromVoiceCall = undefined;
            return;
        }
        this._vcWireFinished = true;
        if (error) {
            this._vcWireError = error;
            this._caseIdFromVoiceCall = undefined;
            return;
        }
        this._vcWireError = undefined;
        const relatedId = fieldValue(data, 'RelatedRecordId');
        this._caseIdFromVoiceCall = relatedId && relatedId.startsWith('500') ? relatedId : undefined;
    }

    get caseLookupRecordId() {
        if (!this.recordId) {
            return undefined;
        }
        if (this.objectApiName === 'MessagingSession') {
            return this._caseIdFromMessagingSession || undefined;
        }
        if (this.objectApiName === 'VoiceCall') {
            return this._caseIdFromVoiceCall || undefined;
        }
        return undefined;
    }

    get caseLookupFields() {
        return this.caseLookupRecordId ? CASE_CONTACT_FIELDS : undefined;
    }

    @wire(getRecord, { recordId: '$caseLookupRecordId', fields: '$caseLookupFields' })
    wiredCase({ data, error }) {
        if (!this.caseLookupRecordId) {
            this._caseWireFinished = false;
            this._caseWireError = undefined;
            this._contactIdFromCase = undefined;
            return;
        }
        this._caseWireFinished = true;
        if (error) {
            this._caseWireError = error;
            this._contactIdFromCase = undefined;
            return;
        }
        this._caseWireError = undefined;
        this._contactIdFromCase = fieldValue(data, 'ContactId') || undefined;
    }

    get contactRecordId() {
        if (this.objectApiName === 'Contact') {
            return this.recordId || undefined;
        }
        return this._contactIdFromCase || undefined;
    }

    get contactWireFields() {
        return this.contactRecordId ? [this.contactFieldPath] : undefined;
    }

    @wire(getRecord, { recordId: '$contactRecordId', fields: '$contactWireFields' })
    wiredContact({ data, error }) {
        if (!this.contactRecordId) {
            this.wiredContactRecord = undefined;
            this._contactWireError = undefined;
            return;
        }
        this.wiredContactRecord = data;
        this._contactWireError = error;
    }

    get hasRecordId() {
        return Boolean(this.recordId);
    }

    get loading() {
        if (!this.hasRecordId) {
            return false;
        }
        if (this.objectApiName === 'Contact') {
            return this.wiredContactRecord === undefined && !this._contactWireError;
        }
        if (this.objectApiName === 'MessagingSession') {
            if (!this._msWireFinished) {
                return true;
            }
            if (!this._caseIdFromMessagingSession) {
                return false;
            }
        }
        if (this.objectApiName === 'VoiceCall') {
            if (!this._vcWireFinished) {
                return true;
            }
            if (!this._caseIdFromVoiceCall) {
                return false;
            }
        }
        if (!this.caseLookupRecordId) {
            return false;
        }
        if (!this._caseWireFinished) {
            return true;
        }
        if (!this.contactRecordId) {
            return false;
        }
        return this.wiredContactRecord === undefined && !this._contactWireError;
    }

    get noCaseLinkedForSession() {
        return (
            this.objectApiName === 'MessagingSession' &&
            this._msWireFinished &&
            !this._caseIdFromMessagingSession &&
            !this._msWireError
        );
    }

    get noCaseLinkedForVoiceCall() {
        return (
            this.objectApiName === 'VoiceCall' &&
            this._vcWireFinished &&
            !this._caseIdFromVoiceCall &&
            !this._vcWireError
        );
    }

    get noContactLinkedForContext() {
        return (
            this.objectApiName !== 'Contact' &&
            this._caseWireFinished &&
            !this._contactIdFromCase &&
            !this._caseWireError &&
            (this.caseLookupRecordId || this.noCaseLinkedForSession || this.noCaseLinkedForVoiceCall)
        );
    }

    get hasDisplayError() {
        return Boolean(
            this._msWireError || this._vcWireError || this._caseWireError || this._contactWireError
        );
    }

    get errorMessage() {
        const err = this._msWireError || this._vcWireError || this._caseWireError || this._contactWireError;
        if (!err) {
            return '';
        }
        return err.body?.message || 'Nao foi possivel carregar os dados.';
    }

    get interestsRaw() {
        return fieldValue(this.wiredContactRecord, this.contactFieldKey);
    }

    get interests() {
        return parseTags(this.interestsRaw);
    }

    get interestRows() {
        return this.interests.map((label, index) => ({
            key: `${index}-${label}`,
            label
        }));
    }

}
