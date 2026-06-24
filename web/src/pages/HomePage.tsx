import { useState, useRef } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Check } from 'lucide-react'
import { getLinks, createLink, deleteLink, exportLinks } from '../http/links'
import linkIconUrl from '../assets/icons/Link.svg'
import downloadIconUrl from '../assets/icons/DownloadSimple.svg'
import copyIconUrl from '../assets/icons/Copy.svg'
import trashIconUrl from '../assets/icons/Trash.svg'
import warningIconUrl from '../assets/icons/Warning.svg'

const formSchema = z.object({
  originalUrl: z
    .string()
    .min(1, 'Informe uma url válida')
    .refine(
      val => {
        try {
          const { protocol } = new URL(val)
          return protocol === 'http:' || protocol === 'https:'
        } catch {
          return false
        }
      },
      'Informe uma url válida'
    ),
  shortenedUrl: z
    .string()
    .min(3, 'Informe uma url minúscula e sem espaço/caractere especial (hífens são permitidos)')
    .max(50, 'Informe uma url minúscula e sem espaço/caractere especial (hífens são permitidos)')
    .regex(/^[a-z0-9-]+$/, 'Informe uma url minúscula e sem espaço/caractere especial (hífens são permitidos)'),
})

type FormValues = z.infer<typeof formSchema>

function LinkSkeleton() {
  return (
    <li className="flex items-center justify-between py-4 border-b border-gray-200 animate-pulse">
      <div className="w-39.25 h-9.5 md:w-86.75 flex flex-col gap-2 overflow-hidden min-w-0">
        <div className="h-3.5 w-36 bg-gray-200 rounded" />
        <div className="h-3 w-56 bg-gray-200 rounded" />
      </div>
      <div className="flex items-center">
        <div className="h-3.5 w-14 bg-gray-200 rounded mx-5" />
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-gray-200 rounded-md" />
          <div className="w-8 h-8 bg-gray-200 rounded-md" />
        </div>
      </div>
    </li>
  )
}

export function HomePage() {
  const queryClient = useQueryClient()

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormValues>({ resolver: zodResolver(formSchema) })

  // Destructured once so we can intercept onChange for real-time sanitization
  const { onChange: onSlugChange, ...slugProps } = register('shortenedUrl')

  const shortLinkBase = (import.meta.env.VITE_FRONTEND_URL as string).replace(/^https?:\/\//, '')

  const { data: links = [], isLoading, isError } = useQuery({
    queryKey: ['links'],
    queryFn: getLinks,
  })

  const [showToast, setShowToast] = useState(false)
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  function triggerToast() {
    if (toastTimer.current) clearTimeout(toastTimer.current)
    setShowToast(true)
    toastTimer.current = setTimeout(() => setShowToast(false), 4000)
  }

  const {
    mutate: submitLink,
    isPending,
  } = useMutation({
    mutationFn: (data: FormValues) => createLink(data),
    onSuccess: () => {
      reset()
      queryClient.invalidateQueries({ queryKey: ['links'] })
    },
    onError: triggerToast,
  })

  const {
    mutate: handleDelete,
    isPending: isDeleting,
    variables: deletingId,
  } = useMutation({
    mutationFn: (id: string) => deleteLink(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['links'] })
    },
  })

  const { mutate: handleExport, isPending: isExporting } = useMutation({
    mutationFn: exportLinks,
    onSuccess: ({ downloadUrl }) => {
      const a = document.createElement('a')
      a.href = downloadUrl
      a.download = ''
      a.click()
    },
  })

  const [copiedLinkId, setCopiedLinkId] = useState<string | null>(null)

  function handleCopy(id: string, shortenedUrl: string) {
    navigator.clipboard.writeText(`${import.meta.env.VITE_FRONTEND_URL}/${shortenedUrl}`)
    setCopiedLinkId(id)
    setTimeout(() => setCopiedLinkId(null), 2000)
  }

  function onSubmit(data: FormValues) {
    submitLink(data)
  }

  return (
    <>
    <div className="flex flex-col md:flex-row items-start gap-6">

      <div className="bg-white rounded-lg shadow-sm w-full h-auto p-6 pb-8 md:p-8 md:pb-8 md:w-95">
        <h2 className="text-xl font-bold text-gray-600 m-5 md:mb-6 md:mt-0 md:mx-0">Novo link</h2>

        <form onSubmit={handleSubmit(onSubmit)} noValidate className="flex flex-col gap-4">

          <div className="group flex flex-col gap-1.5 mb-4 md:mb-0">
            <label className="text-xs font-semibold text-gray-400 uppercase tracking-widest transition-colors group-focus-within:text-blue-base group-focus-within:font-bold">
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
              <span className="flex items-center gap-1 text-xs text-gray-400">
                <img src={warningIconUrl} alt="" className="w-3 h-3 shrink-0" />
                {errors.originalUrl.message}
              </span>
            )}
          </div>

          <div className="group flex flex-col gap-1.5 mb-4 md:mb-0">
            <label className="text-xs font-semibold text-gray-400 uppercase tracking-widest transition-colors group-focus-within:text-blue-base group-focus-within:font-bold">
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
                {...slugProps}
                type="text"
                disabled={isPending}
                onChange={(e) => {
                  e.target.value = e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '')
                  onSlugChange(e)
                }}
                className="flex-1 py-3 bg-transparent outline-none text-md text-gray-600 min-w-0 disabled:cursor-not-allowed"
              />
            </div>
            {errors.shortenedUrl && (
              <span className="flex items-center gap-1 text-xs text-gray-400">
                <img src={warningIconUrl} alt="" className="w-3 h-3 shrink-0" />
                {errors.shortenedUrl.message}
              </span>
            )}
          </div>

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

      <div className="bg-white rounded-lg shadow-sm w-full h-auto p-6 md:p-8 md:w-145">

        <div className="flex flex-row justify-between items-center mb-5 md:gap-0">
          <h2 className="text-xl font-bold text-gray-600">Meus links</h2>
          <button
            type="button"
            onClick={() => handleExport()}
            disabled={isExporting}
            className="flex items-center justify-center gap-1.5 bg-[#eef0f4] text-gray-500 text-xs font-semibold
              w-25 h-8 rounded-lg hover:bg-gray-200 transition-colors cursor-pointer
              disabled:opacity-50 disabled:pointer-events-none
              md:w-auto md:h-auto md:px-4 md:py-2"
          >
            <img src={downloadIconUrl} alt="" className="w-3.5 h-3.5 opacity-50" />
            {isExporting ? 'Exportando...' : 'Baixar CSV'}
          </button>
        </div>

        <div className="border-t border-gray-200" />

        {isLoading && (
          <ul>
            <LinkSkeleton />
            <LinkSkeleton />
            <LinkSkeleton />
          </ul>
        )}

        {!isLoading && isError && (
          <p className="text-xs text-danger font-semibold text-center py-8">
            Não foi possível carregar os links. Verifique a conexão com o servidor.
          </p>
        )}

        {!isLoading && !isError && links.length > 0 && (
          <ul className="max-h-96 overflow-y-auto md:max-h-none md:overflow-visible">
            {links.map(link => (
              <li key={link.id} className="flex items-center justify-between py-4 border-b border-gray-200">

                <div className="w-39.25 h-9.5 md:w-86.75 flex flex-col overflow-hidden min-w-0">
                  <a
                    href={`/${link.shortenedUrl}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[15px] font-semibold text-blue-base truncate mb-1 hover:underline"
                  >
                    {shortLinkBase}/{link.shortenedUrl}
                  </a>
                  <span className="text-sm text-gray-500 truncate">{link.originalUrl}</span>
                </div>

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
                    <button
                      type="button"
                      onClick={() => {
                        if (window.confirm(`Você realmente quer apagar o link ${link.shortenedUrl}?`)) {
                          handleDelete(link.id)
                        }
                      }}
                      disabled={isDeleting && deletingId === link.id}
                      className="w-8 h-8 bg-[#eef0f4] rounded-md flex items-center justify-center cursor-pointer
                        disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <img src={trashIconUrl} alt="Excluir link" className="w-4 h-4" />
                    </button>
                  </div>
                </div>

              </li>
            ))}
          </ul>
        )}

        {!isLoading && !isError && links.length === 0 && (
          <div className="flex flex-col items-center justify-center py-14 gap-3">
            <img src={linkIconUrl} alt="" className="w-8 h-8 opacity-30" />
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest text-center">
              Ainda não existem links cadastrados
            </p>
          </div>
        )}

      </div>

    </div>

      <div
        className={[
          'fixed z-50 px-4 py-3 bg-white rounded-lg shadow-lg transition-all duration-500',
          'left-4 right-4 top-4',
          'md:right-6 md:left-auto md:top-auto md:bottom-6 md:w-64',
          showToast ? 'opacity-100 translate-y-0' : 'opacity-0 pointer-events-none translate-y-2 md:-translate-y-2',
        ].join(' ')}
      >
        <p className="text-sm font-bold text-danger">Erro no cadastro</p>
        <p className="text-xs text-danger">Essa URL encurtada já existe</p>
      </div>
    </>
  )
}
