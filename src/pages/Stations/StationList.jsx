// 트램별 정류장을 지도에 띄우는 역할
import React, { useEffect, useRef, useState } from 'react';
import axios from 'axios';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../../i18n/LanguageContext';

const StationList = () => {
  const mapRef = useRef(null);
  const leafletMapRef = useRef(null);
  const navigate = useNavigate();
  const { t } = useLanguage();
  
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
  // La Trobe St (북), Flinders St (남), Spring St (동), Spencer St (서)
  const freeTramZoneCoords = [
    [144.951153, -37.810619], // La Trobe St & Spencer St (NW)
    [144.974800, -37.809807], // La Trobe St & Spring St (NE)
    [144.974934, -37.818314], // Flinders St & Spring St (SE)
    [144.951312, -37.819134], // Flinders St & Spencer St (SW)
    [144.951153, -37.810619]  // 시작점으로 복귀
  ];

  // Zone 1 경계 좌표 (Free Tram Zone 외곽, 약 1km 반경)
  const zone1Coords = [
    [144.946153, -37.805619], // 북서쪽 (Free Zone에서 약 0.5km 외곽)
    [144.979800, -37.804807], // 북동쪽
    [144.979934, -37.823314], // 남동쪽
    [144.946312, -37.824134], // 남서쪽
    [144.946153, -37.805619]  // 시작점으로 복귀
  ];

  // Zone 2 경계 좌표 (Zone 1보다 외곽, 약 2km 반경)
  const zone2Coords = [
    [144.936153, -37.795619], // 북서쪽 (Zone 1에서 약 0.5km 외곽)
    [144.989800, -37.794807], // 북동쪽
    [144.989934, -37.833314], // 남동쪽
    [144.936312, -37.834134], // 남서쪽
    [144.936153, -37.795619]  // 시작점으로 복귀
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

    // 노선 레이어 (기본적으로 항상 표시)
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
    // 지도가 이미 존재하면 제거
    if (leafletMapRef.current) {
      leafletMapRef.current.remove();
      leafletMapRef.current = null;
    }

    // DOM 요소가 준비되었는지 확인
    if (!mapRef.current) {
      return;
    }

    // 지도 초기화
    try {
      // 멜버른 CBD 중심점으로 설정 (Free Tram Zone 중심)
      leafletMapRef.current = L.map(mapRef.current).setView([-37.814, 144.963], 14);

      // 타일 레이어
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors',
      }).addTo(leafletMapRef.current);
    } catch (error) {
      console.error('지도 초기화 실패:', error);
      return;
    }

    // 트램 존 레이어 생성
    const zoneLayers = [];
    
    // Zone 2 (가장 넓은 지역) - 진한 파란색
    const zone2Layer = L.polygon(zone2Coords, {
      color: '#4A90E2',
      weight: 3,
      fillColor: '#4A90E2',
      fillOpacity: 0.3
    }).bindTooltip(t('zone2Tooltip'), {
      permanent: false,
      direction: 'center'
    });
    zoneLayers.push(zone2Layer);

    // Zone 1 (중간 지역) - 진한 주황색
    const zone1Layer = L.polygon(zone1Coords, {
      color: '#F5A623',
      weight: 3,
      fillColor: '#F5A623',
      fillOpacity: 0.4
    }).bindTooltip(t('zone1Tooltip'), {
      permanent: false,
      direction: 'center'
    });
    zoneLayers.push(zone1Layer);

    // Free Tram Zone (무료 구간) - 진한 초록색
    const freeZoneLayer = L.polygon(freeTramZoneCoords, {
      color: '#7ED321',
      weight: 4,
      fillColor: '#7ED321',
      fillOpacity: 0.5
    }).bindTooltip(t('freeTramZoneTooltip'), {
      permanent: false,
      direction: 'center'
    });
    zoneLayers.push(freeZoneLayer);

    setMapLayers(prev => ({ ...prev, zones: zoneLayers }));
    
    // 트램 존 레이어를 지도에 추가 (기본적으로 표시)
    zoneLayers.forEach(layer => {
      if (leafletMapRef.current) {
        try {
          leafletMapRef.current.addLayer(layer);
        } catch (error) {
          console.error('트램 존 레이어 추가 중 오류:', error);
        }
      }
    });
    
    // 초기 레이어 표시 상태 설정
    updateLayerVisibility();

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
        <h4 style="margin: 0 0 8px 0; font-size: 14px; font-weight: bold;">${t('tramFeeSection')}</h4>
        <div style="display: flex; align-items: center; margin-bottom: 4px;">
          <div style="width: 20px; height: 12px; background-color: #7ED321; margin-right: 8px; border-radius: 2px;"></div>
          <span>${t('freeZone')}</span>
        </div>
        <div style="display: flex; align-items: center; margin-bottom: 4px;">
          <div style="width: 20px; height: 12px; background-color: #F5A623; margin-right: 8px; border-radius: 2px;"></div>
          <span>${t('zone1')}</span>
        </div>
        <div style="display: flex; align-items: center; margin-bottom: 8px;">
          <div style="width: 20px; height: 12px; background-color: #4A90E2; margin-right: 8px; border-radius: 2px;"></div>
          <span>${t('zone2')}</span>
        </div>
        <hr style="margin: 8px 0; border: none; border-top: 1px solid #ddd;">
        <h4 style="margin: 0 0 8px 0; font-size: 14px; font-weight: bold;">${t('tramRoutes')}</h4>
        <div style="display: flex; align-items: center; margin-bottom: 4px;">
          <div style="width: 20px; height: 6px; background-color: #FF4444; margin-right: 8px; border-radius: 2px;"></div>
          <span>${t('line35')}</span>
        </div>
        <div style="display: flex; align-items: center; margin-bottom: 4px;">
          <div style="width: 20px; height: 6px; background-color: #4444FF; margin-right: 8px; border-radius: 2px;"></div>
          <span>${t('line96')}</span>
        </div>
        <div style="display: flex; align-items: center;">
          <div style="width: 20px; height: 6px; background-color: #FFAA00; margin-right: 8px; border-radius: 2px;"></div>
          <span>${t('line86')}</span>
        </div>
      `;
      return div;
    };
    legend.addTo(leafletMapRef.current);

    // 하드코딩된 노선도 데이터 (데이터베이스 문제 우회)
    const hardcodedStations = {
      '35': [ // 35번 City Circle Tram (빨간색) - 실제 순환 경로
        { lat: -37.814464564872125, lng: 144.938645561825, name: t('waterfrontCity') }, // Waterfront City / Docklands Drive
        { lat: -37.813414856197724, lng: 144.94137823870162, name: t('newQuayProm') }, // New Quay Promenade / Docklands Drive
        { lat: -37.815426586135686, lng: 144.94512063442602, name: t('centralPier') }, // Central Pier / Harbour Esplanade
        { lat: -37.81865571347738, lng: 144.94650837136655, name: t('bourkeStHarbour') }, // Bourke Street / Harbour Esplanade
        { lat: -37.82215722680455, lng: 144.94773306350976, name: t('docklandsPark') }, // Docklands Park / Harbour Esplanade
        { lat: -37.82190465062153, lng: 144.95109855638137, name: t('goodsShed') }, // The Goods Shed / Wurundjeri Way
        { lat: -37.82097269970027, lng: 144.95546153614245, name: t('spencerStFlinders') }, // Spencer Street / Flinders Street
        { lat: -37.82023778673241, lng: 144.95786314283018, name: t('melbourneAquarium') }, // Melbourne Aquarium / Flinders Street
        { lat: -37.81922319307822, lng: 144.9614014008424, name: t('marketStFlinders') }, // Market Street / Flinders Street
        { lat: -37.818324403770184, lng: 144.964479208357, name: t('elizabethStFlinders') }, // Elizabeth Street / Flinders Street
        { lat: -37.8176316450406, lng: 144.96690455927876, name: t('swanstonStFlinders') }, // Swanston Street / Flinders Street
        { lat: -37.81667338583987, lng: 144.97015587085124, name: t('russellStFlinders') }, // Russell Street / Flinders Street
        { lat: -37.81538859129167, lng: 144.97453393804187, name: t('springStFlinders') }, // Spring Street / Flinders Street
        { lat: -37.81614537491179, lng: 144.97196946163052, name: t('exhibitionStFlinders') }, // Exhibition Street / Flinders Street
        { lat: -37.821539117626855, lng: 144.95356912978238, name: t('victoriaPoliceCentre') }, // Victoria Police Centre / Flinders Street
        { lat: -37.8131808636857, lng: 144.95149406686252, name: t('spencerStLaTrobe') }, // Spencer Street / La Trobe Street
        { lat: -37.812487918072826, lng: 144.95393532833103, name: t('kingStLaTrobe') }, // King Street / La Trobe Street
        { lat: -37.811771476718356, lng: 144.95644059700524, name: t('williamStLaTrobe') }, // William Street / La Trobe Street
        { lat: -37.81105928060848, lng: 144.95891745116262, name: t('queenStLaTrobe') }, // Queen Street / La Trobe Street
        { lat: -37.810354377085794, lng: 144.96136850025573, name: t('elizabethStLaTrobe') }, // Elizabeth Street / La Trobe Street
        { lat: -37.80961884837298, lng: 144.96384957029932, name: t('swanstonStLaTrobe') }, // Swanston Street / La Trobe Street
        { lat: -37.808876998255194, lng: 144.96634474519394, name: t('russellStLaTrobe') }, // Russell Street / La Trobe Street
        { lat: -37.8081489607039, lng: 144.96879323779422, name: t('exhibitionStLaTrobe') }, // Exhibition Street / La Trobe Street
        { lat: -37.80760292962929, lng: 144.97070054175296, name: t('victoriaStLaTrobe') }, // Victoria Street / La Trobe Street
        { lat: -37.80801062631204, lng: 144.9731036500197, name: t('nicholsonStVictoria') }, // Nicholson Street / Victoria Parade
        { lat: -37.80956201428191, lng: 144.97291405751537, name: t('albertStNicholson') }, // Albert Street / Nicholson Street
        { lat: -37.81358116790275, lng: 144.97406360491075, name: t('parliamentCollins') }, // Parliament / Collins Street
        { lat: -37.814591782869805, lng: 144.94655055842398, name: t('etihadStadium') }, // Etihad Stadium / La Trobe Street
        { lat: -37.814464564872125, lng: 144.938645561825, name: t('waterfrontCity') } // Waterfront City / Docklands Drive (순환 완료)
      ],
      '96': [ // 노선 96 (파란색) - 세로 방향
        { lat: -37.8103, lng: 144.9631, name: t('melbourneCentral') },
        { lat: -37.8113, lng: 144.9731, name: t('parliament') },
        { lat: -37.8093, lng: 144.9631, name: t('flagstaffGardens') },
        { lat: -37.8073, lng: 144.9631, name: t('carltonGardens') },
        { lat: -37.8053, lng: 144.9631, name: t('royalExhibitionBuilding') },
        { lat: -37.8033, lng: 144.9631, name: t('queenVictoriaMarket') }
      ],
      '86': [ // 노선 86 (주황색) - 가로 방향
        { lat: -37.8136, lng: 144.9631, name: t('bourkeStreetMall') },
        { lat: -37.8136, lng: 144.9731, name: t('collinsStreet') },
        { lat: -37.8136, lng: 144.9531, name: t('swanstonStreet') },
        { lat: -37.8136, lng: 144.9581, name: t('elizabethStreet') },
        { lat: -37.8136, lng: 144.9481, name: t('southernCrossStation') },
        { lat: -37.8136, lng: 144.9381, name: t('marvelStadium') }
      ],

    };

    const stationLayers = [];
    const routeLayers = [];

    // 하드코딩된 데이터로 노선도 생성
    Object.entries(hardcodedStations).forEach(([line, stations]) => {
      const coords = stations.map(station => ({ lat: station.lat, lng: station.lng }));
      
      // 노선별 폴리라인 경로 표시 (먼저 선을 그음)
      if (coords.length >= 2) {
        const colorMap = {
          '35': '#FF4444',    // 빨간색 - City Circle Tram
          '96': '#4444FF',    // 파란색
          '86': '#FFAA00',    // 주황색
          'default': '#666666' // 회색
        };
        const color = colorMap[line] || '#333333';

        const routeLayer = L.polyline(coords, {
          color,
          weight: 8,
          opacity: 0.9,
          dashArray: line === 'default' ? '5, 5' : null
        }).bindTooltip(`${t('line')} ${line}`, {
          permanent: false,
          direction: 'center'
        });
        
        routeLayers.push(routeLayer);
      }
      
      // 정류장 마커 생성 (선 위에 마커를 그음)
      stations.forEach((station, index) => {
        // 노선별 마커 아이콘 생성
        const markerIcon = L.divIcon({
          className: 'custom-marker',
          html: `
            <div style="
              width: 24px; 
              height: 24px; 
              background-color: ${line === '35' ? '#FF4444' : line === '96' ? '#4444FF' : line === '86' ? '#FFAA00' : '#666666'};
              border: 3px solid white;
              border-radius: 50%;
              display: flex;
              align-items: center;
              justify-content: center;
              font-weight: bold;
              font-size: 12px;
              color: white;
              box-shadow: 0 2px 4px rgba(0,0,0,0.3);
            ">
              ${line}
            </div>
          `,
          iconSize: [24, 24],
          iconAnchor: [12, 12]
        });

        const marker = L.marker([station.lat, station.lng], {
          icon: markerIcon
        });

        marker.bindTooltip(`<strong>${station.name}</strong><br>${t('line')} ${line}`);
        marker.on('click', () => {
          // 정류장 클릭 시 해당 정류장의 명소 페이지로 이동
          navigate(`/stations/${line}`);
        });
        
        stationLayers.push(marker);
      });
    });

    setMapLayers(prev => ({ 
      ...prev, 
      stations: stationLayers,
      routes: routeLayers
    }));

    // 노선도 레이어를 지도에 추가 (항상 표시되도록 강제)
    routeLayers.forEach(layer => {
      if (leafletMapRef.current) {
        try {
          leafletMapRef.current.addLayer(layer);
        } catch (error) {
          console.error('노선도 레이어 추가 중 오류:', error);
        }
      }
    });

    // 정류장 레이어를 지도에 추가
    stationLayers.forEach(layer => {
      if (filters.stations && leafletMapRef.current) {
        try {
          leafletMapRef.current.addLayer(layer);
        } catch (error) {
          console.error('정류장 레이어 추가 중 오류:', error);
        }
      }
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
              `<strong>${place.name}</strong><br>${place.description}<br>${t('stampPlace')}<br>🎖️ ${t('stampPlaceTooltip')}`,
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

        // 스탬프 명소 레이어를 지도에 추가
        stampLayers.forEach(layer => {
          if (filters.stampPlaces && leafletMapRef.current) {
            try {
              leafletMapRef.current.addLayer(layer);
            } catch (error) {
              console.error('스탬프 명소 레이어 추가 중 오류:', error);
            }
          }
        });
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
      
      marker.bindTooltip(`<strong>${landmark.name}</strong><br>${t('landmarkTooltip', { type: landmark.type })}`);
      return marker;
    });

    setMapLayers(prev => ({ ...prev, landmarks: landmarkLayers }));

    // 랜드마크 레이어를 지도에 추가
    landmarkLayers.forEach(layer => {
      if (filters.landmarks && leafletMapRef.current) {
        try {
          leafletMapRef.current.addLayer(layer);
        } catch (error) {
          console.error('랜드마크 레이어 추가 중 오류:', error);
        }
      }
    });

    return () => {
      if (leafletMapRef.current) {
        try {
          leafletMapRef.current.remove();
        } catch (error) {
          console.error('지도 정리 중 오류:', error);
        }
        leafletMapRef.current = null;
      }
    };
  }, [navigate, t]);

  // 필터 변경 시 레이어 업데이트
  useEffect(() => {
    if (leafletMapRef.current && mapRef.current) {
      try {
        updateLayerVisibility();
      } catch (error) {
        console.error('레이어 업데이트 중 오류:', error);
      }
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
          🚋 {t('tramStationMap')}
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
          🎛️ {t('mapFilters')}
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
            <span style={{ flex: 1 }}>{t('tramZone')}</span>
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
            <span style={{ flex: 1 }}>{t('tramRoutes')}</span>
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
            <span style={{ flex: 1 }}>{t('stations')}</span>
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
            <span style={{ flex: 1 }}>{t('stampPlaces')}</span>
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
            <span style={{ flex: 1 }}>{t('landmarks')}</span>
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
