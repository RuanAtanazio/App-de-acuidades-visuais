
import React, { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../App';
import { useI18n } from '../App';
import { fetchAddressByCEP } from '../services/apiService';
import { sendVerificationEmail } from '../services/emailService';
import { validateCPF, validateCNPJ } from '../services/validationService';


const EyeIcon = ({ visible }: { visible: boolean }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
        {visible ? (
            <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" /><path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.022 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
        ) : (
            <path fillRule="evenodd" d="M13.477 14.89A6 6 0 015.11 6.524l8.367 8.367zm1.06-1.06L6.523 5.11a6 6 0 018.367 8.367zM10 12a2 2 0 110-4 2 2 0 010 4z" clipRule="evenodd" /><path d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7-1.274 4.057-5.022 7-8.268-2.943-9.542-7z" />
        )}
    </svg>
);


const AuthPage: React.FC = () => {
    const [isLogin, setIsLogin] = useState(true);
    const { login } = useAuth();
    const { t } = useI18n();
    const navigate = useNavigate();
    
    // Login State
    const [loginEmail, setLoginEmail] = useState('');
    const [loginPassword, setLoginPassword] = useState('');
    const [showLoginPassword, setShowLoginPassword] = useState(false);

    // Register State
    // FIX: Added 'bairro' to the initial state of the registration form.
    // This resolves the error when trying to set 'bairro' after fetching address data from the CEP API.
    const [regForm, setRegForm] = useState({
        nome: '', email: '', rg: '', cpfCnpj: '', cep: '', numero: '',
        endereco: '', bairro: '', cidade: '', estado: '', pais: 'Brasil', perfil: '',
        crmCra: '', senha: '', confirmSenha: ''
    });
    const [showRegPassword, setShowRegPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [passwordError, setPasswordError] = useState('');
    const [cpfCnpjError, setCpfCnpjError] = useState('');


    // Verification State
    const [isVerifying, setIsVerifying] = useState(false);
    const [verificationCode, setVerificationCode] = useState('');
    const [userCode, setUserCode] = useState('');


    const handleRegChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setRegForm(prev => ({ ...prev, [name]: value }));

        if (name === 'senha' || name === 'confirmSenha') {
            const currentSenha = name === 'senha' ? value : regForm.senha;
            const currentConfirmSenha = name === 'confirmSenha' ? value : regForm.confirmSenha;
             if (currentConfirmSenha && currentSenha !== currentConfirmSenha) {
                setPasswordError(t('auth.error.passwordMismatch'));
            } else {
                setPasswordError('');
            }
        }
    };

    const handleCepBlur = useCallback(async () => {
        const address = await fetchAddressByCEP(regForm.cep);
        if (address) {
            setRegForm(prev => ({
                ...prev,
                endereco: address.endereco || prev.endereco,
                cidade: address.cidade || prev.cidade,
                estado: address.estado || prev.estado,
                bairro: address.bairro || prev.bairro,
            }));
        }
    }, [regForm.cep]);

    const handleCpfCnpjBlur = useCallback(() => {
        const value = regForm.cpfCnpj.replace(/\D/g, '');
        if (!value) {
            setCpfCnpjError('');
            return;
        }
        if (value.length === 11) {
            if (!validateCPF(value)) {
                setCpfCnpjError(t('auth.error.invalidCpf'));
            } else {
                setCpfCnpjError('');
            }
        } else if (value.length === 14) {
            if (!validateCNPJ(value)) {
                setCpfCnpjError(t('auth.error.invalidCnpj'));
            } else {
                setCpfCnpjError('');
            }
        } else {
            setCpfCnpjError(t('auth.error.invalidCpfCnpj'));
        }
    }, [regForm.cpfCnpj, t]);


    const handleLogin = (e: React.FormEvent) => {
        e.preventDefault();
        if(loginEmail && loginPassword){
            login({ email: loginEmail, name: "Dr. User" });
            navigate('/');
        }
    };

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault();
        if (regForm.senha !== regForm.confirmSenha) {
            setPasswordError(t('auth.error.passwordMismatch'));
            return;
        }
        if (passwordError || cpfCnpjError) {
            alert(passwordError || cpfCnpjError);
            return;
        }

        // --- REAL EMAIL VERIFICATION ---
        const code = Math.floor(100000 + Math.random() * 900000).toString();
        setVerificationCode(code);
        
        try {
            await sendVerificationEmail(regForm.email, regForm.nome, code);
            setIsVerifying(true);
            alert(t('auth.verification.alert'));
        } catch (error) {
            console.error("Failed to send verification email:", error);
            alert(t('auth.verification.sendError'));
        }
    };

    const handleVerifyCode = () => {
        if (userCode === verificationCode) {
            alert(t('auth.verification.success'));
            login({ email: regForm.email, name: regForm.nome });
            navigate('/');
        } else {
            alert(t('auth.verification.error'));
        }
    };
    
    const InputField: React.FC<{label: string, name: string, value: string, onChange: any, type?: string, required?: boolean, onBlur?: () => void, children?: React.ReactNode, error?: string}> = 
    ({ label, name, type = 'text', value, onChange, required=true, onBlur, children, error }) => (
        <div className="form-group text-left">
            <label htmlFor={name} className="block mb-1 text-sm font-medium text-text-primary">{label}</label>
            <div className="relative">
                <input type={type} id={name} name={name} value={value} onChange={onChange} onBlur={onBlur} required={required} className={`w-full px-3 py-2 border-2 rounded-md text-sm focus:outline-none focus:ring-1 ${error ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : 'border-gray-300 focus:border-secondary focus:ring-secondary'}`}/>
                {children}
            </div>
            {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
        </div>
    );
    
    return (
        <div className="min-h-screen bg-gradient-to-br from-primary to-secondary flex items-center justify-center p-4">
            <div className="login-card bg-surface p-6 sm:p-8 rounded-2xl shadow-2xl max-w-md w-full text-center">
                 {isVerifying ? (
                    <div>
                        <h2 className="text-xl font-semibold mb-2">{t('auth.verification.title')}</h2>
                        <p className="text-text-secondary mb-4">{t('auth.verification.prompt', { email: regForm.email })}</p>
                        <input
                            type="text"
                            value={userCode}
                            onChange={(e) => setUserCode(e.target.value)}
                            placeholder={t('auth.verification.placeholder')}
                            maxLength={6}
                            className="w-full text-center tracking-widest text-lg p-2 border-2 rounded-md mb-4"
                        />
                        <button onClick={handleVerifyCode} className="w-full py-3 bg-success text-white rounded-lg font-semibold hover:bg-green-700">{t('auth.verification.button')}</button>
                    </div>
                ) : (
                <>
                    <h1 className="text-primary text-3xl font-light mb-2">Optimetrics</h1>
                    <p className="subtitle text-text-secondary mb-6">{t('auth.subtitle')}</p>
                    
                    <div className="flex justify-center gap-2 mb-6 border-b">
                        <button onClick={() => setIsLogin(true)} className={`px-6 py-2 text-sm font-semibold rounded-t-lg transition-colors ${isLogin ? 'text-secondary border-b-2 border-secondary' : 'text-text-secondary'}`}>{t('auth.login')}</button>
                        <button onClick={() => setIsLogin(false)} className={`px-6 py-2 text-sm font-semibold rounded-t-lg transition-colors ${!isLogin ? 'text-secondary border-b-2 border-secondary' : 'text-text-secondary'}`}>{t('auth.register')}</button>
                    </div>

                    {isLogin ? (
                        <form onSubmit={handleLogin} className="space-y-4">
                            <InputField label={t('auth.form.email')} name="email" type="email" value={loginEmail} onChange={(e) => setLoginEmail(e.target.value)} />
                            <InputField label={t('auth.form.password')} name="password" type={showLoginPassword ? 'text' : 'password'} value={loginPassword} onChange={(e) => setLoginPassword(e.target.value)}>
                                <button type="button" onClick={() => setShowLoginPassword(!showLoginPassword)} className="absolute inset-y-0 right-0 px-3 flex items-center text-gray-500">
                                    <EyeIcon visible={showLoginPassword} />
                                </button>
                            </InputField>
                            <button type="submit" className="w-full py-3 bg-secondary text-white rounded-lg font-semibold hover:bg-blue-600 transition-all transform hover:scale-105">{t('auth.signIn')}</button>
                        </form>
                    ) : (
                        <form onSubmit={handleRegister} className="space-y-3">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                <InputField label={t('auth.form.fullName')} name="nome" value={regForm.nome} onChange={handleRegChange} />
                                <InputField label={t('auth.form.email')} name="email" type="email" value={regForm.email} onChange={handleRegChange} />
                                <InputField label={t('auth.form.rg')} name="rg" value={regForm.rg} onChange={handleRegChange} />
                                <InputField label={t('auth.form.cpfCnpj')} name="cpfCnpj" value={regForm.cpfCnpj} onChange={handleRegChange} onBlur={handleCpfCnpjBlur} error={cpfCnpjError} />
                                <InputField label={t('auth.form.cep')} name="cep" value={regForm.cep} onChange={handleRegChange} onBlur={handleCepBlur} />
                                <InputField label={t('auth.form.number')} name="numero" value={regForm.numero} onChange={handleRegChange} />
                                <InputField label={t('auth.form.address')} name="endereco" value={regForm.endereco} onChange={handleRegChange} />
                                <InputField label={t('auth.form.city')} name="cidade" value={regForm.cidade} onChange={handleRegChange} />
                                <InputField label={t('auth.form.state')} name="estado" value={regForm.estado} onChange={handleRegChange} />
                                <div className="form-group text-left">
                                    <label htmlFor="regPerfil" className="block mb-1 text-sm font-medium text-text-primary">{t('auth.form.profile')}</label>
                                    <select id="regPerfil" name="perfil" value={regForm.perfil} onChange={handleRegChange} required className="w-full px-3 py-2 border-2 border-gray-300 rounded-md text-sm focus:outline-none focus:border-secondary focus:ring-1 focus:ring-secondary">
                                        <option value="">{t('auth.form.select')}</option>
                                        <option value="medico">{t('auth.profiles.doctor')}</option>
                                        <option value="optometrista">{t('auth.profiles.optometrist')}</option>
                                        <option value="otica">{t('auth.profiles.clinic')}</option>
                                    </select>
                                </div>
                                {(regForm.perfil === 'medico' || regForm.perfil === 'optometrista') && (
                                    <InputField label={regForm.perfil === 'medico' ? 'CRM' : 'CRA'} name="crmCra" value={regForm.crmCra} onChange={handleRegChange} />
                                )}
                                <InputField label={t('auth.form.password')} name="senha" type={showRegPassword ? 'text' : 'password'} value={regForm.senha} onChange={handleRegChange}>
                                    <button type="button" onClick={() => setShowRegPassword(!showRegPassword)} className="absolute inset-y-0 right-0 px-3 flex items-center text-gray-500"><EyeIcon visible={showRegPassword} /></button>
                                </InputField>
                                <InputField label={t('auth.form.confirmPassword')} name="confirmSenha" type={showConfirmPassword ? 'text' : 'password'} value={regForm.confirmSenha} onChange={handleRegChange}>
                                    <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="absolute inset-y-0 right-0 px-3 flex items-center text-gray-500"><EyeIcon visible={showConfirmPassword} /></button>
                                </InputField>
                            </div>
                            {passwordError && <p className="text-red-500 text-xs text-left mt-1">{passwordError}</p>}
                            <button type="submit" className="w-full py-3 bg-success text-white rounded-lg font-semibold hover:bg-green-700 transition-all transform hover:scale-105">{t('auth.register')}</button>
                        </form>
                    )}
                </>
                )}
            </div>
        </div>
    );
};

export default AuthPage;