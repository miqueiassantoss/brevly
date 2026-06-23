import { Link } from 'react-router-dom'
import NotFoundImage from '../assets/vectors/404.svg'

export function NotFoundPage() {
  return (
    <div className="flex justify-center">
      <div
        className="
          w-full mx-3 px-5 py-12
          md:w-145 md:h-74 md:mx-0 md:px-12 md:py-16
          bg-white rounded-lg shadow-sm
          flex flex-col items-center text-center
        "
      >
        <img
          src={NotFoundImage}
          alt="404"
          className="w-41 h-18 md:w-48.5 md:h-21.5 mb-6"
        />

        <h1 className="text-xl font-bold text-gray-600 mb-4">
          Link não encontrado
        </h1>

        <p className="text-md text-gray-500 font-semibold">
          O link que você está tentando acessar não existe, foi removido ou é
          uma URL inválida. Saiba mais em{' '}
          <Link to="/" className="text-blue-base font-semibold hover:underline">
            brev.ly
          </Link>
          .
        </p>
      </div>
    </div>
  )
}
