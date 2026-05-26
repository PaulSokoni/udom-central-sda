import { useEffect, useRef, useState, useCallback } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import api from '../api';
import { useAuth } from '../AuthContext';
import toast from 'react-hot-toast';

// Fix default leaflet marker icons (broken in Vite builds)
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

const activeIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41], iconAnchor: [12, 41], popupAnchor: [1, -34], shadowSize: [41, 41],
});

const myIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41], iconAnchor: [12, 41], popupAnchor: [1, -34], shadowSize: [41, 41],
});

function FitBounds({ members }) {
  const map = useMap();
  useEffect(() => {
    if (members.length > 0) {
      const bounds = members.map(m => [parseFloat(m.latitude), parseFloat(m.longitude)]);
      map.fitBounds(bounds, { padding: [50, 50] });
    }
  }, [members.length]);
  return null;
}

function timeAgo(dateStr) {
  if (!dateStr) return 'Never';
  const diff = Math.floor((Date.now() - new Date(dateStr)) / 1000);
  if (diff < 60) return `${diff}s ago`;
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}

export default function LocationMap() {
  const { user } = useAuth();
  const [members, setMembers] = useState([]);
  const [myMember, setMyMember] = useState(null);
  const [sharing, setSharing] = useState(false);
  const [myCoords, setMyCoords] = useState(null);
  const [loading, setLoading] = useState(false);
  const [lastRefresh, setLastRefresh] = useState(null);
  const [selectedId, setSelectedId] = useState(null);
  const watchIdRef = useRef(null);
  const intervalRef = useRef(null);

  // Default center: Dodoma, Tanzania (where UDOM is located)
  const CENTER = [-6.1722, 35.7395];

  const fetchLocations = useCallback(() => {
    api.get('/members/locations/').then(r => {
      setMembers(r.data);
      setLastRefresh(new Date());
    });
  }, []);

  // Load my member profile if I have one linked
  useEffect(() => {
    if (!user?.is_staff) {
      api.get('/auth/me/').then(() => {
        // Check if this user has a member profile
        api.get('/members/?page_size=500').then(r => {
          const list = r.data.results || r.data;
          // The backend links user → member via user field
          // We detect by calling my_location which errors if no profile
        }).catch(() => {});
      });
    }
  }, [user]);

  // Auto-refresh locations every 30 seconds
  useEffect(() => {
    fetchLocations();
    intervalRef.current = setInterval(fetchLocations, 30000);
    return () => clearInterval(intervalRef.current);
  }, [fetchLocations]);

  const startSharing = () => {
    if (!navigator.geolocation) {
      toast.error('Your browser does not support GPS location.');
      return;
    }
    setLoading(true);

    // Get initial position
    navigator.geolocation.getCurrentPosition(
      pos => {
        const { latitude, longitude } = pos.coords;
        pushLocation(latitude, longitude, true);
        setMyCoords({ lat: latitude, lng: longitude });
        setSharing(true);
        setLoading(false);
        toast.success('Location sharing enabled. Your location is now visible on the map.');

        // Watch for continuous updates
        watchIdRef.current = navigator.geolocation.watchPosition(
          p => {
            pushLocation(p.coords.latitude, p.coords.longitude, true);
            setMyCoords({ lat: p.coords.latitude, lng: p.coords.longitude });
          },
          () => {},
          { enableHighAccuracy: true, maximumAge: 10000, timeout: 30000 }
        );
      },
      err => {
        setLoading(false);
        toast.error('Could not get location. Please allow location access in your browser.');
      },
      { enableHighAccuracy: true, timeout: 15000 }
    );
  };

  const stopSharing = () => {
    if (watchIdRef.current !== null) {
      navigator.geolocation.clearWatch(watchIdRef.current);
      watchIdRef.current = null;
    }
    pushLocation(null, null, false);
    setSharing(false);
    setMyCoords(null);
    toast('Location sharing disabled.');
  };

  const pushLocation = (lat, lng, sharingEnabled) => {
    const payload = { location_sharing: sharingEnabled };
    if (lat !== null) {
      payload.latitude = lat;
      payload.longitude = lng;
    }
    api.patch('/members/my_location/', payload).catch(() => {});
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (watchIdRef.current !== null) navigator.geolocation.clearWatch(watchIdRef.current);
      clearInterval(intervalRef.current);
    };
  }, []);

  const STATUS_COLOR = { active: '#22c55e', inactive: '#f59e0b', transferred: '#3b82f6', deceased: '#a855f7' };

  return (
    <div>
      <div className="flex items-center justify-between mb-5">
        <h2 className="text-xl font-bold">
          📍 Real-Time Member Locations
          <span className="ml-2 text-sm font-normal text-gray-400">
            {members.length} member{members.length !== 1 ? 's' : ''} sharing
          </span>
        </h2>
        <div className="flex items-center gap-3">
          {lastRefresh && (
            <span className="text-xs text-gray-400">
              Refreshes every 30s · Last: {lastRefresh.toLocaleTimeString()}
            </span>
          )}
          <button onClick={fetchLocations} className="btn btn-outline btn-sm">↻ Refresh Now</button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-5">
        {/* Map */}
        <div className="lg:col-span-3 card overflow-hidden" style={{ height: '580px' }}>
          <MapContainer
            center={CENTER}
            zoom={10}
            style={{ height: '100%', width: '100%' }}
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            {members.map(m => (
              <Marker
                key={m.id}
                position={[parseFloat(m.latitude), parseFloat(m.longitude)]}
                icon={m.id === selectedId ? myIcon : activeIcon}
                eventHandlers={{ click: () => setSelectedId(m.id) }}
              >
                <Popup>
                  <div style={{ minWidth: 180 }}>
                    <div style={{ fontWeight: 700, fontSize: 14 }}>{m.full_name}</div>
                    <div style={{ color: '#666', fontSize: 12 }}>{m.member_id}</div>
                    {m.location_name && (
                      <div style={{ marginTop: 4, fontSize: 12, color: '#444' }}>📍 {m.location_name}</div>
                    )}
                    <div style={{ marginTop: 4, fontSize: 11, color: '#999' }}>
                      Updated: {timeAgo(m.location_updated_at)}
                    </div>
                    <div style={{ marginTop: 4, fontSize: 11, color: '#999' }}>
                      {parseFloat(m.latitude).toFixed(5)}, {parseFloat(m.longitude).toFixed(5)}
                    </div>
                  </div>
                </Popup>
              </Marker>
            ))}
            {members.length > 0 && <FitBounds members={members} />}
          </MapContainer>
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          {/* My Location Controls */}
          {!user?.is_staff && (
            <div className="card">
              <div className="card-header"><h3 className="text-sm font-semibold">My Location</h3></div>
              <div className="card-body">
                {sharing ? (
                  <>
                    <div className="flex items-center gap-2 mb-3">
                      <span className="w-2.5 h-2.5 rounded-full bg-green-500 animate-pulse inline-block"></span>
                      <span className="text-sm text-green-700 font-medium">Sharing live</span>
                    </div>
                    {myCoords && (
                      <p className="text-xs text-gray-400 mb-3">
                        {myCoords.lat.toFixed(5)}, {myCoords.lng.toFixed(5)}
                      </p>
                    )}
                    <button onClick={stopSharing} className="btn btn-danger w-full justify-center btn-sm">
                      ✕ Stop Sharing
                    </button>
                  </>
                ) : (
                  <>
                    <p className="text-xs text-gray-500 mb-3">
                      Share your GPS location so the admin can see where you are on the map.
                    </p>
                    <button
                      onClick={startSharing}
                      disabled={loading}
                      className="btn btn-success w-full justify-center btn-sm"
                    >
                      {loading ? '📡 Getting GPS…' : '📍 Share My Location'}
                    </button>
                  </>
                )}
              </div>
            </div>
          )}

          {/* Members List */}
          <div className="card">
            <div className="card-header">
              <h3 className="text-sm font-semibold">Active on Map ({members.length})</h3>
            </div>
            <div className="overflow-y-auto" style={{ maxHeight: 420 }}>
              {members.length ? members.map(m => (
                <div
                  key={m.id}
                  onClick={() => setSelectedId(m.id)}
                  className={`px-4 py-3 border-b border-gray-100 cursor-pointer hover:bg-gray-50 transition-colors ${selectedId === m.id ? 'bg-blue-50 border-l-4 border-blue-500' : ''}`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium text-sm">{m.full_name}</div>
                      <div className="text-xs text-gray-400">{m.member_id}</div>
                    </div>
                    <div className="text-right">
                      <div
                        className="w-2 h-2 rounded-full inline-block"
                        style={{ background: STATUS_COLOR[m.membership_status] || '#999' }}
                      />
                    </div>
                  </div>
                  {m.location_name && (
                    <div className="text-xs text-gray-500 mt-1 truncate">📍 {m.location_name}</div>
                  )}
                  <div className="text-xs text-gray-400 mt-0.5">{timeAgo(m.location_updated_at)}</div>
                </div>
              )) : (
                <div className="px-4 py-8 text-center text-gray-400 text-sm">
                  No members sharing location yet.
                </div>
              )}
            </div>
          </div>

          {/* Legend */}
          <div className="card">
            <div className="card-header"><h3 className="text-sm font-semibold">Legend</h3></div>
            <div className="card-body space-y-2 text-xs text-gray-600">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-green-500 inline-block"></span> Active member
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-amber-500 inline-block"></span> Inactive member
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-blue-500 inline-block"></span> Transferred
              </div>
              <div className="flex items-center gap-2 mt-2 pt-2 border-t border-gray-100">
                <span className="animate-pulse w-2 h-2 rounded-full bg-green-500 inline-block"></span>
                Map auto-refreshes every 30 seconds
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
