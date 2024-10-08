import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../css/Mvbanner.css';
import Popcho from '../pages/Popcho';

import watchaLogo from '../watcha.png';
import netflixLogo from '../netflix.png';
import disneyPlusLogo from '../disneyplus.png';
import wavveLogo from '../wavve.png';

const flatrateLogos = {
  'disney plus': disneyPlusLogo,
  'netflix': netflixLogo,
  'watcha': watchaLogo,
  'wavve': wavveLogo
};

const MvBanner = ({ title, poster, flatrate, movieId, userId }) => {
  const [rating, setRating] = useState(0); // 기본 값은 0
  const [showModal, setShowModal] = useState(false);
  const navigate = useNavigate();

  // 컴포넌트가 마운트될 때 서버에서 별점을 가져오는 부분
  useEffect(() => {
    const fetchRating = async () => {
      try {
        console.log(`Fetching rating for movieId: ${movieId}, userId: ${userId}`);
        // 서버에서 영화의 별점을 가져오는 API 요청
        const response = await fetch(`https://moviely.duckdns.org/ratings/${movieId}?user_id=${userId}`);
        if (response.ok) {
          const data = await response.json();
          console.log('Fetched rating data:', data); // 응답 데이터 로그로 확인
          
          // 서버에서 배열 형태로 별점 데이터를 반환한다면, 해당 유저의 별점을 찾아야 함
          if (Array.isArray(data)) {
            const userRating = data.find(r => r.user_id === userId && r.movie_id === movieId);
            
            if (userRating) {
              setRating(userRating.rating); // 해당 유저의 별점을 설정
              console.log(`Set rating to: ${userRating.rating}`);
            } else {
              setRating(0); // 유저의 별점이 없을 경우 0으로 설정
              console.log('No rating found for this user, setting default rating to 0');
            }
          } else {
            console.log('Invalid rating data structure');
            setRating(0); // 잘못된 데이터 구조가 반환될 경우
          }
        } else {
          console.error('Failed to fetch rating from the server:', response.status);
          setRating(0); // 서버 응답 실패 시 기본값 설정
        }
      } catch (error) {
        console.error('Error fetching rating:', error);
        setRating(0); // 에러 발생 시 기본값 설정
      }
    };

    if (userId && movieId) {
      fetchRating(); // 유저 ID와 영화 ID가 있을 때만 별점 가져오기
    }
  }, [userId, movieId]);

  // 별점 클릭 핸들러
  const handleStarClick = async (index) => {
    const newRating = index + 1;
    setRating(newRating);

    const ratingData = {
      user_id: userId,
      movie_id: movieId,
      rating: parseFloat(newRating)
    };

    try {
      console.log('Submitting rating:', ratingData); // 제출하는 데이터 확인
      const response = await fetch('https://moviely.duckdns.org/ratings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(ratingData),
      });

      const responseData = await response.text();
      console.log('Response from rating submission:', responseData); // 응답 확인

      try {
        const jsonResponse = JSON.parse(responseData);
        if (response.ok) {
          console.log('Rating submitted successfully!');
        } else {
          console.error('Rating submission failed:', jsonResponse);
          console.log('Rating submission failed:', jsonResponse.message || 'Unknown error');
        }
      } catch (e) {
        console.error('JSON parsing error:', responseData);
        console.log('Failed to submit rating: Invalid JSON response.');
      }

    } catch (error) {
      console.error('Error:', error);
      console.log('Failed to submit rating.');
    }
  };

  // 추가 버튼 클릭 핸들러
  const handleAddClick = () => {
    setShowModal(true);
  };

  // 모달 닫기 핸들러
  const handleCloseModal = () => {
    setShowModal(false);
  };

  // 모달 저장 핸들러
  const handleSaveModal = async (option) => {
    if (!userId || !movieId) {
        console.log('User ID or Movie ID is null:', { userId, movieId });
        return;
    }

    const listData = {
        user_id: userId,
        movie_id: movieId
    };

    console.log('Data being sent:', JSON.stringify(listData)); // 디버그용 로그 추가

    try {
        let url = '';
        if (option === 'option1') {
            url = 'https://moviely.duckdns.org/mypage/wishList';
        } else if (option === 'option2') {
            url = 'https://moviely.duckdns.org/mypage/watchedList';
        }

        console.log('Sending data to URL:', url);

        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(listData),
        });

        const responseData = await response.json();
        console.log('Response from server:', responseData);

        if (response.ok) {
            console.log('List updated successfully!');
        } else {
            console.error('List update failed:', responseData);
            console.log('List update failed:', responseData.message || 'Unknown error');
        }
    } catch (error) {
        console.error('Error:', error);
        console.log('Failed to update list.');
    }

    setShowModal(false);
  };

  // 포스터 클릭 핸들러
  const handlePosterClick = () => {
    navigate(`/movie/${movieId}`);
  };

  console.log('Flatrate data:', flatrate);
  console.log('User ID:', userId);
  console.log('Movie ID:', movieId);

  const validFlatrate = Array.isArray(flatrate) ? flatrate.map(service => service.trim().toLowerCase()).filter(Boolean) : [];

  const posterUrl = poster ? `https://image.tmdb.org/t/p/w500${poster}` : 'https://via.placeholder.com/154x231?text=No+Image';

  console.log('Poster URL:', posterUrl);

  validFlatrate.forEach(service => {
    console.log(`Service: ${service}, URL: ${flatrateLogos[service]}`);
  });

  return (
    <div className="movie-banner">
      <img
        src={posterUrl}
        alt={title}
        className="movie-poster-banner"
        onClick={handlePosterClick}
        onError={(e) => e.target.src = 'https://via.placeholder.com/154x231?text=No+Image'}
      />
      <div className="movie-info">
        <div className="movie-title">{title}</div>
        <div className="flatrate-logos">
          {validFlatrate.map((service) => (
            <img
              key={service}
              src={flatrateLogos[service]}
              alt={`${service} 로고`}
              className="flatrate-logo"
              onError={(e) => e.target.src = 'https://via.placeholder.com/18x18?text=No+Logo'}
            />
          ))}
        </div>
        <div className="movie-rating">
          {[...Array(5)].map((_, index) => (
            <span
              key={index}
              className={`star ${rating > index ? 'filled' : ''}`}  // rating에 따라 filled 클래스 적용
              onClick={() => handleStarClick(index)}
            >
              ★
            </span>
          ))}
        </div>
        <button onClick={handleAddClick} className="add-button">+</button>
      </div>
      {showModal && <Popcho onClose={handleCloseModal} onSave={handleSaveModal} />}
    </div>
  );
};

export default MvBanner;
