import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useMutation } from '@tanstack/react-query'
import { isAxiosError } from 'axios'
import { api } from '../http/api'
import linkIconUrl from '../assets/icons/Link.svg'
import downloadIconUrl from '../assets/icons/DownloadSimple.svg'
import { Check } from 'lucide-react'
import copyIconUrl from '../assets/icons/Copy.svg'
import trashIconUrl from '../assets/icons/Trash.svg'

const formSchema = z.object({
  originalUrl: z
    .string()
    .min(1, 'URL é obrigatória')
    .refine(
      val => {
        try {
          const { protocol } = new URL(val)
          return protocol === 'http:' || protocol === 'https:'
        } catch {
          return false
        }
      },
      'Insira uma URL válida com http:// ou https://'
    ),
  shortenedUrl: z
    .string()
    .min(3, 'Mínimo de 3 caracteres')
    .max(50, 'Máximo de 50 caracteres')
    .regex(/^[a-zA-Z0-9_-]+$/, 'Apenas letras, números, hífens e underscores'),
})

type FormValues = z.infer<typeof formSchema>

const mockLinks = [
  { id: '1', shortenedUrl: 'meu-link-longo', originalUrl: 'https://www.exemplo.com.br/pagina-muito-longa-com-varios-parametros', accessCount: 10 },
  { id: '2', shortenedUrl: 'google', originalUrl: 'https://www.google.com', accessCount: 5 },
  { id: '3', shortenedUrl: 'meu-portfolio', originalUrl: 'https://portfolio.exemplo.com.br/projetos/desenvolvimento-web', accessCount: 23 },
]

export function HomePage() {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormValues>({ resolver: zodResolver(formSchema) })

  const {
    mutate,
    isPending,
    error: mutationError,
    reset: resetMutation,
  } = useMutation({
    mutationFn: (data: FormValues) => api.post('/links', data).then(r => r.data),
    onSuccess: data => {
      console.log('Link criado:', data)
      reset()
    },
  })

  const apiErrorMessage = isAxiosError(mutationError)
    ? ((mutationError.response?.data as { message?: string })?.message ?? 'Erro ao criar link')
    : null

  const [copiedLinkId, setCopiedLinkId] = useState<string | null>(null)

  const hasLinks = true

  function handleCopy(id: string, shortenedUrl: string) {
    navigator.clipboard.writeText(`${import.meta.env.VITE_FRONTEND_URL}/${shortenedUrl}`)
    setCopiedLinkId(id)
    setTimeout(() => setCopiedLinkId(null), 2000)
  }

  function onSubmit(data: FormValues) {
    resetMutation()
    mutate(data)
  }

  return (
    <div className="flex flex-col md:flex-row items-start gap-6">

      {/* ── Left card: create link ── */}
      <div className="bg-white rounded-lg shadow-sm w-full h-auto p-6 md:p-8 md:w-95 md:h-85">
        <h2 className="text-xl font-bold text-gray-600 m-5 md:mb-6 md:mt-0 md:mx-0">Novo link</h2>

        <form onSubmit={handleSubmit(onSubmit)} noValidate className="flex flex-col gap-4">

          {/* LINK ORIGINAL */}
          <div className="flex flex-col gap-1.5 mb-4 md:mb-0">
            <label className="text-xs font-semibold text-gray-400 uppercase tracking-widest">
              Link original
            </label>
            <input
              {...register('originalUrl')}
              type="url"
              placeholder="www.exemplo.com.br"
              disabled={isPending}
              className={[
                'w-full border rounded-lg px-4 py-3 text-md text-gray-600 outline-none',
                'placeholder:text-gray-300 transition-colors focus:border-blue-base',
                'disabled:opacity-60 disabled:cursor-not-allowed',
                errors.originalUrl ? 'border-danger' : 'border-gray-200',
              ].join(' ')}
            />
            {errors.originalUrl && (
              <span className="text-xs text-danger">{errors.originalUrl.message}</span>
            )}
          </div>

          {/* LINK ENCURTADO */}
          <div className="flex flex-col gap-1.5 mb-4 md:mb-0">
            <label className="text-xs font-semibold text-gray-400 uppercase tracking-widest">
              Link encurtado
            </label>
            <div
              className={[
                'flex items-center border rounded-lg px-4 transition-colors focus-within:border-blue-base',
                errors.shortenedUrl ? 'border-danger' : 'border-gray-200',
                isPending ? 'opacity-60' : '',
              ].join(' ')}
            >
              <span className="text-md text-gray-300 select-none shrink-0">brev.ly/</span>
              <input
                {...register('shortenedUrl')}
                type="text"
                disabled={isPending}
                className="flex-1 py-3 bg-transparent outline-none text-md text-gray-600 min-w-0 disabled:cursor-not-allowed"
              />
            </div>
            {errors.shortenedUrl && (
              <span className="text-xs text-danger">{errors.shortenedUrl.message}</span>
            )}
          </div>

          {apiErrorMessage && (
            <p className="text-xs text-danger">{apiErrorMessage}</p>
          )}

          <button
            type="submit"
            disabled={isPending}
            className="w-full bg-blue-base/70 text-white font-semibold text-md py-3.5 rounded-lg mt-2
              transition-colors cursor-pointer
              hover:bg-blue-base/90 active:bg-blue-dark
              disabled:pointer-events-none disabled:opacity-50"
          >
            {isPending ? 'Salvando...' : 'Salvar link'}
          </button>
        </form>
      </div>

      {/* ── Right card: links list ── */}
      <div className="bg-white rounded-lg shadow-sm w-full h-auto p-6 md:p-8 md:w-145">

        {/* Card header */}
        <div className="flex flex-row justify-between items-center mb-5 md:gap-0">
          <h2 className="text-xl font-bold text-gray-600">Meus links</h2>
          <button
            type="button"
            className="flex items-center justify-center gap-1.5 bg-[#eef0f4] text-gray-500 text-xs font-semibold
              w-25 h-8 rounded-lg hover:bg-gray-200 transition-colors cursor-pointer md:w-auto md:h-auto md:px-4 md:py-2"
          >
            <img src={downloadIconUrl} alt="" className="w-3.5 h-3.5 opacity-50" />
            Baixar CSV
          </button>
        </div>

        {/* Divider */}
        <div className="border-t border-gray-200" />

        {hasLinks ? (
          <ul>
            {mockLinks.map(link => (
              <li key={link.id} className="flex items-center justify-between py-4 border-b border-gray-200">

                {/* Left: link texts */}
                <div className="w-39.25 h-9.5 md:w-86.75 flex flex-col overflow-hidden min-w-0">
                  <span className="text-[15px] font-semibold text-blue-base truncate mb-1">
                    brev.ly/{link.shortenedUrl}
                  </span>
                  <span className="text-sm text-gray-500 truncate">{link.originalUrl}</span>
                </div>

                {/* Right: access count + action icons */}
                <div className="flex items-center">
                  <span className="text-sm text-gray-500 mx-5 whitespace-nowrap">{link.accessCount} acessos</span>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => handleCopy(link.id, link.shortenedUrl)}
                      className={`w-8 h-8 rounded-md flex items-center justify-center cursor-pointer transition-colors ${
                        copiedLinkId === link.id ? 'bg-green-50' : 'bg-[#eef0f4]'
                      }`}
                    >
                      {copiedLinkId === link.id
                        ? <Check size={16} className="text-green-600" />
                        : <img src={copyIconUrl} alt="Copiar link" className="w-4 h-4" />}
                    </button>
                    <button type="button" className="w-8 h-8 bg-[#eef0f4] rounded-md flex items-center justify-center cursor-pointer">
                      <img src={trashIconUrl} alt="Excluir link" className="w-4 h-4" />
                    </button>
                  </div>
                </div>

              </li>
            ))}
          </ul>
        ) : (
          <div className="flex flex-col items-center justify-center py-14 gap-3">
            <img src={linkIconUrl} alt="" className="w-8 h-8 opacity-30" />
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest text-center">
              Ainda não existem links cadastrados
            </p>
          </div>
        )}
      </div>

    </div>
  )
}
