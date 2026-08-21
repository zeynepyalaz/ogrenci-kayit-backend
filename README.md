# Öğrenci Kayıt Sistemi — Backend

Öğrenci Kayıt Sistemi'nin REST API ve database katmanıdır.

Backend; frontend tarafından gönderilen HTTP request'lerini karşılar, gerekli CRUD işlemlerini gerçekleştirir ve sonuçları JSON response olarak frontend'e döndürür.

Uygulama Node.js, Express.js ve SQLite kullanılarak geliştirilmiştir.

---

## İçindekiler

- [Mimari](#mimari)
- [Teknolojiler](#teknolojiler)
- [Dosya Yapısı](#dosya-yapısı)
- [Server Yapısı](#server-yapısı)
- [Database](#database)
- [Database Şeması](#database-şeması)
- [REST API](#rest-api)
- [CRUD](#crud)
- [Create](#create)
- [Read](#read)
- [Update](#update)
- [Delete](#delete)
- [HTTP Status Kodları](#http-status-kodları)
- [CORS](#cors)
- [Request / Response Yapısı](#request--response-yapısı)
- [Kurulum](#kurulum)
- [Çalıştırma](#çalıştırma)
- [Frontend ile Entegrasyon](#frontend-ile-entegrasyon)
- [Database ve Git](#database-ve-git)
- [Sistem Akışı](#sistem-akışı)

---

# Mimari

Backend, frontend ile database arasında API katmanı olarak görev yapar.

```text
┌─────────────────────────────────────────────┐
│                  FRONTEND                   │
│                                             │
│             HTML / CSS / JS                │
│                                             │
│             localhost:5500                 │
└──────────────────────┬──────────────────────┘
                       │
                       │ HTTP / JSON
                       ▼
┌─────────────────────────────────────────────┐
│                  BACKEND                   │
│                                             │
│             Node.js / Express              │
│                                             │
│             localhost:3000                 │
│                                             │
│  ┌───────────────────────────────────────┐ │
│  │              REST API                │ │
│  │                                       │ │
│  │ POST /api/students/studentRegister   │ │
│  │ GET  /api/students                   │ │
│  │ GET  /api/students/:studentNumber    │ │
│  │ PUT  /api/students/:studentNumber    │ │
│  │ DELETE /api/students/:studentNumber  │ │
│  └───────────────────┬───────────────────┘ │
└──────────────────────┼──────────────────────┘
                       │
                       │ SQL
                       ▼
┌─────────────────────────────────────────────┐
│              SQLite Database               │
│                                             │
│                 ogrenciler                 │
└─────────────────────────────────────────────┘
```

Backend frontend'i servis etmez.

Frontend ayrı bir repository ve ayrı bir development server üzerinde çalışır.

Backend yalnızca API ve database işlemlerinden sorumludur.

---

# Teknolojiler

- Node.js
- Express.js
- SQLite
- sqlite3
- CORS
- npm

---

# Dosya Yapısı

```text
ogrenci-kayit-backend/
│
├── server.js
├── package.json
├── package-lock.json
├── README.md
└── .gitignore
```

Yerel çalışma ortamında:

```text
node_modules/
chinook.db
```

dosya ve klasörleri de bulunabilir.

Bunlar Git repository'sine dahil edilmez.

---

# Server Yapısı

Ana backend dosyası:

```text
server.js
```

Server'ın temel sorumlulukları:

1. Express uygulamasını oluşturmak
2. Middleware'leri tanımlamak
3. SQLite database bağlantısını oluşturmak
4. `ogrenciler` tablosunu hazırlamak
5. REST API endpointlerini tanımlamak
6. CRUD işlemlerini gerçekleştirmek
7. HTTP response'ları göndermek
8. `3000` portunda server'ı başlatmak

---

# Middleware

Backend aşağıdaki middleware'leri kullanır.

## CORS

```javascript
const cors =
    require("cors");

app.use(cors());
```

Frontend `5500`, backend `3000` portunda çalıştığı için cross-origin request'lere izin vermek amacıyla kullanılır.

---

## JSON Body Parser

```javascript
app.use(
    express.json()
);
```

Frontend'den gelen JSON request body'lerinin:

```javascript
request.body
```

üzerinden okunmasını sağlar.

---

# Database

Backend SQLite kullanmaktadır.

Database dosyası:

```text
chinook.db
```

olarak belirlenmiştir.

Database path:

```javascript
const databasePath =
    path.join(
        __dirname,
        "chinook.db"
    );
```

Database bağlantısı:

```javascript
const db =
    new sqlite3.Database(
        databasePath,
        function (error) {
            ...
        }
    );
```

şeklinde oluşturulur.

---

# Database Şeması

Backend başlatılırken:

```sql
CREATE TABLE IF NOT EXISTS ogrenciler
```

komutu çalıştırılır.

Tablo:

```sql
CREATE TABLE IF NOT EXISTS ogrenciler (

    studentNumber TEXT PRIMARY KEY,

    firstName TEXT NOT NULL,

    lastName TEXT NOT NULL,

    age INTEGER NOT NULL,

    created_at TIMESTAMP
        DEFAULT (
            datetime(
                'now',
                'localtime'
            )
        )
)
```

---

## Alanlar

| Alan | Tip | Kısıtlama | Açıklama |
|---|---|---|---|
| `studentNumber` | TEXT | PRIMARY KEY | Öğrenci numarası |
| `firstName` | TEXT | NOT NULL | Ad |
| `lastName` | TEXT | NOT NULL | Soyad |
| `age` | INTEGER | NOT NULL | Yaş |
| `created_at` | TIMESTAMP | DEFAULT | Oluşturulma zamanı |

`studentNumber` primary key olduğu için aynı numaraya sahip iki öğrenci kaydı oluşturulamaz.

---

# REST API

Backend'in public API yüzeyi:

| Method | Endpoint | Açıklama |
|---|---|---|
| POST | `/api/students/studentRegister` | Yeni öğrenci oluşturur |
| GET | `/api/students` | Tüm öğrencileri getirir |
| GET | `/api/students/:studentNumber` | Tek öğrenci getirir |
| PUT | `/api/students/:studentNumber` | Öğrenciyi günceller |
| DELETE | `/api/students/:studentNumber` | Öğrenciyi siler |

Base URL:

```text
http://localhost:3000
```

---

# CRUD

Backend'in temel veri operasyonları:

```text
CREATE
READ
UPDATE
DELETE
```

şeklindedir.

---

# Create

## Endpoint

```http
POST /api/students/studentRegister
```

## Request Body

```json
{
    "studentNumber": "12345",
    "firstName": "Ali",
    "lastName": "Yılmaz",
    "age": 20
}
```

Backend:

```javascript
const student =
    request.body;
```

ile request body'yi alır.

Daha sonra:

```sql
INSERT INTO ogrenciler
(
    studentNumber,
    firstName,
    lastName,
    age
)
VALUES (?, ?, ?, ?)
```

sorgusu çalıştırılır.

Parametreler:

```text
student.studentNumber
student.firstName
student.lastName
student.age
```

olarak SQL sorgusuna bağlanır.

Başarılı işlem:

```http
201 Created
```

Response:

```json
{
    "message":
        "Öğrenci başarıyla kaydedildi."
}
```

Database hatası:

```http
500 Internal Server Error
```

---

# Read

## Tüm öğrencileri getirme

```http
GET /api/students
```

SQL:

```sql
SELECT
    studentNumber,
    firstName,
    lastName,
    age
FROM ogrenciler
```

Response:

```json
[
    {
        "studentNumber": "12345",
        "firstName": "Ali",
        "lastName": "Yılmaz",
        "age": 20
    }
]
```

---

## Tek öğrenci getirme

```http
GET /api/students/:studentNumber
```

Örnek:

```http
GET /api/students/12345
```

URL parametresi:

```javascript
const studentNumber =
    request.params.studentNumber;
```

SQL:

```sql
SELECT
    studentNumber,
    firstName,
    lastName,
    age
FROM ogrenciler
WHERE studentNumber = ?
```

Öğrenci bulunduğunda JSON olarak döndürülür.

Bulunamadığında:

```http
404 Not Found
```

Response:

```json
{
    "message":
        "Öğrenci bulunamadı."
}
```

---

# Update

## Endpoint

```http
PUT /api/students/:studentNumber
```

Örnek:

```http
PUT /api/students/12345
```

Backend iki farklı veri kaynağı kullanır:

```javascript
const oldStudentNumber =
    request.params.studentNumber;

const student =
    request.body;
```

`request.params` eski kaydın hangi öğrenci olduğunu belirler.

`request.body` yeni bilgileri içerir.

Örnek body:

```json
{
    "studentNumber": "12345",
    "firstName": "Ali",
    "lastName": "Kaya",
    "age": 21
}
```

SQL:

```sql
UPDATE ogrenciler

SET
    studentNumber = ?,
    firstName = ?,
    lastName = ?,
    age = ?

WHERE studentNumber = ?
```

Başarılı işlem:

```http
200 OK
```

Eğer güncellenecek kayıt yoksa:

```http
404 Not Found
```

döndürülür.

Backend bunu:

```javascript
if (this.changes === 0)
```

kontrolüyle tespit eder.

---

# Delete

## Endpoint

```http
DELETE /api/students/:studentNumber
```

Örnek:

```http
DELETE /api/students/12345
```

Parametre:

```javascript
const studentNumber =
    request.params.studentNumber;
```

SQL:

```sql
DELETE FROM ogrenciler
WHERE studentNumber = ?
```

Başarılı işlem:

```http
200 OK
```

Response:

```json
{
    "message":
        "Öğrenci başarıyla silindi."
}
```

Öğrenci bulunamadığında:

```http
404 Not Found
```

döndürülür.

---

# HTTP Status Kodları

| Status | Kullanıldığı durum |
|---|---|
| `200 OK` | GET / PUT / DELETE başarılı |
| `201 Created` | POST ile yeni öğrenci oluşturuldu |
| `404 Not Found` | Öğrenci bulunamadı |
| `500 Internal Server Error` | Database veya server hatası |

---

# SQL Parametreleme

SQL sorgularında değerler doğrudan string içine yazılmak yerine `?` placeholder'ları kullanılmaktadır.

Örneğin:

```sql
WHERE studentNumber = ?
```

ve değer ayrı olarak:

```javascript
[studentNumber]
```

şeklinde gönderilir.

Bu yapı SQL sorgularının parametreli olarak çalıştırılmasını sağlar.

---

# CORS

Frontend:

```text
localhost:5500
```

Backend:

```text
localhost:3000
```

üzerinde çalışmaktadır.

Farklı origin/port üzerinden gelen frontend request'lerinin API'ye erişebilmesi için:

```javascript
const cors =
    require("cors");

app.use(cors());
```

kullanılmıştır.

---

# Frontend ile Entegrasyon

Frontend repository:

```text
ogrenci-kayit-frontend
```

Backend repository:

```text
ogrenci-kayit-backend
```

Frontend API base URL:

```javascript
const API_URL =
    "http://localhost:3000";
```

Örneğin frontend'in tüm öğrencileri istemesi:

```javascript
fetch(
    `${API_URL}/api/students`
);
```

şeklindedir.

Böylece frontend backend'in HTTP API'sini kullanır.

---

# Kurulum

## Gereksinimler

- Git
- Node.js LTS
- npm

Node.js kurulumu:

```text
https://nodejs.org/
```

Node.js kurulumunu kontrol etmek için:

```bash
node -v
npm -v
```

---

# Repository'yi Clone Etme

```bash
git clone https://github.com/zeynepyalaz/ogrenci-kayit-backend.git
```

Daha sonra:

```bash
cd ogrenci-kayit-backend
```

---

# Bağımlılıkların Kurulması

```bash
npm install
```

Bu komut `package.json` içerisindeki bağımlılıkları kurar.

Oluşan:

```text
node_modules/
```

klasörü Git repository'sine dahil edilmez.

---

# Backend'i Çalıştırma

```bash
node server.js
```

Başarılı başlangıçta:

```text
Server http://localhost:3000 adresinde çalışıyor.
SQLite veritabanına bağlanıldı.
Öğrenciler tablosu hazır.
```

benzeri mesajlar görülür.

Backend:

```text
http://localhost:3000
```

üzerinden çalışır.

---

# Frontend'i Çalıştırma

Backend çalıştıktan sonra frontend repository'si de alınır:

```bash
git clone https://github.com/zeynepyalaz/ogrenci-kayit-frontend.git
```

Frontend VS Code ile açılır.

`index.html` Live Server ile çalıştırılır.

Frontend:

```text
http://localhost:5500
```

üzerinden çalışır.

---

# Database ve Git

`chinook.db` repository'de tutulmamaktadır.

`.gitignore` içerisinde database dosyası dışarıda bırakılmıştır.

Bunun amacı yerel database içerisindeki öğrenci kayıtlarının GitHub'a gönderilmesini engellemektir.

Aynı şekilde:

```text
node_modules/
```

de repository'de tutulmaz.

Başka bir bilgisayarda:

```bash
npm install
```

ile yeniden oluşturulabilir.

Database mevcut değilse SQLite database dosyasını oluşturabilir ve server başlangıcındaki:

```sql
CREATE TABLE IF NOT EXISTS ogrenciler
```

işlemi gerekli tabloyu oluşturur.

Dolayısıyla repository'yi clone eden kişi uygulamanın kodunu alabilir ancak yerel database'deki mevcut öğrenci kayıtlarını almaz.

---

# Sistem Akışı

## Create

```text
Frontend
   │
   │ POST
   ▼
/api/students/studentRegister
   │
   ▼
Express
   │
   ▼
SQLite INSERT
   │
   ▼
201 Created
```

## Read

```text
Frontend
   │
   │ GET
   ▼
/api/students
   │
   ▼
Express
   │
   ▼
SQLite SELECT
   │
   ▼
JSON
```

## Update

```text
Frontend
   │
   │ PUT
   ▼
/api/students/:studentNumber
   │
   ▼
Express
   │
   ▼
SQLite UPDATE
   │
   ▼
200 OK
```

## Delete

```text
Frontend
   │
   │ DELETE
   ▼
/api/students/:studentNumber
   │
   ▼
Express
   │
   ▼
SQLite DELETE
   │
   ▼
200 OK
```

---

# Genel Sistem

```text
                        USER
                          │
                          ▼
              ┌─────────────────────┐
              │      FRONTEND       │
              │                     │
              │   HTML / CSS / JS   │
              │                     │
              │      :5500          │
              └──────────┬──────────┘
                         │
                         │ HTTP / JSON
                         ▼
              ┌─────────────────────┐
              │       BACKEND       │
              │                     │
              │ Node.js / Express   │
              │                     │
              │ REST API            │
              │                     │
              │      :3000          │
              └──────────┬──────────┘
                         │
                         │ SQL
                         ▼
              ┌─────────────────────┐
              │       SQLite        │
              │                     │
              │     ogrenciler      │
              └─────────────────────┘
```

Bu ayrım sayesinde frontend ve backend bağımsız olarak geliştirilebilir, test edilebilir ve ayrı repository'lerde version control altında tutulabilir.