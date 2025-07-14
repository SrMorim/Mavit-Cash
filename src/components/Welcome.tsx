import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { DollarSign, User, ArrowRight, Sparkles } from 'lucide-react'
import { useAppStore } from '../store'
import { formatCurrency } from '../utils/dateUtils'

export default function Welcome() {
  const { setUser } = useAppStore()
  const [step, setStep] = useState(1)
  const [formData, setFormData] = useState({
    name: '',
    salary: ''
  })
  const [errors, setErrors] = useState<{name?: string; salary?: string}>({})

  const validateForm = () => {
    const newErrors: {name?: string; salary?: string} = {}
    
    if (!formData.name.trim()) {
      newErrors.name = 'Nome é obrigatório'
    }
    
    if (!formData.salary || parseFloat(formData.salary) <= 0) {
      newErrors.salary = 'Salário deve ser maior que zero'
    }
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleNext = () => {
    if (step === 1) {
      if (!formData.name.trim()) {
        setErrors({ name: 'Nome é obrigatório' })
        return
      }
      setErrors({})
      setStep(2)
    } else if (step === 2) {
      if (validateForm()) {
        handleSubmit()
      }
    }
  }

  const handleSubmit = () => {
    try {
      const newUser = {
        id: crypto.randomUUID(),
        name: formData.name.trim(),
        salary: parseFloat(formData.salary),
        createdAt: new Date(),
        updatedAt: new Date()
      }
      
      setUser(newUser)
    } catch (error) {
      console.error('Error creating user:', error)
      setErrors({ salary: 'Erro ao criar usuário. Tente novamente.' })
    }
  }

  const containerVariants = {
    hidden: { opacity: 0, scale: 0.9 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: {
        duration: 0.5,
        staggerChildren: 0.1
      }
    }
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-6">
      <motion.div
        className="w-full max-w-md"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <motion.div className="text-center mb-8" variants={itemVariants}>
          <div className="flex items-center justify-center mb-6">
            <div className="relative">
              <div className="w-16 h-16 bg-primary rounded-2xl flex items-center justify-center">
                <DollarSign className="w-8 h-8 text-white" />
              </div>
              <motion.div
                className="absolute -top-2 -right-2"
                animate={{ rotate: 360 }}
                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
              >
                <Sparkles className="w-6 h-6 text-primary" />
              </motion.div>
            </div>
          </div>
          <h1 className="text-4xl font-bold gradient-text mb-2">
            Mavit - Cash
          </h1>
          <p className="text-text-secondary">
            Seu gerenciador financeiro pessoal
          </p>
        </motion.div>

        <motion.div className="card p-8" variants={itemVariants}>
          {step === 1 && (
            <motion.div
              key="step1"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.3 }}
            >
              <div className="text-center mb-6">
                <div className="w-12 h-12 bg-blue-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <User className="w-6 h-6 text-blue-400" />
                </div>
                <h2 className="text-2xl font-semibold text-text-primary mb-2">
                  Bem-vindo!
                </h2>
                <p className="text-text-secondary">
                  Vamos começar configurando seu perfil
                </p>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-text-secondary mb-2">
                    Como você gostaria de ser chamado?
                  </label>
                  <input
                    type="text"
                    placeholder="Digite seu nome"
                    className={`input-field w-full ${errors.name ? 'border-red-500' : ''}`}
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    onKeyPress={(e) => e.key === 'Enter' && handleNext()}
                  />
                  {errors.name && (
                    <p className="text-red-400 text-sm mt-1">{errors.name}</p>
                  )}
                </div>
              </div>
            </motion.div>
          )}

          {step === 2 && (
            <motion.div
              key="step2"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.3 }}
            >
              <div className="text-center mb-6">
                <div className="w-12 h-12 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <DollarSign className="w-6 h-6 text-green-400" />
                </div>
                <h2 className="text-2xl font-semibold text-text-primary mb-2">
                  Quase pronto, {formData.name}!
                </h2>
                <p className="text-text-secondary">
                  Agora vamos configurar sua renda mensal
                </p>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-text-secondary mb-2">
                    Qual é o seu salário líquido mensal?
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-text-secondary">
                      R$
                    </span>
                    <input
                      type="number"
                      placeholder="0,00"
                      className={`input-field w-full pl-10 ${errors.salary ? 'border-red-500' : ''}`}
                      value={formData.salary}
                      onChange={(e) => setFormData({ ...formData, salary: e.target.value })}
                      onKeyPress={(e) => e.key === 'Enter' && handleNext()}
                    />
                  </div>
                  {errors.salary && (
                    <p className="text-red-400 text-sm mt-1">{errors.salary}</p>
                  )}
                  {formData.salary && !errors.salary && (
                    <p className="text-text-secondary text-sm mt-1">
                      Valor: {formatCurrency(parseFloat(formData.salary) || 0)}
                    </p>
                  )}
                </div>
                
                <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4">
                  <h3 className="text-sm font-medium text-blue-400 mb-2">
                    💡 Dica
                  </h3>
                  <p className="text-sm text-text-secondary">
                    Use seu salário líquido (após descontos) para ter um controle mais preciso das suas finanças.
                  </p>
                </div>
              </div>
            </motion.div>
          )}

          <motion.div className="flex justify-between items-center mt-8" variants={itemVariants}>
            <div className="flex space-x-2">
              <div className={`w-2 h-2 rounded-full ${step >= 1 ? 'bg-primary' : 'bg-border'}`} />
              <div className={`w-2 h-2 rounded-full ${step >= 2 ? 'bg-primary' : 'bg-border'}`} />
            </div>
            
            <button
              onClick={handleNext}
              disabled={
                (step === 1 && !formData.name.trim()) ||
                (step === 2 && (!formData.salary || parseFloat(formData.salary) <= 0))
              }
              className="btn-primary flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {step === 1 ? 'Continuar' : 'Começar'}
              <ArrowRight className="w-4 h-4" />
            </button>
          </motion.div>
        </motion.div>

        <motion.div className="text-center mt-6" variants={itemVariants}>
          <p className="text-text-muted text-sm">
            Seus dados ficam salvos apenas no seu computador
          </p>
        </motion.div>
      </motion.div>
    </div>
  )
}