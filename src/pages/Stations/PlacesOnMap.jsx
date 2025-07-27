// 해당 정류장의 명소들을 지도에 띄우는 역할
import React, { useEffect, useRef } from 'react';
import axios from 'axios';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { useNavigate, useParams } from 'react-router-dom';

const PlacesOnMap = () => {
  const mapRef = useRef(null);
  const leafletMapRef = useRef(null);
  const navigate = useNavigate();
  const { stationId } = useParams();

  // 스탬프 명소 아이콘
  const stampIcon = L.icon({
    iconUrl: '/img/stamp_pin.png',
    iconSize: [30, 30],
    iconAnchor: [15, 30],
    popupAnchor: [0, -25],
  });

  // 일반 명소 아이콘
  const placeIcon = L.icon({
    iconUrl: '/img/place.png',
    iconSize: [25, 25],
    iconAnchor: [12, 25],
    popupAnchor: [0, -20],
  });

  // Free Tram Zone 경계 좌표 (멜버른 실제 데이터 기반)
  const freeTramZoneCoords = [
    [-37.8136, 144.9631], // 멜버른 CBD 중심
    [-37.8136, 144.9731], // 동쪽 경계
    [-37.8236, 144.9731], // 남동쪽 경계
    [-37.8236, 144.9531], // 남서쪽 경계
    [-37.8136, 144.9531], // 서쪽 경계
    [-37.8136, 144.9631]  // 시작점으로 복귀
  ];

  // Zone 1 경계 좌표 (Free Tram Zone 외곽)
  const zone1Coords = [
    [-37.8036, 144.9431], // 북서쪽
    [-37.8036, 144.9831], // 북동쪽
    [-37.8336, 144.9831], // 남동쪽
    [-37.8336, 144.9431], // 남서쪽
    [-37.8036, 144.9431]  // 시작점으로 복귀
  ];

  // Zone 2 경계 좌표 (더 넓은 지역)
  const zone2Coords = [
    [-37.7936, 144.9331], // 북서쪽
    [-37.7936, 144.9931], // 북동쪽
    [-37.8436, 144.9931], // 남동쪽
    [-37.8436, 144.9331], // 남서쪽
    [-37.7936, 144.9331]  // 시작점으로 복귀
  ];

  useEffect(() => {
    // 지도 초기화
    leafletMapRef.current = L.map(mapRef.current).setView([-37.8136, 144.9631], 14);

    // 타일 레이어
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors',
    }).addTo(leafletMapRef.current);

    // Zone 2 (가장 넓은 지역) - 연한 파란색
    L.polygon(zone2Coords, {
      color: '#4A90E2',
      weight: 2,
      fillColor: '#4A90E2',
      fillOpacity: 0.1
    }).addTo(leafletMapRef.current).bindTooltip('Zone 2 (유료 구간)', {
      permanent: false,
      direction: 'center'
    });

    // Zone 1 (중간 지역) - 연한 주황색
    L.polygon(zone1Coords, {
      color: '#F5A623',
      weight: 2,
      fillColor: '#F5A623',
      fillOpacity: 0.15
    }).addTo(leafletMapRef.current).bindTooltip('Zone 1 (유료 구간)', {
      permanent: false,
      direction: 'center'
    });

    // Free Tram Zone (무료 구간) - 연한 초록색
    L.polygon(freeTramZoneCoords, {
      color: '#7ED321',
      weight: 3,
      fillColor: '#7ED321',
      fillOpacity: 0.2
    }).addTo(leafletMapRef.current).bindTooltip('Free Tram Zone (무료 구간)', {
      permanent: false,
      direction: 'center'
    });

    // 범례 추가
    const legend = L.control({ position: 'bottomright' });
    legend.onAdd = function() {
      const div = L.DomUtil.create('div', 'info legend');
      div.style.backgroundColor = 'white';
      div.style.padding = '10px';
      div.style.borderRadius = '8px';
      div.style.boxShadow = '0 2px 10px rgba(0,0,0,0.1)';
      div.style.fontSize = '12px';
      div.style.fontFamily = 'Arial, sans-serif';
      
      div.innerHTML = `
        <h4 style="margin: 0 0 8px 0; font-size: 14px; font-weight: bold;">트램 요금 구간</h4>
        <div style="display: flex; align-items: center; margin-bottom: 4px;">
          <div style="width: 20px; height: 12px; background-color: #7ED321; margin-right: 8px; border-radius: 2px;"></div>
          <span>Free Tram Zone (무료)</span>
        </div>
        <div style="display: flex; align-items: center; margin-bottom: 4px;">
          <div style="width: 20px; height: 12px; background-color: #F5A623; margin-right: 8px; border-radius: 2px;"></div>
          <span>Zone 1 (유료)</span>
        </div>
        <div style="display: flex; align-items: center;">
          <div style="width: 20px; height: 12px; background-color: #4A90E2; margin-right: 8px; border-radius: 2px;"></div>
          <span>Zone 2 (유료)</span>
        </div>
      `;
      return div;
    };
    legend.addTo(leafletMapRef.current);

    // 명소 데이터 로딩 및 마커 표시
    axios.get(`${process.env.REACT_APP_API_BASE_URL}/getplaces_map.php?station_id=${stationId}`)
      .then(response => {
        response.data.forEach(place => {
          if (place.latitude && place.longitude) {
            const icon = place.is_stampPlace == 1 ? stampIcon : placeIcon;
            const marker = L.marker([place.latitude, place.longitude], {
              icon: icon
            }).addTo(leafletMapRef.current);

            const popupContent = `
              <div style="text-align: center;">
                <h3 style="margin: 0 0 8px 0; font-size: 16px; font-weight: bold;">${place.name}</h3>
                <p style="margin: 0 0 8px 0; font-size: 14px; color: #666;">${place.description}</p>
                <div style="display: flex; justify-content: space-between; align-items: center; font-size: 12px;">
                  <span style="color: #999;">⭐ ${place.average_rating || '평점 없음'}</span>
                  ${place.is_stampPlace == 1 ? '<span style="color: #FFD700;">🎖 스탬프</span>' : ''}
                </div>
                <button 
                  onclick="window.location.href='/place/${place.id}'"
                  style="
                    margin-top: 8px;
                    padding: 6px 12px;
                    background: #667eea;
                    color: white;
                    border: none;
                    border-radius: 6px;
                    font-size: 12px;
                    cursor: pointer;
                    width: 100%;
                  "
                >
                  상세보기
                </button>
              </div>
            `;

            marker.bindPopup(popupContent);
            marker.on('click', () => {
              navigate(`/place/${place.id}`);
            });
          }
        });
      })
      .catch(error => {
        console.error('명소 데이터 로딩 실패:', error);
      });

    return () => {
      leafletMapRef.current.remove();
    };
  }, [stationId, navigate]);

  return (
    <div>
      <h2 className="text-xl font-bold mb-4 px-4 pt-4">🗺️ 명소 지도 보기</h2>
      <div id="map" ref={mapRef} style={{ height: '90vh', width: '100%' }} />
    </div>
  );
};

export default PlacesOnMap;
