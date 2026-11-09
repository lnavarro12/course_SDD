/** Error de validación de reglas de negocio (mensajes aptos para el usuario). */
export class ValidationError extends Error {
  messages: string[]
  constructor(messages: string | string[]) {
    const list = Array.isArray(messages) ? messages : [messages]
    super(list.join(' '))
    this.name = 'ValidationError'
    this.messages = list
  }
}
