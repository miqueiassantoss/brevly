import logoUrl from '../assets/vectors/Logo.svg'

export function Header() {
  return (
    <header className="mb-8">
      <img src={logoUrl} alt="brev.ly" className="h-9" />
    </header>
  )
}
