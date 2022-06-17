import { useTranslation as useReactI18NextTranslation } from 'react-i18next';

// IMPORTANT: This file adds comments recognized by the react-i18next-parser so that
// labels declared in console-extensions.json are added to the message catalog.

// TODO: We should make the custom i18next JSON lexer available to plugins so
// that they do not need this file.

// t('plugin__console-plugin-nvidia-gpu~GPU Power usage')
// t('plugin__console-plugin-nvidia-gpu~GPU Encoder/Decoder')
// t('plugin__console-plugin-nvidia-gpu~GPUs')
// t('plugin__console-plugin-nvidia-gpu~GPUs health')

export function useTranslation() {
  return useReactI18NextTranslation('plugin__console-plugin-nvidia-gpu');
}
