
import React from 'react';

// No Antigravity, a edição de perfil geralmente acontece em uma página dedicada (/accounts/profile/).
// Este modal pode ser removido ou transformado em um link de redirecionamento.

const ProfileModal = ({ isOpen, onClose }: any) => {
  if (!isOpen) return null;
  
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-sm">
      <div className="bg-white p-8 rounded-xl shadow-xl text-center max-w-sm">
        <h2 className="text-xl font-bold mb-4">Gerenciar Perfil</h2>
        <p className="text-gray-600 mb-6">
            Para alterar seus dados ou senha, acesse a área de configurações da sua conta.
        </p>
        <div className="flex gap-3 justify-center">
            <button onClick={onClose} className="px-4 py-2 text-gray-500 hover:bg-gray-100 rounded">Fechar</button>
            <a href="/accounts/profile/" className="px-4 py-2 bg-emerald-600 text-white rounded hover:bg-emerald-700">
                Ir para Configurações
            </a>
        </div>
      </div>
    </div>
  );
};

export default ProfileModal;
