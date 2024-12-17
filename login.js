const form = document.querySelector("form");
const idInput = document.querySelector("#user_id");
const passwordInput = document.querySelector("#user_password");
const loginButton = document.querySelector("#login_button");

const main = document.querySelector("main");
const userName = document.querySelector("#user_name");
const userInfo = document.querySelector("#user_info");
const logoutButton = document.querySelector("#logout_button");

// Axios 전역 설정
axios.defaults.withCredentials = true;

// 로컬 스토리지에서 Access Token 관리
function setAccessToken(token) {
  localStorage.setItem("accessToken", token);
}

function getAccessToken() {
  return localStorage.getItem("accessToken");
}

function removeAccessToken() {
  localStorage.removeItem("accessToken");
}

// 이벤트 핸들링 방지
form.addEventListener("submit", (e) => e.preventDefault());

// 로그인 함수
function login() {
  const userId = idInput.value;
  const userPassword = passwordInput.value;

  return (
    axios
      .post("http://localhost:3000", { userId, userPassword })
      .then((res) => {
        setAccessToken(res.data); // 응답으로 받은 토큰 저장
        alert("로그인 성공!"); // 피드백 추가
      })
      .catch((error) => {
        console.error(error);
        alert("로그인 실패: " + (error.response?.data || "서버 에러"));
      })
  );
}

// 로그아웃 함수
function logout() {
  removeAccessToken();
  alert("로그아웃 되었습니다.");
}

// 사용자 정보 요청 함수
function getUserInfo() {
  const token = getAccessToken();

  if (!token) {
    alert("로그인이 필요합니다!");
    return Promise.reject("Access Token 없음");
  }

  return axios
    .get("http://localhost:3000", {
      headers: { Authorization: `Bearer ${token}` },
    })
    .then((res) => res.data)
    .catch((error) => {
      console.error(error);
      alert("사용자 정보 가져오기 실패: " + (error.response?.data || "서버 에러"));
      throw error;
    });
}

// 사용자 정보 렌더링
function renderUserInfo(user) {
  main.style.display = "block";
  form.style.display = "none";
  userName.textContent = user.user_name;
  userInfo.textContent = user.user_info;
}

// 로그인 폼 렌더링
function renderLoginForm() {
  main.style.display = "none";
  form.style.display = "grid";
  userName.textContent = "";
  userInfo.textContent = "";
}

// 로그인 버튼 클릭 핸들러
loginButton.onclick = () => {
  login()
    .then(() => getUserInfo())
    .then((user) => renderUserInfo(user))
    .catch(() => {
      // 실패한 경우 UI 복구
      renderLoginForm();
    });
};

// 로그아웃 버튼 클릭 핸들러
logoutButton.onclick = () => {
  logout();
  renderLoginForm();
};

// 초기화 (페이지 로드 시 토큰 유효성 확인)
function initializeApp() {
  if (getAccessToken()) {
    getUserInfo()
      .then((user) => renderUserInfo(user))
      .catch(() => renderLoginForm());
  } else {
    renderLoginForm();
  }
}

// 애플리케이션 초기화 실행
initializeApp();
