import { formatCOP } from '../domain/money'
import { StorageUnavailableError } from '../storage/db'
import { ValidationError } from '../domain/errors'

export const M = {
  draftSaved: 'Borrador guardado.',
  quantityNotNumber: 'La cantidad debe ser un número.',
  priceNotNumber: 'El precio debe ser un número.',
  selectClientForTotal: 'Selecciona un cliente para calcular la retención y el total.',
  completeErrorsTitle: 'No se puede guardar el presupuesto. Corrige lo siguiente:',
  confirmComplete: 'Al guardar el presupuesto quedará definitivo: no podrás modificarlo. ¿Deseas continuar?',
  completeStorageError:
    'No se pudo guardar el presupuesto. No se perdió ningún dato y sigue como borrador. Libera espacio en tu dispositivo e inténtalo de nuevo.',
  previewBlocked: 'Primero debes guardar el presupuesto como definitivo para verlo o descargarlo.',
  serviceAlreadyInQuote: 'Este servicio ya está en el presupuesto.',
  serviceCodeDuplicate: 'Ya existe un servicio con ese código.',
  clientTaxIdDuplicate: 'Ya tienes un cliente con este NIT/CC. ¿Guardar de todos modos?',
  logoInvalid: 'El logo debe ser una imagen PNG o JPG de hasta 2 MB.',
  confirmDeleteDraft: 'Se eliminará este borrador de forma definitiva. ¿Deseas continuar?',
  unsavedChanges: 'Tienes cambios sin guardar en este borrador. Si sales, se perderán.',
  alreadyOpen:
    'PresupuestosPro ya está abierta en otra pestaña o ventana. Ciérrala o úsala allí; aquí no se puede editar.',
  storageUnavailable:
    'No se puede guardar información en este navegador. Revisa que no estés en modo privado y que haya espacio disponible.',
  pdfFailed: 'No se pudo generar el PDF. Inténtalo de nuevo; si continúa, cierra y vuelve a abrir la aplicación.',
  quoteNotAvailable: 'Este presupuesto no está disponible.',
  noQuotes: 'Aún no tienes presupuestos.',
  nameRequired: 'El nombre o razón social es obligatorio.',
  taxIdRequired: 'El NIT/CC es obligatorio.',
  taxIdRequiredCompany: 'El NIT/CC es obligatorio para empresas.',
  clientNameRequired: 'El nombre del cliente es obligatorio.',
  clientTypeRequired: 'El tipo de cliente es obligatorio.',
  serviceCodeRequired: 'El código del servicio es obligatorio.',
  serviceDescriptionRequired: 'La descripción del servicio es obligatoria.',
  servicePriceInvalid: 'El precio del servicio debe ser un número entero de pesos, mayor o igual a cero.',
  withholdingInvalid: 'El porcentaje de retención debe ser 4 %, 6 %, 10 % u 11 %.',
  genericStorageError: 'No se pudo guardar la información. Inténtalo de nuevo.',
}

export function quoteSaved(number: string): string {
  return `Presupuesto guardado con el número ${number}.`
}

export function catalogPriceChanged(name: string, before: number, after: number): string {
  return `El precio de «${name}» cambió en el catálogo (antes ${formatCOP(before)}, ahora ${formatCOP(after)}). La línea conserva el precio con el que la agregaste.`
}

/** Describe un error: qué ocurrió y qué hacer (FR-004). */
export function describeStorageError(err: unknown): string {
  if (err instanceof StorageUnavailableError) return err.message
  if (err instanceof ValidationError) return err.message
  if (err instanceof Error && err.name === 'QuotaExceededError') return M.storageUnavailable
  return M.genericStorageError
}
