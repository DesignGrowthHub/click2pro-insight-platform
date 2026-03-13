"use client";

type RazorpayCheckoutOptions = {
  key: string;
  amount: number;
  currency: string;
  name: string;
  description: string;
  order_id: string;
  prefill?: {
    name?: string;
    email?: string;
  };
  theme?: {
    color?: string;
  };
  modal?: {
    ondismiss?: () => void;
  };
  handler?: (response: {
    razorpay_payment_id: string;
    razorpay_order_id: string;
    razorpay_signature: string;
  }) => void;
};

type RazorpayCheckoutInstance = {
  open: () => void;
  on: (eventName: "payment.failed", handler: (response: unknown) => void) => void;
};

type RazorpayConstructor = new (options: RazorpayCheckoutOptions) => RazorpayCheckoutInstance;

function getRazorpayConstructor() {
  return (window as Window & { Razorpay?: RazorpayConstructor }).Razorpay;
}

export async function loadRazorpayCheckoutScript() {
  if (getRazorpayConstructor()) {
    return true;
  }

  await new Promise<void>((resolve, reject) => {
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    script.onload = () => resolve();
    script.onerror = () =>
      reject(new Error("Razorpay checkout could not be loaded in this browser session."));
    document.body.appendChild(script);
  });

  return Boolean(getRazorpayConstructor());
}

export function openRazorpayCheckout(options: RazorpayCheckoutOptions) {
  const Razorpay = getRazorpayConstructor();

  if (!Razorpay) {
    throw new Error("Razorpay checkout is not available.");
  }

  const instance = new Razorpay(options);
  instance.open();

  return instance;
}
