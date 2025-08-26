

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../App';
import * as dataService from '../services/dataService';
import type { SignInLog } from '../types';

const AdminPage: React.FC = () => {
    const { logout } = useAuth();
    const navigate = useNavigate();
    const [loginLogs, setLoginLogs] = useState<SignInLog[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let isMounted = true;
        dataService.getSignInLogs()
            .then(logs => {
                if (isMounted) {
                    setLoginLogs(logs);
                }
            })
            .catch(error => console.error("Failed to fetch login logs:", error))
            .finally(() => {
                if (isMounted) {
                    setLoading(false);
                }
            });
        
        return () => { isMounted = false; };
    }, []);

    const handleLogout = () => {
        logout();
        navigate('/auth');
    };

    return (
        <div className="min-h-screen bg-background text-text-primary">
            <header className="bg-surface shadow-md p-4 flex justify-between items-center sticky top-0 z-10">
                <h1 className="text-xl font-bold text-primary">Painel do Administrador</h1>
                <button 
                    onClick={handleLogout} 
                    className="bg-accent text-white px-4 py-2 rounded-full text-sm font-semibold hover:bg-red-700 transition-colors"
                >
                    Sair
                </button>
            </header>
            
            <main className="p-4 sm:p-8">
                <div className="max-w-7xl mx-auto">
                    <h2 className="text-2xl font-bold text-primary mb-6">Histórico de Login de Usuários</h2>
                    
                    <div className="bg-surface rounded-lg shadow-lg overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">
                                            Email do Usuário
                                        </th>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">
                                            Localização (do Cadastro)
                                        </th>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">
                                            Data e Hora do Login
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {loading ? (
                                        <tr>
                                            <td colSpan={3} className="px-6 py-12 text-center text-sm text-text-secondary">
                                                Carregando registros...
                                            </td>
                                        </tr>
                                    ) : loginLogs.length > 0 ? (
                                        loginLogs.map((log, index) => (
                                            <tr key={index} className="hover:bg-gray-50">
                                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                                    {log.email}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-text-secondary">
                                                    {log.location}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-text-secondary">
                                                    {new Date(log.timestamp).toLocaleString('pt-BR')}
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan={3} className="px-6 py-12 text-center text-sm text-text-secondary">
                                                Nenhum registro de login encontrado.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default AdminPage;