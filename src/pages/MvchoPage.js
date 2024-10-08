import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSearch } from '@fortawesome/free-solid-svg-icons';
import MvBanner from './MvBanner';
import '../css/MvchoPage.css';
import logoImage from '../logo.png';
import watchaLogo from '../watcha.png';
import netflixLogo from '../netflix.png';
import disneyPlusLogo from '../disneyplus.png';
import wavveLogo from '../wavve.png';
import Sidebar from '../components/Sidebar';
import { useAuth } from '../context/AuthContext';

function MvchoPage() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const genreMapping = useMemo(() => ({
    '장르 전체': 'All',
    '액션': '28',
    '모험': '12',
    '애니메이션': '16',
    '코미디': '35',
    '범죄': '80',
    '다큐멘터리': '99',
    '드라마': '18',
    '가족': '10751',
    '판타지': '14',
    '역사': '36',
    '공포': '27',
    '음악': '10402',
    '미스터리': '9648',
    '로맨스': '10749',
    'SF': '878',
    'TV 영화': '10770',
    '스릴러': '53',
    '전쟁': '10752',
    '서부': '37'
  }), []);

  const platformMapping = useMemo(() => ({
    '전체': 'All',
    '넷플릭스': 'netflix',
    '디즈니플러스': 'disney plus',
    '왓챠': 'watcha',
    '웨이브': 'wavve'
  }), []);

  const platforms = useMemo(() => [
    { name: '전체', logo: null },
    { name: '넷플릭스', logo: netflixLogo },
    { name: '디즈니플러스', logo: disneyPlusLogo },
    { name: '왓챠', logo: watchaLogo },
    { name: '웨이브', logo: wavveLogo }
  ], []);

  const genres = useMemo(() => Object.keys(genreMapping), [genreMapping]);

  const [selectedGenre, setSelectedGenre] = useState('장르 전체');
  const [selectedPlatform, setSelectedPlatform] = useState('전체');
  const [allMovies, setAllMovies] = useState([]); // 전체 영화 데이터 저장
  const [filteredMovies, setFilteredMovies] = useState([]); // 필터링된 영화 데이터 저장
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [showPlatforms, setShowPlatforms] = useState(false);
  const [showGenres, setShowGenres] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const closeSidebar = () => {
    setSidebarOpen(false);
  };

  const fetchMovies = useCallback(async () => {
    setLoading(true);
    try {
      const genre = selectedGenre !== '장르 전체' ? genreMapping[selectedGenre] : '';
      const platform = selectedPlatform !== '전체' ? platformMapping[selectedPlatform] : '';
      const url = new URL('https://moviely.duckdns.org/api/movies');
      const params = { 
        size: 1000, 
        sort: 'popularity,desc', 
        popular: true 
      };

      if (genre) params.genre = genre;
      if (platform) params.flatrate = platform;

      Object.keys(params).forEach(key => url.searchParams.append(key, params[key]));

      console.log("API 요청 URL:", url.toString());

      const response = await fetch(url, { mode: 'cors', cache: 'no-store' });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log("API 응답 데이터:", data);

      if (data && data.content) {
        const processedData = data.content.map((movie) => ({
          ...movie,
          flatrate: movie.flatrate ? movie.flatrate.split(', ').map(f => f.trim().toLowerCase()) : [],
          genre: movie.genre ? movie.genre.split(',').map(g => g.trim()) : [] // 장르 데이터를 배열로 변환
        }));

        setAllMovies(processedData); // 전체 영화 목록 설정
        setFilteredMovies(processedData); // 필터링된 영화 목록 초기화
      }

      setLoading(false);
    } catch (error) {
      console.error('Error fetching movies:', error);
      setLoading(false);
    }
  }, [selectedGenre, selectedPlatform, genreMapping, platformMapping]);

  useEffect(() => {
    fetchMovies();
  }, [fetchMovies]);

  // 필터링 함수
  useEffect(() => {
    let filtered = allMovies;

    if (selectedGenre !== '장르 전체') {
      const genreCode = genreMapping[selectedGenre];
      filtered = filtered.filter(movie => movie.genre.includes(genreCode));
    }

    if (selectedPlatform !== '전체') {
      const platformName = platformMapping[selectedPlatform];
      filtered = filtered.filter(movie => movie.flatrate.includes(platformName));
    }

    setFilteredMovies(filtered);
  }, [selectedGenre, selectedPlatform, allMovies, genreMapping, platformMapping]);

  const handleGenreClick = (genre) => {
    setSelectedGenre(genre);
    setSelectedPlatform('전체'); // 장르 선택 시 플랫폼 선택 초기화
  };

  const handlePlatformClick = (platform) => {
    setSelectedPlatform(platform);
    setSelectedGenre('장르 전체'); // 플랫폼 선택 시 장르 선택 초기화
  };

  const loadMoreMovies = () => {
    if (hasMore && !loading) {
      setCurrentPage(prevPage => prevPage + 1);
    }
  };

  let resultText = '';
  if (selectedPlatform !== '전체') {
    resultText += `플랫폼 : <span style="color: yellow;">${selectedPlatform}</span>`;
  }
  if (selectedGenre !== '장르 전체') {
    if (resultText) {
      resultText += ', ';
    }
    resultText += `장르 : <span style="color: yellow;">${selectedGenre}</span>`;
  }
  if (resultText) {
    resultText += ' 검색 결과입니다.';
  }

  return (
    <div className="MvchoPage">
      <header className="pageHeader">
        <Link to="/recommendations" className="chologo">
          <img src={logoImage} alt="Logo" />
        </Link>
        <FontAwesomeIcon
          icon={faSearch}
          size="2x"
          className="cho-searchIcon"
          onClick={() => navigate('/movie-search')}
        />
        <button className="cho-sidebar-toggle" onClick={toggleSidebar}>
          ☰
        </button>
        <Sidebar isOpen={sidebarOpen} onClose={closeSidebar} />
        <div
          className={`overlay ${sidebarOpen ? 'show' : ''}`}
          onClick={closeSidebar}
        />
      </header>
      <div className="mainText">재미있게 봤거나 눈길이 가는 영화들을 평가해주세요.</div>
      <div className="subText">찜한 영화들을 바탕으로 MOVIELY가 취향저격 영화들을 추천해 드려요.</div>
      <div className="stickyTop">
        <Link to="/recommendations">
          <button className="recommendButton">영화 추천 받기 &gt;</button>
        </Link>
        <div className="MvchoDropdownContainer">
          <div style={{ position: 'relative' }}>
            <button onClick={() => setShowGenres(!showGenres)} className="MvchoGenreButton">장르 선택 ▼</button>
            {showGenres && (
              <div className="MvchoGenreDropdown">
                {genres.map((genre) => (
                  <button
                    key={genre}
                    onClick={() => handleGenreClick(genre)}
                    className="MvchoFilter"
                  >
                    {genre}
                  </button>
                ))}
              </div>
            )}
          </div>
          <div style={{ position: 'relative' }}>
            <button onClick={() => setShowPlatforms(!showPlatforms)} className="MvchoPlatformButton">플랫폼 선택 ▼</button>
            {showPlatforms && (
              <div className="MvchoPlatformDropdown">
                {platforms.map((platform) => (
                  <button
                    key={platform.name}
                    onClick={() => handlePlatformClick(platform.name)}
                    className="MvchoFilter"
                  >
                    {platform.logo && <img src={platform.logo} alt={platform.name} className="platformLogo"/>}
                    {platform.name}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
      <div className="bannerGrid">
        {loading && <div className="loading">로딩 중...</div>}
        {filteredMovies.length > 0 ? (
          filteredMovies.map((movie, index) => (
            <MvBanner
              key={index}
              title={movie.title}
              poster={movie.poster_path}
              flatrate={movie.flatrate}
              rating={Math.round(movie.vote_average / 2)}
              movieId={movie.id || movie.movie_id}
              userId={user?.id}
            />
          ))
        ) : (
          !loading && <div className="noMovies">검색 결과가 없습니다.</div>
        )}
      </div>
      {hasMore && !loading && (
        <button className="loadMoreButton" onClick={loadMoreMovies}>
          더 보기
        </button>
      )}
    </div>
  );
}

export default MvchoPage;
