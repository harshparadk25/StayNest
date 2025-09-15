import checkoutNodeJssdk from "@paypal/checkout-server-sdk";

function environment() {
  let clientId = process.env.PAYPAL_CLIENT_ID;
  let clientSecret = process.env.PAYPAL_CLIENT_SECRET;

  if (process.env.PAYPAL_MODE === "sandbox") {
    return new checkoutNodeJssdk.core.SandboxEnvironment(clientId, clientSecret);
  } else {
    return new checkoutNodeJssdk.core.LiveEnvironment(clientId, clientSecret);
  }
}

export function client() {
  return new checkoutNodeJssdk.core.PayPalHttpClient(environment());
}

// export sdk so controllers can use request classes
export const paypalSdk = checkoutNodeJssdk;
