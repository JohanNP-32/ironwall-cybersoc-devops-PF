# 🛡️ CyberSOC — IronWall

> Sistema de monitoreo de seguridad (SOC) alojado en AWS con red privada aislada, contenedores Docker y respuesta automática a incidentes.

![AWS](https://img.shields.io/badge/AWS-EC2%20%7C%20Lambda%20%7C%20CloudWatch-FF9900?style=flat-square&logo=amazonaws&logoColor=white)
![Docker](https://img.shields.io/badge/Docker-Compose-2496ED?style=flat-square&logo=docker&logoColor=white)
![Linux](https://img.shields.io/badge/Linux-Bash%20Scripting-FCC624?style=flat-square&logo=linux&logoColor=black)
![Estado](https://img.shields.io/badge/Estado-Activo-1D9E75?style=flat-square)

---

## 📐 Arquitectura

```
Internet Público
      │
      ▼
┌─────────────────────────────────────────────┐
│              AWS VPC                        │
│                                             │
│  ┌──────────────┐    ┌────────────────────┐ │
│  │ Subred       │    │ Subred Privada     │ │
│  │ Pública      │───▶│ (Aislada)          │ │
│  │ Landing Page │SSH │ CyberSOC Backend   │ │
│  │ Puerto 80/22 │    │ Docker :8080       │ │
│  └──────────────┘    │ CloudWatch Agent   │ │
│                      └────────┬───────────┘ │
│                               │ Logs        │
│                               ▼             │
│            ┌──────────────────────────────┐ │
│            │  Monitoreo y Respuesta       │ │
│            │  CloudWatch Logs             │ │
│            │       ▼                      │ │
│            │  CloudWatch Alarm            │ │
│            │  "ErroresCriticos"           │ │
│            │       ▼                      │ │
│            │  AWS Lambda (auto-respuesta) │ │
│            └──────────────────────────────┘ │
└─────────────────────────────────────────────┘
```

---

## ✨ Características principales

| Característica | Descripción |
|---|---|
| 🔒 **Red aislada** | El panel SOC vive en una instancia privada sin acceso directo a internet |
| 🔑 **Acceso seguro** | Entrada exclusiva mediante túnel SSH cifrado con port forwarding |
| 📊 **Monitoreo constante** | CloudWatch Agent analiza los logs de la API en tiempo real |
| ⚡ **Defensa automática** | Alarma + Lambda responden a incidentes críticos al instante |

---

## 🧰 Stack tecnológico

- **Nube:** AWS EC2, CloudWatch Logs, CloudWatch Alarms, Lambda, VPC, Security Groups
- **Contenedores:** Docker, Docker Compose
- **Sistemas:** Linux (Amazon Linux 2), Bash Scripting
- **Redes:** SSH con Port Forwarding

---

## 🚀 Instrucciones de uso

### 1. Levantar los servicios

Dentro de la instancia privada, enciende los contenedores:

```bash
docker-compose up -d
```

Verifica que los contenedores estén corriendo:

```bash
docker ps
```

### 2. Crear la conexión segura (túnel SSH)

Desde tu computadora local, ejecuta el siguiente comando con tus datos de AWS:

```bash
ssh -i tu-llave.pem \
    -L 9000:<IP_PRIVADA>:8080 \
    ec2-user@<IP_PUBLICA_LANDING_PAGE>
```

> **Parámetros:**
> - `tu-llave.pem` → tu archivo de clave privada de AWS
> - `<IP_PRIVADA>` → IP de la instancia privada (CyberSOC Backend)
> - `<IP_PUBLICA_LANDING_PAGE>` → IP pública de la instancia Landing Page

### 3. Entrar al panel

Con el túnel activo, abre tu navegador y visita:

```
http://localhost:9000
```

---

## 🧪 Prueba de respuesta automática

Para verificar que el sistema de defensa funciona correctamente, conéctate a la instancia privada y genera un error de prueba:

```bash
echo "ERROR: Intento de intrusión detectado" >> /home/ec2-user/api_logs.txt
```

El flujo de respuesta esperado es:

1. **CloudWatch Agent** detecta el patrón `ERROR` en el archivo de logs
2. **CloudWatch Logs** registra el evento
3. **CloudWatch Alarm** `ErroresCriticos` cambia a estado `IN ALARM`
4. **AWS Lambda** se ejecuta automáticamente y registra la alerta

---

## 📁 Estructura del repositorio

```
cybersoc-ironwall/
├── docker-compose.yml       # Definición de servicios y contenedores
├── api/                     # Código fuente del backend CyberSOC
│   └── ...
├── scripts/
│   └── setup-cloudwatch.sh  # Script de configuración del agente
├── infra/
│   └── lambda_handler.py    # Función Lambda de respuesta automática
└── README.md
```

---

## 🔐 Consideraciones de seguridad

- La instancia del backend **nunca** tiene IP pública asignada
- Los Security Groups restringen el tráfico a únicamente el necesario
- El acceso SSH requiere llave `.pem` — no se permite autenticación por contraseña
- Los logs son inmutables una vez enviados a CloudWatch Logs

---

## 📄 Licencia

Este proyecto es de uso educativo/personal. Consulta el archivo `LICENSE` para más detalles.

---

<p align="center">Construido con 🔐 y AWS por <strong>IronWall Team</strong></p>
