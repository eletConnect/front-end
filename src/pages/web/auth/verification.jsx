import React, { useState, useEffect, useCallback } from 'react';
import axios from '../../../configs/axios';
import { useNavigate } from 'react-router-dom';
import 'bootstrap';
axios.defaults.withCredentials = true;

export default function Verification() {
    const [isLoading, setIsLoading] = useState(true);
    const [mensagem, setMensagem] = useState('Verificando...');
    const [subMensagem, setSubMensagem] = useState('');
    const navigate = useNavigate();

    const handleError = useCallback((error, subMsg) => {
        let errorMessage = 'Erro inesperado. Tente novamente.';
        if (error.response) {
            errorMessage = error.response.data?.mensagem || error.response.statusText;
        } else if (error.request) {
            errorMessage = 'Não foi possível se comunicar com o servidor. Verifique sua conexão.';
        } else {
            errorMessage = error.message;
        }
        console.error('Erro ocorrido:', errorMessage);
        setMensagem(errorMessage);
        setSubMensagem(subMsg || 'Redirecionando...');
        sessionStorage.clear();
        setTimeout(() => navigate('/login'), 2000);
    }, [navigate]);

    const verifyInstitution = useCallback(async (userId) => {
        // Verifica se a instituição já está no sessionStorage antes de fazer a requisição
        const storedInstitution = sessionStorage.getItem('escola');
        if (!storedInstitution) {
            try {
                console.log('Verificando instituição para o usuário com ID:', userId);
                const responseInstitution = await axios.post('/instituicao/verificar', { id: userId });
                const institutionData = responseInstitution.data.userData;
                sessionStorage.setItem('escola', JSON.stringify(responseInstitution.data));
                navigateUser(!!institutionData?.instituicao);
            } catch (error) {
                console.error('Erro ao verificar instituição:', error);
                handleError(error, 'Redirecionando...');
            }
        } else {
            // Navega diretamente se a instituição já está definida
            const institutionData = JSON.parse(storedInstitution).userData;
            navigateUser(!!institutionData?.instituicao);
        }
    }, [handleError]);

    const verifySession = useCallback(async () => {
        console.log('Início da verificação de sessão via API.');

        try {
            // Verifica se o usuário já está armazenado no sessionStorage
            const storedUser = sessionStorage.getItem('user');
            if (!storedUser) {
                const responseSession = await axios.get('/auth/check-session');
                const user = responseSession.data;
                console.log('Sessão verificada:', user);

                if (user.status === 'Inativo') {
                    handleError(new Error('Usuário inativo'), 'Redirecionando para login...');
                    return;
                }

                sessionStorage.setItem('user', JSON.stringify(user));
                await verifyInstitution(user.id);
            } else {
                // Se o usuário já está no sessionStorage, verifica a instituição sem chamar a API novamente
                const user = JSON.parse(storedUser);
                await verifyInstitution(user.id);
            }
        } catch (error) {
            console.error('Erro ao verificar a sessão:', error);
            handleError(error, 'Redirecionando para login...');
        }
    }, [handleError, verifyInstitution]);

    useEffect(() => {
        verifySession();
    }, [verifySession]);

    const navigateUser = (hasInstitution) => {
        setIsLoading(false);
        if (hasInstitution) {
            console.log('Redirecionando para /home');
            navigate('/home');
        } else {
            console.log('Redirecionando para /first-access');
            navigate('/first-access');
        }
    };

    if (isLoading) {
        return (
            <div className='position-absolute top-50 start-50 translate-middle'>
                <div className="d-flex align-items-center gap-4">
                    <strong role="status"><p id='sub-mensagem' className='m-0'>{subMensagem}</p></strong>
                    <div className="spinner-border" aria-hidden="true"></div>
                </div>
                <div>
                    <p id='mensagem' className='m-0'>{mensagem}</p>
                </div>
            </div>
        );
    }

    return null;
}
