import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSearch } from '@fortawesome/free-solid-svg-icons';
import { ResponsiveBar } from '@nivo/bar';
import { ResponsivePie } from '@nivo/pie';
import '../css/PlatRecom.css';
import logoImage from '../logo.png';
import { useAuth } from '../context/AuthContext';

const genreMapping = {
  '28': '액션',
  '12': '모험',
  '16': '애니메이션',
  '35': '코미디',
  '80': '범죄',
  '99': '다큐멘터리',
  '18': '드라마',
  '10751': '가족',
  '14': '판타지',
  '36': '역사',
  '27': '공포',
  '10402': '음악',
  '9648': '미스터리',
  '10749': '로맨스',
  '878': 'SF',
  '10770': 'TV 영화',
  '53': '스릴러',
  '10752': '전쟁',
  '37': '서부',
};

const platformNameMapping = {
  'disney plus': '디즈니 플러스',
  'netflix': '넷플릭스',
  'watcha': '왓챠',
  'wavve': '웨이브'
};

const API_URL = 'https://moviely.duckdns.org/api/recommend_platform';

const subscriptionData = [
  { platform: '넷플릭스', cost: 5500, color: '#FBB4AE' },
  { platform: '왓챠', cost: 9900, color: '#CCEBC5' },
  { platform: '디즈니플러스', cost: 7900, color: '#B3CDE3' },
  { platform: '웨이브', cost: 7900, color: '#DECBE4' }
];

const contentData = [
  { platform: '넷플릭스', content: 4298 },
  { platform: '왓챠', content: 8344 },
  { platform: '디즈니플러스', content: 1487 },
  { platform: '웨이브', content: 12982 }
];

const genreData = {
  '웨이브': [
    { genre: '드라마', count: 7187 },
    { genre: '스릴러', count: 4256 },
    { genre: '액션', count: 4155 },
    { genre: '코미디', count: 3386 },
    { genre: '범죄', count: 2049 },
    { genre: '로맨스', count: 2466 },
    { genre: '유럽 제작', count: 1674 }
  ],
  '디즈니플러스': [
    { genre: '코미디', count: 626 },
    { genre: '가족', count: 549 },
    { genre: '애니메이션', count: 401 },
    { genre: '드라마', count: 430 },
    { genre: '유럽 제작', count: 430 },
    { genre: '액션', count: 459 },
    { genre: '판타지', count: 321 }
  ],
  '왓챠': [
    { genre: '드라마', count: 4792 },
    { genre: '액션', count: 2469 },
    { genre: '코미디', count: 2000 },
    { genre: '스릴러', count: 1200 },
    { genre: '범죄', count: 1119 },
    { genre: '로맨스', count: 1000 },
    { genre: '유럽 제작', count: 900 }
  ],
  '넷플릭스': [
    { genre: '코미디', count: 1718 },
    { genre: '스릴러', count: 1129 },
    { genre: '액션', count: 1081 },
    { genre: '로맨스', count: 857 },
    { genre: '범죄', count: 770 },
    { genre: '다큐멘터리', count: 598 },
    { genre: '애니메이션', count: 409 }
  ]
};

const PlatRecom = () => {
  const { user } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [recommendation, setRecommendation] = useState({ platform: '', genre: '' });
  const [selectedPlatform, setSelectedPlatform] = useState('넷플릭스'); // 기본값을 "넷플릭스"로 설정

  useEffect(() => {
    if (user) {
      const requestData = { user_id: user.id };
      fetch(API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestData),
      })
      .then(response => {
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.json();
      })
      .then(data => {
        const platform = platformNameMapping[data['추천 플랫폼']] || data['추천 플랫폼'];
        const genreCode = data['추천 장르'];
        const genre = genreMapping[genreCode];
        setRecommendation({ platform, genre });
      })
      .catch(error => console.error('Error fetching recommendation:', error));
    }
  }, [user]);
  

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const closeSidebar = () => {
    setSidebarOpen(false);
  };

  const handlePlatformSelect = (platform) => {
    setSelectedPlatform(platform);
  };

  return (
    <div className="plat-PlatRecom">
      <header className="pageHeader">
        <Link to="/recommendations" className="recomlogo">
          <img src={logoImage} alt="Logo" />
        </Link>
        <Link to="/movie-search" className="searchIconContainer">
          <FontAwesomeIcon
            icon={faSearch}
            size="2x"
            className="recom-searchIcon"
          />
        </Link>
        <button className="recom-sidebar-toggle" onClick={toggleSidebar}>
          ☰
        </button>
      </header>
      <Sidebar isOpen={sidebarOpen} onClose={closeSidebar} />
      
      <div className="plat-recommendationText">
        <p>{user?.name}님에게 맞는 플랫폼은 <span className="highlighted-text">{recommendation.platform}</span> 일지도?</p>
        <p>{user?.name}님이 평가한 항목 중 <span className="highlighted-text">{recommendation.platform}</span>의 컨텐츠가 가장 많아요.</p>
        <p>그리고 <span className="highlighted-text">{recommendation.genre}</span> 장르가 가장 많아요.</p>
      </div>
      
      <div className="plat-content">
        <h1 className="plat-title">나에게 맞는 OTT 플랫폼 찾아보기</h1>
        {/* 항상 표시되는 두 개의 그래프 */}
        <div className="plat-graphContainer">
          <div className="plat-barGraph">
            <div className="plat-subtitle">OTT 플랫폼별 구독료 (최저가를 기준으로 함)</div>
            <ResponsiveBar
              data={subscriptionData}
              keys={['cost']}
              indexBy="platform"
              margin={{ top: 30, right: 20, bottom: 50, left: 50 }}
              padding={0.3}
              layout="vertical"
              colors={({ data }) => data.color}
              axisBottom={{
                tickSize: 5,
                tickPadding: 5,
                tickRotation: 0,
                legend: '플랫폼',
                legendPosition: 'middle',
                legendOffset: 32,
                tickColor: '#000000',
                tickTextColor: '#000000',
              }}
              axisLeft={{
                tickSize: 5,
                tickPadding: 5,
                tickRotation: 0,
                legend: '구독료 (원)',
                legendPosition: 'middle',
                legendOffset: -42,
                tickColor: '#000000',
                tickTextColor: '#000000',
                tickValues: [0, 2000, 4000, 6000, 8000],
              }}
              labelSkipWidth={12}
              labelSkipHeight={12}
              labelTextColor="#000000"
              isInteractive={false}
              theme={{
                fontSize: 14,
              }}
            />
          </div>
        </div>
        <div className="plat-graphContainer">
          <div className="plat-pieGraph">
            <div className="plat-subtitle">OTT 플랫폼별 컨텐츠 양</div>
            <ResponsivePie
              data={contentData.map(d => ({ id: d.platform, label: d.platform, value: d.content }))}
              margin={{ top: 20, right: 20, bottom: 40, left: 100 }} 
              innerRadius={0.5}
              padAngle={0.7}
              cornerRadius={0}
              colors={['#FBB4AE', '#CCEBC5', '#B3CDE3', '#DECBE4']}
              borderWidth={1}
              borderColor={{ from: 'color', modifiers: [['darker', 0.0]] }}
              enableRadialLabels={false}
              enableSliceLabels={false}
              enableArcLabels={true} 
              enableArcLinkLabels={false} 
              legends={[
                {
                  anchor: 'left',
                  direction: 'column',
                  translateX: -80,
                  translateY: 0,
                  itemsSpacing: 0,
                  itemWidth: 100,
                  itemHeight: 20,
                  itemTextColor: '#000000',
                  symbolSize: 12,
                  symbolShape: 'circle'
                },
                {
                  anchor: 'bottom',
                  direction: 'row',
                  translateX: 0,
                  translateY: 30,
                  itemsSpacing: 0,
                  itemWidth: 80,
                  itemHeight: 20,
                  itemTextColor: '#000000',
                  symbolSize: 12,
                  symbolShape: 'circle',
                  data: [
                    { id: '단위', label: '단위: 개', color: '#000000' },
                  ],
                },
              ]}
              theme={{
                fontSize: 14,
              }}
            />
          </div>
        </div>

        {/* 플랫폼 버튼에 따른 그래프들 */}
        <div className="plat-platformQuestion">
          <h2>
          {selectedPlatform
            ? <><span className="highlighted-text">{selectedPlatform}</span>, 나랑 맞을까?</>
            : '나에게 맞는 OTT 플랫폼 찾아보기'}
          </h2>
          <div className="plat-platformButtons">
          {['넷플릭스', '왓챠', '디즈니플러스', '웨이브'].map(platform => (
        <button
          key={platform}
          className="plat-platformButton"
          onClick={() => handlePlatformSelect(platform)}
        >
          {platform}
        </button>
      ))}
      </div>
</div>

{selectedPlatform && genreData[selectedPlatform] && (
  <div className="plat-graphContainer">
    <div className="plat-pieGraph"> 
      <div className="plat-subtitle">{selectedPlatform} 장르별 컨텐츠 양</div>
      <ResponsivePie
        data={genreData[selectedPlatform].map(d => ({ id: d.genre, label: d.genre, value: d.count }))}
        margin={{ top: 20, right: 20, bottom: 40, left: 100 }} 
        innerRadius={0.5}
        padAngle={0.7}
        cornerRadius={0}
        colors={['#B3CDE3', '#CCEBC5', '#DECBE4', '#E5D8BD', '#FBB4AE', '#FED9A6', '#FFFFCC']}
        borderWidth={1}
        borderColor={{ from: 'color', modifiers: [['darker', 0.0]] }}
        enableRadialLabels={false}
        enableSliceLabels={false}
        enableArcLabels={true} 
        enableArcLinkLabels={false} 
        legends={[
          {
            anchor: 'left', 
            direction: 'column',
            translateX: -80,
            translateY: 0,
            itemsSpacing: 0,
            itemWidth: 100,
            itemHeight: 20,
            itemTextColor: '#000000',
            symbolSize: 12,
            symbolShape: 'circle'
          },
          {
            anchor: 'bottom',
            direction: 'row',
            translateX: 0,
            translateY: 30,
            itemsSpacing: 0,
            itemWidth: 80,
            itemHeight: 18,
            itemTextColor: '#000000',
            symbolSize: 12,
            symbolShape: 'circle',
            data: [
              { id: '단위', label: '단위: 개', color: '#000000' },
            ],
          }
        ]}
        theme={{
          fontSize: 14,
        }}
      />
    </div>
  </div>
)}

      </div>
    </div>
  );
};

export default PlatRecom;
