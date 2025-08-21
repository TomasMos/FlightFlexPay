import admin from 'firebase-admin';

const serviceAccount = {
  type: "service_account",
  project_id: "splickets",
  private_key_id: "18703dce6ee713932e463948899864ebb44aed2f",
  private_key: "-----BEGIN PRIVATE KEY-----\nMIIEvAIBADANBgkqhkiG9w0BAQEFAASCBKYwggSiAgEAAoIBAQCzh9vWgGubr2fK\nXVpj458XzzLgcLWf0ED0MvGwTgmtlkh7xoXccRp4IBvS6Hojo+1phIddJN4oe9og\nFuk/RuGtCm8pI4lXX+/JkGijVB7EKMEJj9e9gYXV4Cc0KDnOt0dIFADGsS4QwyOJ\nBlb8Gl7t92g0FeMlN8nSE7bWKUmHH/SFEMtX0cJg8MPlTlNp1xzEHE8UjTPhHDnX\nATJCJ1q94K2F3bqoue5K8leGQQinO11cNbpFABqrAq0i7csRozHk6OJQvmSgkRuN\nZZgP///OHo68HcEyC8ppxsMmIr4CaQhDk4imKhlN3BnDqzQFmzmmLm7oNNk8R5OR\n09QKVBVhAgMBAAECggEAIjZ5j1DlUOO2NpMgQulxm9a1Vh68igJkonTj6KqSfxVk\n5kugnnAicHKEAuchQZH/kCx8pGQ+fv4NRTDAjfm6z6BtqywVxAQpHOMrgbap701p\n7iHOphNdFzNSnUauL4XvbF29gR/qTLD3YGlIId5/qT9NCSIDqcfOKv3tSbZQCBMd\nJk44iwTK2GcUSC4b9Brv6WwLnp7zRpl1vfmYxL2XWwXRa5qktLQfG4/ZcdFZ0ayb\ni2Oy2cCn+qE0EcOedKEq3wDkRHoGTZkG6IWNVga6opjVBjJ4JHQ6ifW5FA7NvPeL\nccxFeCt0uk/SiPTRLM7Ib681aheirs1ysFZPesh2PQKBgQD2Na4wMBbiX2K1ecBz\nwtHelRWpKX8pnxLGnMpZVJYThhu13+wCBKopTWaEEL7dIio+hTjlWiC1fZ0+W+ac\nHTBZZjJtg4N2REG7Lu/ubInKev9mWyy+fhxnhLuorfSs+huMOFqYAMwTgV/OpVLo\nouYK9EEGSoTUR8nGHA2kmxq3lQKBgQC6q2l0lDEBcachou+WlZBZhnmP5Sur6Abp\nYdbnOno7VP7WpgzvjVFhkrqTanbmDDWQ3j/BtQKF/kintIUceJ6zScw+q46OQURV\nTeyJU9|+SXkejKm7vI1HmSaRxnfKWd9Pxa4G+WYZzyjQmocWfnevPH+lnvkICTzK\nFmTCOe/DnQKBgCO4PgE3uNo2xHdXppgk15XXQ0E7h/td3Ld73899+hfzCOomBnN0\ngctkM09NrqMeZcqUQWDk5oHuK3X0l0xm37DYptBEmDn8RR0G/kA09vitR4huCdvJ\nKA3Mr/0U376Iup5pPpt24iSiTGgKjDC8EWvda+GhxguWLqvTPhd3eTTRAoGAaE+M\n+FYvJE1sRYGVPKKLLVvV5jD7vG5GHnhL7J5i23DdjvjvVZW0mj+x/tqJYngEHtXy\n7r3FkTbNRtm7YHOOy0U72vFnEdsq4jhPK1Ytdbt88TNNTdlJYW8VfHRZUDv0a9Fd\nNAx9n4KBnkAbqNg27TdzZQt2waTX0V2+JELX1okCgYAVAwkgu4/gZE0lyCTJFl0U\nbD78OS4JsP+9YhO3mzNgzVK9WHtt0WvMwEGkBhOnmzh2GhNuqPLZuKbWyHL0IwLm\niOiQhTYs30RjLgZgL2u/k0LB8df4PL7RmhE+n754mv7j6^+W2BYUU9FtjWXPok2Ux\n0GY4G8jjwQ9HqYXgLh4r1Q==\n-----END PRIVATE KEY-----\n",
  client_email: "firebase-adminsdk-fbsvc@splickets.iam.gserviceaccount.com",
  client_id: "112376092229928311088",
  auth_uri: "https://accounts.google.com/o/oauth2/auth",
  token_uri: "https://oauth2.googleapis.com/token",
  auth_provider_x509_cert_url: "https://www.googleapis.com/oauth2/v1/certs",
  client_x509_cert_url: "https://www.googleapis.com/robot/v1/metadata/x509/firebase-adminsdk-fbsvc%40splickets.iam.gserviceaccount.com",
  universe_domain: "googleapis.com"
};

// Initialize Firebase Admin only if not already initialized
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount as admin.ServiceAccount),
    projectId: "splickets"
  });
}

export const adminAuth = admin.auth();
export default admin;