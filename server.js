const express = require("express");

const cors = require("cors");
const sqlite3 = require("sqlite3").verbose();
const path = require("path");

const app = express();

app.use(cors());
app.use(express.json());


// ====================
// DATABASE CONNECTION
// ====================

const databasePath = path.join(
    __dirname,
    "chinook.db"
);

const db = new sqlite3.Database(
    databasePath,
    function (error) {

        if (error) {

            console.error(
                "Veritabanı bağlantı hatası:",
                error.message
            );

        } else {

            console.log(
                "SQLite veritabanına bağlanıldı."
            );

            console.log(
                "Database:",
                databasePath
            );

        }

    }
);


// ====================
// CREATE STUDENTS TABLE
// ====================

db.run(`
    CREATE TABLE IF NOT EXISTS ogrenciler (

        studentNumber TEXT PRIMARY KEY,

        firstName TEXT NOT NULL,

        lastName TEXT NOT NULL,

        age INTEGER NOT NULL,

        created_at TIMESTAMP DEFAULT (datetime('now', 'localtime'))

    )
`, function (error) {

    if (error) {

        console.error(
            "Tablo oluşturma hatası:",
            error.message
        );

    } else {

        console.log(
            "Öğrenciler tablosu hazır."
        );

    }

});


// ====================
// CREATE - ADD STUDENT
// ====================

app.post(
    "/api/students/studentRegister",
    function (request, response) {

        const student = request.body;

        const sql = `
            INSERT INTO ogrenciler
            (
                studentNumber,
                firstName,
                lastName,
                age
            )
            VALUES (?, ?, ?, ?)
        `;

        db.run(
            sql,
            [
                student.studentNumber,
                student.firstName,
                student.lastName,
                student.age
            ],
            function (error) {

                if (error) {

                    console.error(
                        "Veritabanı hatası:",
                        error.message
                    );

                    return response.status(500).json({

                        message:
                            "Öğrenci kaydedilemedi."

                    });

                }

                response.status(201).json({

                    message:
                        "Öğrenci başarıyla kaydedildi."

                });

            }
        );

    }
);


// ====================
// READ - GET ALL STUDENTS
// ====================

app.get(
    "/api/students",
    function (request, response) {

        const sql = `
            SELECT
                studentNumber,
                firstName,
                lastName,
                age
            FROM ogrenciler
        `;

        db.all(
            sql,
            [],
            function (error, rows) {

                if (error) {

                    console.error(
                        "Veritabanı hatası:",
                        error.message
                    );

                    return response.status(500).json({

                        message:
                            "Öğrenciler getirilemedi."

                    });

                }

                response.json(rows);

            }
        );

    }
);


// ====================
// READ - GET ONE STUDENT
// ====================

app.get(
    "/api/students/:studentNumber",
    function (request, response) {

        const studentNumber =
            request.params.studentNumber;

        const sql = `
            SELECT
                studentNumber,
                firstName,
                lastName,
                age
            FROM ogrenciler
            WHERE studentNumber = ?
        `;

        db.get(
            sql,
            [studentNumber],
            function (error, student) {

                if (error) {

                    console.error(
                        "Veritabanı hatası:",
                        error.message
                    );

                    return response.status(500).json({

                        message:
                            "Öğrenci getirilemedi."

                    });

                }

                if (!student) {

                    return response.status(404).json({

                        message:
                            "Öğrenci bulunamadı."

                    });

                }

                response.json(student);

            }
        );

    }
);


// ====================
// UPDATE - UPDATE STUDENT
// ====================

app.put(
    "/api/students/:studentNumber",
    function (request, response) {

        const oldStudentNumber =
            request.params.studentNumber;

        const student =
            request.body;

        const sql = `
            UPDATE ogrenciler

            SET
                studentNumber = ?,
                firstName = ?,
                lastName = ?,
                age = ?

            WHERE studentNumber = ?
        `;

        db.run(
            sql,
            [
                student.studentNumber,
                student.firstName,
                student.lastName,
                student.age,
                oldStudentNumber
            ],
            function (error) {

                if (error) {

                    console.error(
                        "Veritabanı hatası:",
                        error.message
                    );

                    return response.status(500).json({

                        message:
                            "Öğrenci güncellenemedi."

                    });

                }

                if (this.changes === 0) {

                    return response.status(404).json({

                        message:
                            "Öğrenci bulunamadı."

                    });

                }

                response.json({

                    message:
                        "Öğrenci başarıyla güncellendi."

                });

            }
        );

    }
);


// ====================
// DELETE - DELETE STUDENT
// ====================

app.delete(
    "/api/students/:studentNumber",
    function (request, response) {

        const studentNumber =
            request.params.studentNumber;

        const sql = `
            DELETE FROM ogrenciler
            WHERE studentNumber = ?
        `;

        db.run(
            sql,
            [studentNumber],
            function (error) {

                if (error) {

                    console.error(
                        "Veritabanı hatası:",
                        error.message
                    );

                    return response.status(500).json({

                        message:
                            "Öğrenci silinemedi."

                    });

                }

                if (this.changes === 0) {

                    return response.status(404).json({

                        message:
                            "Öğrenci bulunamadı."

                    });

                }

                response.json({

                    message:
                        "Öğrenci başarıyla silindi."

                });

            }
        );

    }
);


// ====================
// SERVER
// ====================

app.listen(
    3000,
    function () {

        console.log(
            "Server http://localhost:3000 adresinde çalışıyor."
        );

    }
);