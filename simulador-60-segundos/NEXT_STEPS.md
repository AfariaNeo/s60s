# Próximos Passos - Simulador 60 Segundos

## Status Atual (30/01/2026)
- **Git/GitHub:** Configurado e sincronizado (`main`).
- **Netlify:** Conectado e Deploy automático ativo.
- **Bug Fixes:** 
    - Tela branca resolvida (Variáveis de ambiente Supabase configuradas).
    - Build corrigido (Tailwind CSS v3 instalado e configurado).

## Pendências para a próxima sessão:
1. **Configurar API do Gemini:**
   - A chave `GEMINI_API_KEY` ainda não foi adicionada no Netlify. O simulador pode falhar se tentar gerar dicas de IA.
   - Precisa ser adicionada em: *Netlify Site Settings > Environment variables*.

2. **Testes em Produção:**
   - Verificar se o login/cadastro está gravando novos usuários no Supabase corretamente.
   - Testar a gravação de simulações.

3. **Melhorias de UI/UX:**
   - Revisar se os estilos (Tailwind) estão 100% fieis no deploy.

## Como retomar
Basta abrir este arquivo e pedir para "Continuar os itens do NEXT_STEPS.md".
