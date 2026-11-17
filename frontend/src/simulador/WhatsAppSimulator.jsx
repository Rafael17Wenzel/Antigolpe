import { useCallback, useEffect, useRef, useState } from "react";
import {
  ArrowLeft,
  ImagePlus,
  Info,
  LoaderCircle,
  SendHorizontal,
  ShieldCheck,
  Trash2,
} from "lucide-react";

import ReportForm from "../components/ReportForm";
import { validarVaga } from "../api";
import ImageTokenReview from "./ImageTokenReview";
import extrairToken from "./extrairToken";
import { lerTextoDaImagem } from "./ocr";
import { TIPOS_ACEITOS, verificarImagem } from "./verificarImagem";

let proximoId = 1;
const novoId = () => proximoId++;

const BOAS_VINDAS = {
  id: 0,
  autor: "assistente",
  tipo: "texto",
  texto:
    "Olá! Encaminhe ou cole aqui a mensagem da vaga, ou anexe um print. Vou procurar o token e, depois da sua confirmação, consultar o cadastro do protótipo.",
};

function hora() {
  return new Date().toLocaleTimeString("pt-BR", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

/**
 * SIMULAÇÃO visual de um chat de mensagens. Não há integração com o WhatsApp
 * nem com outros serviços: texto e imagem ficam no navegador, e a consulta usa
 * a mesma API de validação do site.
 */
export default function WhatsAppSimulator({ onToast }) {
  const [mensagens, setMensagens] = useState([
    { ...BOAS_VINDAS, hora: hora() },
  ]);
  const [texto, setTexto] = useState("");
  const [anexo, setAnexo] = useState(null);
  const [erroEntrada, setErroEntrada] = useState(null);
  const [processando, setProcessando] = useState(false);
  const [denuncia, setDenuncia] = useState(null);

  const tituloRef = useRef(null);
  const arquivoRef = useRef(null);
  const fimRef = useRef(null);
  const urlsRef = useRef([]);

  useEffect(() => {
    tituloRef.current?.focus();
    const urls = urlsRef.current;
    return () => urls.forEach((u) => URL.revokeObjectURL(u));
  }, []);

  useEffect(() => {
    fimRef.current?.scrollIntoView({ block: "nearest" });
  }, [mensagens]);

  const adicionar = useCallback((msg) => {
    const id = novoId();
    setMensagens((atual) => [...atual, { id, hora: hora(), ...msg }]);
    return id;
  }, []);

  const atualizar = useCallback((id, mudancas) => {
    setMensagens((atual) =>
      atual.map((m) => (m.id === id ? { ...m, ...mudancas } : m)),
    );
  }, []);

  async function escolherArquivo(event) {
    const arquivo = event.target.files?.[0];
    event.target.value = "";
    if (!arquivo) return;
    const verificacao = await verificarImagem(arquivo);
    if (!verificacao.ok) {
      setErroEntrada(verificacao.mensagem);
      return;
    }
    setErroEntrada(null);
    const url = URL.createObjectURL(arquivo);
    urlsRef.current.push(url);
    setAnexo({ arquivo, url, nome: arquivo.name });
  }

  async function enviar(event) {
    event.preventDefault();
    const conteudo = texto.trim();
    if (!conteudo && !anexo) {
      setErroEntrada("Cole ou digite uma mensagem, ou anexe uma imagem.");
      return;
    }
    setErroEntrada(null);
    setTexto("");
    const imagem = anexo;
    setAnexo(null);
    setProcessando(true);

    if (conteudo)
      adicionar({ autor: "usuario", tipo: "texto", texto: conteudo });
    if (imagem)
      adicionar({
        autor: "usuario",
        tipo: "imagem",
        url: imagem.url,
        nome: imagem.nome,
      });

    let candidato = extrairToken(conteudo);
    let origem = "texto";

    if (!candidato && imagem) {
      const aviso = adicionar({
        autor: "assistente",
        tipo: "texto",
        texto: "Lendo a imagem (experimental)…",
      });
      try {
        const lido = await lerTextoDaImagem(imagem.arquivo, (p) =>
          atualizar(aviso, { texto: `Lendo a imagem (experimental)… ${p}%` }),
        );
        candidato = extrairToken(lido);
        origem = "imagem";
        atualizar(aviso, { texto: "Leitura da imagem concluída." });
      } catch {
        atualizar(aviso, {
          texto:
            "Não consegui ler a imagem. Você pode digitar o token manualmente abaixo.",
        });
      }
    }

    adicionar({
      autor: "assistente",
      tipo: "revisao",
      candidato,
      origem,
      encerrada: false,
    });
    setProcessando(false);
  }

  async function consultar(idRevisao, token) {
    try {
      const r = await validarVaga(token);
      atualizar(idRevisao, { encerrada: true });
      adicionar({
        autor: "assistente",
        tipo: "resultado",
        resultado: r,
        consultado: token,
      });
      if (r.status !== "CONFIRMADO")
        onToast?.({ message: "Oferta não confirmada.", type: "warning" });
    } catch (erro) {
      atualizar(idRevisao, { encerrada: true });
      adicionar({
        autor: "assistente",
        tipo: "texto",
        texto:
          erro.status === 400 || erro.status === 429
            ? erro.message
            : "Não foi possível consultar agora. Isso não indica golpe nem confirma a vaga; tente novamente.",
      });
    }
  }

  function cancelar(idRevisao) {
    atualizar(idRevisao, { encerrada: true });
    adicionar({
      autor: "assistente",
      tipo: "texto",
      texto: "Tudo bem, nada foi consultado.",
    });
  }

  return (
    <section
      aria-labelledby="simulador-titulo"
      className="contorno-ac rounded-xl bg-superficie p-5 shadow-xl sm:p-8"
    >
      <a
        href="#validador"
        className="mb-4 inline-flex min-h-[32px] items-center gap-1.5 text-sm font-semibold text-primaria hover:underline"
      >
        <ArrowLeft size={16} aria-hidden="true" />
        Voltar ao validador
      </a>

      <h2
        id="simulador-titulo"
        ref={tituloRef}
        tabIndex={-1}
        className="text-xl font-bold text-texto outline-none"
      >
        Simulador de chat
      </h2>
      <p className="mt-1 flex items-start gap-2 rounded-lg border border-alerta-borda bg-alerta-fundo p-3 text-sm text-alerta-texto">
        <Info size={16} aria-hidden="true" className="mt-0.5 shrink-0" />
        <span>
          <strong>Simulação visual — não é o WhatsApp.</strong> Nada é enviado a
          aplicativos de mensagem. A leitura de imagens é experimental, feita no
          seu navegador, e o print não é salvo.
        </span>
      </p>

      <div className="mx-auto mt-5 max-w-2xl overflow-hidden rounded-2xl border border-borda-forte">
        <div className="flex items-center gap-3 bg-chat-topo px-4 py-3 text-chat-sobre-topo">
          <span className="flex h-9 w-9 items-center justify-center rounded-full border border-chat-sobre-topo/60">
            <ShieldCheck size={18} aria-hidden="true" />
          </span>
          <div>
            <p className="text-sm font-bold">Assistente Antigolpe (simulado)</p>
            <p className="text-xs opacity-90">Protótipo acadêmico</p>
          </div>
        </div>

        <div
          role="log"
          aria-live="polite"
          aria-label="Conversa"
          tabIndex={0}
          className="max-h-[60vh] min-h-[280px] overflow-y-auto bg-chat-fundo p-4"
        >
          <ol className="space-y-3">
            {mensagens.map((m) => (
              <li
                key={m.id}
                className={`flex ${m.autor === "usuario" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`contorno-ac max-w-[85%] rounded-xl px-3 py-2 text-sm text-texto shadow-sm ${
                    m.autor === "usuario"
                      ? "bg-chat-enviada"
                      : "bg-chat-recebida"
                  }`}
                >
                  <span className="sr-only">
                    {m.autor === "usuario" ? "Você:" : "Assistente:"}{" "}
                  </span>
                  {m.tipo === "texto" && (
                    <p className="whitespace-pre-wrap break-words">{m.texto}</p>
                  )}

                  {m.tipo === "imagem" && (
                    <img
                      src={m.url}
                      alt={`Imagem anexada por você: ${m.nome}`}
                      className="max-h-60 rounded-lg"
                    />
                  )}

                  {m.tipo === "revisao" && (
                    <ImageTokenReview
                      id={m.id}
                      candidato={m.candidato}
                      origem={m.origem}
                      encerrada={m.encerrada}
                      onConsultar={(token) => consultar(m.id, token)}
                      onCancelar={() => cancelar(m.id)}
                    />
                  )}

                  {m.tipo === "resultado" && (
                    <Resultado
                      r={m.resultado}
                      onDenunciar={() =>
                        setDenuncia({
                          chave: m.id,
                          url: m.consultado,
                          idValidacao: m.resultado.idValidacao,
                        })
                      }
                    />
                  )}

                  <p className="mt-1 text-right text-[11px] text-texto-suave">
                    {m.hora}
                  </p>
                </div>
              </li>
            ))}
          </ol>
          <div ref={fimRef} aria-hidden="true" />
        </div>

        <form
          onSubmit={enviar}
          noValidate
          className="space-y-2 border-t border-borda-forte bg-superficie p-3"
        >
          {anexo && (
            <div className="flex items-center gap-3 rounded-lg border border-borda-forte p-2">
              <img
                src={anexo.url}
                alt={`Prévia do anexo: ${anexo.nome}`}
                className="h-16 w-16 rounded object-cover"
              />
              <p className="flex-1 truncate text-xs text-texto">{anexo.nome}</p>
              <button
                type="button"
                onClick={() => setAnexo(null)}
                className="inline-flex min-h-alvo items-center gap-1 rounded-lg px-3 text-sm font-semibold text-perigo-texto hover:bg-superficie-2"
              >
                <Trash2 size={16} aria-hidden="true" />
                Remover imagem
              </button>
            </div>
          )}

          <label htmlFor="mensagem-chat" className="sr-only">
            Mensagem para o assistente
          </label>
          <textarea
            id="mensagem-chat"
            value={texto}
            onChange={(event) => setTexto(event.target.value)}
            rows={2}
            maxLength={4000}
            disabled={processando}
            placeholder="Cole aqui a mensagem que você recebeu…"
            aria-invalid={Boolean(erroEntrada)}
            aria-describedby={erroEntrada ? "chat-erro" : undefined}
            className="w-full resize-y rounded-lg border border-borda-forte bg-superficie px-3 py-2 text-sm text-texto placeholder:text-texto-suave"
          />

          {erroEntrada && (
            <p
              id="chat-erro"
              role="alert"
              className="text-xs font-semibold text-perigo-texto"
            >
              {erroEntrada}
            </p>
          )}

          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <input
                ref={arquivoRef}
                id="anexo-chat"
                type="file"
                accept={TIPOS_ACEITOS}
                onChange={escolherArquivo}
                className="sr-only"
                aria-describedby="anexo-dica"
              />
              <label
                htmlFor="anexo-chat"
                className="inline-flex min-h-alvo cursor-pointer items-center gap-2 rounded-lg border border-borda-forte px-3 text-sm font-semibold text-texto hover:bg-superficie-2"
              >
                <ImagePlus size={16} aria-hidden="true" />
                Anexar print
              </label>
              <span id="anexo-dica" className="ml-2 text-xs text-texto-suave">
                PNG, JPEG ou WebP, até 5 MB (opcional)
              </span>
            </div>
            <button
              type="submit"
              disabled={processando}
              className="inline-flex min-h-alvo items-center gap-2 rounded-lg bg-chat-topo px-4 text-sm font-bold text-chat-sobre-topo hover:opacity-90 disabled:opacity-60"
            >
              {processando ? (
                <LoaderCircle
                  size={16}
                  aria-hidden="true"
                  className="animate-spin"
                />
              ) : (
                <SendHorizontal size={16} aria-hidden="true" />
              )}
              {processando ? "Processando…" : "Enviar"}
            </button>
          </div>
        </form>
      </div>

      {denuncia && (
        <div className="mx-auto mt-6 max-w-2xl">
          <ReportForm
            key={denuncia.chave}
            urlInicial={denuncia.url}
            idValidacao={denuncia.idValidacao}
            onToast={onToast}
          />
        </div>
      )}
    </section>
  );
}

function Resultado({ r, onDenunciar }) {
  if (r.status === "CONFIRMADO") {
    const local =
      [r.vaga?.cidade, r.vaga?.uf].filter(Boolean).join(" / ") || "Remota";
    return (
      <div className="space-y-1">
        <p className="font-bold text-sucesso-texto">
          Token encontrado no cadastro
        </p>
        <p>
          <strong>Cargo:</strong> {r.vaga?.cargo}
          <br />
          <strong>Região:</strong> {local}
        </p>
        <p>{r.mensagem}</p>
      </div>
    );
  }
  return (
    <div className="space-y-2">
      <p className="font-bold text-alerta-texto">Oferta não confirmada</p>
      <p>{r.mensagem}</p>
      <ul className="list-disc pl-4 text-xs">
        <li>Não clique em links nem envie documentos ou dados bancários.</li>
        <li>
          Procure a vaga no site oficial, digitando o endereço você mesmo.
        </li>
      </ul>
      <button
        type="button"
        onClick={onDenunciar}
        className="inline-flex min-h-[32px] items-center text-sm font-bold text-primaria hover:underline"
      >
        Quero denunciar (opcional)
      </button>
    </div>
  );
}
