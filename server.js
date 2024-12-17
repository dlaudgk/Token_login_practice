const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const jwt = require("jsonwebtoken");

const users = [
  {
    user_id: "test",
    user_password: "1234",
    user_name: "테스트 유저",
    user_info: "테스트 유저입니다",
  },
];

const app = express();

app.use(
  cors({
    origin: [
      "http://127.0.0.1:3000", // 포트번호를 본인의 설정에 맞게 수정하세요
      "http://localhost:3000",
    ],
    methods: ["OPTIONS", "POST", "GET", "DELETE"],
    credentials: true,
  })
);

app.use(cookieParser());
app.use(express.json());

const secretKey = "ozcodingschool"; // 토큰 생성 시 사용할 비밀 키

// 클라이언트에서 POST 요청을 받은 경우
app.post("/", (req, res) => {
  const { userId, userPassword } = req.body;

  // 유저 정보를 찾음
  const userInfo = users.find(
    (el) => el.user_id === userId && el.user_password === userPassword
  );

  // 유저정보가 없는 경우
  if (!userInfo) {
    res.status(401).send("로그인 실패");
  } else {
    // 1. 유저 정보가 있는 경우 accessToken 발급
    const accessToken = jwt.sign(
      {
        user_id: userInfo.user_id,
        user_name: userInfo.user_name,
      },
      secretKey,
      { expiresIn: "1h" } // 토큰 유효기간 설정
    );

    // 2. accessToken을 응답으로 전송
    res.send({ accessToken });
  }
});

// 클라이언트에서 GET 요청을 받은 경우
app.get("/", (req, res) => {
  const token = req.headers.authorization?.split(" ")[1]; // "Bearer <token>"에서 토큰 부분만 추출

  if (!token) {
    return res.status(401).send("토큰이 없습니다.");
  }

  try {
    // 3. 토큰 검증
    const decoded = jwt.verify(token, secretKey);

    // 4. 검증 완료 후 유저 정보 전송
    const userInfo = users.find((el) => el.user_id === decoded.user_id);

    if (!userInfo) {
      return res.status(404).send("유저 정보를 찾을 수 없습니다.");
    }

    res.send({
      user_id: userInfo.user_id,
      user_name: userInfo.user_name,
      user_info: userInfo.user_info,
    });
  } catch (error) {
    res.status(403).send("유효하지 않은 토큰입니다.");
  }
});

app.listen(3000, () => console.log("서버 실행!"));
