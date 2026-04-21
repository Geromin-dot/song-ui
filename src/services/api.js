const BASE_URL = "https://song-api-ljxm.onrender.com/manese/songs";

export const getSongs = async () => {
  const response = await fetch(BASE_URL);
  if (!response.ok) throw new Error("Failed to fetch songs");
  return response.json();
};

export const postSong = async (songData) => {
  const response = await fetch(BASE_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(songData),
  });
  if (!response.ok) throw new Error("Failed to post song");
  return response.json();
};