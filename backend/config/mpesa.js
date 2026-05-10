const axios = require("axios");

const CONSUMER_KEY    = process.env.MPESA_CONSUMER_KEY;
const CONSUMER_SECRET = process.env.MPESA_CONSUMER_SECRET;
const SHORTCODE       = process.env.MPESA_SHORTCODE    || "174379";
const PASSKEY         = process.env.MPESA_PASSKEY;
const CALLBACK_URL    = process.env.MPESA_CALLBACK_URL;
const ENV             = process.env.MPESA_ENV          || "sandbox";

const BASE_URL = ENV === "production"
  ? "https://api.safaricom.co.ke"
  : "https://sandbox.safaricom.co.ke";

// ── Get OAuth token ───────────────────────────────────────
const getToken = async () => {
  const credentials = Buffer.from(`${CONSUMER_KEY}:${CONSUMER_SECRET}`).toString("base64");
  const { data } = await axios.get(
    `${BASE_URL}/oauth/v1/generate?grant_type=client_credentials`,
    { headers: { Authorization: `Basic ${credentials}` } }
  );
  return data.access_token;
};

// ── Generate password ─────────────────────────────────────
const getPassword = () => {
  const timestamp = new Date()
    .toISOString()
    .replace(/[^0-9]/g, "")
    .slice(0, 14);
  const password = Buffer.from(`${SHORTCODE}${PASSKEY}${timestamp}`).toString("base64");
  return { password, timestamp };
};

// ── Format phone number ───────────────────────────────────
const formatPhone = (phone) => {
  // Convert 07XX or +2547XX to 2547XX
  let cleaned = phone.replace(/\s+/g, "").replace(/[^0-9]/g, "");
  if (cleaned.startsWith("0"))   cleaned = "254" + cleaned.slice(1);
  if (cleaned.startsWith("+"))   cleaned = cleaned.slice(1);
  return cleaned;
};

// ── STK Push ──────────────────────────────────────────────
const stkPush = async ({ phone, amount, orderId }) => {
  const token = await getToken();
  const { password, timestamp } = getPassword();
  const formattedPhone = formatPhone(phone);

  const { data } = await axios.post(
    `${BASE_URL}/mpesa/stkpush/v1/processrequest`,
    {
      BusinessShortCode: SHORTCODE,
      Password:          password,
      Timestamp:         timestamp,
      TransactionType:   "CustomerPayBillOnline",
      Amount:            Math.ceil(amount),
      PartyA:            formattedPhone,
      PartyB:            SHORTCODE,
      PhoneNumber:       formattedPhone,
      CallBackURL:       CALLBACK_URL,
      AccountReference:  `Order-${orderId}`,
      TransactionDesc:   `Payment for LuxeWear Order ${orderId}`,
    },
    { headers: { Authorization: `Bearer ${token}` } }
  );

  return data;
};

// ── Query STK status ──────────────────────────────────────
const stkQuery = async (checkoutRequestId) => {
  const token = await getToken();
  const { password, timestamp } = getPassword();

  const { data } = await axios.post(
    `${BASE_URL}/mpesa/stkpushquery/v1/query`,
    {
      BusinessShortCode: SHORTCODE,
      Password:          password,
      Timestamp:         timestamp,
      CheckoutRequestID: checkoutRequestId,
    },
    { headers: { Authorization: `Bearer ${token}` } }
  );

  return data;
};

module.exports = { stkPush, stkQuery, formatPhone };