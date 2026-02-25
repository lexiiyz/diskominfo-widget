# Cara Pakai DiskominfoWidget di Website Lain

## Cara 1 — Import di Project React

### 1. Install package

```bash
npm install https://github.com/lexiiyz/diskominfo-widget.git
```

> Atau kalau belum di-publish ke npm, copy folder `dist/` ke project kamu, lalu import langsung dari path-nya.

### 2. Import & Render

```jsx
import DiskominfoWidget from "diskominfo-widget";

function App() {
  return (
    <DiskominfoWidget
      supabaseUrl="https://xxxxx.supabase.co"
      supabaseKey="eyJ..."
      webhookUrl="https://n8n.example.com/webhook/chat"
      title="Asisten Chat" // opsional, default "Asisten Diskominfo"
    />
  );
}
```

Widget akan muncul sebagai tombol 💬 di pojok kanan bawah.

---

## Cara 2 — Non-React / Framework Lain (Laravel, PHP Native, CodeIgniter, HTML Biasa)

Jika website kamu tidak menggunakan ekosistem React (misal menggunakan Laravel Blade, PHP biasa, atau HTML statis), kamu tetap bisa menggunakan widget ini menggunakan tag `<script>` standar.

### 1. Build library (Jika menggunakan source lokal)

```bash
npm run build:lib
```

Hasilnya ada di folder `dist/`:

- `diskominfo-widget.js` (ES Module)
- `diskominfo-widget.umd.cjs` (UMD) - **Gunakan file ini**

### 2. Embed di HTML / View (misal: welcome.blade.php / index.html)

```html
<!DOCTYPE html>
<html>
  <head>
    <title>My Website</title>
  </head>
  <body>
    <div id="widget-root"></div>

    <!-- React CDN -->
    <script
      crossorigin
      src="https://unpkg.com/react@18/umd/react.production.min.js"
    ></script>
    <script
      crossorigin
      src="https://unpkg.com/react-dom@18/umd/react-dom.production.min.js"
    ></script>

    <!-- Widget -->
    <script src="./dist/diskominfo-widget.umd.cjs"></script>

    <script>
      const root = ReactDOM.createRoot(document.getElementById("widget-root"));
      root.render(
        React.createElement(DiskominfoWidget.default, {
          supabaseUrl: "https://xxxxx.supabase.co",
          supabaseKey: "eyJ...",
          webhookUrl: "https://n8n.example.com/webhook/chat",
          title: "Asisten Chat",
        }),
      );
    </script>
  </body>
</html>
```

---

## Props

| Prop          | Tipe   | Wajib | Default                | Deskripsi                  |
| ------------- | ------ | ----- | ---------------------- | -------------------------- |
| `supabaseUrl` | string | ✅    | —                      | URL project Supabase       |
| `supabaseKey` | string | ✅    | —                      | Anon/public key Supabase   |
| `webhookUrl`  | string | ✅    | —                      | URL webhook N8N untuk chat |
| `title`       | string | ❌    | `"Asisten Diskominfo"` | Judul di header chat       |
