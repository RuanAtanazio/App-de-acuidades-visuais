<<<<<<< HEAD
=======

>>>>>>> 55c9eae83c5b5087bd5334a8c2bd725e8a8a5db7
// This is a browser-only module, so we need to declare the global 'emailjs' object.
declare global {
    interface Window {
        emailjs: {
            send: (serviceID: string, templateID: string, templatePrams: Record<string, unknown>, publicKey: string) => Promise<any>;
        }
    }
}

<<<<<<< HEAD
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
=======
export const sendVerificationEmail = (toEmail: string, toName: string, code: string): Promise<any> => {
    
    // IMPORTANT: Replace these placeholder values with your own from your EmailJS account.
    // 1. Go to https://www.emailjs.com and create a free account.
    // 2. Connect your email provider (e.g., Gmail) to get a 'Service ID'.
    // 3. Create an email template to get a 'Template ID'. Your template should have variables like {{to_name}} and {{verification_code}}.
    // 4. Find your 'Public Key' in your account settings.
    const SERVICE_ID = 'YOUR_SERVICE_ID'; // <-- REPLACE
    const TEMPLATE_ID = 'YOUR_TEMPLATE_ID'; // <-- REPLACE
    const PUBLIC_KEY = 'YOUR_PUBLIC_KEY'; // <-- REPLACE

    if (SERVICE_ID === 'YOUR_SERVICE_ID' || TEMPLATE_ID === 'YOUR_TEMPLATE_ID' || PUBLIC_KEY === 'YOUR_PUBLIC_KEY') {
        const errorMessage = "EmailJS is not configured. Please replace placeholder credentials in services/emailService.ts";
        console.error(errorMessage);
        alert(errorMessage + `\n\nFor testing, your code is: ${code}`); // Fallback for developers
        return Promise.reject(new Error(errorMessage));
    }

    const templateParams = {
        to_email: toEmail,
        to_name: toName,
        verification_code: code,
    };

    return window.emailjs.send(SERVICE_ID, TEMPLATE_ID, templateParams, PUBLIC_KEY);
};
>>>>>>> 55c9eae83c5b5087bd5334a8c2bd725e8a8a5db7
