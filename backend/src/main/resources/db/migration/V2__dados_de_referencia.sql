-- Dados de referência (todos os ambientes): unidades federativas, categorias,
-- cursos e a trilha de segurança. Os cursos têm nomes do catálogo público da
-- Escola Virtual da Fundação Bradesco; as descrições são resumos do protótipo
-- e não há carga horária (consultar o catálogo).

INSERT INTO regiao (uf, nome) VALUES
 ('AC','Acre'),('AL','Alagoas'),('AP','Amapá'),('AM','Amazonas'),('BA','Bahia'),
 ('CE','Ceará'),('DF','Distrito Federal'),('ES','Espírito Santo'),('GO','Goiás'),
 ('MA','Maranhão'),('MT','Mato Grosso'),('MS','Mato Grosso do Sul'),('MG','Minas Gerais'),
 ('PA','Pará'),('PB','Paraíba'),('PR','Paraná'),('PE','Pernambuco'),('PI','Piauí'),
 ('RJ','Rio de Janeiro'),('RN','Rio Grande do Norte'),('RS','Rio Grande do Sul'),
 ('RO','Rondônia'),('RR','Roraima'),('SC','Santa Catarina'),('SP','São Paulo'),
 ('SE','Sergipe'),('TO','Tocantins');

INSERT INTO categoria (nome) VALUES
 ('Tecnologia da Informação'),
 ('Programação'),
 ('Negócios e Inovação'),
 ('Desenvolvimento Pessoal e Profissional');

INSERT INTO curso (slug, titulo, descricao, categoria_id) VALUES
 ('seguranca-ti', 'Segurança em Tecnologia da Informação',
  'Conceitos de proteção da informação, ameaças digitais e boas práticas de segurança.',
  (SELECT id FROM categoria WHERE nome = 'Tecnologia da Informação')),
 ('lgpd', 'Lei Geral de Proteção de Dados (LGPD)',
  'Princípios da LGPD e cuidados no tratamento de dados pessoais.',
  (SELECT id FROM categoria WHERE nome = 'Negócios e Inovação')),
 ('letramento-digital', 'Letramento Digital',
  'Uso seguro e consciente de ferramentas e serviços digitais no dia a dia.',
  (SELECT id FROM categoria WHERE nome = 'Tecnologia da Informação')),
 ('redes', 'Introdução a Redes de Computadores',
  'Fundamentos de redes, protocolos e comunicação entre sistemas.',
  (SELECT id FROM categoria WHERE nome = 'Tecnologia da Informação')),
 ('atendimento-publico', 'Atendimento ao público',
  'Técnicas para um atendimento cordial, claro e eficiente.',
  (SELECT id FROM categoria WHERE nome = 'Desenvolvimento Pessoal e Profissional')),
 ('educacao-financeira', 'Educação financeira',
  'Organização do orçamento e decisões financeiras conscientes.',
  (SELECT id FROM categoria WHERE nome = 'Desenvolvimento Pessoal e Profissional')),
 ('postura-imagem', 'Postura e imagem profissional',
  'Comportamento, comunicação e imagem no ambiente de trabalho.',
  (SELECT id FROM categoria WHERE nome = 'Desenvolvimento Pessoal e Profissional')),
 ('logica-programacao', 'Fundamentos de Lógica de Programação',
  'Raciocínio lógico e algoritmos, a base para aprender a programar.',
  (SELECT id FROM categoria WHERE nome = 'Programação')),
 ('java-basico', 'Linguagem de Programação Java – Básico',
  'Primeiros passos em Java: sintaxe, variáveis e estruturas de controle.',
  (SELECT id FROM categoria WHERE nome = 'Programação')),
 ('etica-sistemas', 'Ética no Desenvolvimento de Sistemas',
  'Responsabilidade e ética na criação de sistemas e no uso de dados.',
  (SELECT id FROM categoria WHERE nome = 'Programação')),
 ('comunicacao-empresarial', 'Comunicação Empresarial',
  'Comunicação clara e eficaz no contexto corporativo.',
  (SELECT id FROM categoria WHERE nome = 'Desenvolvimento Pessoal e Profissional')),
 ('qualidade-vida', 'Qualidade de vida e trabalho',
  'Bem-estar, equilíbrio e saúde no ambiente de trabalho.',
  (SELECT id FROM categoria WHERE nome = 'Desenvolvimento Pessoal e Profissional'));

INSERT INTO trilha (slug, nome) VALUES ('seguranca', 'Trilha de segurança digital');

INSERT INTO trilha_curso (trilha_id, curso_id, ordem) VALUES
 ((SELECT id FROM trilha WHERE slug = 'seguranca'), (SELECT id FROM curso WHERE slug = 'seguranca-ti'), 1),
 ((SELECT id FROM trilha WHERE slug = 'seguranca'), (SELECT id FROM curso WHERE slug = 'lgpd'), 2),
 ((SELECT id FROM trilha WHERE slug = 'seguranca'), (SELECT id FROM curso WHERE slug = 'letramento-digital'), 3);
