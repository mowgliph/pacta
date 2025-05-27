interface FooterProps {
  className?: string;
}

export default function Footer({ className = '' }: FooterProps) {
  return (
    <footer className={`w-full h-12 bg-[#F5F5F5] dark:bg-gray-800 flex items-center justify-center text-[#757575] dark:text-gray-400 text-xs ${className}`}>
      {new Date().getFullYear()} PACTA · Plataforma de Gestión de Contratos
    </footer>
  )
}