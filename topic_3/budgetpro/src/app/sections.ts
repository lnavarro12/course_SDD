/** Lista única de secciones: la usan la navegación común y los accesos del inicio. */
export interface Section {
  href: string
  label: string
  description: string
}

export const SECTIONS: Section[] = [
  { href: '/', label: 'Inicio', description: 'Resumen de tu actividad.' },
  { href: '/presupuestos', label: 'Presupuestos', description: 'Crea, revisa y descarga tus presupuestos.' },
  { href: '/clientes', label: 'Clientes', description: 'Los datos de las personas y empresas a las que cotizas.' },
  { href: '/servicios', label: 'Catálogo', description: 'Tus servicios con código y precio, listos para reutilizar.' },
  { href: '/configuracion', label: 'Perfil', description: 'Tus datos profesionales, tu logo y la retención en la fuente.' },
]
