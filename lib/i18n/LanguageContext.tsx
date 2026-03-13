"use client"

import React, { createContext, useContext, useState, useEffect } from "react"
import ja from "./ja.json"
import en from "./en.json"

type Language = "ja" | "en"
type Dictionary = typeof ja

const dictionaries = { ja, en }

interface LanguageContextType {
  language: Language
  setLanguage: (lang: Language) => void
  t: (key: string, params?: Record<string, any>) => string
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined)

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguage] = useState<Language>("ja")

  useEffect(() => {
    const saved = localStorage.getItem("app-language") as Language
    if (saved && (saved === "ja" || saved === "en")) {
      setLanguage(saved)
    }
  }, [])

  const handleSetLanguage = (lang: Language) => {
    setLanguage(lang)
    localStorage.setItem("app-language", lang)
  }

  const t = (key: string, params?: Record<string, any>) => {
    const keys = key.split(".")
    let value: any = dictionaries[language]
    
    for (const k of keys) {
      value = value?.[k]
    }

    if (typeof value !== "string") return key

    if (params) {
      Object.entries(params).forEach(([k, v]) => {
        value = value.replace(`{${k}}`, String(v))
      })
    }

    return value
  }

  return (
    <LanguageContext.Provider value={{ language, setLanguage: handleSetLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  )
}

export function useLanguage() {
  const context = useContext(LanguageContext)
  if (!context) {
    throw new Error("useLanguage must be used within a LanguageProvider")
  }
  return context
}
