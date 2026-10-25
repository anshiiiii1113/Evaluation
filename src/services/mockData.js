/**
 * StreamScout Offline / Campus Fallback Dataset
 * Used automatically when TMDB is unreachable (e.g. ISP DNS block, campus Wi-Fi firewall,
 * airplane mode, or API rate-limit). Guarantees that StreamScout always displays a rich,
 * interactive, responsive experience instead of blank silhouette placeholders.
 */

const BACKDROP_FALLBACK = 'https://images.unsplash.com/photo-1517604931442-7e0c8ed2963c?w=1600&auto=format&fit=crop&q=80';
const POSTER_FALLBACK = 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=500&auto=format&fit=crop&q=80';

export const MOCK_TRENDING = [
  {
    id: 693134,
    title: 'Dune: Part Two',
    overview: 'Follow the mythic journey of Paul Atreides as he unites with Chani and the Fremen while on a path of revenge against the conspirators who destroyed his family.',
    poster_path: '/1pdfLvkbY9ohJlCjQH2CZjjYVvJ.jpg',
    backdrop_path: '/xOMo8BRK7PfcJv9JCnx7s520DRq.jpg',
    media_type: 'movie',
    vote_average: 8.3,
    release_date: '2024-03-01',
    genre_ids: [878, 12]
  },
  {
    id: 66732,
    name: 'Stranger Things',
    overview: 'When a young boy vanishes, a small town uncovers a mystery involving secret experiments, terrifying supernatural forces and one strange little girl.',
    poster_path: '/49WJfeN0moxb9IPfGn8AIqMGskD.jpg',
    backdrop_path: '/56v2KjBlU4XaOv9rVYEQypROD7P.jpg',
    media_type: 'tv',
    vote_average: 8.6,
    first_air_date: '2016-07-15',
    genre_ids: [10765, 9648, 18]
  },
  {
    id: 872585,
    title: 'Oppenheimer',
    overview: 'The story of J. Robert Oppenheimer’s role in the development of the atomic bomb during World War II.',
    poster_path: '/8Gxv8gSFCU0XGDykEGv7zR1n2ua.jpg',
    backdrop_path: '/fm6KqXpk3M2HVveHwCrBSSBaO0V.jpg',
    media_type: 'movie',
    vote_average: 8.1,
    release_date: '2023-07-21',
    genre_ids: [18, 36]
  },
  {
    id: 94605,
    name: 'Arcane',
    overview: 'Amid the stark discord of twin cities Piltover and Zaun, two sisters fight on rival sides of a war between magic technologies and incompatible convictions.',
    poster_path: '/fqldf2t8ztc9aiwn3k6mlX3tvRT.jpg',
    backdrop_path: '/rkB4LyZHo1NHXFEDHl9vSD9r1lW.jpg',
    media_type: 'tv',
    vote_average: 8.7,
    first_air_date: '2021-11-06',
    genre_ids: [16, 10765, 10759]
  },
  {
    id: 157336,
    title: 'Interstellar',
    overview: 'The adventures of a group of explorers who make use of a newly discovered wormhole to surpass the limitations on human space travel and conquer the vast distances involved in an interstellar voyage.',
    poster_path: '/gEU2QniE6E77NI6lCU6MxlNBvIx.jpg',
    backdrop_path: '/xJHokMbljvjADYdit5fK5VQsXEG.jpg',
    media_type: 'movie',
    vote_average: 8.4,
    release_date: '2014-11-05',
    genre_ids: [12, 18, 878]
  },
  {
    id: 100088,
    name: 'The Last of Us',
    overview: 'Twenty years after modern civilization has been destroyed, Joel, a hardened survivor, is hired to smuggle Ellie, a 14-year-old girl, out of an oppressive quarantine zone.',
    poster_path: '/uKvVjHNqB5VmOrdxqAt2V7JMrRI.jpg',
    backdrop_path: '/9ha9u10JqXvNq4o4lU2Qe8C6TfA.jpg',
    media_type: 'tv',
    vote_average: 8.6,
    first_air_date: '2023-01-15',
    genre_ids: [18, 10759]
  }
];

export const MOCK_NEW_RELEASES = [
  {
    id: 693134,
    title: 'Dune: Part Two',
    overview: 'Paul Atreides unites with Chani and the Fremen on a warpath of revenge.',
    poster_path: '/1pdfLvkbY9ohJlCjQH2CZjjYVvJ.jpg',
    backdrop_path: '/xOMo8BRK7PfcJv9JCnx7s520DRq.jpg',
    media_type: 'movie',
    vote_average: 8.3,
    release_date: '2024-03-01',
    genre_ids: [878, 12]
  },
  {
    id: 872585,
    title: 'Oppenheimer',
    overview: 'The story of J. Robert Oppenheimer and the Manhattan Project.',
    poster_path: '/8Gxv8gSFCU0XGDykEGv7zR1n2ua.jpg',
    backdrop_path: '/fm6KqXpk3M2HVveHwCrBSSBaO0V.jpg',
    media_type: 'movie',
    vote_average: 8.1,
    release_date: '2023-07-21',
    genre_ids: [18, 36]
  },
  {
    id: 929590,
    title: 'Civil War',
    overview: 'In the near future, a team of journalists travel across the United States during a rapidly escalating second American Civil War.',
    poster_path: '/sh7Rg8Er3tFcN9BpKIPOMvALgZd.jpg',
    backdrop_path: '/z12o5tq3vLAUMUOClQpDq8Rlka1.jpg',
    media_type: 'movie',
    vote_average: 7.0,
    release_date: '2024-04-12',
    genre_ids: [28, 18, 10752]
  },
  {
    id: 786892,
    title: 'Furiosa: A Mad Max Saga',
    overview: 'As the world fell, young Furiosa is snatched from the Green Place of Many Mothers into the hands of a great Biker Horde.',
    poster_path: '/iADOJ8Zymht2JPMoy3R7xUMZqaC.jpg',
    backdrop_path: '/wNAhuOZ3Zf84jCI5TeTVxDUMWi5.jpg',
    media_type: 'movie',
    vote_average: 7.6,
    release_date: '2024-05-24',
    genre_ids: [28, 12, 878]
  },
  {
    id: 414906,
    title: 'The Batman',
    overview: 'In his second year of fighting crime, Batman uncovers corruption in Gotham City that connects to his own family.',
    poster_path: '/74xTEgt7R36Fpooo50r9T25onhq.jpg',
    backdrop_path: '/tRS6jvPM9qPrrnx2KRx3ew96Yot.jpg',
    media_type: 'movie',
    vote_average: 7.7,
    release_date: '2022-03-04',
    genre_ids: [80, 9648, 53]
  }
];

export const MOCK_ACTION = [
  {
    id: 361743,
    title: 'Top Gun: Maverick',
    overview: 'After more than thirty years of service as an aviator, Pete Mitchell is where he belongs.',
    poster_path: '/62HCnUTziyWcpDaBO2i1DX17ljH.jpg',
    backdrop_path: '/odJ4hx6g6vBt4lBWKFD1tI8WS4x.jpg',
    media_type: 'movie',
    vote_average: 8.2,
    release_date: '2022-05-27',
    genre_ids: [28, 18]
  },
  {
    id: 603692,
    title: 'John Wick: Chapter 4',
    overview: 'With the price on his head ever increasing, John Wick uncovers a path to defeating The High Table.',
    poster_path: '/vZloFAK7NKnMGKEslUsZ2VoXVWd.jpg',
    backdrop_path: '/7I6VUdPj6tQECNHdviJkUHD2389.jpg',
    media_type: 'movie',
    vote_average: 7.7,
    release_date: '2023-03-24',
    genre_ids: [28, 53, 80]
  },
  {
    id: 155,
    title: 'The Dark Knight',
    overview: 'Batman raises the stakes in his war on crime with the help of Lt. Jim Gordon and DA Harvey Dent.',
    poster_path: '/qJ2tW6WMUDux911r6m7haRef0WH.jpg',
    backdrop_path: '/dqK9Hag1054tghRQSqLSfrkvQnA.jpg',
    media_type: 'movie',
    vote_average: 8.5,
    release_date: '2008-07-18',
    genre_ids: [18, 28, 80, 53]
  },
  {
    id: 569094,
    title: 'Spider-Man: Across the Spider-Verse',
    overview: 'Miles Morales catapults across the Multiverse, where he encounters a team of Spider-People.',
    poster_path: '/8Vt6mWEReuy4Of61Lnj5Xj704m8.jpg',
    backdrop_path: '/4HodYYKEIsGOdinkGi2Ucz6X9i0.jpg',
    media_type: 'movie',
    vote_average: 8.4,
    release_date: '2023-06-02',
    genre_ids: [16, 28, 12, 878]
  }
];

export const MOCK_COMEDY = [
  {
    id: 533535,
    title: 'Deadpool & Wolverine',
    overview: 'A listless Wade Wilson toils away in civilian life with his days as the morally flexible mercenary behind him.',
    poster_path: '/8cdWjvZQUExUUTzyp4t6EDMubfO.jpg',
    backdrop_path: '/yDHYTfA3R0jFYba16jBB1ef8oIt.jpg',
    media_type: 'movie',
    vote_average: 7.7,
    release_date: '2024-07-26',
    genre_ids: [28, 35, 878]
  },
  {
    id: 545611,
    title: 'Everything Everywhere All at Once',
    overview: 'An aging Chinese immigrant is swept up in an insane adventure across the multiverse.',
    poster_path: '/w3LxiVYPqrlexP07ApMlNVehSuh.jpg',
    backdrop_path: '/ss0Os3uW2QW85uvgM0ZgL41tVqZ.jpg',
    media_type: 'movie',
    vote_average: 7.8,
    release_date: '2022-03-25',
    genre_ids: [28, 12, 35, 878]
  },
  {
    id: 346698,
    title: 'Barbie',
    overview: 'To live in Barbie Land is to be a perfect being in a perfect place. Unless you have a full-on existential crisis.',
    poster_path: '/iuFNMS8U5cb6xfzi51Dbkovj7vM.jpg',
    backdrop_path: '/ctMserH8g2SeOAnCw5gFjd2NTL6.jpg',
    media_type: 'movie',
    vote_average: 7.1,
    release_date: '2023-07-21',
    genre_ids: [35, 12]
  },
  {
    id: 546554,
    title: 'Knives Out',
    overview: 'When renowned crime novelist Harlan Thrombey is found dead, the inquisitive Detective Benoit Blanc is enlisted to investigate.',
    poster_path: '/pThyQovXQrw2m0s9x82twj48Jq4.jpg',
    backdrop_path: '/Ab8mkHmkYADjU7wQiOkia9BzGvS.jpg',
    media_type: 'movie',
    vote_average: 7.9,
    release_date: '2019-11-27',
    genre_ids: [35, 9648, 80]
  }
];

export const MOCK_HORROR = [
  {
    id: 762441,
    title: 'A Quiet Place: Day One',
    overview: 'As New York City is invaded by alien creatures that hunt by sound, a young woman named Sam fights to survive.',
    poster_path: '/yrpPYKijwd9ur1jRIjg9YnMrSQW.jpg',
    backdrop_path: '/2RVcJbWFmICRDs7E8vIy90p8iwE.jpg',
    media_type: 'movie',
    vote_average: 6.8,
    release_date: '2024-06-28',
    genre_ids: [27, 878, 53]
  },
  {
    id: 1008042,
    title: 'Talk to Me',
    overview: 'When a group of friends discover how to conjure spirits using an embalmed hand, they become hooked on the new thrill.',
    poster_path: '/kdPMUMJzyYAc4roD52qavX0nUQ3.jpg',
    backdrop_path: '/4HodYYKEIsGOdinkGi2Ucz6X9i0.jpg',
    media_type: 'movie',
    vote_average: 7.2,
    release_date: '2023-07-28',
    genre_ids: [27, 53]
  },
  {
    id: 493922,
    title: 'Hereditary',
    overview: 'When Ellen, the matriarch of the Graham family, passes away, her daughter’s family begins to unravel cryptic and increasingly terrifying secrets.',
    poster_path: '/p9fmuz2Oj3HtEJn51fM9vN7G2zS.jpg',
    backdrop_path: '/qE54vF8K6t1M1O2M6s8bT8V1v8E.jpg',
    media_type: 'movie',
    vote_average: 7.3,
    release_date: '2018-06-08',
    genre_ids: [27, 9648, 53]
  }
];

export const MOCK_SCIFI = [
  {
    id: 157336,
    title: 'Interstellar',
    overview: 'A team of explorers travel through a wormhole in space in an attempt to ensure humanity’s survival.',
    poster_path: '/gEU2QniE6E77NI6lCU6MxlNBvIx.jpg',
    backdrop_path: '/xJHokMbljvjADYdit5fK5VQsXEG.jpg',
    media_type: 'movie',
    vote_average: 8.4,
    release_date: '2014-11-05',
    genre_ids: [12, 18, 878]
  },
  {
    id: 335984,
    title: 'Blade Runner 2049',
    overview: 'Thirty years after the events of the first film, a new Blade Runner unearths a long-buried secret.',
    poster_path: '/gajva2L0rPYkEWjzgFlBXCAVBE5.jpg',
    backdrop_path: '/sAtoMqDVhNDQBc3QJL3RF6hlxGq.jpg',
    media_type: 'movie',
    vote_average: 7.6,
    release_date: '2017-10-06',
    genre_ids: [878, 18, 9648]
  },
  {
    id: 27205,
    title: 'Inception',
    overview: 'Cobb, a skilled thief who commits corporate espionage by infiltrating the subconscious of his targets, is offered a chance to have his criminal history erased.',
    poster_path: '/oYuLEt3zVCKq57qu2F8dT7NIa6f.jpg',
    backdrop_path: '/8ZTVqvKDQ8emSGUEMjsS4yHAwrp.jpg',
    media_type: 'movie',
    vote_average: 8.4,
    release_date: '2010-07-16',
    genre_ids: [28, 878, 12]
  }
];

export const MOCK_SERIES = [
  {
    id: 66732,
    name: 'Stranger Things',
    overview: 'In Hawkins, Indiana, a young boy disappears and secret supernatural experiments are brought to light.',
    poster_path: '/49WJfeN0moxb9IPfGn8AIqMGskD.jpg',
    backdrop_path: '/56v2KjBlU4XaOv9rVYEQypROD7P.jpg',
    media_type: 'tv',
    vote_average: 8.6,
    first_air_date: '2016-07-15',
    genre_ids: [10765, 9648, 18]
  },
  {
    id: 94605,
    name: 'Arcane',
    overview: 'Amid the discord of twin cities Piltover and Zaun, two sisters fight on rival sides of a war.',
    poster_path: '/fqldf2t8ztc9aiwn3k6mlX3tvRT.jpg',
    backdrop_path: '/rkB4LyZHo1NHXFEDHl9vSD9r1lW.jpg',
    media_type: 'tv',
    vote_average: 8.7,
    first_air_date: '2021-11-06',
    genre_ids: [16, 10765, 10759]
  },
  {
    id: 100088,
    name: 'The Last of Us',
    overview: 'Joel and Ellie forge a bond as they navigate a brutal, post-pandemic America.',
    poster_path: '/uKvVjHNqB5VmOrdxqAt2V7JMrRI.jpg',
    backdrop_path: '/9ha9u10JqXvNq4o4lU2Qe8C6TfA.jpg',
    media_type: 'tv',
    vote_average: 8.6,
    first_air_date: '2023-01-15',
    genre_ids: [18, 10759]
  },
  {
    id: 1396,
    name: 'Breaking Bad',
    overview: 'A chemistry teacher diagnosed with inoperable lung cancer turns to manufacturing methamphetamine to secure his family’s future.',
    poster_path: '/ztkUQFLlC19CCMYHW9o1zWhJRNq.jpg',
    backdrop_path: '/tsRy63Mu5cu8etL1X7ZLyf7UP1M.jpg',
    media_type: 'tv',
    vote_average: 8.9,
    first_air_date: '2008-01-20',
    genre_ids: [18, 80]
  }
];

export const getMockMovieDetails = (id) => {
  const allMovies = [...MOCK_TRENDING, ...MOCK_NEW_RELEASES, ...MOCK_ACTION, ...MOCK_COMEDY, ...MOCK_HORROR, ...MOCK_SCIFI];
  const found = allMovies.find((m) => String(m.id) === String(id)) || MOCK_TRENDING[0];

  return {
    ...found,
    id: Number(id) || found.id,
    media_type: 'movie',
    runtime: 148,
    tagline: 'Experience it in theatres.',
    vote_count: 5420,
    genres: [
      { id: 878, name: 'Sci-Fi' },
      { id: 12, name: 'Adventure' },
      { id: 28, name: 'Action' }
    ],
    credits: {
      cast: [
        { id: 1, name: 'Timothée Chalamet', character: 'Paul Atreides', profile_path: null },
        { id: 2, name: 'Zendaya', character: 'Chani', profile_path: null },
        { id: 3, name: 'Rebecca Ferguson', character: 'Lady Jessica', profile_path: null },
        { id: 4, name: 'Javier Bardem', character: 'Stilgar', profile_path: null }
      ]
    },
    videos: {
      results: [
        { key: 'Way9Dexny3w', site: 'YouTube', type: 'Trailer', official: true },
        { key: 'uYPbbksJxIg', site: 'YouTube', type: 'Teaser', official: true }
      ]
    },
    similar: {
      results: MOCK_ACTION.slice(0, 6)
    },
    recommendations: {
      results: MOCK_SCIFI.slice(0, 6)
    }
  };
};

export const getMockTVDetails = (id) => {
  const allShows = [...MOCK_SERIES, ...MOCK_TRENDING.filter((x) => x.media_type === 'tv')];
  const found = allShows.find((s) => String(s.id) === String(id)) || MOCK_SERIES[0];

  return {
    ...found,
    id: Number(id) || found.id,
    media_type: 'tv',
    number_of_seasons: 4,
    number_of_episodes: 34,
    tagline: 'Every ending has a beginning.',
    vote_count: 8200,
    genres: [
      { id: 10765, name: 'Sci-Fi & Fantasy' },
      { id: 18, name: 'Drama' },
      { id: 9648, name: 'Mystery' }
    ],
    seasons: [
      { season_number: 1, name: 'Season 1', episode_count: 8, poster_path: found.poster_path },
      { season_number: 2, name: 'Season 2', episode_count: 9, poster_path: found.poster_path },
      { season_number: 3, name: 'Season 3', episode_count: 8, poster_path: found.poster_path },
      { season_number: 0, name: 'Specials', episode_count: 2, poster_path: found.poster_path }
    ],
    credits: {
      cast: [
        { id: 101, name: 'Millie Bobby Brown', character: 'Eleven', profile_path: null },
        { id: 102, name: 'David Harbour', character: 'Jim Hopper', profile_path: null },
        { id: 103, name: 'Winona Ryder', character: 'Joyce Byers', profile_path: null },
        { id: 104, name: 'Finn Wolfhard', character: 'Mike Wheeler', profile_path: null }
      ]
    },
    videos: {
      results: [
        { key: 'b9EkMc79ZSU', site: 'YouTube', type: 'Trailer', official: true }
      ]
    },
    similar: {
      results: MOCK_SERIES.slice(0, 4)
    },
    recommendations: {
      results: MOCK_SERIES.slice(0, 4)
    }
  };
};

export const getMockSeasonDetails = (tvId, seasonNumber) => {
  const seasonNum = Number(seasonNumber);
  const count = seasonNum === 0 ? 2 : 8;
  const episodes = Array.from({ length: count }).map((_, i) => ({
    id: 1000 + seasonNum * 100 + i + 1,
    episode_number: i + 1,
    season_number: seasonNum,
    name: `Chapter ${i + 1}: The Unfolding Mystery`,
    overview: `In episode ${i + 1} of season ${seasonNum}, revelations lead our characters into deeper mysteries with high stakes.`,
    air_date: `202${Math.min(4, Math.max(0, seasonNum))}-0${(i % 8) + 1}-15`,
    runtime: 50 + (i * 3),
    still_path: null,
    vote_average: 8.5
  }));

  return {
    season_number: seasonNum,
    episodes
  };
};

export const searchMockData = (query) => {
  if (!query || !query.trim()) return [];
  const q = query.trim().toLowerCase();
  const pool = [...MOCK_TRENDING, ...MOCK_NEW_RELEASES, ...MOCK_ACTION, ...MOCK_COMEDY, ...MOCK_HORROR, ...MOCK_SCIFI, ...MOCK_SERIES];
  
  const seen = new Set();
  const matched = [];
  for (const item of pool) {
    const title = (item.title || item.name || '').toLowerCase();
    const overview = (item.overview || '').toLowerCase();
    const key = `${item.media_type}:${item.id}`;
    if (!seen.has(key) && (title.includes(q) || overview.includes(q))) {
      seen.add(key);
      matched.push(item);
    }
  }
  return matched;
};
