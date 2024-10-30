import React, { useState, useEffect } from 'react';
import axios from '../../../configs/axios';
import Header from '../../../components/header';
import showToast from '../../../utills/toasts';

export default function CentralAvisos() {
  const [carregando, setCarregando] = useState(true);
  const [loadingId, setLoadingId] = useState(null); // ID do aviso em exclusão
  const [loadingCriar, setLoadingCriar] = useState(false); // Carregamento do botão "Criar"
  const [loadingEditar, setLoadingEditar] = useState(false); // Carregamento do botão "Editar"
  const [avisos, setAvisos] = useState([]);
  const [avisoSelecionado, setAvisoSelecionado] = useState({});
  const seriesOpcoes = ['1º ano', '2º ano', '3º ano'];
  const user = JSON.parse(sessionStorage.getItem('user'));

  const carregarAvisos = async () => {
    try {
      setCarregando(true);
      const response = await axios.post('/home/exibir-avisos', { instituicao: user.instituicao });
      setAvisos(response.data.filter(aviso => !aviso.deleted_at));
    } catch (error) {
      showToast('danger', error.response?.data?.mensagem || 'Erro ao carregar avisos.');
    } finally {
      setCarregando(false);
    }
  };

  const criarAviso = async () => {
    setLoadingCriar(true);
    try {
      const avisoParaSalvar = formatarAvisoParaSalvar();
      const response = await axios.post('/home/criar-aviso', { avisoParaSalvar, instituicao: user.instituicao });
      setAvisos([...avisos, response.data]);
      showToast('success', 'Aviso criado com sucesso!');
    } catch (error) {
      showToast('danger', error.response?.data?.mensagem || 'Erro ao criar aviso.');
    } finally {
      setLoadingCriar(false);
    }
  };

  const editarAviso = async () => {
    setLoadingEditar(true);
    try {
      const avisoParaSalvar = formatarAvisoParaSalvar();
      const response = await axios.post('/home/editar-aviso', { avisoParaSalvar, instituicao: user.instituicao });
      setAvisos(avisos.map(aviso => aviso.id === avisoSelecionado.id ? response.data : aviso));
      showToast('success', 'Aviso atualizado com sucesso!');
    } catch (error) {
      showToast('danger', error.response?.data?.mensagem || 'Erro ao editar aviso.');
    } finally {
      setLoadingEditar(false);
    }
  };

  const excluirAviso = async (id) => {
    setLoadingId(id);
    try {
      await axios.post('/home/excluir-aviso', { id, instituicao: user.instituicao });
      setAvisos(avisos.filter(aviso => aviso.id !== id));
      showToast('success', 'Aviso excluído com sucesso!');
    } catch (error) {
      showToast('danger', 'Erro ao excluir aviso.');
    } finally {
      setLoadingId(null);
    }
  };

  const formatarAvisoParaSalvar = () => {
    const { titulo, conteudo, exclusivo, exclusividade, series, serie, turma, cor } = avisoSelecionado;
    return {
      ...avisoSelecionado,
      author: user.matricula,
      cor,
      series: exclusivo && exclusividade === 'serie' ? series : [],
      serie: exclusivo && exclusividade === 'turma' ? serie : '',
      turma: exclusivo && exclusividade === 'turma' ? turma : '',
    };
  };

  const abrirModalEditar = (aviso) => {
    setAvisoSelecionado({
      id: aviso.id,
      titulo: aviso.titulo,
      conteudo: aviso.conteudo,
      author: aviso.author,
      exclusivo: !!aviso.turma || (aviso.series && aviso.series.length > 0),
      exclusividade: aviso.turma ? 'turma' : aviso.series?.length > 0 ? 'serie' : '',
      series: aviso.series ? aviso.series.split(', ') : [],
      serie: aviso.serie || '',
      turma: aviso.turma || '',
      cor: aviso.cor || 'primary',
    });
  };

  useEffect(() => {
    carregarAvisos();
  }, []);

  return (
    <>
      <div id="toast-container" className="toast-container position-absolute bottom-0 start-50 translate-middle-x"></div>
      <Header />
      <main id="main-section">
        <section id="section">
          <div className="box">
            <div className="title">
              <span className="d-flex align-items-center gap-2 text-black">
                <i className="bi bi-megaphone fs-3"></i>
                <h3 className="m-0 fs-4">Central de avisos</h3>
              </span>
              {!carregando && (
                <div className="d-flex gap-2">
                  <a className="btn btn-outline-secondary" href="/home">
                    <i className="bi bi-arrow-return-left"></i>&ensp;Voltar
                  </a>
                  <button
                    className="btn btn-outline-secondary"
                    data-bs-toggle="modal"
                    data-bs-target="#criarAvisoModal"
                  >
                    <i className="bi bi-plus-square-dotted"></i>&ensp;Criar
                  </button>
                </div>
              )}
            </div>
            <div className="p-4">
              {carregando ? (
                <div className="d-flex justify-content-center my-5">
                  <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">Carregando...</span>
                  </div>
                </div>
              ) : (
                <div className="m-4">
                  <div className="list-group list-group-flush">
                    {avisos.map(aviso => (
                      <div key={aviso.id} className={`list-group-item list-group-item-action border-left-${aviso.cor}`}>
                        <div className="d-flex justify-content-between align-items-center">
                          <span>
                            <h6 className={`text-${aviso.cor} m-0`}>{aviso.titulo}</h6>
                            <p className='m-0 text-muted'>{aviso.conteudo}</p>
                          </span>
                          <div className="d-flex gap-2 mt-2">
                            <button
                              className="btn btn-sm btn-success"
                              data-bs-toggle="modal"
                              data-bs-target="#editarAvisoModal"
                              onClick={() => abrirModalEditar(aviso)}
                            >
                              <i className="bi bi-pencil-fill"></i>&ensp;Editar
                            </button>
                            <button
                              className="btn btn-sm btn-danger"
                              onClick={() => excluirAviso(aviso.id)}
                              disabled={loadingId === aviso.id}
                            >
                              {loadingId === aviso.id ? (
                                <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                              ) : (
                                <>
                                  <i className="bi bi-trash-fill"></i>&ensp;Excluir
                                </>
                              )}
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </section>
      </main>

      {/* Modais de Criação e Edição */}
      <ModalAviso
        id="criarAvisoModal"
        tituloModal="Criar Aviso"
        avisoSelecionado={avisoSelecionado}
        setAvisoSelecionado={setAvisoSelecionado}
        seriesOpcoes={seriesOpcoes}
        onSave={criarAviso}
        loading={loadingCriar}
      />

      <ModalAviso
        id="editarAvisoModal"
        tituloModal="Editar Aviso"
        avisoSelecionado={avisoSelecionado}
        setAvisoSelecionado={setAvisoSelecionado}
        seriesOpcoes={seriesOpcoes}
        onSave={editarAviso}
        loading={loadingEditar}
      />
    </>
  );
}

function ModalAviso({ id, tituloModal, avisoSelecionado, setAvisoSelecionado, seriesOpcoes, onSave, loading }) {
  return (
    <div className="modal fade" id={id} tabIndex="-1" aria-hidden="true">
      <div className="modal-dialog">
        <div className="modal-content">
          <div className="modal-header">
            <div className="d-flex align-items-center gap-2">
              <span className='d-flex align-items-center gap-2'>
                <i className="bi bi-megaphone fs-3"></i>
                <h3 className='m-0 fs-4'>Avisos</h3>
              </span>
              <i className="bi bi-arrow-right-short fs-4"></i>
              <h4 className='m-0 fs-4'>{tituloModal}</h4>
            </div>
            <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
          </div>
          <div className="modal-body">
            <AvisoForm avisoSelecionado={avisoSelecionado} setAvisoSelecionado={setAvisoSelecionado} seriesOpcoes={seriesOpcoes} />
          </div>
          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" data-bs-dismiss="modal">Fechar</button>
            <button type="button" className="btn btn-primary" onClick={onSave} disabled={loading}>
              {loading ? (
                <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
              ) : (
                <i className="bi bi-check-circle"></i>
              )}
              &ensp;Salvar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function AvisoForm({ avisoSelecionado, setAvisoSelecionado, seriesOpcoes }) {
  const { titulo, conteudo, exclusivo, exclusividade, series, serie, turma, cor } = avisoSelecionado;

  const handleExclusividadeChange = (e) => {
    const isExclusivo = e.target.checked;
    setAvisoSelecionado({
      ...avisoSelecionado,
      exclusivo: isExclusivo,
      exclusividade: '',
      series: [],
      serie: '',
      turma: '',
    });
  };

  const handleCorChange = (corSelecionada) => {
    setAvisoSelecionado({ ...avisoSelecionado, cor: corSelecionada });
  };

  const handleSerieChange = (serie) => {
    const seriesAtualizadas = series.includes(serie) ? series.filter(s => s !== serie) : [...series, serie];
    setAvisoSelecionado({ ...avisoSelecionado, series: seriesAtualizadas });
  };

  return (
    <>
      <div className="form-group mb-3">
        <label>Título</label>
        <input type="text" className="form-control" value={titulo || ''} onChange={(e) => setAvisoSelecionado({ ...avisoSelecionado, titulo: e.target.value })} />
      </div>
      <div className="form-group mb-3">
        <label>Conteúdo</label>
        <textarea className="form-control" rows="3" value={conteudo || ''} onChange={(e) => setAvisoSelecionado({ ...avisoSelecionado, conteudo: e.target.value })}></textarea>
      </div>
      <div className="form-group mb-3">
        <label>Selecione a cor do card</label>
        <div className="d-flex flex-wrap gap-2">
          {['primary', 'info', 'secondary', 'success', 'warning', 'danger'].map((value, idx) => (
            <div key={idx}>
              <input type="radio" className="btn-check" name="cor" id={`btn-check-${value}`} autoComplete="off" checked={cor === value} onChange={() => handleCorChange(value)} />
              <label className={`btn btn-outline-${value}`} htmlFor={`btn-check-${value}`}>{value.charAt(0).toUpperCase() + value.slice(1)}</label>
            </div>
          ))}
        </div>
      </div>
      <div className="form-check form-switch mb-4">
        <input className="form-check-input" type="checkbox" id="exclusivoSwitch" checked={exclusivo || false} onChange={handleExclusividadeChange} />
        <label className="form-check-label" htmlFor="exclusivoSwitch">Este aviso é exclusivo?</label>
      </div>
      {exclusivo && exclusividade === 'serie' && (
        <div className="form-group mb-3">
          <label>Selecione as séries</label>
          {seriesOpcoes.map(serieOp => (
            <div className="form-check" key={serieOp}>
              <input className="form-check-input" type="checkbox" id={`serie-${serieOp}`} checked={series.includes(serieOp)} onChange={() => handleSerieChange(serieOp)} />
              <label className="form-check-label" htmlFor={`serie-${serieOp}`}>{serieOp}</label>
            </div>
          ))}
        </div>
      )}
    </>
  );
}
