// 트램별 정류장을 지도에 띄우는 역할
import React, { useEffect, useRef, useState } from 'react';
import axios from 'axios';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { useNavigate } from 'react-router-dom';

const StationList = () => {
  const mapRef = useRef(null);
  const leafletMapRef = useRef(null);
  const navigate = useNavigate();
  
  // 필터 상태 관리
  const [filters, setFilters] = useState({
    tramZones: true,      // 트램 존 (무료/유료 구간)
    tramRoutes: true,      // 노선도
    touristSpots: true,    // 관광지
    stations: true,        // 정류장
    stampPlaces: true,     // 스탬프 명소
    landmarks: true        // 랜드마크
  });

  // 지도 레이어 참조 저장
  const [mapLayers, setMapLayers] = useState({
    zones: [],
    routes: [],
    stations: [],
    stampPlaces: [],
    landmarks: []
  });

  // 노선번호별 아이콘 URL 지정 함수
  const getTramIconByLine = (line) => {
    return L.icon({
      iconUrl: `/img/${line}.png`, // 예: /img/35.png
      iconSize: [40, 40],
      iconAnchor: [20, 40],
      popupAnchor: [0, -35],
    });
  };

  // 스탬프 명소 아이콘
  const stampIcon = L.icon({
    iconUrl: '/img/stamp_pin.png',
    iconSize: [30, 30],
    iconAnchor: [15, 30],
    popupAnchor: [0, -25],
  });

  // 관광지 아이콘
  const touristIcon = L.icon({
    iconUrl: '/img/place.png',
    iconSize: [25, 25],
    iconAnchor: [12, 25],
    popupAnchor: [0, -20],
  });

  // 랜드마크 아이콘
  const landmarkIcon = L.icon({
    iconUrl: '/img/place.png',
    iconSize: [28, 28],
    iconAnchor: [14, 28],
    popupAnchor: [0, -22],
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

  // 필터 토글 함수
  const toggleFilter = (filterName) => {
    setFilters(prev => ({
      ...prev,
      [filterName]: !prev[filterName]
    }));
  };

  // 레이어 표시/숨김 함수
  const updateLayerVisibility = () => {
    // 트램 존 레이어
    mapLayers.zones.forEach(layer => {
      if (filters.tramZones) {
        leafletMapRef.current.addLayer(layer);
      } else {
        leafletMapRef.current.removeLayer(layer);
      }
    });

    // 노선 레이어
    mapLayers.routes.forEach(layer => {
      if (filters.tramRoutes) {
        leafletMapRef.current.addLayer(layer);
      } else {
        leafletMapRef.current.removeLayer(layer);
      }
    });

    // 정류장 레이어
    mapLayers.stations.forEach(layer => {
      if (filters.stations) {
        leafletMapRef.current.addLayer(layer);
      } else {
        leafletMapRef.current.removeLayer(layer);
      }
    });

    // 스탬프 명소 레이어
    mapLayers.stampPlaces.forEach(layer => {
      if (filters.stampPlaces) {
        leafletMapRef.current.addLayer(layer);
      } else {
        leafletMapRef.current.removeLayer(layer);
      }
    });

    // 랜드마크 레이어
    mapLayers.landmarks.forEach(layer => {
      if (filters.landmarks) {
        leafletMapRef.current.addLayer(layer);
      } else {
        leafletMapRef.current.removeLayer(layer);
      }
    });
  };

  useEffect(() => {
    // 지도 초기화
    leafletMapRef.current = L.map(mapRef.current).setView([-37.8136, 144.9631], 14);

    // 타일 레이어
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors',
    }).addTo(leafletMapRef.current);

    // 트램 존 레이어 생성
    const zoneLayers = [];
    
    // Zone 2 (가장 넓은 지역) - 연한 파란색
    const zone2Layer = L.polygon(zone2Coords, {
      color: '#4A90E2',
      weight: 2,
      fillColor: '#4A90E2',
      fillOpacity: 0.1
    }).bindTooltip('Zone 2 (유료 구간)', {
      permanent: false,
      direction: 'center'
    });
    zoneLayers.push(zone2Layer);

    // Zone 1 (중간 지역) - 연한 주황색
    const zone1Layer = L.polygon(zone1Coords, {
      color: '#F5A623',
      weight: 2,
      fillColor: '#F5A623',
      fillOpacity: 0.15
    }).bindTooltip('Zone 1 (유료 구간)', {
      permanent: false,
      direction: 'center'
    });
    zoneLayers.push(zone1Layer);

    // Free Tram Zone (무료 구간) - 연한 초록색
    const freeZoneLayer = L.polygon(freeTramZoneCoords, {
      color: '#7ED321',
      weight: 3,
      fillColor: '#7ED321',
      fillOpacity: 0.2
    }).bindTooltip('Free Tram Zone (무료 구간)', {
      permanent: false,
      direction: 'center'
    });
    zoneLayers.push(freeZoneLayer);

    setMapLayers(prev => ({ ...prev, zones: zoneLayers }));

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

    // 정류장 마커 + 노선 경로
    axios.get(`${process.env.REACT_APP_API_BASE_URL}/getStations_map.php`)
      .then(response => {
        const stationsByLine = {};
        const stationLayers = [];
        const routeLayers = [];

        response.data.forEach(station => {
          if (station.latitude && station.longitude) {
            const line = station.line || 'default';

            // 노선별 정류장 위치 수집
            if (!stationsByLine[line]) stationsByLine[line] = [];
            stationsByLine[line].push({
              lat: parseFloat(station.latitude),
              lng: parseFloat(station.longitude)
            });

            // 정류장 마커 표시
            const icon = getTramIconByLine(line);
            const marker = L.marker([station.latitude, station.longitude], {
              icon: icon
            });

            marker.bindTooltip(`<strong>${station.name}</strong><br>${station.description}`);
            marker.on('click', () => {
              navigate(`/places_on_map/${station.id}`);
            });
            
            stationLayers.push(marker);
          }
        });

        // 노선별 폴리라인 경로 표시
        Object.entries(stationsByLine).forEach(([line, coords]) => {
          const colorMap = {
            '35': 'red',
            '96': 'blue',
            '86': 'gold',
            'default': 'gray'
          };
          const color = colorMap[line] || 'black';

          const routeLayer = L.polyline(coords, {
            color,
            weight: 4
          });
          
          routeLayers.push(routeLayer);
        });

        setMapLayers(prev => ({ 
          ...prev, 
          stations: stationLayers,
          routes: routeLayers
        }));
      })
      .catch(error => {
        console.error('정류장 데이터 로딩 실패:', error);
      });

    // 스탬프 명소 마커 표시
    axios.get(`${process.env.REACT_APP_API_BASE_URL}/getStampPlaces.php`)
      .then(response => {
        const stampLayers = [];
        
        response.data.forEach(place => {
          if (place.latitude && place.longitude) {
            const marker = L.marker([place.latitude, place.longitude], {
              icon: stampIcon
            });

            marker.bindTooltip(
              `<strong>${place.name}</strong><br>${place.description}<br>🎖 스탬프 명소`,
              {
                direction: 'top',
                offset: [0, -20],
                opacity: 1,
              }
            );
                    marker.on('click', () => {
          navigate(`/place/${place.id}`);
        });
            
            stampLayers.push(marker);
          }
        });

        setMapLayers(prev => ({ ...prev, stampPlaces: stampLayers }));
      })
      .catch(error => {
        console.error('스탬프 명소 데이터 로딩 실패:', error);
      });

    // 랜드마크 데이터 (샘플)
    const landmarks = [
      { name: 'Flinders Street Station', lat: -37.8183, lng: 144.9671, type: '역' },
      { name: 'Melbourne Cricket Ground', lat: -37.8199, lng: 144.9834, type: '스포츠' },
      { name: 'Royal Exhibition Building', lat: -37.8047, lng: 144.9717, type: '문화' },
      { name: 'St Kilda Beach', lat: -37.8683, lng: 144.9806, type: '해변' },
      { name: 'Queen Victoria Market', lat: -37.8076, lng: 144.9568, type: '시장' }
    ];

    const landmarkLayers = landmarks.map(landmark => {
      const marker = L.marker([landmark.lat, landmark.lng], {
        icon: landmarkIcon
      });
      
      marker.bindTooltip(`<strong>${landmark.name}</strong><br>🏛️ ${landmark.type}`);
      return marker;
    });

    setMapLayers(prev => ({ ...prev, landmarks: landmarkLayers }));

    return () => {
      leafletMapRef.current.remove();
    };
  }, [navigate]);

  // 필터 변경 시 레이어 업데이트
  useEffect(() => {
    if (leafletMapRef.current) {
      updateLayerVisibility();
    }
  }, [filters]);

  return (
    <div style={{ height: '100vh', display: 'flex', flexDirection: 'column' }}>
      <div style={{ 
        padding: '16px', 
        backgroundColor: 'white', 
        borderBottom: '1px solid #e5e7eb',
        display: 'flex',
        alignItems: 'center',
        gap: '12px'
      }}>
        <button 
          onClick={() => navigate(-1)}
          style={{
            background: 'none',
            border: 'none',
            fontSize: '20px',
            cursor: 'pointer',
            padding: '8px',
            borderRadius: '8px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            minWidth: '40px',
            height: '40px'
          }}
          onMouseEnter={(e) => e.target.style.backgroundColor = '#f3f4f6'}
          onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
        >
          ←
        </button>
        <h2 style={{ 
          margin: 0, 
          fontSize: '18px', 
          fontWeight: 'bold',
          flex: 1
        }}>
          🚋 트램 정류장 지도 보기
        </h2>
      </div>
      
      {/* 필터 패널 */}
      <div style={{
        position: 'absolute',
        bottom: '10px',
        left: '5px',
        zIndex: 1000,
        backgroundColor: 'white',
        borderRadius: '8px',
        padding: '10px',
        boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
        fontSize: '12px',
        minWidth: '170px',
        fontFamily: 'Arial, sans-serif'
      }}>
        <div style={{ 
          fontWeight: 'bold', 
          marginBottom: '6px',
          fontSize: '13px',
          color: '#333'
        }}>
          🎛️ 지도 필터
        </div>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          <button
            onClick={() => toggleFilter('tramZones')}
            style={{
              display: 'flex',
              alignItems: 'center',
              padding: '5px 10px',
              border: `2px solid ${filters.tramZones ? '#2563eb' : '#e0e0e0'}`,
              borderRadius: '6px',
              background: filters.tramZones ? '#2563eb' : '#f5f6fa',
              color: filters.tramZones ? '#fff' : '#444',
              cursor: 'pointer',
              transition: 'all 0.3s',
              fontSize: '11px',
              textAlign: 'left',
              width: '100%',
              position: 'relative',
              minHeight: '28px'
            }}
          >
            <span style={{ marginRight: '6px' }}>🚦</span>
            <span style={{ flex: 1 }}>트램 존</span>
            {filters.tramZones && (
              <span style={{ 
                position: 'absolute', 
                right: '6px', 
                top: '4px',
                fontSize: '12px',
                pointerEvents: 'none'
              }}>✔️</span>
            )}
          </button>
          
          <button
            onClick={() => toggleFilter('tramRoutes')}
            style={{
              display: 'flex',
              alignItems: 'center',
              padding: '5px 10px',
              border: `2px solid ${filters.tramRoutes ? '#2563eb' : '#e0e0e0'}`,
              borderRadius: '6px',
              background: filters.tramRoutes ? '#2563eb' : '#f5f6fa',
              color: filters.tramRoutes ? '#fff' : '#444',
              cursor: 'pointer',
              transition: 'all 0.3s',
              fontSize: '11px',
              textAlign: 'left',
              width: '100%',
              position: 'relative',
              minHeight: '28px'
            }}
          >
            <span style={{ marginRight: '6px' }}>🚋</span>
            <span style={{ flex: 1 }}>노선도</span>
            {filters.tramRoutes && (
              <span style={{ 
                position: 'absolute', 
                right: '6px', 
                top: '4px',
                fontSize: '12px',
                pointerEvents: 'none'
              }}>✔️</span>
            )}
          </button>
          
          <button
            onClick={() => toggleFilter('stations')}
            style={{
              display: 'flex',
              alignItems: 'center',
              padding: '5px 10px',
              border: `2px solid ${filters.stations ? '#2563eb' : '#e0e0e0'}`,
              borderRadius: '6px',
              background: filters.stations ? '#2563eb' : '#f5f6fa',
              color: filters.stations ? '#fff' : '#444',
              cursor: 'pointer',
              transition: 'all 0.3s',
              fontSize: '11px',
              textAlign: 'left',
              width: '100%',
              position: 'relative',
              minHeight: '28px'
            }}
          >
            <span style={{ marginRight: '6px' }}>📍</span>
            <span style={{ flex: 1 }}>정류장</span>
            {filters.stations && (
              <span style={{ 
                position: 'absolute', 
                right: '6px', 
                top: '4px',
                fontSize: '12px',
                pointerEvents: 'none'
              }}>✔️</span>
            )}
          </button>
          
          <button
            onClick={() => toggleFilter('stampPlaces')}
            style={{
              display: 'flex',
              alignItems: 'center',
              padding: '5px 10px',
              border: `2px solid ${filters.stampPlaces ? '#2563eb' : '#e0e0e0'}`,
              borderRadius: '6px',
              background: filters.stampPlaces ? '#2563eb' : '#f5f6fa',
              color: filters.stampPlaces ? '#fff' : '#444',
              cursor: 'pointer',
              transition: 'all 0.3s',
              fontSize: '11px',
              textAlign: 'left',
              width: '100%',
              position: 'relative',
              minHeight: '28px'
            }}
          >
            <span style={{ marginRight: '6px' }}>🎖️</span>
            <span style={{ flex: 1 }}>스탬프 명소</span>
            {filters.stampPlaces && (
              <span style={{ 
                position: 'absolute', 
                right: '6px', 
                top: '4px',
                fontSize: '12px',
                pointerEvents: 'none'
              }}>✔️</span>
            )}
          </button>
          
          <button
            onClick={() => toggleFilter('landmarks')}
            style={{
              display: 'flex',
              alignItems: 'center',
              padding: '5px 10px',
              border: `2px solid ${filters.landmarks ? '#2563eb' : '#e0e0e0'}`,
              borderRadius: '6px',
              background: filters.landmarks ? '#2563eb' : '#f5f6fa',
              color: filters.landmarks ? '#fff' : '#444',
              cursor: 'pointer',
              transition: 'all 0.3s',
              fontSize: '11px',
              textAlign: 'left',
              width: '100%',
              position: 'relative',
              minHeight: '28px'
            }}
          >
            <span style={{ marginRight: '6px' }}>🏛️</span>
            <span style={{ flex: 1 }}>랜드마크</span>
            {filters.landmarks && (
              <span style={{ 
                position: 'absolute', 
                right: '6px', 
                top: '4px',
                fontSize: '12px',
                pointerEvents: 'none'
              }}>✔️</span>
            )}
          </button>
        </div>
      </div>
      
      <div 
        id="map" 
        ref={mapRef} 
        style={{ 
          flex: 1, 
          width: '100%' 
        }} 
      />
    </div>
  );
};

export default StationList;
