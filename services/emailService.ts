// This is a browser-only module, so we need to declare the global 'emailjs' object.
declare global {
    interface Window {
        emailjs: {
            send: (serviceID: string, templateID: string, templatePrams: Record<string, unknown>, publicKey: string) => Promise<any>;
        }
    }
}

export const sendVerificationEmail = (toEmail: string, code: string): Promise<any> => {
    
    // EmailJS Credentials provided by the user.
    const SERVICE_ID = 'service_qwwhcdl';
    const TEMPLATE_ID = 'template_1irtnnl';
    const PUBLIC_KEY = 'PrXulu-S8tyeFldYR';

    // FIX: Removed the obsolete safeguard check for placeholder credentials. Since the credentials
    // are now hardcoded, this check was always false and caused a TypeScript error.

    const expirationTime = new Date(Date.now() + 15 * 60 * 1000);
    const formattedTime = expirationTime.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });

    // These parameters must match the variables in your EmailJS template.
    const templateParams = {
        email: toEmail,
        passcode: code,
        time: formattedTime,
    };

    return window.emailjs.send(SERVICE_ID, TEMPLATE_ID, templateParams, PUBLIC_KEY);
};