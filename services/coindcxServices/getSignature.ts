import crypto from "crypto";

const getSignature = (body: any, secret: string) => {
  const payload = Buffer.from(JSON.stringify(body)).toString();
  const signature = crypto
    .createHmac("sha256", secret)
    .update(payload)
    .digest("hex");
  return signature;
};

export default getSignature;
