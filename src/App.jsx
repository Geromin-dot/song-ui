import { useEffect, useState } from 'react';
import { getSongs } from './services/api';
import './App.css';

function App() {
  const [songs, setSongs] = useState([]);
  const [selectedSong, setSelectedSong] = useState(null);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);

  // GET: Fetch songs on mount
  useEffect(() => {
    getSongs()
      .then(data => {
        setSongs(data);
        if (data.length > 0) {
          setSelectedSong(data[0]);
          setSelectedIndex(0);
        }
      })
      .catch(err => console.error(err));
  }, []);

  // Handle song selection
  const handleSelectSong = (song, index) => {
    setSelectedSong(song);
    setSelectedIndex(index);
    setIsPlaying(true);
  };

  // Previous button
  const handlePrevious = () => {
    if (selectedIndex > 0) {
      const newIndex = selectedIndex - 1;
      handleSelectSong(songs[newIndex], newIndex);
    }
  };

  // Next button
  const handleNext = () => {
    if (selectedIndex < songs.length - 1) {
      const newIndex = selectedIndex + 1;
      handleSelectSong(songs[newIndex], newIndex);
    }
  };

  // Toggle play/pause
  const handlePlayPause = () => {
    setIsPlaying(!isPlaying);
  };

  // Extract YouTube video ID from URL
  const getYouTubeVideoId = (url) => {
    if (!url) return null;
    let videoId = '';
    if (url.includes('youtube.com/watch?v=')) {
      videoId = url.split('v=')[1]?.split('&')[0];
    } else if (url.includes('youtu.be/')) {
      videoId = url.split('youtu.be/')[1]?.split('?')[0];
    }
    return videoId || null;
  };

  // Get YouTube embed URL
  const getYouTubeEmbedUrl = (url) => {
    const videoId = getYouTubeVideoId(url);
    return videoId ? `https://www.youtube.com/embed/${videoId}?autoplay=${isPlaying ? 1 : 0}` : null;
  };

  // Get YouTube thumbnail URL
  const getYouTubeThumbnail = (url) => {
    const videoId = getYouTubeVideoId(url);
    return videoId ? `https://img.youtube.com/vi/${videoId}/hqdefault.jpg` : null;
  };

  const embedUrl = selectedSong ? getYouTubeEmbedUrl(selectedSong.youtubeUrl || selectedSong.youtube_url || selectedSong.url) : null;

  return (
    <div className="app-container">
      <div className="main-content">
        {/* Main Player Section */}
        <div className="player-section">
          {selectedSong ? (
            <>
              {/* YouTube Player */}
              <div className="video-player">
                {embedUrl ? (
                  <iframe
                    width="100%"
                    height="100%"
                    src={embedUrl}
                    title={selectedSong.title}
                    frameBorder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  ></iframe>
                ) : (
                  <div className="player-placeholder">
                    <span>♫</span>
                    <p>No YouTube URL available</p>
                  </div>
                )}
              </div>

              {/* Song Details */}
              <div className="song-details">
                <h1>{selectedSong.title}</h1>
                <p className="artist">{selectedSong.artist || 'Unknown Artist'}</p>
              </div>

              {/* Playback Controls */}
              <div className="controls">
                <button 
                  className="control-btn prev-btn" 
                  onClick={handlePrevious}
                  disabled={selectedIndex === 0}
                  title="Previous"
                >
                  ⏮
                </button>
                <button 
                  className="control-btn play-btn" 
                  onClick={handlePlayPause}
                  title={isPlaying ? "Pause" : "Play"}
                >
                  {isPlaying ? '⏸' : '▶'}
                </button>
                <button 
                  className="control-btn next-btn" 
                  onClick={handleNext}
                  disabled={selectedIndex === songs.length - 1}
                  title="Next"
                >
                  ⏭
                </button>
              </div>
            </>
          ) : (
            <div className="no-songs">No songs available</div>
          )}
        </div>

        {/* Sidebar with Song List */}
        <div className="sidebar">
          <h2>Up Next</h2>
          <ul className="song-list">
            {songs.map((song, index) => {
              const thumbnailUrl = getYouTubeThumbnail(song.youtubeUrl || song.youtube_url || song.url);
              return (
                <li
                  key={song.id}
                  className={`song-item ${selectedIndex === index ? 'active' : ''}`}
                  onClick={() => handleSelectSong(song, index)}
                >
                  <div className="song-thumbnail">
                    {thumbnailUrl ? (
                      <img src={thumbnailUrl} alt={song.title} />
                    ) : (
                      <span>♫</span>
                    )}
                  </div>
                  <div className="song-info">
                    <p className="song-title">{song.title}</p>
                    <p className="song-artist">{song.artist || 'Unknown'}</p>
                  </div>
                </li>
              );
            })}
          </ul>
        </div>
      </div>
    </div>
  );
}

export default App;