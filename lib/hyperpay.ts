const HYPERPAY_BASE_URL = (process.env.HYPERPAY_BASE_URL || "https://eu-prod.oppwa.com/").replace(
  /\/?$/,
  "/"
);
const HYPERPAY_ACCESS_TOKEN = process.env.HYPERPAY_ACCESS_TOKEN!;
const HYPERPAY_ENTITY_ID = process.env.HYPERPAY_ENTITY_ID!;

export interface PrepareCheckoutParams {
  amount: string;
  currency: string;
  paymentType: string;
  merchantTransactionId: string;
  entityId?: string;
  integrity?: boolean;
  // shopperResultUrl intentionally excluded: for synchronous COPYandPAY (DB/VISA/MASTER),
  // the redirect is set via <form action> only. Including it here causes HyperPay
  // to reject the status call with "shopperResultUrl was already set and cannot be overwritten".
  /** Mandatory for live: customer email */
  "customer.email"?: string;
  /** Mandatory for live */
  "customer.givenName"?: string;
  /** Mandatory for live */
  "customer.surname"?: string;
  /** Mandatory for live */
  "billing.street1"?: string;
  "billing.city"?: string;
  "billing.state"?: string;
  /** Mandatory for live; Alpha-2 country code e.g. JO */
  "billing.country"?: string;
  "billing.postcode"?: string;
}

export interface PrepareCheckoutResponse {
  id: string;
  integrity?: string;
  result?: { code: string; description: string };
}

function safeStr(v: unknown): string | undefined {
  if (v == null) return undefined;
  const s = String(v).trim();
  return s.length > 0 ? s : undefined;
}

export async function prepareCheckout(
  params: PrepareCheckoutParams
): Promise<PrepareCheckoutResponse> {
  const body: Record<string, string> = {
    entityId: params.entityId || HYPERPAY_ENTITY_ID,
    amount: String(params.amount).trim(),
    currency: String(params.currency).trim(),
    paymentType: String(params.paymentType).trim(),
    merchantTransactionId: String(params.merchantTransactionId).trim(),
    ...(params.integrity !== false ? { integrity: "true" } : {}),
  };

  const email = safeStr(params["customer.email"]);
  const givenName = safeStr(params["customer.givenName"]);
  const surname = safeStr(params["customer.surname"]);
  if (email) body["customer.email"] = email;
  if (givenName) body["customer.givenName"] = givenName;
  if (surname) body["customer.surname"] = surname;

  const street1 = safeStr(params["billing.street1"]);
  const city = safeStr(params["billing.city"]);
  const state = safeStr(params["billing.state"]);
  const country = safeStr(params["billing.country"]);
  const postcode = safeStr(params["billing.postcode"]);
  if (street1) body["billing.street1"] = street1;
  if (city) body["billing.city"] = city;
  if (state) body["billing.state"] = state;
  if (country) body["billing.country"] = country;
  if (postcode) body["billing.postcode"] = postcode;

  const url = `${HYPERPAY_BASE_URL}v1/checkouts`;
  const bodyStr = new URLSearchParams(body).toString();
  console.log("[HyperPay] prepareCheckout →", url, "| keys:", Object.keys(body).join(", "));

  const res = await fetch(url, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${HYPERPAY_ACCESS_TOKEN}`,
      "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8",
    },
    body: bodyStr,
  });

  const raw = await res.text();
  let data: PrepareCheckoutResponse;
  try {
    data = JSON.parse(raw) as PrepareCheckoutResponse;
  } catch {
    console.error("[HyperPay] prepareCheckout ← non-JSON", res.status, raw.slice(0, 300));
    throw new Error(`HyperPay returned invalid response: ${res.status}`);
  }

  if (!res.ok) {
    console.error("[HyperPay] prepareCheckout ← error", res.status, JSON.stringify(data));
    throw new Error(data.result?.description || data.result?.code || `HyperPay error: ${res.status}`);
  }
  console.log("[HyperPay] prepareCheckout ← success id:", data.id);
  return data;
}

export interface PaymentStatusResponse {
  id?: string;
  result?: { code: string; description: string };
  amount?: string;
  currency?: string;
  merchantTransactionId?: string;
  "merchantTransactionId"?: string;
  customParameters?: { merchantTransactionId?: string };
}

export async function getPaymentStatus(resourcePath: string): Promise<PaymentStatusResponse> {
  const path = resourcePath.startsWith("/") ? resourcePath.slice(1) : resourcePath;
  const url = `${HYPERPAY_BASE_URL}${path}?entityId=${encodeURIComponent(HYPERPAY_ENTITY_ID)}`;
  console.log("[HyperPay] getPaymentStatus →", url);

  const res = await fetch(url, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${HYPERPAY_ACCESS_TOKEN}`,
    },
  });

  const text = await res.text();
  let data: PaymentStatusResponse;
  try {
    data = JSON.parse(text) as PaymentStatusResponse;
  } catch {
    console.error("[HyperPay] getPaymentStatus ← non-JSON", res.status, text.slice(0, 500));
    throw new Error(`HyperPay returned invalid response: ${res.status}`);
  }

  if (!res.ok) {
    console.error("[HyperPay] getPaymentStatus ← error", res.status, JSON.stringify(data));
    const msg = data.result?.description || data.result?.code || `HyperPay status error: ${res.status}`;
    throw new Error(msg);
  }
  console.log("[HyperPay] getPaymentStatus ←", data.result?.code, "orderId:", data.merchantTransactionId ?? data["merchantTransactionId"]);
  return data;
}

export function getHyperPayBaseUrl(): string {
  return HYPERPAY_BASE_URL;
}

export function getWidgetScriptUrl(): string {
  return `${HYPERPAY_BASE_URL}v1/paymentWidgets.js`;
}
