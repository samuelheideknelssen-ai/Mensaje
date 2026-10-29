# Conecta Web

Sitio de mensajería adaptable a pantalla grande y móvil, con llamadas de voz y video mediante WebRTC.

## Abrir en Windows con Visual Studio Code

1. Abre esta carpeta en VS Code.
2. En la terminal, ejecuta `npm install`.
3. Ejecuta `npm start`.
4. Abre `http://localhost:3000` en el navegador.

Para llamar entre dos personas, abre el sitio en dos navegadores o dispositivos, crea un perfil en cada uno y agrega el otro con su código. Acepta el permiso del micrófono y, para videollamadas, el de la cámara.

## Publicar una demo en Render

El archivo `render.yaml` configura el servidor web para Render con WebSockets habilitados por el servicio Node. Sube esta carpeta como un repositorio GitHub y crea un **Blueprint** en Render seleccionando ese repositorio. Render leerá la configuración y publicará el sitio bajo un subdominio `onrender.com` con TLS administrado. Render permite websockets entrantes en sus web services; el plan gratuito se suspende tras 15 minutos sin tráfico y pierde los archivos locales al reiniciar, por lo que esta configuración sirve como demo, no para guardar cuentas o historial de forma duradera.

Para un dominio propio, se configura después de desplegar desde el panel del proveedor.

## Funciones

- Navegación de sitio con secciones de chats, contactos y llamadas.
- Perfiles con código, foto, búsqueda de códigos y contactos.
- Mensajes en tiempo real cuando el destinatario está conectado.
- Llamadas entrantes/salientes de voz y video, controles de micrófono y cámara, y registro local de llamadas.
- Diseño adaptable a escritorio y móvil.

## Requisitos para llamadas

El navegador necesita permitir el micrófono y la cámara. En desarrollo se puede usar `localhost`; al publicar el sitio debe servirse con HTTPS. El proyecto incluye señalización y STUN para iniciar conexiones WebRTC. Redes con NAT o cortafuegos restrictivos pueden requerir configurar un servidor TURN. La conexión entre pares y su disponibilidad dependen de la red de cada participante.

## Alcance de esta versión

Es un prototipo: los perfiles, contactos y conversaciones se guardan en el navegador; los mensajes en tiempo real no se guardan en un servidor ni se entregan cuando el destinatario está desconectado. El directorio de códigos del servidor vive en memoria y se reinicia al apagarlo. El registro local por código no protege la identidad y no debe usarse con información privada. Antes de publicar para uso real hay que añadir cuentas con autenticación, almacenamiento central, control de acceso, HTTPS, TURN y medidas contra abuso.
