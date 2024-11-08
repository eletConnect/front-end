import React, { useState } from 'react';
import axios from '../../../../configs/axios';
import showToast from '../../../../utills/toasts';
import supabase from '../../../../configs/supabase';

export default function SettingsInstituicao() {
    const escola = JSON.parse(sessionStorage.getItem('escola'));

    const [eNome, setENome] = useState(escola?.nome || '');
    const [eCep, setECEP] = useState(escola?.cep || '');
    const [eEndereco, setEEndereco] = useState(escola?.endereco || '');
    const [eTelefone, setETelefone] = useState(escola?.telefone || '');
    const [eCnpj, setECnpj] = useState(escola?.cnpj || '');
    const [logo, setLogo] = useState(null);
    const [logotipoUrl, setLogotipoUrl] = useState(escola?.logotipo || '');
    const [loading, setLoading] = useState(false);

    const verificarCEP = async (cep) => {
        if (!cep) return;
        try {
            const formattedCep = cep.replace(/\D/g, '');
            const response = await axios.get(`https://brasilapi.com.br/api/cep/v1/${formattedCep}`, { withCredentials: false });
            if (response.status === 200) {
                setEEndereco(response.data.street);
            }
        } catch (error) {
            showToast('danger', 'Erro ao verificar CEP.');
        }
    };

    const validarCNPJ = async (cnpj) => {
        if (!cnpj) return;
        try {
            const response = await axios.get(`https://brasilapi.com.br/api/cnpj/v1/${cnpj}`, { withCredentials: false });
            if (response.status === 200) {
                const cnpjData = response.data;
                setENome(cnpjData.nome_fantasia || cnpjData.razao_social);
                setEEndereco(cnpjData.logradouro);
                const cnpjCep = cnpjData.cep.replace(/\D/g, '');
                setECEP(cnpjCep);
                setETelefone(cnpjData.ddd_telefone_1);
                await verificarCEP(cnpjCep);
            }
        } catch (error) {
            showToast('danger', 'Erro ao validar o CNPJ.');
        }
    };

    const alterarLogotipo = (e) => {
        const file = e.target.files[0];
        if (file) {
            setLogo(file);
            const previewUrl = URL.createObjectURL(file);
            setLogotipoUrl(previewUrl);
        }
    };

    const removerLogotipo = async () => {
        if (!logotipoUrl || logotipoUrl === 'https://via.placeholder.com/150') {
            showToast('info', 'Nenhum logotipo para remover.');
            return;
        }

        try {
            const logotipoPath = logotipoUrl.split('/').pop();
            const { error } = await supabase.storage.from('logotipo').remove([logotipoPath]);
            if (error) {
                showToast('danger', 'Erro ao remover o logotipo.');
                return;
            }

            setLogotipoUrl('https://via.placeholder.com/150');
            sessionStorage.setItem('escola', JSON.stringify({ ...escola, logotipo: null }));
            showToast('success', 'Logotipo removido com sucesso.');
        } catch (error) {
            showToast('danger', 'Erro inesperado ao remover o logotipo.');
        }
    };

    const armazenarLogotipo = async () => {
        if (!logo) return logotipoUrl;

        const pathF = `LOGOTIPO_${Date.now()}`;

        try {
            const { error } = await supabase.storage.from('logotipo').upload(pathF, logo);
            if (error) {
                showToast('danger', error.message);
                return null;
            }

            const { data, error: publicUrlError } = supabase.storage.from('logotipo').getPublicUrl(pathF);
            if (publicUrlError) {
                showToast('danger', publicUrlError.message);
                return null;
            }

            return data.publicUrl;
        } catch (error) {
            showToast('danger', 'Erro ao armazenar a logo.');
            return null;
        }
    };

    const alterarInstituicao = async (e) => {
        e.preventDefault();
        setLoading(true);
        const logotipoUrlAtualizado = await armazenarLogotipo();
        if (!logotipoUrlAtualizado) {
            setLoading(false);
            return;
        }

        try {
            const response = await axios.post('/instituicao/editar', { cnpj: eCnpj, nome: eNome, cep: eCep, endereco: eEndereco, telefone: eTelefone, logotipo: logotipoUrlAtualizado });
            if (response.status === 200) {
                sessionStorage.setItem('escola', JSON.stringify({ ...escola, nome: eNome, cep: eCep, endereco: eEndereco, telefone: eTelefone, logotipo: logotipoUrlAtualizado }));
                sessionStorage.setItem('mensagemSucesso', 'Instituição atualizada com sucesso.');
                window.location.reload();
            }
        } catch (error) {
            showToast('danger', error.response ? error.response.data.mensagem : 'Erro ao atualizar instituição.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <div className="d-flex align-items-center gap-4">
                <div className='text-end'>
                    <div className="d-flex flex-column align-items-center gap-3">
                        <img width={250} src={logotipoUrl || 'https://via.placeholder.com/250'} alt="Logo da instituição" />
                        <input type="file" onChange={alterarLogotipo} />
                    </div>
                    {logotipoUrl && logotipoUrl !== 'https://via.placeholder.com/250' && (
                        <p className='m-0'><a href="#" className="pe-auto text-danger" onClick={removerLogotipo}>Remover logotipo</a></p>
                    )}
                </div>
                <div className='vr'></div>
                <form onSubmit={alterarInstituicao} className="w-100">
                    <div className="row g-3">
                        <div className="col-md-6">
                            <label className="form-label">Inscrição estadual</label>
                            <input type="text" className="form-control" value={escola?.inscricaoEstadual} disabled />
                        </div>
                        <div className="col-md-6">
                            <label className="form-label">CNPJ</label>
                            <input
                                type="text"
                                className="form-control"
                                value={eCnpj}
                                onChange={(e) => setECnpj(e.target.value)}
                                onBlur={() => validarCNPJ(eCnpj)}
                                pattern="\d{14}"
                                maxLength={14}
                                title="Digite um CNPJ válido com 14 dígitos (Remova caracteres especiais)"
                                required
                                disabled
                            />
                            {eCnpj && !/^\d{14}$/.test(eCnpj) && (
                                <div className="text-danger mt-1">
                                    <small>Digite um CNPJ válido com 14 dígitos.</small>
                                </div>
                            )}
                        </div>
                        <div className="col-9">
                            <label className="form-label">Nome da instituição</label>
                            <input type="text" className="form-control" value={eNome} onChange={(e) => setENome(e.target.value)} />
                        </div>
                        <div className="col-3">
                            <label className="form-label">Telefone (+55)</label>
                            <input
                                type="text"
                                className="form-control"
                                value={eTelefone}
                                onChange={(e) => setETelefone(e.target.value)}
                                pattern="^\d{2}\d{4,5}\d{4}$"
                                title="Digite um telefone válido, no formato DDD + Número"
                                required
                            />
                            {eTelefone && !/^\d{2}\d{4,5}\d{4}$/.test(eTelefone) && (
                                <div className="text-danger mt-1">
                                    <small>Digite um telefone válido no formato correto (DDD + Número).</small>
                                </div>
                            )}
                        </div>
                        <div className="col-md-3">
                            <label className="form-label">CEP</label>
                            <input
                                type="text"
                                className="form-control"
                                value={eCep}
                                onChange={(e) => setECEP(e.target.value)}
                                onBlur={() => verificarCEP(eCep)}
                                pattern="^\d{8}$"
                                title="Digite um CEP válido com 8 dígitos"
                                required
                            />
                            {eCep && !/^\d{8}$/.test(eCep) && (
                                <div className="text-danger mt-1">
                                    <small>Digite um CEP válido com 8 dígitos.</small>
                                </div>
                            )}
                        </div>
                        <div className="col-md-9">
                            <label className="form-label">Endereço</label>
                            <input type="text" className="form-control" value={eEndereco} onChange={(e) => setEEndereco(e.target.value)} />
                        </div>
                        <div className="text-end ">
                            <button type='submit' className="btn btn-success" disabled={loading}>
                                {loading ? (<span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>) : (<><i className="bi bi-pencil"></i>&ensp;Editar</>)}
                            </button>
                        </div>
                    </div>
                </form>
            </div>
        </>
    );
}
