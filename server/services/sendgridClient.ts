import client from "@sendgrid/client";

if (!process.env.SENDGRID_API_KEY) {
  throw new Error("SENDGRID_API_KEY is not set");
}

client.setApiKey(process.env.SENDGRID_API_KEY);

export default client;