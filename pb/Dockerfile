# PocketBase para Railway (servicio separado con volumen en /pb_data)
FROM alpine:3.20

ARG PB_VERSION=0.39.9

RUN apk add --no-cache ca-certificates unzip wget \
    && wget -q https://github.com/pocketbase/pocketbase/releases/download/v${PB_VERSION}/pocketbase_${PB_VERSION}_linux_amd64.zip -O /tmp/pb.zip \
    && unzip /tmp/pb.zip -d /pb \
    && rm /tmp/pb.zip

# El contexto de build es la raíz del repo (RAILWAY_DOCKERFILE_PATH=pb/Dockerfile)
COPY pb/pb_migrations /pb/pb_migrations

EXPOSE 8080

# Si PB_SUPERUSER_EMAIL/PASSWORD están definidos, crea o actualiza el
# superusuario antes de arrancar (idempotente).
CMD ["sh", "-c", "if [ -n \"$PB_SUPERUSER_EMAIL\" ]; then /pb/pocketbase superuser upsert \"$PB_SUPERUSER_EMAIL\" \"$PB_SUPERUSER_PASSWORD\" --dir /pb_data --migrationsDir /pb/pb_migrations; fi; exec /pb/pocketbase serve --http=0.0.0.0:8080 --dir /pb_data --migrationsDir /pb/pb_migrations"]
