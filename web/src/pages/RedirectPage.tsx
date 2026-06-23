import Symbol from '../assets/vectors/Logo_Icon.svg'

export function RedirectPage() {
  return (
    <div className="flex justify-center">
      <div
        className="
          w-full mx-3 px-5 py-12
          md:w-[580px] md:h-[296px] md:mx-0 md:px-12 md:py-16
          bg-white rounded-lg shadow-sm
          flex flex-col items-center text-center
        "
      >
        <img src={Symbol} alt="Brevly symbol" className="w-12 h-12 mb-6" />

        <h1 className="text-xl font-bold text-gray-600 mb-6">Redirecionando...</h1>

        <p className="text-md text-gray-500 font-semibold mb-2">
          O link será aberto automaticamente em alguns instantes.
        </p>

        <p className="text-md text-gray-500 font-semibold">
          Não foi redirecionado?{' '}
          <a href="#" className="text-blue-base font-semibold hover:underline">
            Acesse aqui
          </a>
        </p>
      </div>
    </div>
  )
}
