import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useMutation } from '@tanstack/react-query'
import { isAxiosError } from 'axios'
import { api } from '../http/api'
import linkIconUrl from '../assets/icons/Link.svg'
import downloadIconUrl from '../assets/icons/DownloadSimple.svg'

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

  function onSubmit(data: FormValues) {
    resetMutation()
    mutate(data)
  }

  return (
    <div className="flex flex-col md:flex-row items-start gap-6">

      {/* ── Left card: create link ── */}
      <div className="bg-white rounded-lg shadow-sm p-8 w-95 h-85">
        <h2 className="text-xl font-bold text-gray-600 mb-6">Novo link</h2>

        <form onSubmit={handleSubmit(onSubmit)} noValidate className="flex flex-col gap-4">

          {/* LINK ORIGINAL */}
          <div className="flex flex-col gap-1.5">
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
          <div className="flex flex-col gap-1.5">
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
      <div className="bg-white rounded-lg shadow-sm p-8 w-145 h-58.5">

        {/* Card header */}
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-xl font-bold text-gray-600">Meus links</h2>
          <button
            type="button"
            className="flex items-center gap-1.5 bg-gray-100 text-gray-500 text-xs font-semibold
              px-4 py-2 rounded-lg hover:bg-gray-200 transition-colors cursor-pointer"
          >
            <img src={downloadIconUrl} alt="" className="w-3.5 h-3.5 opacity-50" />
            Baixar CSV
          </button>
        </div>

        {/* Divider */}
        <div className="border-t border-gray-200" />

        {/* Empty state */}
        <div className="flex flex-col items-center justify-center py-14 gap-3">
          <img src={linkIconUrl} alt="" className="w-8 h-8 opacity-30" />
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest text-center">
            Ainda não existem links cadastrados
          </p>
        </div>
      </div>

    </div>
  )
}
