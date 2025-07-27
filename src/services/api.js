import axios from "axios";


export const fetchStations = async () => {
  try {
    const res = await axios.get(`${process.env.REACT_APP_API_BASE_URL}/getStations.php`);
    return res.data;
  } catch (err) {
    console.error("정류장 목록 불러오기 실패:", err);
    return [];
  }
};

export const fetchPlacesByStationId = async (stationId) => {
  try {
    const res = await axios.get(`${process.env.REACT_APP_API_BASE_URL}/getPlaces.php?station_id=${stationId}`);
    return res.data;
  } catch (err) {
    console.error("장소 목록 불러오기 실패:", err);
    return [];
  }
};

export const fetchRouteRecommendation = async ({ interest, time, latitude, longitude }) => {
  try {
    const res = await axios.post(
      `${process.env.REACT_APP_API_BASE_URL}/getRouteRecommendation.php`,
      { interest, time, latitude, longitude }
    );
    return res.data;
  } catch (err) {
    console.error("추천 경로 불러오기 실패:", err);
    throw err;
  }
};

console.log("API BASE URL:", process.env.REACT_APP_API_BASE_URL);
