import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { 
  Utensils, Car, Home, Heart, BookOpen, Music, Shirt, Package, 
  Coffee, Gamepad2, Gift, Baby, Briefcase, Plane, Wrench, 
  GraduationCap, X, Plus, Edit3, Trash2 
} from 'lucide-react'
import { Category } from '../types'
import { useAppStore } from '../store'

interface CategoryFormProps {
  onSubmit: (category: Omit<Category, 'id' | 'createdAt'>) => void
  onCancel: () => void
  editingCategory?: Category | null
}

const availableIcons = [
  { name: 'Utensils', icon: Utensils, label: 'Alimentação' },
  { name: 'Car', icon: Car, label: 'Transporte' },
  { name: 'Home', icon: Home, label: 'Moradia' },
  { name: 'Heart', icon: Heart, label: 'Saúde' },
  { name: 'BookOpen', icon: BookOpen, label: 'Educação' },
  { name: 'Music', icon: Music, label: 'Entretenimento' },
  { name: 'Shirt', icon: Shirt, label: 'Roupas' },
  { name: 'Coffee', icon: Coffee, label: 'Café/Bebidas' },
  { name: 'Gamepad2', icon: Gamepad2, label: 'Jogos' },
  { name: 'Gift', icon: Gift, label: 'Presentes' },
  { name: 'Baby', icon: Baby, label: 'Crianças' },
  { name: 'Briefcase', icon: Briefcase, label: 'Trabalho' },
  { name: 'Plane', icon: Plane, label: 'Viagens' },
  { name: 'Wrench', icon: Wrench, label: 'Manutenção' },
  { name: 'GraduationCap', icon: GraduationCap, label: 'Estudos' },
  { name: 'Package', icon: Package, label: 'Outros' },
]

const availableColors = [
  '#ff6b6b', '#4ecdc4', '#45b7d1', '#96ceb4', '#feca57', 
  '#ff9ff3', '#54a0ff', '#5f27cd', '#00d2d3', '#ff9f43',
  '#10ac84', '#ee5a24', '#0abde3', '#3742fa', '#2f3542',
  '#747d8c', '#a4b0be', '#57606f'
]

export default function CategoryForm({ onSubmit, onCancel, editingCategory }: CategoryFormProps) {
  const { categories, deleteCategory, updateCategory } = useAppStore()
  const [showForm, setShowForm] = useState(!!editingCategory)
  const [formData, setFormData] = useState({
    name: editingCategory?.name || '',
    color: editingCategory?.color || availableColors[0],
    icon: editingCategory?.icon || 'Package'
  })
  const [errors, setErrors] = useState<{ [key: string]: string }>({})

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    const newErrors: { [key: string]: string } = {}
    
    if (!formData.name.trim()) {
      newErrors.name = 'Nome da categoria é obrigatório'
    }
    
    if (formData.name.trim().length < 2) {
      newErrors.name = 'Nome deve ter pelo menos 2 caracteres'
    }
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return
    }
    
    onSubmit({
      name: formData.name.trim(),
      color: formData.color,
      icon: formData.icon
    })
    
    setShowForm(false)
    setFormData({
      name: '',
      color: availableColors[0],
      icon: 'Package'
    })
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }))
    }
  }

  const selectedIconComponent = availableIcons.find(icon => icon.name === formData.icon)?.icon || Package

  const handleEditCategory = (category: Category) => {
    setFormData({
      name: category.name,
      color: category.color,
      icon: category.icon
    })
    setShowForm(true)
  }

  const handleDeleteCategory = (categoryId: string) => {
    if (confirm('Tem certeza que deseja excluir esta categoria? Todas as despesas desta categoria ficarão sem categoria.')) {
      deleteCategory(categoryId)
    }
  }

  const getIconComponent = (iconName: string) => {
    return availableIcons.find(icon => icon.name === iconName)?.icon || Package
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.2 }}
      className="max-h-[90vh] overflow-y-auto scrollbar-custom"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-text-primary">
          Gerenciar Categorias
        </h2>
        <button
          type="button"
          onClick={onCancel}
          className="p-2 hover:bg-border/20 rounded-lg transition-colors"
        >
          <X className="w-5 h-5 text-text-secondary" />
        </button>
      </div>

      {!showForm ? (
        <div className="space-y-6">
          {/* Add New Category Button */}
          <button
            onClick={() => setShowForm(true)}
            className="w-full btn-primary flex items-center justify-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Nova Categoria
          </button>

          {/* Categories List */}
          <div className="space-y-3">
            <h3 className="text-lg font-medium text-text-primary">
              Suas Categorias ({categories.length})
            </h3>
            
            <div className="grid gap-3 max-h-96 overflow-y-auto scrollbar-custom">
              {categories.map((category) => {
                const IconComponent = getIconComponent(category.icon)
                
                return (
                  <div
                    key={category.id}
                    className="card p-4 flex items-center justify-between"
                  >
                    <div className="flex items-center gap-3">
                      <div 
                        className="p-2 rounded-lg"
                        style={{ backgroundColor: `${category.color}20` }}
                      >
                        {React.createElement(IconComponent, {
                          className: "w-5 h-5",
                          style: { color: category.color }
                        })}
                      </div>
                      <div>
                        <p className="font-medium text-text-primary">{category.name}</p>
                        <p className="text-sm text-text-secondary">{category.color}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleEditCategory(category)}
                        className="p-2 hover:bg-border/20 rounded-lg transition-colors"
                        title="Editar categoria"
                      >
                        <Edit3 className="w-4 h-4 text-text-secondary" />
                      </button>
                      <button
                        onClick={() => handleDeleteCategory(category.id)}
                        className="p-2 hover:bg-red-500/20 rounded-lg transition-colors"
                        title="Excluir categoria"
                      >
                        <Trash2 className="w-4 h-4 text-red-400" />
                      </button>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-6">

        {/* Preview */}
        <div className="card p-4 bg-border/20">
          <div className="flex items-center gap-3">
            <div 
              className="p-3 rounded-lg"
              style={{ backgroundColor: `${formData.color}20` }}
            >
              {React.createElement(selectedIconComponent, {
                className: "w-6 h-6",
                style: { color: formData.color }
              })}
            </div>
            <div>
              <p className="font-medium text-text-primary">
                {formData.name || 'Nome da categoria'}
              </p>
              <p className="text-sm text-text-secondary">Prévia da categoria</p>
            </div>
          </div>
        </div>

        {/* Name Input */}
        <div>
          <label className="block text-sm font-medium text-text-secondary mb-2">
            Nome da Categoria
          </label>
          <input
            type="text"
            className={`input-field w-full ${errors.name ? 'border-red-500' : ''}`}
            value={formData.name}
            onChange={(e) => handleInputChange('name', e.target.value)}
            placeholder="Ex: Alimentação, Transporte..."
            maxLength={50}
          />
          {errors.name && (
            <p className="text-red-400 text-sm mt-1">{errors.name}</p>
          )}
        </div>

        {/* Icon Selection */}
        <div>
          <label className="block text-sm font-medium text-text-secondary mb-2">
            Ícone
          </label>
          <div className="grid grid-cols-8 gap-2 max-h-48 overflow-y-auto scrollbar-custom">
            {availableIcons.map((iconItem) => {
              const IconComponent = iconItem.icon
              const isSelected = formData.icon === iconItem.name
              
              return (
                <button
                  key={iconItem.name}
                  type="button"
                  className={`p-3 rounded-lg border transition-all ${
                    isSelected 
                      ? 'border-primary bg-primary/20' 
                      : 'border-border hover:border-text-secondary'
                  }`}
                  onClick={() => handleInputChange('icon', iconItem.name)}
                  title={iconItem.label}
                >
                  <IconComponent 
                    className={`w-5 h-5 ${
                      isSelected ? 'text-primary' : 'text-text-secondary'
                    }`} 
                  />
                </button>
              )
            })}
          </div>
        </div>

        {/* Color Selection */}
        <div>
          <label className="block text-sm font-medium text-text-secondary mb-2">
            Cor
          </label>
          <div className="grid grid-cols-9 gap-2">
            {availableColors.map((color) => (
              <button
                key={color}
                type="button"
                className={`w-8 h-8 rounded-lg border-2 transition-all ${
                  formData.color === color 
                    ? 'border-white scale-110' 
                    : 'border-border hover:scale-105'
                }`}
                style={{ backgroundColor: color }}
                onClick={() => handleInputChange('color', color)}
                title={color}
              />
            ))}
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3 pt-4">
          <button
            type="button"
            onClick={() => setShowForm(false)}
            className="btn-secondary flex-1"
          >
            Voltar
          </button>
          <button
            type="submit"
            className="btn-primary flex-1"
          >
            {editingCategory ? 'Salvar Alterações' : 'Criar Categoria'}
          </button>
        </div>
      </form>
      )}
    </motion.div>
  )
}