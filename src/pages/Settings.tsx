import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { Settings as SettingsIcon, User, Download, Upload, Trash2, Save } from 'lucide-react'
import { useAppStore } from '../store'

export default function Settings() {
  const { user, settings, updateSettings, updateUser, resetData } = useAppStore()
  const [formData, setFormData] = useState({
    name: user?.name || '',
    salary: user?.salary || 0
  })
  const [isSaving, setIsSaving] = useState(false)
  const [saveMessage, setSaveMessage] = useState('')

  const handleInputChange = (field: 'name' | 'salary', value: string | number) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleSaveProfile = async () => {
    if (!formData.name.trim()) {
      setSaveMessage('Nome é obrigatório')
      return
    }

    if (formData.salary < 0) {
      setSaveMessage('Salário não pode ser negativo')
      return
    }

    setIsSaving(true)
    setSaveMessage('')

    try {
      updateUser({
        name: formData.name.trim(),
        salary: Number(formData.salary)
      })
      
      setSaveMessage('Perfil atualizado com sucesso!')
      setTimeout(() => setSaveMessage(''), 3000)
    } catch (error) {
      setSaveMessage('Erro ao salvar perfil')
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <motion.div 
      className="space-y-6"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div>
        <h1 className="text-3xl font-bold text-text-primary">Configurações</h1>
        <p className="text-text-secondary mt-1">
          Personalize sua experiência no Mavit - Cash
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* User Profile */}
        <div className="card p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-primary/20 rounded-lg">
              <User className="w-5 h-5 text-primary" />
            </div>
            <h3 className="text-lg font-semibold text-text-primary">Perfil do Usuário</h3>
          </div>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-text-secondary mb-2">
                Nome
              </label>
              <input
                type="text"
                className="input-field w-full"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                placeholder="Seu nome"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-text-secondary mb-2">
                Salário Mensal
              </label>
              <input
                type="number"
                className="input-field w-full"
                value={formData.salary}
                onChange={(e) => handleInputChange('salary', Number(e.target.value))}
                placeholder="0,00"
                min="0"
                step="0.01"
              />
            </div>
            {saveMessage && (
              <div className={`text-sm p-2 rounded ${
                saveMessage.includes('sucesso') 
                  ? 'bg-green-500/20 text-green-400 border border-green-500/20' 
                  : 'bg-red-500/20 text-red-400 border border-red-500/20'
              }`}>
                {saveMessage}
              </div>
            )}
            <button 
              className="btn-primary w-full flex items-center justify-center gap-2"
              onClick={handleSaveProfile}
              disabled={isSaving}
            >
              <Save className="w-4 h-4" />
              {isSaving ? 'Salvando...' : 'Salvar Alterações'}
            </button>
          </div>
        </div>

        {/* App Settings */}
        <div className="card p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-blue-500/20 rounded-lg">
              <SettingsIcon className="w-5 h-5 text-blue-400" />
            </div>
            <h3 className="text-lg font-semibold text-text-primary">Preferências</h3>
          </div>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-text-secondary mb-2">
                Moeda
              </label>
              <select className="input-field w-full">
                <option value="BRL">Real Brasileiro (BRL)</option>
                <option value="USD">Dólar Americano (USD)</option>
                <option value="EUR">Euro (EUR)</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-text-secondary mb-2">
                Idioma
              </label>
              <select className="input-field w-full">
                <option value="pt-BR">Português (Brasil)</option>
                <option value="en-US">English (US)</option>
                <option value="es-ES">Español</option>
              </select>
            </div>
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium text-text-secondary">
                Notificações
              </label>
              <input
                type="checkbox"
                className="w-4 h-4"
                checked={settings.notifications}
                onChange={(e) => updateSettings({ notifications: e.target.checked })}
              />
            </div>
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium text-text-secondary">
                Backup Automático
              </label>
              <input
                type="checkbox"
                className="w-4 h-4"
                checked={settings.autoBackup}
                onChange={(e) => updateSettings({ autoBackup: e.target.checked })}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Data Management */}
      <div className="card p-6">
        <h3 className="text-lg font-semibold text-text-primary mb-4">
          Gerenciamento de Dados
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button className="btn-secondary flex items-center gap-2">
            <Download className="w-4 h-4" />
            Exportar Dados
          </button>
          <button className="btn-secondary flex items-center gap-2">
            <Upload className="w-4 h-4" />
            Importar Dados
          </button>
          <button 
            className="btn-secondary flex items-center gap-2 text-red-400 hover:bg-red-500/10"
            onClick={() => {
              if (confirm('Tem certeza que deseja apagar todos os dados?')) {
                resetData()
              }
            }}
          >
            <Trash2 className="w-4 h-4" />
            Limpar Dados
          </button>
        </div>
      </div>
    </motion.div>
  )
}