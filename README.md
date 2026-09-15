# Fikadoo – Netlify + Resend V2

Ta wersja używa aktualnego API Netlify Functions (`Request` / `Response`) i oddziela pliki publikowane od backendu.

## Struktura

- `site/` – strona publikowana przez Netlify
- `netlify/functions/send.mjs` – backend mailowy
- `netlify.toml` – konfiguracja publikacji i funkcji

## Zmienne w Netlify

Ustaw w Project configuration -> Environment variables:

- `RESEND_API_KEY` – klucz z Resend, zaznaczony jako secret
- `MAIL_TO` – adres, na który mają przychodzić formularze, np. Twój Gmail

Po zmianie zmiennych wykonaj nowy deploy.

## Test funkcji

Po deployu otwórz:

`https://TWOJA-STRONA.netlify.app/api/send`

Powinien pojawić się JSON:

`{"ok":true,"message":"Fikadoo mail API działa. Formularz wysyła dane metodą POST."}`

Jeśli ten JSON działa, formularz korzysta z tego samego endpointu metodą POST.
