import React, { useEffect } from 'react';

const ProtectedRoute = ({ element, allowedRoles }) => {
    let aluno = JSON.parse(sessionStorage.getItem('aluno')) || null;
    let user = JSON.parse(sessionStorage.getItem('user')) || null;

    let cargo = aluno ? 'Aluno' : user?.cargo;

    if (!cargo) {
        aluno = JSON.parse(sessionStorage.getItem('aluno')) || null;
        user = JSON.parse(sessionStorage.getItem('user')) || null;
        cargo = aluno ? 'Aluno' : user?.cargo;
    }

    useEffect(() => {
        if (cargo === 'First' && window.location.pathname !== '/first-access') {
            window.location.replace('/first-access');
        }
    }, [cargo]);

    if (cargo) {
        if (cargo === 'ADMIN') {
            return element;
        }

        if (allowedRoles.includes(cargo)) {
            return element;
        } else {
            const redirectPath = aluno ? '/m/home' : '/home';
            if (window.location.pathname !== redirectPath) {
                window.location.replace(redirectPath);
            }
            return null;
        }
    } else {
        if (window.location.pathname !== '/') {
            window.location.replace('/');
        }
        return null;
    }
};

export default ProtectedRoute;
