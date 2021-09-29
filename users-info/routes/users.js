const express = require("express");
const router = express.Router();
const sqlite3 = require("sqlite3");
const db = new sqlite3.Database("users.db");

/* ホーム画面読み込み */
router.get("/api/v1/users", (req, res) => {
  try {
    db.serialize(() => {
      db.all(
        "select id, name, age, email, telephone from users",
        (err, rows) => {
          res.status(200).json({ userData: rows });
        }
      );
    });
  } catch (e) {
    res.status(500).json({
      errorMessage: "データーベースのアクセスに失敗しました",
      error: e,
    });
  }
});

/* idに紐づいたAPI(取得) */
router.get("/api/v1/users/:id", (req, res) => {
  // ここも
  const { id } = req.params;

  try {
    db.serialize(() => {
      db.get(`select * from users where id = ?`, [id], (err, row) =>
        res.status(200).json({ searchData: row })
      );
    });
  } catch (e) {
    res.status(500).json({ errorMessage: "取得に失敗しました", error: e });
  }
});

/* 新規登録 */
router.post("/api/v1/users", (req, res) => {
  const { name, email, age, telephone } = req.body;
  const emailError = email.match(/@/);

  if (!name) {
    return res.status(400).json({ message: "名前が入力されていません" });
  }

  if (name.length >= 20) {
    return res.status(400).json({ message: "名前は20文字以下です" });
  }

  if (!email) {
    return res
      .status(400)
      .json({ message: "メールアドレスが入力されていません" });
  }

  if (emailError === null) {
    return res
      .status(400)
      .json({ message: "メールアドレスが正しくありません" });
  }

  if (!age) {
    return res.status(400).json({ message: "年齢が入力されていません" });
  }

  if (age > 999) {
    return res.status(400).json({ message: "年齢は３桁までです" });
  }

  if (!telephone) {
    return res.status(400).json({ message: "電話番号が入力されていません" });
  }

  if (telephone.length > 11 || telephone.length < 10) {
    return res.status(400).json({ message: "電話番号が正しくありません" });
  }

  try {
    db.serialize(() => {
      db.exec(
        `insert into users (name, email, age, telephone) values("${name}","${email}","${age}","${telephone}")`,
        () => res.status(200).json({ message: "ユーザーの登録に成功しました" })
      );
    });
  } catch (e) {
    res
      .status(500)
      .json({ errorMessage: "ユーザーの登録に失敗しました", error: e });
    console.error(e);
  }
});

/* 削除 */
router.delete("/api/v1/users/:id", (req, res) => {
  // idがあるかチェックする
  const { id } = req.params;
  try {
    db.serialize(() => {
      db.exec(`delete from users where id = ${id}`, () =>
        res.status(200).json({ message: "削除できました" })
      );
    });
  } catch (e) {
    res.status(500).json({ errorMessage: "削除できませんでした", error: e });
    console.error(e);
  }
});

module.exports = router;
