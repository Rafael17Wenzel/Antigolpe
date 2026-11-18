-- Sprint 11 (pedido do usuário, D056): o token passa a ser guardado em TEXTO PURO para que o RH
-- possa consultá-lo sempre na área administrativa. O HMAC deixa de existir.
-- Os tokens existentes só tinham o hash (valor original irrecuperável), então são removidos;
-- as validações antigas perdem a referência (FK com ON DELETE SET NULL). Os tokens de
-- demonstração são recriados pelo DemoSeeder quando DEMO_SEED=true.
DELETE FROM token;

ALTER TABLE token DROP CONSTRAINT uk_token_hash;
ALTER TABLE token DROP COLUMN hash;
ALTER TABLE token ADD COLUMN codigo VARCHAR(40) NOT NULL;
ALTER TABLE token ADD CONSTRAINT uk_token_codigo UNIQUE (codigo);
