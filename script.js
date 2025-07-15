// API 키를 직접 코드에 선언
const API_KEY = '8b2f3e55b4c441ca9a736559c455a49d';
const FIXED_SCHOOL_NAME = '광양하이텍고등학교';

// 급식 정보 조회 함수
async function fetchMeal(date) {
    const apiKey = API_KEY;
    // 학교 코드와 교육청 코드 조회 (학교명은 고정)
    const schoolInfoUrl = `https://open.neis.go.kr/hub/schoolInfo?KEY=${apiKey}&Type=json&SCHUL_NM=${encodeURIComponent(FIXED_SCHOOL_NAME)}`;
    const schoolRes = await fetch(schoolInfoUrl);
    const schoolData = await schoolRes.json();
    if (!schoolData.schoolInfo || !schoolData.schoolInfo[1] || schoolData.schoolInfo[1].row.length === 0) {
        throw new Error('학교 정보를 찾을 수 없습니다.');
    }
    const school = schoolData.schoolInfo[1].row[0];
    const eduCode = school.ATPT_OFCDC_SC_CODE;
    const schoolCode = school.SD_SCHUL_CODE;

    // 급식 정보 조회
    const mealUrl = `https://open.neis.go.kr/hub/mealServiceDietInfo?KEY=${apiKey}&Type=json&ATPT_OFCDC_SC_CODE=${eduCode}&SD_SCHUL_CODE=${schoolCode}&MLSV_YMD=${date.replace(/-/g, '')}`;
    const mealRes = await fetch(mealUrl);
    const mealData = await mealRes.json();
    if (!mealData.mealServiceDietInfo || !mealData.mealServiceDietInfo[1]) {
        throw new Error('해당 날짜의 급식 정보가 없습니다.');
    }
    // 여러 식사(조식, 중식, 석식)가 있을 수 있으니 모두 반환
    const meals = mealData.mealServiceDietInfo[1].row;
    return meals;
}

// 조식, 중식, 석식만 출력하는 함수
function renderMeal(meals) {
    let html = '';
    // 조식, 중식, 석식 순서대로 출력
    ['조식', '중식', '석식'].forEach(type => {
        const meal = meals.find(m => m.MMEAL_SC_NM === type);
        if (meal) {
            html += `<div style="margin-bottom:18px;">
                <h2 class="meal-title">${type}</h2>
                <div class="meal-menu">${meal.DDISH_NM.replace(/<br\/>/g, '\n').replace(/\./g, '').replace(/\n/g, '<br>')}</div>
            </div>`;
        }
    });
    if (!html) html = '<span style="color:red;">해당 날짜의 조식, 중식, 석식 정보가 없습니다.</span>';
    return html;
}

// 폼 이벤트 핸들러
const form = document.getElementById('meal-form');
const resultDiv = document.getElementById('result');
form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const date = document.getElementById('meal-date').value;
    resultDiv.innerHTML = '조회 중...';
    try {
        const meals = await fetchMeal(date);
        resultDiv.innerHTML = renderMeal(meals);
    } catch (err) {
        resultDiv.innerHTML = `<span style='color:red;'>${err.message}</span>`;
    }
});
