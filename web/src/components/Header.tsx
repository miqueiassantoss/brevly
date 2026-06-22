import logoUrl from '../assets/vectors/Logo.svg'

export function Header() {
  return (
    <header className="mb-5.5 flex justify-center md:mb-8 md:justify-start">
      <img src={logoUrl} alt="brev.ly" className="h-9" />
    </header>
  )
}
