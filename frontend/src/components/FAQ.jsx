import { useState } from 'react';
import { ChevronDown } from 'lucide-react';

const questions = [
  {
    question:
      'O Bradesco cobra alguma taxa para participação em processos seletivos?',
    answer:
      'Desconfie de pedidos de pagamento para inscrição, testes, exames ou treinamento. Confirme qualquer cobrança por canais oficiais e independentes antes de tomar qualquer decisão.',
  },
  {
    question: 'Como confirmar se o e-mail do recrutador é verdadeiro?',
    answer:
      'Verifique cuidadosamente o endereço completo do remetente e o domínio dos links. Um domínio aparentemente legítimo não basta para comprovar a identidade do remetente. Entre no portal oficial digitando o endereço por conta própria e confirme a oportunidade.',
  },
  {
    question:
      'O que fazer ao identificar uma mensagem suspeita de contratação?',
    answer:
      'Não clique em links nem compartilhe senhas ou documentos. Guarde evidências sem interagir com o remetente e encaminhe a ocorrência a um canal oficial de segurança. O formulário desta demonstração não envia denúncias reais.',
  },
];

export default function FAQ() {
  const [openItems, setOpenItems] = useState([]);

  function toggleItem(index) {
    setOpenItems((current) =>
      current.includes(index)
        ? current.filter((item) => item !== index)
        : [...current, index],
    );
  }

  return (
    <section
      id="faq"
      className="mt-12 scroll-mt-28 border-t border-gray-200 pt-8"
    >
      <h2 className="mb-2 text-xl font-bold text-gray-900">
        Dúvidas frequentes
      </h2>

      <p className="mb-6 text-sm text-gray-500">
        Orientações para identificar e evitar possíveis golpes.
      </p>

      <div className="space-y-3">
        {questions.map((item, index) => {
          const isOpen = openItems.includes(index);
          const answerId = `faq-answer-${index}`;

          return (
            <article
              key={item.question}
              className="overflow-hidden rounded-lg border border-gray-200"
            >
              <h3>
                <button
                  type="button"
                  aria-expanded={isOpen}
                  aria-controls={answerId}
                  onClick={() => toggleItem(index)}
                  className="flex w-full items-center justify-between gap-4 bg-gray-50 p-4 text-left text-sm font-semibold text-gray-800 transition hover:bg-gray-100"
                >
                  <span>{item.question}</span>

                  <ChevronDown
                    size={18}
                    className={`shrink-0 text-gray-400 transition-transform ${
                      isOpen ? 'rotate-180' : ''
                    }`}
                  />
                </button>
              </h3>

              {isOpen && (
                <div
                  id={answerId}
                  className="border-t border-gray-100 bg-white p-4 text-xs leading-relaxed text-gray-600"
                >
                  {item.answer}
                </div>
              )}
            </article>
          );
        })}
      </div>
    </section>
  );
}
