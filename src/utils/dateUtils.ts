import { format, startOfMonth, endOfMonth, isSameMonth, isSameYear } from 'date-fns'
import { ptBR } from 'date-fns/locale'

export const formatCurrency = (value: number): string => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value)
}

export const formatDate = (date: Date): string => {
  return format(date, 'dd/MM/yyyy', { locale: ptBR })
}

export const formatDateLong = (date: Date): string => {
  return format(date, "d 'de' MMMM 'de' yyyy", { locale: ptBR })
}

export const formatMonth = (date: Date): string => {
  return format(date, 'MMMM yyyy', { locale: ptBR })
}

export const getGreeting = (): string => {
  const hour = new Date().getHours()
  
  if (hour < 12) {
    return 'Bom dia'
  } else if (hour < 18) {
    return 'Boa tarde'
  } else {
    return 'Boa noite'
  }
}

export const getCurrentMonth = (): { month: number; year: number } => {
  const now = new Date()
  return {
    month: now.getMonth() + 1,
    year: now.getFullYear(),
  }
}

export const isCurrentMonth = (date: Date): boolean => {
  const now = new Date()
  return isSameMonth(date, now) && isSameYear(date, now)
}

export const getMonthStart = (month: number, year: number): Date => {
  return startOfMonth(new Date(year, month - 1))
}

export const getMonthEnd = (month: number, year: number): Date => {
  return endOfMonth(new Date(year, month - 1))
}

export const getMonthDays = (month: number, year: number): number => {
  return new Date(year, month, 0).getDate()
}

export const generateId = (): string => {
  return crypto.randomUUID()
}