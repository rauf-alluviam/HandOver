Let's Encrypt / Certbot usage (nginx + Docker Compose)
===================================================

This project exposes nginx on ports 80 and 443 and mounts two folders used by
certbot for HTTP-01 (webroot) challenges and certificate storage:

- ./nginx/html -> /usr/share/nginx/html (ACME http-01 challenge files go here)
- ./nginx/certs -> mounted for certificate storage (certbot writes here)

Pre-requirements
----------------

- Make sure your DNS for CLIENT_URL points at the server where this docker
  compose stack will run.
- Add `CLIENT_URL` and `CERT_EMAIL` to `server/.env` (this repo ignores `server/.env`)

Quick one-shot certificate issuance
-----------------------------------

1. Start the stack (so nginx will serve the ACME challenge path):

```bash
cd server
docker compose up -d nginx backend
```

2. Request a certificate with certbot (one-shot run):

```bash
# replace with your own email and domain, or set these in server/.env
docker compose run --rm certbot \
  certonly --webroot --webroot-path=/usr/share/nginx/html \
  --email ${CERT_EMAIL} --agree-tos --no-eff-email -d ${CLIENT_URL}
```

This will create certificate files under `./nginx/certs/live/${CLIENT_URL}/` on
the host. The `nginx` container is configured to read certs from
`/etc/nginx/certs` (which is `./nginx/certs` on the host). After certificate
creation, reload nginx:

```bash
docker compose exec nginx nginx -s reload
```

Renewal
-------

You can renew certificates periodically by running certbot renew (again with
the webroot plugin) and reloading nginx after a successful renewal:

```bash
docker compose run --rm certbot renew --webroot --webroot-path=/usr/share/nginx/html && docker compose exec nginx nginx -s reload
```

Notes / Alternatives
--------------------

- The current setup intentionally provides `certbot` as a helper/one-shot
  container so you control when certs are requested. If you prefer fully
  automated certificate management, consider using an automated solution such
  as `nginx-proxy` + `letsencrypt-nginx-proxy-companion` or running certbot in
  a container with a scheduled cron or systemd timer.
- During testing use `--staging` with certbot to avoid hitting Let's Encrypt
  rate limits.
