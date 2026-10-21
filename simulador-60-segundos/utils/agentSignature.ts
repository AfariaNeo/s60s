import { UserProfile } from '../types';

// Monta as linhas de identificação do corretor para as mensagens de WhatsApp.
// O CRECI aparece sempre que o número estiver preenchido; a UF é opcional.
export function agentShareLines(
    profile?: Pick<UserProfile, 'name' | 'creciNumber' | 'creciState'> | null
): string {
    const name = profile?.name?.trim() || 'Corretor';
    const number = profile?.creciNumber?.trim();
    const uf = profile?.creciState?.trim();
    const creci = number ? `\n🧾 *CRECI:* ${number}${uf ? ` / ${uf}` : ''}` : '';
    return `👤 *Corretor:* ${name}${creci}\n`;
}
