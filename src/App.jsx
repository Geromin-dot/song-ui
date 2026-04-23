import { useEffect, useState } from 'react';
import { getSongs, deleteSong, postSong } from './services/api';
import './App.css';
import {
  Heart,
  Share2,
  SkipBack,
  SkipForward,
  Play,
  Pause,
  Trash2,
  Plus,
  Music
} from 'lucide-react';

function App() {
  const [songs, setSongs] = useState([]);
  const [selectedSong, setSelectedSong] = useState(null);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    title: '',
    artist: '',
    album: '',
    genre: '',
    url: ''
  });

  // GET: Fetch songs on mount
  useEffect(() => {
    fetchSongs();
  }, []);

  const fetchSongs = () => {
    getSongs()
      .then(data => {
        setSongs(data);
        if (data.length > 0 && !selectedSong) {
          setSelectedSong(data[0]);
          setSelectedIndex(0);
        }
      })
      .catch(err => console.error(err));
  };

  // Handle song selection
  const handleSelectSong = (song, index) => {
    setSelectedSong(song);
    setSelectedIndex(index);
    setIsPlaying(true);
  };


  // Delete song
  const handleDeleteSong = (e, id, index) => {
    e.stopPropagation();
    if (window.confirm('Are you sure you want to delete this song?')) {
      deleteSong(id)
        .then(() => {
          const newSongs = songs.filter(song => song.id !== id);
          setSongs(newSongs);

          if (selectedIndex === index) {
            if (newSongs.length > 0) {
              const nextIndex = Math.min(index, newSongs.length - 1);
              setSelectedSong(newSongs[nextIndex]);
              setSelectedIndex(nextIndex);
            } else {
              setSelectedSong(null);
              setSelectedIndex(0);
            }
          } else if (selectedIndex > index) {
            setSelectedIndex(selectedIndex - 1);
          }
        })
        .catch(err => {
          console.error(err);
          alert('Failed to delete song');
        });
    }
  };

  // Add Song logic
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleAddSong = (e) => {
    e.preventDefault();

    // Simple validation
    if (!formData.title || !formData.url) {
      alert('Title and YouTube URL are required');
      return;
    }

    // Prepare data
    const newSong = {
      ...formData
    };

    postSong(newSong)
      .then(() => {
        setIsModalOpen(false);
        setFormData({ title: '', artist: '', album: '', genre: '', url: '' });
        fetchSongs(); // Refresh list
      })
      .catch(err => {
        console.error(err);
        alert(err.message); // Show the specific error from the API
      });
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
                    <Music size={80} />
                    <p>No YouTube URL available</p>
                  </div>
                )}
              </div>

              {/* Song Details */}
              <div className="song-details">
                <div className="details-left">
                  <h1>{selectedSong.title}</h1>
                  <p className="artist">{selectedSong.artist || 'Unknown Artist'}</p>
                </div>
                <div className="details-right">
                  <div className="stat-item" title="Likes">
                    <span className="stat-icon"><Heart size={18} /></span>
                    <span className="stat-value">
                      {selectedSong.likes || (Math.floor(Math.random() * 5000) + 1000).toLocaleString()}
                    </span>
                  </div>
                  <div className="stat-item" title="Shares">
                    <span className="stat-icon"><Share2 size={18} /></span>
                    <span className="stat-value">
                      {selectedSong.shares || (Math.floor(Math.random() * 1000) + 100).toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>

              {/* Playback Controls */}
              <div className="controls">
                <button
                  className="control-btn prev-btn"
                  onClick={handlePrevious}
                  disabled={selectedIndex === 0}
                  title="Previous"
                >
                  <SkipBack size={24} fill="currentColor" />
                </button>
                <button
                  className="control-btn play-btn"
                  onClick={handlePlayPause}
                  title={isPlaying ? "Pause" : "Play"}
                >
                  {isPlaying ? (
                    <Pause size={32} fill="currentColor" />
                  ) : (
                    <Play size={32} fill="currentColor" style={{ marginLeft: '4px' }} />
                  )}
                </button>
                <button
                  className="control-btn next-btn"
                  onClick={handleNext}
                  disabled={selectedIndex === songs.length - 1}
                  title="Next"
                >
                  <SkipForward size={24} fill="currentColor" />
                </button>
              </div>
            </>
          ) : (
            <div className="no-songs">No songs available</div>
          )}
        </div>

        {/* Sidebar with Song List */}
        <div className="sidebar">
          <div className="sidebar-header">
            <h2>Up Next</h2>
            <button className="add-song-main-btn" onClick={() => setIsModalOpen(true)}>
              <Plus size={18} style={{ marginRight: '4px' }} /> Add Song
            </button>
          </div>

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
                      <Music size={24} />
                    )}
                  </div>
                  <div className="song-info">
                    <p className="song-title">{song.title}</p>
                    <p className="song-artist">{song.artist || 'Unknown'}</p>
                  </div>
                  <button
                    className="delete-song-btn"
                    onClick={(e) => handleDeleteSong(e, song.id, index)}
                    title="Delete song"
                  >
                    <Trash2 size={18} />
                  </button>
                </li>
              );
            })}
          </ul>
        </div>
      </div>

      {/* Add Song Modal */}
      {isModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3>Add New Song</h3>
            <form onSubmit={handleAddSong}>
              <div className="form-group">
                <label>Title</label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  placeholder="e.g. Ligaya"
                  required
                />
              </div>
              <div className="form-group">
                <label>Artist</label>
                <input
                  type="text"
                  name="artist"
                  value={formData.artist}
                  onChange={handleInputChange}
                  placeholder="e.g. Eraserheads"
                />
              </div>
              <div className="form-group">
                <label>Album</label>
                <input
                  type="text"
                  name="album"
                  value={formData.album}
                  onChange={handleInputChange}
                  placeholder="e.g. Ultraelectromagneticpop!"
                />
              </div>
              <div className="form-group">
                <label>Genre</label>
                <input
                  type="text"
                  name="genre"
                  value={formData.genre}
                  onChange={handleInputChange}
                  placeholder="e.g. OPM"
                />
              </div>
              <div className="form-group">
                <label>YouTube URL</label>
                <input
                  type="text"
                  name="url"
                  value={formData.url}
                  onChange={handleInputChange}
                  placeholder="https://youtu.be/..."
                  required
                />
              </div>
              <div className="modal-actions">
                <button type="button" className="cancel-btn" onClick={() => setIsModalOpen(false)}>
                  Cancel
                </button>
                <button type="submit" className="submit-btn">
                  Add Track
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;