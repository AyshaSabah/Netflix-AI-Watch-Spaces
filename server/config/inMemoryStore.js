import bcrypt from 'bcryptjs';

// Pre-seeded high quality movies with valid HTML5 video streaming URLs
export const initialMovies = [
  {
    id: 'movie-1',
    _id: 'movie-1',
    title: 'Big Buck Bunny',
    description: 'A large, gentle rabbit is tormented by bully forest creatures until he decides to take vengeance with ingenious traps in a lush woodland setting.',
    genre: 'Animation / Comedy',
    duration: '9m 56s',
    thumbnailUrl: 'https://upload.wikimedia.org/wikipedia/commons/c/c5/Big_buck_bunny_poster_big.jpg',
    videoUrl: 'https://media.w3.org/2010/05/bunny/trailer.mp4',
    releaseYear: 2008,
    rating: 'PG',
    director: 'Sacha Goedegebure',
    cast: ['Bunny', 'Frank (Flying Squirrel)', 'Rinky', 'Gimera'],
    timelineTrivia: [
      {
        timestamp: 10,
        timeFormatted: '00:10',
        title: 'Open Source Animation Milestone',
        trivia: 'Big Buck Bunny was produced entirely using free software, primarily the Blender open-source 3D suite.',
        category: 'Behind the Scenes'
      },
      {
        timestamp: 30,
        timeFormatted: '00:30',
        title: 'The Awakening',
        trivia: 'The giant rabbit Bunny wakes up to discover a tranquil morning before the mischievous forest trio disrupts his peace.',
        category: 'Trivia'
      },
      {
        timestamp: 60,
        timeFormatted: '01:00',
        title: 'Sound Design & Orchestration',
        trivia: 'The entire orchestral score was recorded with live instruments by composer Jan Morgenstern.',
        category: 'Behind the Scenes'
      },
      {
        timestamp: 120,
        timeFormatted: '02:00',
        title: 'The Bully Squad Appears',
        trivia: 'Frank the flying squirrel was modeled after classic Warner Bros slapstick cartoon villains.',
        category: 'Character Note'
      },
      {
        timestamp: 180,
        timeFormatted: '03:00',
        title: 'Ingenious Traps',
        trivia: 'Bunny builds elaborate Rube Goldberg traps to outsmart the bullies without causing permanent harm.',
        category: 'Plot Hint'
      }
    ]
  },
  {
    id: 'movie-2',
    _id: 'movie-2',
    title: 'Tears of Steel',
    description: 'In a dystopian future, a group of scientists and cybernetic warriors gather in Amsterdam to alter a devastating apocalyptic timeline involving robotics.',
    genre: 'Sci-Fi / Action',
    duration: '12m 14s',
    thumbnailUrl: 'https://upload.wikimedia.org/wikipedia/commons/7/70/Tos-poster.png',
    videoUrl: 'https://vjs.zencdn.net/v/oceans.mp4',
    releaseYear: 2012,
    rating: 'PG-13',
    director: 'Ian Hubert',
    cast: ['Derek de Lint', 'Sergio Hasselbaink', 'Rogier Schippers', 'Vanja Rukavina'],
    timelineTrivia: [
      {
        timestamp: 15,
        timeFormatted: '00:15',
        title: 'Oude Kerk Setting',
        trivia: 'The opening tracking shot shows the famous Oude Kerk church in Amsterdam retrofitted as a futuristic command post.',
        category: 'Trivia'
      },
      {
        timestamp: 45,
        timeFormatted: '00:45',
        title: 'VFX Tracking Markers',
        trivia: 'Green tracking markers were physically attached to historical landmarks during filming in the Netherlands.',
        category: 'Behind the Scenes'
      },
      {
        timestamp: 95,
        timeFormatted: '01:35',
        title: 'Celia’s Robotic Hand',
        trivia: 'The mechanical prosthetics were 3D modeled using real anatomical scan references.',
        category: 'Character Note'
      },
      {
        timestamp: 150,
        timeFormatted: '02:30',
        title: 'Memory Time Capsule',
        trivia: 'The central device projects past holographic memories into the present space to rewrite emotional history.',
        category: 'Plot Hint'
      }
    ]
  },
  {
    id: 'movie-3',
    _id: 'movie-3',
    title: 'Sintel',
    description: 'A lonely young warrior woman searches relentlessly across dangerous frozen mountains and treacherous ruins for her lost companion, a baby dragon.',
    genre: 'Fantasy / Adventure',
    duration: '14m 48s',
    thumbnailUrl: 'https://upload.wikimedia.org/wikipedia/commons/8/8f/Sintel_poster.jpg',
    videoUrl: 'https://media.w3.org/2010/05/sintel/trailer.mp4',
    releaseYear: 2010,
    rating: 'PG-13',
    director: 'Colin Levy',
    cast: ['Halina Reijn', 'Thom Hoffman'],
    timelineTrivia: [
      {
        timestamp: 20,
        timeFormatted: '00:20',
        title: 'Snow & Cloth Simulation',
        trivia: 'Sintel pioneered a brand new cloth and procedural snow simulation system in Blender.',
        category: 'Behind the Scenes'
      },
      {
        timestamp: 60,
        timeFormatted: '01:00',
        title: 'Scales the Baby Dragon',
        trivia: 'Scales was designed to evoke the innocence of an injured bird mixed with a reptilian mythical beast.',
        category: 'Character Note'
      },
      {
        timestamp: 130,
        timeFormatted: '02:10',
        title: 'The Golden Desert Ruins',
        trivia: 'The ancient desert city architecture was inspired by Petra in Jordan and ancient Babylonian arches.',
        category: 'Trivia'
      }
    ]
  },
  {
    id: 'movie-4',
    _id: 'movie-4',
    title: 'Elephants Dream',
    description: 'Two travelers journey through the infinite, shifting mechanical guts of a surreal, living steam-punk machine while questioning the fabric of reality.',
    genre: 'Sci-Fi / Cyberpunk',
    duration: '10m 54s',
    thumbnailUrl: 'https://upload.wikimedia.org/wikipedia/commons/0/0c/ElephantsDreamPoster.jpg',
    videoUrl: 'https://media.w3.org/2010/05/video/movie_300.mp4',
    releaseYear: 2006,
    rating: 'PG',
    director: 'Bassam Kurdali',
    cast: ['Tygo Gernandt', 'Cas Jansen'],
    timelineTrivia: [
      {
        timestamp: 15,
        timeFormatted: '00:15',
        title: 'World First Open Movie',
        trivia: 'This was the world’s very first open-source 3D animated film ever produced by a distributed global community.',
        category: 'Trivia'
      },
      {
        timestamp: 50,
        timeFormatted: '00:50',
        title: 'Proog & Emo',
        trivia: 'The two characters represent contrasting views of reality: elderly guide Proog believes in the machine, youth Emo is skeptical.',
        category: 'Character Note'
      }
    ]
  },
  {
    id: 'movie-5',
    _id: 'movie-5',
    title: 'Cosmic Horizons',
    description: 'A visual celebration of sweeping terrestrial landscapes, ocean horizons, and starry twilight expeditions exploring the quiet beauty of the wild.',
    genre: 'Documentary / Nature',
    duration: '8m 20s',
    thumbnailUrl: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=1000&auto=format&fit=crop&q=80',
    videoUrl: 'https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4',
    releaseYear: 2023,
    rating: 'G',
    director: 'Aurora Film Collective',
    cast: ['Narrator', 'Field Explorers'],
    timelineTrivia: [
      {
        timestamp: 15,
        timeFormatted: '00:15',
        title: 'Ultra-High Dynamic Range',
        trivia: 'Captured using special wide-gamut lenses across the Pacific Northwest and coastal dunes.',
        category: 'Behind the Scenes'
      },
      {
        timestamp: 45,
        timeFormatted: '00:45',
        title: 'Bioluminescence Phenomenon',
        trivia: 'The faint glow along the waves in nocturnal shots is caused by billions of dinoflagellate algae.',
        category: 'Trivia'
      }
    ]
  }
];

// In-Memory Database store for reliable fallback and zero-configuration development
class InMemoryDatabase {
  constructor() {
    this.movies = [...initialMovies];
    this.users = [
      {
        _id: 'user-demo-1',
        id: 'user-demo-1',
        name: 'Alex Rivera',
        email: 'alex@netflixspaces.com',
        // 'password123' hashed with bcrypt
        password: bcrypt.hashSync('password123', 10),
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80',
        createdAt: new Date(),
      },
      {
        _id: 'user-demo-2',
        id: 'user-demo-2',
        name: 'Jordan Lee',
        email: 'jordan@netflixspaces.com',
        password: bcrypt.hashSync('password123', 10),
        avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80',
        createdAt: new Date(),
      }
    ];

    this.rooms = [
      {
        roomId: 'BUNNY-9482',
        name: 'Weekend Bunny Party 🍿',
        movieId: 'movie-1',
        movieTitle: 'Big Buck Bunny',
        movieThumbnail: 'https://upload.wikimedia.org/wikipedia/commons/c/c5/Big_buck_bunny_poster_big.jpg',
        videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
        hostId: 'user-demo-1',
        hostName: 'Alex Rivera',
        isPlaying: false,
        currentTime: 30,
        activeUsersCount: 2,
        createdAt: new Date(),
      },
      {
        roomId: 'CYBER-4105',
        name: 'Sci-Fi Night: Tears of Steel',
        movieId: 'movie-2',
        movieTitle: 'Tears of Steel',
        movieThumbnail: 'https://upload.wikimedia.org/wikipedia/commons/7/70/Tos-poster.png',
        videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4',
        hostId: 'user-demo-2',
        hostName: 'Jordan Lee',
        isPlaying: false,
        currentTime: 0,
        activeUsersCount: 1,
        createdAt: new Date(),
      }
    ];

    this.messages = [
      {
        id: 'msg-1',
        roomId: 'BUNNY-9482',
        userId: 'user-demo-1',
        userName: 'Alex Rivera',
        userAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80',
        message: 'Welcome everyone to the watch party! Hit play when ready! 🍿',
        isSystem: false,
        timestamp: '08:00 PM',
        createdAt: new Date(Date.now() - 300000),
      },
      {
        id: 'msg-2',
        roomId: 'BUNNY-9482',
        userId: 'user-demo-2',
        userName: 'Jordan Lee',
        userAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80',
        message: 'Hey Alex! Just joined. Loved the intro animation!',
        isSystem: false,
        timestamp: '08:02 PM',
        createdAt: new Date(Date.now() - 180000),
      }
    ];

    this.history = [
      {
        id: 'hist-1',
        userId: 'user-demo-1',
        movieId: 'movie-1',
        movieTitle: 'Big Buck Bunny',
        movieThumbnail: 'https://upload.wikimedia.org/wikipedia/commons/c/c5/Big_buck_bunny_poster_big.jpg',
        movieGenre: 'Animation / Comedy',
        progressSeconds: 185,
        durationSeconds: 596,
        lastWatchedAt: new Date(Date.now() - 3600000),
      },
      {
        id: 'hist-2',
        userId: 'user-demo-1',
        movieId: 'movie-2',
        movieTitle: 'Tears of Steel',
        movieThumbnail: 'https://upload.wikimedia.org/wikipedia/commons/7/70/Tos-poster.png',
        movieGenre: 'Sci-Fi / Action',
        progressSeconds: 420,
        durationSeconds: 734,
        lastWatchedAt: new Date(Date.now() - 86400000),
      }
    ];
  }

  // User Operations
  findUserByEmail(email) {
    return this.users.find(u => u.email.toLowerCase() === email.toLowerCase());
  }

  findUserById(id) {
    return this.users.find(u => u._id === id || u.id === id);
  }

  createUser(userData) {
    const newUser = {
      _id: 'user-' + Date.now(),
      id: 'user-' + Date.now(),
      name: userData.name,
      email: userData.email.toLowerCase(),
      password: userData.password,
      avatar: userData.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80',
      createdAt: new Date(),
    };
    this.users.push(newUser);
    return newUser;
  }

  // Movie Operations
  getAllMovies() {
    return this.movies;
  }

  getMovieById(id) {
    return this.movies.find(m => m.id === id || m._id === id);
  }

  // Room Operations
  getAllRooms() {
    return this.rooms;
  }

  getRoomById(roomId) {
    return this.rooms.find(r => r.roomId.toUpperCase() === roomId.toUpperCase());
  }

  createRoom(roomData) {
    const newRoom = {
      roomId: roomData.roomId || ('ROOM-' + Math.floor(1000 + Math.random() * 9000)),
      name: roomData.name || 'Watch Party',
      movieId: roomData.movieId,
      movieTitle: roomData.movieTitle,
      movieThumbnail: roomData.movieThumbnail,
      videoUrl: roomData.videoUrl,
      hostId: roomData.hostId,
      hostName: roomData.hostName,
      isPlaying: false,
      currentTime: 0,
      activeUsersCount: 1,
      createdAt: new Date(),
    };
    this.rooms.unshift(newRoom);
    return newRoom;
  }

  updateRoomState(roomId, updates) {
    const room = this.getRoomById(roomId);
    if (room) {
      Object.assign(room, updates);
      return room;
    }
    return null;
  }

  // Chat Operations
  getMessagesByRoom(roomId) {
    return this.messages.filter(m => m.roomId.toUpperCase() === roomId.toUpperCase());
  }

  addMessage(msgData) {
    const newMsg = {
      id: 'msg-' + Date.now() + '-' + Math.random().toString(36).substring(2, 7),
      roomId: msgData.roomId.toUpperCase(),
      userId: msgData.userId,
      userName: msgData.userName,
      userAvatar: msgData.userAvatar,
      message: msgData.message,
      isSystem: !!msgData.isSystem,
      timestamp: msgData.timestamp || new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      createdAt: new Date(),
    };
    this.messages.push(newMsg);
    // Keep max 200 messages in memory per room
    if (this.messages.length > 500) {
      this.messages = this.messages.slice(-300);
    }
    return newMsg;
  }

  // Watch History Operations
  getUserHistory(userId) {
    return this.history
      .filter(h => h.userId === userId)
      .sort((a, b) => new Date(b.lastWatchedAt).getTime() - new Date(a.lastWatchedAt).getTime());
  }

  updateWatchHistory(userId, historyData) {
    const existingIndex = this.history.findIndex(h => h.userId === userId && h.movieId === historyData.movieId);
    if (existingIndex >= 0) {
      this.history[existingIndex].progressSeconds = historyData.progressSeconds || this.history[existingIndex].progressSeconds;
      this.history[existingIndex].lastWatchedAt = new Date();
      return this.history[existingIndex];
    } else {
      const newEntry = {
        id: 'hist-' + Date.now(),
        userId,
        movieId: historyData.movieId,
        movieTitle: historyData.movieTitle,
        movieThumbnail: historyData.movieThumbnail,
        movieGenre: historyData.movieGenre || 'Movie',
        progressSeconds: historyData.progressSeconds || 0,
        durationSeconds: historyData.durationSeconds || 600,
        lastWatchedAt: new Date(),
      };
      this.history.unshift(newEntry);
      return newEntry;
    }
  }
}

export const inMemoryStore = new InMemoryDatabase();
