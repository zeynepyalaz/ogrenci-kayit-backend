# Öğrenci Kayıt Sistemi - Backend

Öğrenci Kayıt Sistemi'nin Node.js ve Express kullanılarak geliştirilmiş backend servisidir.

## Kullanılan Teknolojiler

- Node.js
- Express.js
- SQLite
- CORS

## API

Backend aşağıdaki adreste çalışır:

http://localhost:3000

### Öğrenci İşlemleri

- `GET /api/students` — Tüm öğrencileri getirir.
- `GET /api/students/:studentNumber` — Öğrenci numarasına göre öğrenci getirir.
- `POST /api/students/studentRegister` — Yeni öğrenci kaydeder.
- `PUT /api/students/:studentNumber` — Öğrenci bilgilerini günceller.
- `DELETE /api/students/:studentNumber` — Öğrenci siler.

## Kurulum

Projeyi indirdikten sonra gerekli paketleri yüklemek için:

```bash
npm install