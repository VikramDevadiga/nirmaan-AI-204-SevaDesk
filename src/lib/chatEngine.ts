import { v4 as uuidv4 } from 'uuid';
import { getServiceFlow, ServiceFlow } from './serviceFlows';
import { createApplication } from './db';
import { normalizeWhatsappOtpPhone, sendWhatsappOtp, verifyWhatsappOtp } from './whatsappOtp';

// ─── Types ────────────────────────────────────────────────────────────────────
export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  quickReplies?: string[];
  isConfirmation?: boolean;
  applicationId?: string;
}

export interface ChatResponse {
  sessionId: string;
  message: string;
  quickReplies?: string[];
  applicationId?: string;
  stage?: string;
  messages?: ChatMessage[];
}

type Stage =
  | 'greeting'
  | 'select-service'
  | 'select-document'
  | 'pre-collect'
  | 'collecting'
  | 'verify-otp'
  | 'confirm'
  | 'complete';

interface PendingOtpState {
  fieldKey: string;
  phone: string;
}

interface SessionState {
  sessionId: string;
  stage: Stage;
  service?: string;
  document?: string;
  currentFieldIndex: number;
  collectedData: Record<string, string>;
  serviceFlow?: ServiceFlow;
  applicationId?: string;
  pendingOtp?: PendingOtpState;
  verifiedPhoneFields: string[];
  invalidAttempts: number;
  createdAt: Date;
  lastActivity: Date;
}

// ─── In-memory session store (use Redis in production) ────────────────────────
const sessions = new Map<string, SessionState>();

setInterval(() => {
  const cutoff = new Date(Date.now() - 2 * 3600 * 1000); // 2 hours
  for (const [key, s] of sessions.entries()) {
    if (s.lastActivity < cutoff) sessions.delete(key);
  }
}, 10 * 60 * 1000);

// ─── Document ID prefix map ───────────────────────────────────────────────────
const DOC_PREFIX: Record<string, string> = {
  pan: 'PAN',
  aadhaar: 'AAD',
  passport: 'PSP',
  'driving-license': 'DL',
  'voter-id': 'VOTE',
  'ration-card': 'RC',
  'birth-certificate': 'BC',
};

function generateApplicationId(document: string): string {
  const prefix = DOC_PREFIX[document] || 'GOV';
  const year = new Date().getFullYear();
  const rand = Math.random().toString(36).substring(2, 8).toUpperCase();
  return `${prefix}-${year}-${rand}`;
}

// ─── Service display names ────────────────────────────────────────────────────
const SERVICE_LABELS: Record<string, string> = {
  apply: 'Apply for a Document',
  retrieve: 'Retrieve / Check Status',
  update: 'Update Information',
};

const DOC_LABELS: Record<string, string> = {
  pan: 'PAN Card',
  aadhaar: 'Aadhaar Card',
  passport: 'Passport',
  'driving-license': 'Driving Licence',
  'voter-id': 'Voter ID',
  'ration-card': 'Ration Card',
  'birth-certificate': 'Birth Certificate',
};

// ─── Apply document options ───────────────────────────────────────────────────
const APPLY_DOCS = [
  '🪪 PAN Card', '🆔 Aadhaar Update', '📔 Passport',
  '🚗 Driving Licence', '🗳️ Voter ID', '🍚 Ration Card', '📜 Birth Certificate',
];

const RETRIEVE_DOCS = [
  '🪪 PAN Card Status', '🆔 Aadhaar / e-Aadhaar', '📔 Passport Status',
];

const DOC_VALUE_MAP: Record<string, string> = {
  '🪪 pan card': 'pan',
  'pan card': 'pan',
  'pan': 'pan',
  '🆔 aadhaar update': 'aadhaar',
  'aadhaar update': 'aadhaar',
  'aadhaar': 'aadhaar',
  '📔 passport': 'passport',
  'passport': 'passport',
  '🚗 driving licence': 'driving-license',
  'driving licence': 'driving-license',
  'driving license': 'driving-license',
  'dl': 'driving-license',
  '🗳️ voter id': 'voter-id',
  'voter id': 'voter-id',
  'voter': 'voter-id',
  'epic': 'voter-id',
  '🍚 ration card': 'ration-card',
  'ration card': 'ration-card',
  'ration': 'ration-card',
  '📜 birth certificate': 'birth-certificate',
  'birth certificate': 'birth-certificate',
  'birth': 'birth-certificate',
  // retrieve
  '🪪 pan card status': 'pan',
  'pan card status': 'pan',
  '🆔 aadhaar / e-aadhaar': 'aadhaar',
  'aadhaar / e-aadhaar': 'aadhaar',
  'e-aadhaar': 'aadhaar',
  '📔 passport status': 'passport',
  'passport status': 'passport',
};

const SERVICE_VALUE_MAP: Record<string, string> = {
  '📋 apply for a document': 'apply',
  'apply for a document': 'apply',
  'apply': 'apply',
  '🔍 retrieve / check status': 'retrieve',
  'retrieve / check status': 'retrieve',
  'retrieve': 'retrieve',
  'check status': 'retrieve',
  '✏️ update information': 'apply', // map to apply+aadhaar
  'update information': 'apply',
  'update': 'apply',
  '❓ other services': 'other',
  'other services': 'other',
  'other': 'other',
};

// ─── Core processor ───────────────────────────────────────────────────────────
export async function processMessage(sessionId: string | null, userMessage: string): Promise<ChatResponse> {
  const sid = sessionId || uuidv4();
  let session = sessions.get(sid);

  // Init or reset
  if (!session || userMessage === '__init__') {
    session = {
      sessionId: sid,
      stage: 'select-service',
      currentFieldIndex: 0,
      collectedData: {},
      verifiedPhoneFields: [],
      invalidAttempts: 0,
      createdAt: new Date(),
      lastActivity: new Date(),
    };
    sessions.set(sid, session);

    return {
      sessionId: sid,
      stage: 'select-service',
      message:
        "🙏 **Namaste! Welcome to SevaDesk** — your intelligent assistant for all Indian government document services.\n\nI'll guide you step-by-step. What would you like to do today?",
      quickReplies: ['📋 Apply for a Document', '🔍 Retrieve / Check Status', '✏️ Update Information', '❓ Other Services'],
    };
  }

  session.lastActivity = new Date();
  const msgTrimmed = userMessage.trim();
  const msgLower = msgTrimmed.toLowerCase();

  // Universal commands
  if (['start over', 'restart', 'reset', '/restart'].includes(msgLower)) {
    session.stage = 'select-service';
    session.service = undefined;
    session.document = undefined;
    session.currentFieldIndex = 0;
    session.collectedData = {};
    session.serviceFlow = undefined;
    session.applicationId = undefined;
    session.pendingOtp = undefined;
    session.verifiedPhoneFields = [];
    session.invalidAttempts = 0;
    sessions.set(sid, session);
    return {
      sessionId: sid,
      stage: 'select-service',
      message: '🔄 **Starting fresh!** What would you like to do today?',
      quickReplies: ['📋 Apply for a Document', '🔍 Retrieve / Check Status', '✏️ Update Information', '❓ Other Services'],
    };
  }

  if (['help', '/help', '?'].includes(msgLower)) {
    return {
      sessionId: sid,
      stage: session.stage,
      message:
        '**Available Commands:**\n• Type your answer naturally or click a quick reply\n• Type **"start over"** to restart from the beginning\n• Type **"back"** to go to the previous question\n• Type **"help"** to see this message\n\nIf you\'re mid-application, your progress is saved in this session.',
    };
  }

  if (msgLower === 'back' && session.stage === 'collecting' && session.currentFieldIndex > 0) {
    session.currentFieldIndex -= 1;
    sessions.set(sid, session);
    return askCurrentField(session);
  }

  switch (session.stage) {
    case 'select-service':
      return handleServiceSelection(session, msgLower, sid);
    case 'select-document':
      return handleDocumentSelection(session, msgLower, sid);
    case 'pre-collect':
      return startCollection(session, sid);
    case 'collecting':
      return await handleDataCollection(session, msgTrimmed, sid);
    case 'verify-otp':
      return await handleOtpVerification(session, msgTrimmed, sid);
    case 'confirm':
      return await handleConfirmation(session, msgLower, sid);
    case 'complete':
      return {
        sessionId: sid,
        stage: 'complete',
        message: `Your application **${session.applicationId}** has already been submitted! 🎉\n\nWould you like to start a new application or check your status?`,
        quickReplies: ['📋 New Application', '🔍 Track Status', '🏠 Start Over'],
        applicationId: session.applicationId,
      };
    default:
      return {
        sessionId: sid,
        stage: 'select-service',
        message: "I'm not sure what you mean. Let's start fresh — what would you like to do?",
        quickReplies: ['📋 Apply for a Document', '🔍 Retrieve / Check Status', '✏️ Update Information'],
      };
  }
}

// ─── Stage handlers ───────────────────────────────────────────────────────────

function handleServiceSelection(session: SessionState, msgLower: string, sid: string): ChatResponse {
  if (msgLower === 'other' || msgLower === '❓ other services' || msgLower === 'other services') {
    sessions.set(sid, session);
    return {
      sessionId: sid,
      stage: 'select-service',
      message:
        "For other services, please visit:\n\n• **Income Tax**: https://incometaxindiaefiling.gov.in\n• **GST**: https://gst.gov.in\n• **DigiLocker**: https://digilocker.gov.in\n• **UMANG App**: umang.gov.in\n\nWould you like help with any of the services I can assist with?",
      quickReplies: ['📋 Apply for a Document', '🔍 Retrieve / Check Status', '✏️ Update Information'],
    };
  }

  let service: string | null = null;
  for (const [key, val] of Object.entries(SERVICE_VALUE_MAP)) {
    if (msgLower.includes(key)) {
      service = val;
      break;
    }
  }

  if (!service) {
    session.invalidAttempts++;
    sessions.set(sid, session);
    return {
      sessionId: sid,
      stage: 'select-service',
      message: "Please select one of the options below:",
      quickReplies: ['📋 Apply for a Document', '🔍 Retrieve / Check Status', '✏️ Update Information', '❓ Other Services'],
    };
  }

  session.service = service;
  session.stage = 'select-document';
  session.invalidAttempts = 0;
  sessions.set(sid, session);

  const isRetrieve = service === 'retrieve';
  return {
    sessionId: sid,
    stage: 'select-document',
    message: isRetrieve
      ? "Great! Which document status would you like to **retrieve**?"
      : "Great! Which document would you like to **apply for**?",
    quickReplies: isRetrieve ? RETRIEVE_DOCS : APPLY_DOCS,
  };
}

function handleDocumentSelection(session: SessionState, msgLower: string, sid: string): ChatResponse {
  let document: string | null = null;

  for (const [key, val] of Object.entries(DOC_VALUE_MAP)) {
    if (msgLower.includes(key)) {
      document = val;
      break;
    }
  }

  if (!document) {
    session.invalidAttempts++;
    sessions.set(sid, session);
    const isRetrieve = session.service === 'retrieve';
    return {
      sessionId: sid,
      stage: 'select-document',
      message: "Please select a document from the options:",
      quickReplies: isRetrieve ? RETRIEVE_DOCS : APPLY_DOCS,
    };
  }

  const flow = getServiceFlow(session.service!, document);
  if (!flow) {
    sessions.set(sid, session);
    return {
      sessionId: sid,
      stage: 'select-document',
      message: "Sorry, I don't have a flow for that combination yet. Please pick from these options:",
      quickReplies: session.service === 'retrieve' ? RETRIEVE_DOCS : APPLY_DOCS,
    };
  }

  session.document = document;
  session.serviceFlow = flow;
  session.stage = 'pre-collect';
  session.currentFieldIndex = 0;
  session.collectedData = {};
  session.verifiedPhoneFields = [];
  session.pendingOtp = undefined;
  session.invalidAttempts = 0;
  sessions.set(sid, session);

  const docList = flow.requiredDocuments.map((d) => `  • ${d}`).join('\n');
  return {
    sessionId: sid,
    stage: 'pre-collect',
    message: `📋 **${flow.title}**\n\n${flow.description}\n\n⏳ **Processing Time:** ${flow.estimatedTime}\n\n📄 **Documents Required:**\n${docList}\n\nI'll now collect the required information. Ready?`,
    quickReplies: ['Yes, let\'s proceed ✅', 'Start Over 🔄'],
  };
}

function startCollection(session: SessionState, sid: string): ChatResponse {
  session.stage = 'collecting';
  session.currentFieldIndex = 0;
  session.pendingOtp = undefined;
  session.verifiedPhoneFields = [];
  sessions.set(sid, session);
  return askCurrentField(session);
}

async function handleDataCollection(session: SessionState, userInput: string, sid: string): Promise<ChatResponse> {
  const flow = session.serviceFlow!;
  const field = flow.fields[session.currentFieldIndex];

  if (!field) {
    // All fields collected — move to confirm
    session.stage = 'confirm';
    sessions.set(sid, session);
    return buildConfirmationMessage(session, sid);
  }

  // Validate
  if (field.validation && !field.validation(userInput)) {
    session.invalidAttempts++;
    sessions.set(sid, session);
    return {
      sessionId: sid,
      stage: 'collecting',
      message: `⚠️ ${field.validationMessage || 'Invalid input. Please try again.'}\n\n${field.question}${field.hint ? `\n\n💡 *Hint: ${field.hint}*` : ''}`,
    };
  }

  // Store and advance
  const normalizedInput = field.type === 'phone' ? normalizeWhatsappOtpPhone(userInput) : userInput;
  session.collectedData[field.key] = normalizedInput;
  session.currentFieldIndex++;
  session.invalidAttempts = 0;

  if (field.type === 'phone' && !session.verifiedPhoneFields.includes(field.key)) {
    const otpSendResult = await sendWhatsappOtp(normalizedInput);

    session.stage = 'verify-otp';
    session.pendingOtp = {
      fieldKey: field.key,
      phone: normalizedInput,
    };
    sessions.set(sid, session);

    if (!otpSendResult.success) {
      return {
        sessionId: sid,
        stage: 'verify-otp',
        message:
          `⚠️ I could not send the WhatsApp OTP to **${normalizedInput}**.\n\n${otpSendResult.message || 'Please try again in a moment.'}`,
        quickReplies: ['🔁 Resend OTP', '✏️ Change Number'],
      };
    }

    return {
      sessionId: sid,
      stage: 'verify-otp',
      message:
        `📲 A verification OTP has been sent to your WhatsApp number **${normalizedInput}**.\n\nPlease enter the **6-digit OTP** to continue.`,
      quickReplies: ['🔁 Resend OTP', '✏️ Change Number'],
    };
  }

  sessions.set(sid, session);

  if (session.currentFieldIndex >= flow.fields.length) {
    // Done collecting
    session.stage = 'confirm';
    sessions.set(sid, session);
    return buildConfirmationMessage(session, sid);
  }

  return askCurrentField(session);
}

async function handleOtpVerification(session: SessionState, userInput: string, sid: string): Promise<ChatResponse> {
  const pendingOtp = session.pendingOtp;

  if (!pendingOtp) {
    session.stage = 'collecting';
    sessions.set(sid, session);
    return askCurrentField(session);
  }

  const msgLower = userInput.trim().toLowerCase();

  if (msgLower.includes('change')) {
    session.stage = 'collecting';
    session.pendingOtp = undefined;
    session.currentFieldIndex = Math.max(0, session.currentFieldIndex - 1);
    delete session.collectedData[pendingOtp.fieldKey];
    session.verifiedPhoneFields = session.verifiedPhoneFields.filter((key) => key !== pendingOtp.fieldKey);
    sessions.set(sid, session);
    return {
      sessionId: sid,
      stage: 'collecting',
      message: 'No problem. Let\'s update the mobile number again.\n\n' + askCurrentField(session).message,
      quickReplies: askCurrentField(session).quickReplies,
    };
  }

  if (msgLower.includes('resend')) {
    const resendResult = await sendWhatsappOtp(pendingOtp.phone);
    session.pendingOtp = pendingOtp;
    sessions.set(sid, session);

    return {
      sessionId: sid,
      stage: 'verify-otp',
      message: resendResult.success
        ? `🔁 A new OTP has been sent to WhatsApp number **${pendingOtp.phone}**. Please enter the **6-digit OTP**.`
        : `⚠️ I could not resend the OTP right now.\n\n${resendResult.message || 'Please try again.'}`,
      quickReplies: ['🔁 Resend OTP', '✏️ Change Number'],
    };
  }

  const otpCode = userInput.replace(/\D/g, '');
  if (!/^\d{6}$/.test(otpCode)) {
    sessions.set(sid, session);
    return {
      sessionId: sid,
      stage: 'verify-otp',
      message: `⚠️ Please enter a valid **6-digit OTP** sent to WhatsApp number **${pendingOtp.phone}**.`,
      quickReplies: ['🔁 Resend OTP', '✏️ Change Number'],
    };
  }

  const verificationResult = await verifyWhatsappOtp(pendingOtp.phone, otpCode);
  if (!verificationResult.success) {
    session.invalidAttempts += 1;
    sessions.set(sid, session);
    return {
      sessionId: sid,
      stage: 'verify-otp',
      message: `⚠️ ${verificationResult.message || 'The OTP is incorrect.'}\n\nPlease try again or request a new OTP.`,
      quickReplies: ['🔁 Resend OTP', '✏️ Change Number'],
    };
  }

  session.invalidAttempts = 0;
  session.pendingOtp = undefined;
  session.verifiedPhoneFields = [...new Set([...session.verifiedPhoneFields, pendingOtp.fieldKey])];
  session.stage = 'collecting';
  sessions.set(sid, session);

  if (session.currentFieldIndex >= session.serviceFlow!.fields.length) {
    session.stage = 'confirm';
    sessions.set(sid, session);
    return {
      sessionId: sid,
      stage: 'confirm',
      message: `✅ WhatsApp OTP verified successfully.\n\n${buildConfirmationMessage(session, sid).message}`,
      quickReplies: ['✅ Confirm & Submit', '✏️ Edit Answers', '❌ Cancel Application'],
    };
  }

  const nextField = askCurrentField(session);
  return {
    sessionId: sid,
    stage: 'collecting',
    message: `✅ WhatsApp OTP verified successfully.\n\n${nextField.message}`,
    quickReplies: nextField.quickReplies,
  };
}

function askCurrentField(session: SessionState): ChatResponse {
  const flow = session.serviceFlow!;
  const field = flow.fields[session.currentFieldIndex];
  const total = flow.fields.length;
  const current = session.currentFieldIndex + 1;
  const progress = Math.round((session.currentFieldIndex / total) * 100);

  const progressBar = `📊 Step ${current} of ${total} (${progress}% complete)`;
  
  let msg = `${progressBar}\n\n${field.question}`;
  if (field.hint) msg += `\n\n💡 *${field.hint}*`;

  return {
    sessionId: session.sessionId,
    stage: 'collecting',
    message: msg,
    quickReplies: field.type === 'select' && field.options ? field.options : undefined,
  };
}

function buildConfirmationMessage(session: SessionState, sid: string): ChatResponse {
  const flow = session.serviceFlow!;
  const data = session.collectedData;

  const fieldLines = flow.fields
    .filter((f) => data[f.key] !== undefined)
    .map((f) => `**${f.label}:** ${data[f.key]}`)
    .join('\n');

  const msg =
    `✅ **All information collected!** Please review before submitting:\n\n` +
    `📋 **${flow.title}**\n` +
    `━━━━━━━━━━━━━━━━━━━━\n` +
    `${fieldLines}\n` +
    `━━━━━━━━━━━━━━━━━━━━\n\n` +
    `Is all the information correct? Once submitted, you will receive an **Application ID** to track your status.`;

  return {
    sessionId: sid,
    stage: 'confirm',
    message: msg,
    quickReplies: ['✅ Confirm & Submit', '✏️ Edit Answers', '❌ Cancel Application'],
  };
}

async function handleConfirmation(session: SessionState, msgLower: string, sid: string): Promise<ChatResponse> {
  if (msgLower.includes('confirm') || msgLower.includes('submit') || msgLower === 'yes') {
    const appId = generateApplicationId(session.document!);
    session.applicationId = appId;
    session.stage = 'complete';
    sessions.set(sid, session);

    // Persist to DB
    try {
      const flow = session.serviceFlow!;
      const applicantName =
        session.collectedData['fullName'] ||
        `${session.collectedData['firstName'] || ''} ${session.collectedData['lastName'] || ''}`.trim() ||
        session.collectedData['givenName'] ||
        session.collectedData['headName'] ||
        'Applicant';

      await createApplication({
        id: appId,
        type: flow.title,
        service: session.service!,
        document: session.document!,
        status: 'Submitted',
        statusHistory: [
          { status: 'Submitted', timestamp: new Date().toISOString(), note: 'Application received successfully' },
        ],
        submittedAt: new Date().toISOString(),
        data: session.collectedData,
        applicantName,
        applicantMobile: session.collectedData['mobile'] || '',
        applicantEmail: session.collectedData['email'] || '',
      });
    } catch (err) {
      console.error('DB write error:', err);
    }

    return {
      sessionId: sid,
      stage: 'complete',
      applicationId: appId,
      message:
        `🎉 **Application Submitted Successfully!**\n\n` +
        `Your **Application ID** is:\n## \`${appId}\`\n\n` +
        `📧 A confirmation will be sent to your registered email/mobile.\n\n` +
        `You can use this ID to track your application status anytime.\n\n` +
        `**Next Steps:**\n• Keep your application ID safe\n• Visit the Track Status page\n• Collect required original documents`,
      quickReplies: ['🔍 Track My Application', '📋 New Application', '🏠 Start Over'],
    };
  }

  if (msgLower.includes('edit') || msgLower.includes('change') || msgLower.includes('correct')) {
    session.stage = 'collecting';
    session.currentFieldIndex = 0;
    session.pendingOtp = undefined;
    session.verifiedPhoneFields = [];
    sessions.set(sid, session);
    return {
      sessionId: sid,
      stage: 'collecting',
      message: "No problem! Let's go through the questions again. You can update any field.\n\n" + askCurrentField(session).message,
      quickReplies: session.serviceFlow?.fields[0].options,
    };
  }

  if (msgLower.includes('cancel')) {
    session.stage = 'select-service';
    session.service = undefined;
    session.document = undefined;
    session.currentFieldIndex = 0;
    session.collectedData = {};
    session.serviceFlow = undefined;
    session.pendingOtp = undefined;
    session.verifiedPhoneFields = [];
    sessions.set(sid, session);
    return {
      sessionId: sid,
      stage: 'select-service',
      message: '❌ Application cancelled. What would you like to do?',
      quickReplies: ['📋 Apply for a Document', '🔍 Retrieve / Check Status', '✏️ Update Information'],
    };
  }

  return {
    sessionId: sid,
    stage: 'confirm',
    message: 'Please confirm or edit your application:',
    quickReplies: ['✅ Confirm & Submit', '✏️ Edit Answers', '❌ Cancel Application'],
  };
}
