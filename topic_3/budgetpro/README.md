# PresupuestosPro

Presupuestos profesionales en PDF, en español de Colombia. Aplicación web estática: todo vive en el navegador del dispositivo (sin servidor, sin cuentas).

## Comandos

```bash
npm install        # instalar dependencias (Node 20 o superior)
npm run dev        # desarrollo en http://localhost:5173
npm test           # pruebas automáticas (Vitest + fake-indexeddb)
npm run build      # compilar a la carpeta dist/
npm run preview    # probar la versión compilada (incluye funcionamiento sin conexión)
```

## Publicar

Ejecuta `npm run build` y arrastra la carpeta `dist/` a Netlify (o cualquier hosting estático con HTTPS).

## Importante

Los datos (perfil, clientes, servicios y presupuestos) se guardan **solo en el navegador** de este dispositivo. En la versión 1 **no hay respaldo ni exportación**: si borras los datos del navegador o cambias de dispositivo, se pierden.
