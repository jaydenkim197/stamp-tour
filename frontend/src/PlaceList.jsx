import React, { useEffect, useState } from 'react';

function PlaceList() {
  const [places, setPlaces] = useState([]);

  useEffect(() => {
    fetch('/places.json')  // public 폴더 안의 파일 자동 인식됨
      .then(response => response.json())
      .then(data => setPlaces(data));
  }, []);

  return (
    <div>
      <h2>장소 리스트</h2>
      <ul>
        {places.map(place => (
          <li key={place.id}>
            <strong>{place.name}</strong> - {place.category}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default PlaceList;
